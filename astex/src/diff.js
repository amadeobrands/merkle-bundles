var objDiff = require('minimal-object-diff')

let a = require('../dist/output/HashTree.clientTree.json')
let b = require('../dist/output/HashTree.serverTree.json')

var patches = objDiff.diff(a, b)
console.log(JSON.stringify(patches, null, 1))