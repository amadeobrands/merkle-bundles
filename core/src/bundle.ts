import { HashedTreeWithLocs, ChunkLookup, makeChunkLookup, ChunkId } from "./chunks";
import { parse, getHashedTree } from "./merkle";
import { Hash } from "./hash";

abstract class BundleCore {
    // canonical name, e.g. jquery
    name: string;
    src: string;
    chunks: ChunkLookup
    root: Hash;

    constructor(name: string, src: string) {
        this.name = name;
        this.src = src;
    }

    protected build() {
        let ast;
        try {
            ast = parse(this.src, true);
        } catch(ex) {
            throw new Error(`Couldn't load bundle ${this.name} due to parsing errors: ${ex}`)
        }
        let tree = getHashedTree(ast);
        let root = tree._hash;
        let chunkLookup = makeChunkLookup(tree.val);
        return {
            ast,
            tree,
            root,
            chunkLookup
        }
    }
}

export class LightBundle extends BundleCore {
    constructor(name: string, src: string) {
        super(name, src);
        let { root, chunkLookup } = this.build();
        this.root = root;
        this.chunks = chunkLookup;
    }
};

export class Bundle extends BundleCore {
    tree?: HashedTreeWithLocs

    constructor(name: string, src: string) {
        super(name, src);
        let {
            ast,
            tree,
            root,
            chunkLookup
        } = this.build();
        this.src = "";
    }
}

// export const getCommonChunks(a: BundleCore, b: BundleCore) {
//     return 
// }