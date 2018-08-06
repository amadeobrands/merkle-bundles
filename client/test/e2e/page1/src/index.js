
const bootstrap = require('astex-client/dist/bootstrap').bootstrap;

window.addEventListener('DOMContentLoaded', function() {
    // bootstrap('http://localhost:9002').load('bundle.js')
    // ^^ Ideal syntax

    
    bootstrap('http://localhost:9002')
    .then(client => {
        // console.log(window['MerkleAstBundleClient'])
        client.load('bundle.js').then(bundle => {
            // console.log(JSON.stringify(bundle, null, 1))
        })
    })
});