Merkle Bundles
==============

**A new way to deliver JS**. Turn the AST of modules into a Merkle tree, and use it as an efficient index to delta update the client's source code.

## Design
Webpack:
 - Compiles module.
 - We hook in, and generate the AST of the unoptimized source but with dependencies included.
 - Post-process this module, generating a Merkle tree from the AST which represents the layout of the nodes.
 - The nodes themselves are optimized and stored in a hash table.

Webpack:
 - Compiles code into AST.
 - AST is transformed into [Patricia-Merkle tree](https://github.com/ethereum/wiki/wiki/Patricia-Tree).
 - AST is minified into bundle.

Client:
Tree loaded with bottom leaves all sent.
Server diffs the tree and sends the bundle diff as a tree at all locations
Client merges bundle diff, saves to cache, and loads code

Optimisations:
 - HTTP2 Push Merkle leaves
 - Start running code as soon as ready, wait on fetch modules when ready
 - use Prefetch/Preload


```
var FoobarPlugin = require('../plugin');
new FoobarPlugin(),
```


