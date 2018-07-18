// @flowx
var getType = require('get-object-type');
// const recast = require("recast");
const esprima = require('esprima');
const sha224 = require('js-sha256').sha224;
const hexToArrayBuffer = require('hex-to-array-buffer')
const hasher = (v: any) => {
    // return sha224.arrayBuffer(`${v}`);
    return sha224(`${v}`).substring(0, 14);
}
const includes = require('lodash.includes');
const sortBy = require('lodash.sortby');
const findIndex = require('lodash.findindex');

const helper = require('./helper');
const coding = require('./coding');


export const HASH = '_hash'
// export const SHALLOWHASH = '_shallowHash';

type hash = string;

type tree = {
    [x: string]: tree | any,
    _hash: hash,
};


const ignoredKeys = ['range'];

function hashSubtrees(subtrees) : hash {
    return hasher( subtrees.map(({ hash }) => hash).join('') );
}

export function getHashedTree(thing: any) : {| hash: hash, val: tree |} {
    let typ = getType(thing);

    if(typ == 'Object') {
        let kvs = helper.getKeyVals(thing);
        let ignoredEntries = kvs.filter(({ k }) => {
            return includes(ignoredKeys, k);
        })
        let entriesToHash = kvs.filter(({ k }) => {
            return !includes(ignoredKeys, k);
        })

        let subtrees = entriesToHash.map(({ k, v }) => {
            let { hash, val } = getHashedTree(v);
            return { k, hash, val };
        })

        let hash = hashSubtrees(subtrees);
        let newObj: tree = {
            _hash: hash,
        };
        ignoredEntries.map(({ k, v }) => {
            newObj[k] = v;
        })
        subtrees.map(({ k, val }) => {
            newObj[k] = val;
        })

        return {
            hash,
            val: newObj,
        }

    } else if (typ == 'Array') {
        if(helper.isArrayFullOfPrimitives(thing)) {
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
            throw ex;
        }
    }
}

export function _compactTree(node) {
    let children = getChildren(node);
    let x = [
        hexToArrayBuffer(node[HASH])
    ];
    if(children.length > 0) x.push(children.map(_compactTree));
    return x;
}

export function compactTree(tree) {
    return coding.encode(_compactTree(tree));
}

export function parse(src, range: bool) {
    // return recast.parse(src, { range })
    return esprima.parse(src, { range })
}


export const HashTree = Symbol('HashTree');
export const Ast = Symbol('Ast');
export const Diffs = Symbol('Diffs');
export const BinDiffs = Symbol('BinDiffs');
export const Stats = Symbol("Stats");


export function getCommonChunks(tree1, tree2) {
    let chunks1 = getChunks(tree1);
    let chunks2 = getChunks(tree2);
    return new Set([...chunks1].filter(x => chunks2.has(x)))
}



export function getChunks(tree) {
    let chunks = new Set();
    bfsVisit(tree, (node) => {
        chunks.add(node[HASH]);
        return true
    })
    return chunks
}


export function buildDiff(src, treeWithLocs, commonChunks) {
    if(commonChunks.size == 0) {
        return {
            diff: [src],
            chunks: []
        }
    }
    // let src = recast.print(treeWithLocs).code;
    let chunks = [];

    bfsVisit(treeWithLocs, (node) => {
        let id = node[HASH];
        
        if(commonChunks.has(id)) {
            let [from, to] = node.range;
            chunks.push({ from, to, id })
            return false
        }

        return true;
    });

    let sorted = sortBy(chunks, [function(o) { return o.from; }]);

    const chunkId = (id) => findIndex(sorted, { id });

    let g = sorted
    .reduce((prev, curr) => {
        let before = prev[prev.length - 1];

        return [
            ...prev,
            Object.assign(curr, {
                prevTo: (before && before.to) || 0,
            })
        ]
    }, [])

    let lastBit = [ src.substring(g[g.length - 1].to) ];

    g = g
    .reduce((prev, curr) => {
        return [
            ...prev,
            src.substring(curr.prevTo, curr.from),
            chunkId(curr.id),
        ]
    }, [])
    .concat(lastBit)

    return {
        chunks: sorted.map(chunk => chunk.id),
        diff: g
    }
}


export function applyDiff(src, diff) {
    let treeWithLocs = parse(src, true);
    // let src = recast.print(treeWithLocs).code;

    let chunkLookup: { [hash]: number[] } = {};
    bfsVisit(treeWithLocs, node => {
        chunkLookup[node[HASH]] = node.range;
        return true;
    });

    let newSrc = diff.diff.map(x => {
        if(getType(x) == 'String') return x;
        else {
            let id = diff.chunks[x];
            let [ from, to ] = chunkLookup[id];
            return src.substring(from, to);
        }
    }).join('')
    
    return newSrc;
}


export function compactDiff(diff) {
    let val = Object.assign(diff, {
        chunks: diff.chunks.map(hexToArrayBuffer)
    })
    var buffer = coding.encode(val);
    return buffer;
}

// export function decodeDiff(diff) {}

function getChildren(node: tree) : tree[] {
    let children: tree[] = [];
    switch(getType(node)) {
        case 'Object':
        case 'Array':
            children = (Object.values(node).filter((val: any) => {
                var typ = getType(val);
                if(typ == 'Object') return true;
                if(typ == 'Array') {
                    if(!helper.isArrayFullOfPrimitives(val)) return true;
                }
                return false;
            }) : any[]);
        default:
            break;
    }
    return children;
}

function bfsVisit(n1: tree, visit: (n1: tree) => boolean) {
    if(visit(n1)) {
        getChildren(n1).map(child => bfsVisit(child, visit))
    }
}

function traverseTree(n1: tree, n2: tree, visit: (n1: tree, n2: tree) => boolean) {
    function getChildren(node: tree) : tree[] {
        let children: tree[] = [];
        switch(getType(node)) {
            case 'Object':
            case 'Array':
                children = (Object.values(node).filter((val: any) => {
                    var typ = getType(val);
                    if(typ == 'Object') return true;
                    if(typ == 'Array') {
                        if(!helper.isArrayFullOfPrimitives(val)) return true;
                    }
                    return false;
                }) : any[]);
            default:
                break;
        }
        return children;
    }

    if(
        n2[HASH] === (n1 && n1[HASH])
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


// class CachedTreesDiffer {
//     diff() {
//     }
// }