Idea:

we use the hash tree as a compact form for comparing knowledge about source trees between nodes
but we can also just use the root hash and then the index in the tree, rather than referring the full node IDs




data to capture?
evidence to collect
data to prove argument







Page with script and bundle name specified
First load - server 



build:

client needs to be generated in a very small bundle (webpack probs)
server just needs to be bundled into an executable

the core needs to be shared between the two
remain agnostic probs





cookie:
- contains hash of bundles, and hash of current source

server sends BundleCacher, which is loaded only once and is the interface to the caching backend
server already knows what client has based on the cookie header

it's simple:
our user: the web app owner who is loading their app 




jquery.turbojs.com/bundle.js
lodash.turbojs.com/bundle.js //5mb

make the bootstrap loader so small it doesn't matter anyways??? 
i.e. max 1kB





messenger.com loads 321 different scripts (cold).

ideally we want one round trip from client to server

vendored scripts are different
jquery is a hash
we just have the name => hash mapping so we can know what to download and execute.

but also you want to account for the async lazy loading paradigm of webpack
ie

import("whatever").then(module => {
    // ...
})

the level of abstraction we're modifying here, is still just the js fetching and everything before eval

we can't do http/2 server push bc we don't have it yet

so the bootstrapper:
1. 

you could probably store the data in a much more efficient ds, st like:


```html
<script 
      async
      type='text/javascript' 
      src='http://localhost:3000/turbo.js' 
      id='turbojs' 
      integrity="" 
      data-scripts='bundle.js'>
    </script>
```


<script 
      async
      type='text/javascript' 
      src='http://localhost:3000/turbo.js' 
      id='turbojs' 
      integrity="" 
      data-scripts='bundle.js'>
    </script>


dumb client is simply:

(oldhash, newhash) => newcode




<script 
      async
      type='text/javascript' 
      src='http://localhost:3000/turbo.js' 
      id='turbojs' 
      integrity="" 
      data-scripts='bundle.js'>
    </script>





troubles moving over to arraybuffers:
 - equals is by reference UGH
 - have to change find methods (esp from underscore)
 - can't use the same value as a key anymore (only strings)





Why is this superior to simply using a diff algorithm and storing the history of files?
 - merkle trees preserve space (so you only need to store the merkle tree on the server)
 - merkle trees on AST's are a much better diffing algorithm.






simplified design
=================

watch files
every change => commit new file to memory chunks[hash(bundlename,content)] =>(bundlename, content)

http server:
    /turbo.js ->
        read most recent versions of files from cookies.
        
        get diff:
            old = chunks[cookie.id]
            new = chunks[current]
            diff(old, new)

        construct diff update on the fly:
            let old = 












code sign the root of each update to the tree
use that as proof somehow so you can bittorrent the source
then make a distributed package manager



also

send the hashes from the browser to the server
the server sends back self-executing javascript that updates the cache
(no bootstrap needed)




old, new = trees
cached = intersect(old.chunks, new.chunks)
new = new.chunks - old.chunks;

patch = 
"new ThisThat();", Chunk(1), "// what is happening", Chunk(4)



src
visit the tree:
    if node.hash in cached:
        src.replace [from,to] with just "ID"



what's the issue?
we want to provide the diff to the client from X_i to X_now
what's the smallest diff representation?
what they already have + minimal edit to update their diff



we could:

send a run-length encoded compression of the new src. along the lines of:
"new ThisThat();", Chunk(1), "// what is happening", Chunk(4)

then the client would simply lookup their chunks and the code, build/patch the source and apply



or

we could send a diff of the AST layout tree and the new chunks













clientLoader.js

main = () => {
    tree = load()
    changed, deltachunks = serverdiff(tree)
    tree = tree.merge(deltachunks)

    // [{ id: xyz, newval: "" }]


}


// how do I handle the webpack dependency thingo?
// where to integrate it?

could possibly just change the code for module dependencies

installedModules