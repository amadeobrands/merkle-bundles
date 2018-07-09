old, new = trees
cached = intersect(old.chunks, new.chunks)
new = new.chunks - old.chunks;

patch = 
"new ThisThat();", Chunk(1), "// what is happening", Chunk(4)




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