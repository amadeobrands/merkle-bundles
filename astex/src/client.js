// Take AST of code
// Generate Merkle tree

// Diff two merlkle trees
// generate the src that the client currently has

// generate a diff








// // GET /
// tree = localStorage.get('tree') || {};

// fetch('/bundle', { tree })
// .then(res => {
//     tree.merge(res.changes)
//     webpackBootstrap(tree.modules())
// })



// class tree {
//     modules: { [id]: string } = {};
//     tree = {};
    
//     merge(changes) {
//         this.modules = changes.map((id, diffs) => {
//             let module = this.modules[id];
//             diffs.map({ from, to, content } => {
//                 module = module.updateRange(from, to, content);
//             })
//             return module;
//         })
        
//         this.recomputeTree()
//     }

//     recomputeTree() {
//         for({ id, module } in Object.entries(this.modules)) {
//             this.trees[id] = buildMerkleAst(module);
//         })
//     }

//     get modules() {
//         return Object.values(this.modules);
//     }
// }





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
    
//     res.send(changeset);
// // })