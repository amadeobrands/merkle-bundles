// @flowx
var getType = require('get-object-type');
const esprima = require('esprima');
const recast = require("recast");
const sha224 = require('js-sha256').sha224;
const hasher = (v: any) => {
    return sha224(`${v}`);
}
const _ = require('lodash')


const helper = require('./helper');

function isArrayFullOfPrimitives(arr: any[]) {
    for(let item of arr) {
        let typ = getType(item);
        if(typ === 'Object') return false;
    }
    return true;
}

function isAnArrayAtTheEndOfTheDay(arr) {
    return arr.__proto__.constructor.name === 'Array';
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
export const SHALLOWHASH = '_shallowHash';

type hash = string;

type tree = {
    [x: string]: tree | any,
    _hash: hash,
};

function hashSubtrees(subtrees) : hash {
    return hasher( subtrees.map(({ hash }) => hash).join('') );
}

const ignoredKeys = ['range'];


const getKeyVals = (obj) => {
    return Object.entries(obj).map(entry => {
        return {
            k: entry[0],
            v: entry[1]
        }
    })
}

export function getHashedTree(thing: any) : {| hash: hash, val: tree |} {
    let typ = getType(thing);

    if(typ == 'Object') {
        let kvs = getKeyVals(thing);
        let ignoredEntries = kvs.filter(({ k }) => {
            return _.includes(ignoredKeys, k);
        })
        let entriesToHash = kvs.filter(({ k }) => {
            return !_.includes(ignoredKeys, k);
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
            throw ex;
        }
    }
}


// Uses BFS
// return true to recurse down
// const visitTree = (node, visitorCb) => {
//     let continue = visitorCb(node);
//     if(continue) {
//         node.children.map(visitTree)
// 	}
// }

// export function hashNode(node: tree) {
//     const serialise = (val) => JSON.stringify(val);
//     return hash(
//         serialise(node.value) + node.children.map(hashNode)
//     );
// }

// export class MerkleDiffer {
//     // treeB has ast node info in it.
//     // TODO better patterning
//     diff(treeA, treeB) {
//         let changes = [];

//         // This must be applied top-down, otherwise the ranges will be incorrect
//         // which stems from using n2 by default
//         function compareTree(n1, n2) {
//             if(hashNode(n1) !== hashNode(n2)) {
//                let [ start, end ] = n2.range;
//                changes.push({ start, end })
//                return;
//                // don't recurse further.
//             }

//             for(let i = 0; i < Math.min(n1.children.length, n2.children.length); i++) {
//                 compareTree(n1.children[i], n2.children[i])
//             }
//         }

//         compareTree(treeA, treeB);

//         return changes;
//     }
// }



export function parse(src, range: bool) {
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
let clientAstLocations = parse(example1, true);
let clientTree = getHashedTree(clientAst).val;

helper.log(HashTree, 'clientTree', clientTree)

let serverAst = parse(example2, false);
let serverAstLocations = parse(example2, true);
let serverTree = getHashedTree(serverAst).val;

helper.log(HashTree, 'merged', _.merge(serverAstLocations, serverTree));


helper.log(HashTree, 'serverTree', serverTree);


let merged = _.merge(serverAstLocations, serverTree);
// let diffs = getDiffs(clientTree, serverTree);
// let diffs = getDiffs(clientTree, serverAstLocations);
let diffs = getDiffs(clientTree, merged);

function getChunks(tree) {
    let chunks = new Set();
    bfsVisit(tree, (node) => {
        chunks.add(node[HASH]);
        return true
    })
    return chunks
}

let clientChunks = getChunks(clientTree);
let serverChunks = getChunks(serverTree);
let intersection = new Set(
    [...clientChunks].filter(x => serverChunks.has(x)))


function buildDiff(treeWithLocs, commonChunks) {
    let src = recast.print(treeWithLocs).code;
    let chunks = [];

    bfsVisit(treeWithLocs, (node) => {
        let id = node[HASH];
        
        if(commonChunks.has(id)) {
            let [from, to] = node.range;
            // src.replaceWithChunk();
            chunks.push({ from, to, id })
            return false
        }

        return true;
    });

    let sorted = _.sortBy(chunks, [function(o) { return o.from; }]);
    console.log(sorted)

    const chunkId = (id) => _.findIndex(sorted, { id });

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

// console.log(intersection)
let diff = buildDiff(merged, intersection);
helper.log(Diffs, 'diffs', diffs);
console.log(diff)

function applyDiff(treeWithLocs, diff) {
    let src = recast.print(treeWithLocs).code;

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


console.log(applyDiff(_.merge(clientAstLocations, clientTree), diff))


function bfsVisit(n1: tree, visit: (n1: tree) => boolean) {
    function getChildren(node: tree) : tree[] {
        let children: tree[] = [];
        switch(getType(node)) {
            case 'Object':
            case 'Array':
                children = (Object.values(node).filter((val: any) => {
                    var typ = getType(val);
                    if(typ == 'Object') return true;
                    if(typ == 'Array') {
                        if(!isArrayFullOfPrimitives(val)) return true;
                    }
                    return false;
                }) : any[]);
            default:
                break;
        }
        return children;
    }

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
                        if(!isArrayFullOfPrimitives(val)) return true;
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




function getDiffs(a: tree, b: tree) {
    let diffs = [];

    traverseTree(a, b, (n1, n2, path) => {
        diffs.push(n2);

        return true;

        // iterate through the n2 tree
        // leaf node = node.children === 0
        // if node.hash != current.hash: log node
        // 
        // iterate down where hash is different

    })
    return diffs;
}



// class CachedTreesDiffer {
//     diff() {
//     }
// }

