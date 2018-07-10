
const fs = require("fs");
const path = require('path');
const EventEmitter = require('events');
const msgpack = require("msgpack-lite");
const glob = require("glob")

import chokidar from 'chokidar';
import _ from 'lodash';
import helper from './helper';
import {
    parse,
    getHashedTree,
    getChunks,
    buildDiff,
    compactDiff
} from './merkle';

import Q from 'q';


class MyEmitter extends EventEmitter {}
export const events = new MyEmitter();



let core = {
    basePath: null
}

let cache = {};
let rootToChunks = {};

const NO_CHUNKS = new Set();
function lookupChunks(root) {
    let chunks = rootToChunks[root];
    // if(!chunks) throw new Error(`No chunkset found for ${root}`);
    return chunks || NO_CHUNKS;
}

function addChunksToLookup(hash, chunks) {
    console.log(`Added ${hash} to chunks lookup`);
    rootToChunks[hash] = chunks;
}

export function getDataForBundle(bundleFilename) {
    let k = bundleFilename;
    if(!cache[k]) {
        throw new Error("Bundle not loaded?")
    } else {
        return cache[k];
    }
}

function loadDataForBundle(bundleFilename) {
    let k = bundleFilename;

    // TODO security
    let currentSrc = fs.readFileSync(path.join(core.basePath, '/', bundleFilename), 'utf-8');

    let ast, astLocs;
    try {
        ast = parse(currentSrc, false);
        astLocs = parse(currentSrc, true);
    } catch(ex) {
        console.error(`Couldn't load ${bundleFilename} due to parsing errors`)
        return;
    }

    let hashedTree = getHashedTree(ast);
    let tree = _.merge(astLocs, hashedTree.val);
    let chunks = getChunks(tree);

    let data = { src: currentSrc, tree, chunks };
    cache[k] = data;
    addChunksToLookup(hashedTree.hash, chunks)
    events.emit('reloaded', { bundleFilename, root: hashedTree.hash })
    return cache[k]
}

export function generateDiff(bundleFilename, root) {
    if(!bundleFilename) throw new Error("no bundleFilename given");
    let clientChunks = lookupChunks(root);
    // console.log(clientChunks)
    let { src, tree, chunks, } = getDataForBundle(bundleFilename)
    let commonChunks = new Set([...clientChunks].filter(x => chunks.has(x)));
    // console.log(commonChunks)
    let diff = compactDiff(buildDiff(src, tree, commonChunks));
    return diff;
}

export function loadInitialModules(basePath) {
    core.basePath = basePath;
    let bundleFileGlob = path.join(core.basePath, "/*.js");

    const getBundleFilename = (fpath) => {
        return path.parse(fpath).base;
    }

    let dfd = new Q.defer();

    glob(bundleFileGlob, null, (err, files) => {
        if(err) throw err;
        console.log(`Loading ${files.length} bundles`);
        files.map(fpath => {
            let base = getBundleFilename(fpath)
            console.log(`loading: ${base}`)
            loadDataForBundle(base)
        })
        // console.log(cache['example1.js'])
        
        dfd.resolve();
        // console.log(rootToChunks)
    })

    chokidar.watch(bundleFileGlob).on('all', (event, fpath) => {
        let base = getBundleFilename(fpath)
        console.log(`reloading: ${base}`)
        loadDataForBundle(base)
    });

    return dfd.promise;
}