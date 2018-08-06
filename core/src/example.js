const helper = require('./helper');

const readText = (f) => fs.readFileSync(__dirname + f, 'utf-8')

export function log(type, name, content) {
    let x = JSON.stringify(content, (k, v) => {
        if(v instanceof Array && v.hasOwnProperty(HASH)) {
            let newObj = {};
            v.map((v, i) => {
                newObj[i] = v;
            })
            newObj[HASH] = v[HASH];
            return newObj;
        } else return v;
    }, 1);

    let fname = `${symDesc(type)}.${name}.json`;
    fs.writeFileSync(`${__dirname}/output/${fname}`, x);
}

import {
    parse,
    getHashedTree,
    getCommonChunks,
    buildDiff,
    compactDiff,
    compactTree,

    HashTree,
    Ast,
    Diffs,
    BinDiffs,
} from './merkle';

import merge from 'lodash.merge';

var compressjs = require('compressjs');



// let example1 = helper.readText('/test/example1.js')
// let example2 = helper.readText('/test/example2.js')
let example1 = helper.readText('/test/bundle1.js')
let example2 = helper.readText('/test/bundle2.js')

let clientAst = parse(example1, false);
let clientAstLocations = parse(example1, true);
let clientTree = getHashedTree(clientAst).val;

helper.log(HashTree, 'clientTree', clientTree)

let clientTreeCompacted = compactTree(clientTree);
helper.log(HashTree, 'clientTreeCompacted', clientTreeCompacted.length)
let clientTreeCompactedCompressed = compressjs.Bzip2.compressFile(clientTreeCompacted)
helper.log(HashTree, 'clientTreeCompactedCompressed', clientTreeCompactedCompressed.length)

let serverAst = parse(example2, false);
let serverAstLocations = parse(example2, true);
let serverTree = getHashedTree(serverAst).val;

helper.log(HashTree, 'merged', merge(serverAstLocations, serverTree));

helper.log(HashTree, 'serverTree', serverTree);


let serverTreeLocs = merge(serverAstLocations, serverTree);

let commonChunks = getCommonChunks(clientTree, serverTreeLocs);
let diff = buildDiff(example2, serverTreeLocs, commonChunks);
helper.log(Diffs, 'diff', diff);

let bindiff = compactDiff(diff)
helper.log(BinDiffs, 'bindiff', bindiff.length);



// console.log(applyDiff(src, diff))