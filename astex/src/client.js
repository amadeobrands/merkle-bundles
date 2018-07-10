import * as qwest from 'qwest';
import localforage from 'localforage';

class Client {
    constructor(endpoint) {
        this.endpoint = endpoint;

        localforage.setItem('key', 'value').then(function () {
            return localforage.getItem('key');
          }).then(function (value) {
            // we got our value
          }).catch(function (err) {
            // we got an error
          });
    }

    getBundle(name) {
        qwest.get(`this.endpoint/${name}`, data, { dataType: 'arraybuffer', responseType: 'arraybuffer' })
        .then((xhr, response) => {
            
        })
        .catch(function(e, xhr, response) {
            // Process the error
        })
        .complete(function() {
            // Always run
        });
    }
}

// handle('/bundle', (req, res) => {
//     let trees = req.trees;
//     let changeset = trees.map((id, tree) => {
//         let module = modules[id];

//         let diff = treediff(module.tree, tree);
//         let changes = diff.nodes.map(node => {
//             let { from, to } = module.tree.getRange(node)
//             let diff = module.getCode(from, to);
//             return { from, to, diff }
//         })

//         return { id, changes }
//     })

//     res.send(changeset)






// // GET /
// tree = localStorage.get('tree') || {};

// fetch('/bundle', { tree })
// .then(res => {
//     tree.merge(res.changes)
//     webpackBootstrap(tree.modules())
// })

