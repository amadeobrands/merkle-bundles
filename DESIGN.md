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