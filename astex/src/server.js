var express = require('express')
var app = express()


app.get('/bundles/{id}', function (req, res) {
    // get tree from params
    // load file from disk
    let currentSrc = readText('/test/example1.js')
    let ast = parse(currentSrc, false);
    let astLocs = parse(currentSrc, true);
    let tree = _.merge(serverAstLocations, getHashedTree(serverAst).val);

    let clientChunks = getChunks(clientTree);
    let serverChunks = getChunks(tree);
    let intersection = new Set([...clientChunks].filter(x => serverChunks.has(x)))

    let diff = buildDiff(tree, intersection);
    
    // send diff to client
    // compacted format
})

app.listen(3000)