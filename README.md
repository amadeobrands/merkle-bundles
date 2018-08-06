Merkle Bundles
==============

**A new way to deliver JS**. Turn the AST of modules into a Merkle tree, and use it as an efficient index to delta update the client's source code.

Copyright [Liam Zebedee](https://liamz.co) 2018.

## Development
Organised into 3 packages:
 - **astex-core**: manages diffing bundles based on a merkle tree approach, and other helpers shared by client/server
 - **astex-server**: serves a bundle server, which sends diffs down. 
 - **astex-client**: split into two parts - bootstrap and client bundle. The bootstrapper will require the client, and the client will download and apply diffs from the server.

Because of the development approach, these packages are linked together. The client has E2E testing which requires the server, the server requires the client bundle code so it can bootstrap it, and the core is shared between both.