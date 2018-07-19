
const bootstrap = require('../../../src/client/bootstrap').bootstrap;

window.addEventListener('DOMContentLoaded', function() {
    bootstrap('http://localhost:9002')
    .then(client => {
        console.log(window['MerkleAstBundleClient'])
        client.load([
            'bundle.js'
        ])
    }) 
});