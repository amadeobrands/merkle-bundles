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