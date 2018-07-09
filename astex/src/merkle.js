// @flow
var getType = require('get-object-type');
const esprima = require('esprima');
const recast = require("recast");
const sha224 = require('js-sha256').sha224;
const hasher = (v) => {
    return sha224(`${v}`);
}


const helper = require('./helper');

function isArrayFullOfPrimitives(arr) {
    for(let item of arr) {
        if(getType(item) === 'Object') return false;
    }
    return true;
}

// tree
/**
{
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
            ],
            "kind": "var",
            "range": [
                34,
                53
            ]
        }
    ],
    "sourceType": "script",
    "range": [
        34,
        53
    ]
}
*/

// const HASH = Symbol("Hash");
export const HASH = '_hash'

function hashSubtrees(subtrees) {
    return hasher( subtrees.map(({ hash }) => hash).join('') );
}
export function getHashedTree(thing) {
    // if value is object- return hash of all entries' hashes
    // if value is array- return hash of all items hashes
    // if value is primitive- return hash of value

    // if we are an object- set the _hash prop on the object
    // else just return the hash

    let typ = getType(thing);

    // two things:
    // recurse until we have a primitive value
    // hash is only set on objects
    // hash is = hash(items for an array | keys for an object | val for a primitive)
    // return the subtrees with their hashes too
    if(typ == 'Object') {
        let subtrees = Object.entries(thing).map(entry => {
            let [k,v] = entry;
            let { hash, val } = getHashedTree(v);
            return { k, hash, val };
        })

        let newObj = {};
        subtrees.map(({ k, val }) => {
            newObj[k] = val;
        })

        let hash = hashSubtrees(subtrees)
        newObj[HASH] = hash;

        return {
            hash,
            val: newObj,
        }
    } else if (typ == 'Array') {
        if(isArrayFullOfPrimitives(thing)) {
            let val = thing;
            let hash = hasher( thing.map(hasher).join('') );
            val[HASH] = hash;
            return { val, hash };

        } else {
            let subtrees = thing.map(item => {
                return getHashedTree(item);
            })
            let newObj = subtrees.map(({ val }) => val);
            let hash = hashSubtrees(subtrees);
            newObj[HASH] = hash;

            return {
                hash,
                val: newObj,
            }
        }

    } else {
        let val = thing;
        try {
            let hash = hasher(val);
            return {
                hash,
                val 
            }
        } catch(ex) {
            return new Error(ex)
        }
    }
}

export function getHashedValue(thing) {

}

// Uses BFS
// return true to recurse down
// const visitTree = (node, visitorCb) => {
//     let continue = visitorCb(node);
//     if(continue) {
//         node.children.map(visitTree)
// 	}
// }

export function hashNode(node) {
    const serialise = (val) => JSON.stringify(val);
    return hash(
        serialise(node.value) + node.children.map(hashNode)
    );
}

export class MerkleDiffer {
    // treeB has ast node info in it.
    // TODO better patterning
    diff(treeA, treeB) {
        let changes = [];

        // This must be applied top-down, otherwise the ranges will be incorrect
        // which stems from using n2 by default
        function compareTree(n1, n2) {
            if(hashNode(n1) !== hashNode(n2)) {
               let [ start, end ] = n2.range;
               changes.push({ start, end })
               return;
               // don't recurse further.
            }

            for(let i = 0; i < Math.min(n1.children.length, n2.children.length); i++) {
                compareTree(n1.children[i], n2.children[i])
            }
        }

        compareTree(treeA, treeB);

        return changes;
    }
}




// export function getDiffs(tree, currentSrc) {
//     let ast = parse(currentSrc, false);
//     let astWithRangeInfo = parse(currentSrc, true);
//     let currentTree = makeTree(ast);

//     function treediff(a, b) {
//         // recurse and visit all children
//         // unless there is a difference in hashes, in which case
//     }
    // for every differing node, get the node from the AST
    // get the location info and add that in

    // problem? what about loc info? 
    // the tree is simply a compact representation of the code
    // which we can use to determine how our code differs with the client
    // if we knew the exact value of each node, we could send a diff rather than the content

    // we also have to be careful here with locations/positions
    // let diff = treediff(tree, currentTree);
    

//     let changes = diff.nodes.map(node => {
//         let { from, to } = module.tree.getRange(node)
//         let diff = module.getCode(from, to);
//         return { from, to, diff }
//     })
    
//     return { id, changes }
// }

export function parse(src, range) {
    return esprima.parse(src, { range })
}


const HashTree = Symbol('HashTree');
const Ast = Symbol('Ast');
const Diffs = Symbol('Diffs');


const fs = require('fs');
const readText = (f) => fs.readFileSync(__dirname + f, 'utf-8')


let example1 = readText('/test/example1.js')
let example2 = readText('/test/example2.js')

let clientAst = parse(example1, false);
let clientTree = getHashedTree(clientAst);

helper.log(HashTree, 'clientTree', clientTree.val)

let serverAst = parse(example2, false);
let serverAstLocations = parse(example2, true);
let serverTree = getHashedTree(serverAst).val;

helper.log(HashTree, 'serverTree', serverTree);

// get diff
// basically get the leaf nodes where the parent has an unequal hash

let diffs = getDiffs(clientTree, serverTree);
helper.log(Diffs, 'diffs', diffs);

function traverseTree(n1, n2, visit) {
    let parent = n2;

    function getChildren(node) {
        let children = [];
        switch(getType(node)) {
            case 'Object':
                children = Object.values(n2).filter(x => getType(x) === 'Object');
                break;
            case 'Array':
                if(!isArrayFullOfPrimitives(n2)) {
                    children = n2;
                }
            default:
                break;
        }
        return children;
    }

    let goDeeper = visit(n1, n2);
    if(goDeeper) {
        let childrens = [
            getChildren(n1),
            getChildren(n2),
        ];
        
        for(let i = 0; i < Math.min(childrens[0].length, childrens[1].length); i++) {
            traverseTree(childrens[0][i], childrens[1][i], (z1, z2) => visit(z1, z2, parent))
        }
    }
}



// if the hashes are not equal


/*

hash: G
a [
    { hash: X,
        b: [
        asd,
        asd,
    ] },

    { hash: B,
        b: [
        asd,
        asd,
    ] }
]

*/
function getDiffs(a, b) {
    let diffs = [];

    traverseTree(a, b, (n1, n2, parent) => {
        if(n1[HASH] !== n2[HASH]) {
            return true;
        }
        diffs.push( parent );
        return false;
    })
    return diffs;
}



// class CachedTreesDiffer {
//     diff() {
//     }
// }

