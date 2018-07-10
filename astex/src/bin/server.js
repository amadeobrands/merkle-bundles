#!/usr/bin/env node
import {
    generateDiff,
    loadInitialModules
} from '../server_core';
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

// If you're bigger than 10mb, gimme a call.
app.use(bodyParser({limit: '10mb'}));

app.get('/bundle-diffs/:id/by-root/:root', function (req, res) {
    let bundleFilename = req.params.id;
    let root = req.params.root || null;
    let diff = generateDiff(bundleFilename, root);
    res.write(diff, 'binary');
    res.end(null, 'binary');
})

// app.get('/bundle-diffs/:id/by-tree', function (req, res) {
    // get tree from params
    // load file from disk
    // let id = req.params.id;
    // let clientTree = msgpack.decode(req.body);
    
    // var clientChunks = getChunks(clientTree);

    // var diff = buildDiff(src, tree, intersection);

    // send diff to client
    // compacted format
// });


if (require.main === module) {
    const program = require('commander');
    program
    .version('0.1.0')
    .option('-d, --dir [dir]', 'Directory of JS bundles to serve')
    .parse(process.argv);

    console.log('Merkle Tree Ast - with <3 from @liamzebedee');
    const basePath = path.resolve(program.dir);
    console.log(`Serving bundles from path: \n${basePath}`)
    console.log(`Preloading into cache...`)
    loadInitialModules(basePath).then(() => {
        console.log("Now running server on port 3000!");
        app.listen(3000);
    })

} else {
    module.exports = app;
}