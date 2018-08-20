import getType from 'get-object-type';
import esprima from 'esprima';
import { sha224 } from 'js-sha256';

const includes = require('lodash.includes');
const sortBy = require('lodash.sortby');
const findIndex = require('lodash.findindex');

import {
    getKeyVals,
    isArrayFullOfPrimitives
} from './helper';

const coding = require('coding');

var isEqual = require('arraybuffer-equal');
export function hashesEqual(a: Hash, b: Hash) : boolean {
    // return a === b;
    return isEqual(a, b);
}

export type Hash = ArrayBuffer;
// export type Hash = number[];
// export type Hash = string;

export interface Hashed
{
    _hash: Hash
}

interface HashedArray<array> extends Hashed {};

export type HashedTreeNode = HashedTree | HashedArray<any>;

export interface HashedTree extends Hashed 
{
    [k: string]: HashedTreeNode | Hash,
};



// Since we use JS in an esoteric way
// by setting the _hash on the prototype of primitive values
// i.e. a = [1,2,3]
//      a.hash = "123"
// console.log(a)
// => [1,2,3]
// console.log(a.hash)
// => "123"
// 
// We need a generic container
// interface HashValContainer 
// {
//     val: HashedTree | HashedPrimitive<any>,
//     _hash: Hash
// };
interface HashValContainer extends Hashed {
    val: HashedTree | HashedArray<HashValContainer> | any,
}



const hasher = (v: any) : Hash => {
    // return sha224(`${v}`).substring(0, 14);
    // return sha224.array(v);
    return sha224.arraybuffer(v);
}

function hashSubtrees(subtrees: HashValContainer[]) : Hash {
    return hasher( subtrees.map(({ _hash }) => _hash).join('') );
}


export function getHashedTree(thing: any): HashValContainer {
    let typ = getType(thing);

    if(typ == 'Object') {
        let kvs = getKeyVals(thing);

        let subtrees = kvs.map(({ k, v }) => {
            let { _hash, val } = getHashedTree(v);
            return { k, _hash, val };
        })

        let _hash = hashSubtrees(subtrees);

        const tree: HashedTree = {
            _hash,
        };
        subtrees.map(({ k, val }) => {
            tree[k] = val;
        })

        return {
            _hash,
            val: tree,
        }

    } else if (typ == 'Array') {
        const arr = thing;
        
        if(isArrayFullOfPrimitives(thing)) {
            const val: HashedArray<any> = arr;
            const _hash = hasher( arr.map(hasher).join('') );
            val._hash = _hash;
            return { val, _hash };

        } else {
            let subtrees: HashValContainer[] = arr.map(getHashedTree);
            const _hash = hashSubtrees(subtrees);
            // @ts-ignore
            const val: HashedArray<Hashed<any>> = subtrees.map(({ val }) => val);
            val._hash = _hash;
            return { val, _hash };
        }

    } else {
        const val = thing;
        try {
            const _hash = hasher(val);
            return { val, _hash };
        } catch(ex) {
            throw ex;
        }
    }
}

export function parse(src: string, range: boolean): any {
    return esprima.parse(src, { range })
}


export const HashTree = Symbol('HashTree');
export const Ast = Symbol('Ast');
export const Diffs = Symbol('Diffs');
export const BinDiffs = Symbol('BinDiffs');
export const Stats = Symbol("Stats");






function getChildren(node: HashedTreeNode) {
    let children = [];
    switch(getType(node)) {
        case 'Object':
        case 'Array':
            children = Object.values(node).filter((val) => {
                var typ = getType(val);
                if(typ == 'Object') return true;
                if(typ == 'Array') {
                    if(!isArrayFullOfPrimitives(val)) return true;
                }
                return false;
            });
        default:
            break;
    }
    return children;
}

export function bfsVisit(n1: HashedTreeNode, visit: (n1: HashedTreeNode) => boolean) {
    if(visit(n1)) {
        getChildren(n1).map(child => bfsVisit(child, visit))
    }
}

function traverseTree(
    n1: HashedTreeNode, 
    n2: HashedTreeNode, 
    visit: (n1: HashedTreeNode, n2: HashedTreeNode) => boolean
) {
    function getChildren(node: HashedTreeNode) {
        let children = [];
        switch(getType(node)) {
            case 'Object':
            case 'Array':
                children = Object.values(node).filter((val) => {
                    var typ = getType(val);
                    if(typ == 'Object') return true;
                    if(typ == 'Array') {
                        if(!isArrayFullOfPrimitives(val)) return true;
                    }
                    return false;
                });
            default:
                break;
        }
        return children;
    }

    // Note that if the tree is the same, we don't traverse further.
    if(
        n1 && n1._hash && hashesEqual(n2._hash, n1._hash)
    ) return;

    let childrens = [
        getChildren(n1),
        getChildren(n2),
    ];
    // let numChildren = Math.min(childrens[0].length, childrens[1].length);

    let numChildren = childrens[1].length;
    if(numChildren == 0) {
        // leaf node
        visit(n1, n2)

    } else {
        let parent = n2;

        for(let i = 0; i < numChildren; i++) {
            let a = childrens[0][i];
            let b = childrens[1][i];
            traverseTree(a, b, visit)
        }
    }
}
