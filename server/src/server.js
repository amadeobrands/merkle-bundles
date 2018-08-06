import {
    generateDiff,
    loadInitialModules
} from './core';
const path = require('path');
const express = require('express');
const app = express();
// const bodyParser = require('body-parser')
const cors = require("cors");

app.use(cors())

// If you're bigger than 10mb, gimme a call.
// app.use(bodyParser({limit: '10mb'}));
// app.use(bodyParser.json());

app.get('/bundle-diffs/:id/by-root/:root', function (req, res) {
    let bundleFilename = req.params.id;
    let root = req.params.root || null;
    let diff = generateDiff(bundleFilename, root);
    res.write(diff, 'binary');
    res.end(null, 'binary');
})

const clientBundle = require('raw-loader!astex-client/dist/bundle');

app.get('/merkle-ast-client-bundle', (req, res) => {
    res.write(clientBundle, 'utf-8')
    res.end()
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

export function command() {
    const program = require('commander');
    program
    .version('0.1.0')
    .option('-d, --dir  [dir]', 'Directory of JS bundles to serve')
    .option('-a, --addr [addr]', 'Address to listen on')
    .option('-p, --port [port]', 'Port to listen on')
    .parse(process.argv);

    console.log('Merkle Tree Ast - with <3 from @liamzebedee');
    const basePath = path.resolve(program.dir);
    const port = program.port || 3000;
    const addr = program.addr || '127.0.0.1';
    const watch = !(process.env.NODE_ENV === 'test') || true;

    console.log(`Serving bundles from path: \n${basePath}`)
    console.log(`Preloading into cache...`)
    loadInitialModules(basePath, watch).then(() => {
        console.log(`Now running server on ${addr}:${port}`)
        app.listen(port, addr);
    })
}

export async function makeApp(basePath, watch=true) {
    await loadInitialModules(basePath, watch);
    return app;
}