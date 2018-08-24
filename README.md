Merkle Bundles
==============

**A new way to deliver JS**. Turn the AST of modules into a Merkle tree, and use it as an efficient index to delta update the client's source code.

Copyright [Liam Zebedee](https://liamz.co) 2018.


## Build
```
cd client && yarn dev 
cd core && yarn dev 
cd server && yarn dev 
```

Organised into 3 packages:
 - **core**: manages diffing bundles based on a merkle tree approach, and other helpers shared by client/server
 - **server**: serves a bundle server, which sends diffs down. 
 - **client**: split into two parts - bootstrap and client bundle. The bootstrapper will require the client, and the client will download and apply diffs from the server.

Because of the development approach, these packages are linked together. The client has E2E testing which requires the server, the server requires the client bundle code so it can bootstrap it, and the core is shared between both.


## Use
To reap the benefits, you must 1) run a bundle server and 2) change your code.

### 1) Run the server
`./merkle-ast-server -d .` will run the server

### 2) Change your code
```html
<script 
      async
      type='text/javascript' 
      src='http://localhost:3000/turbo.js' 
      id='turbojs' 
      data-scripts='bundle.js'>
    </script>
```

## Wishlist
 
 - WebAssembly implementation (massive speedup)
 - Binary AST's