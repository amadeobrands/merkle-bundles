import {
    parse,
    getHashedTree,
    makeChunkLookup,
} from 'astex-core/dist/bundle.web';
import merge from 'lodash.merge';

export default class Bundle {
    constructor(src) {
        this.src = src;
        let ast = parse(src, false);
        let astLocations = parse(src, true);
        let tree = getHashedTree(ast);
        let hashedTree = merge(astLocations, tree.val);
        this.hash = tree.hash;
        this.chunkLookup = makeChunkLookup(hashedTree);
    }
}
