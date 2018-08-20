import {
    Hash,
    Hashed,
    HashedTreeNode,
    HashedTree,
    bfsVisit
} from './merkle';

export interface HashedTreeWithLocs extends Hashed 
{
    [k: string]: HashedTreeNode | Hash | SourceCodeRange,
};


// index of chunk
export type ChunkId = Hash;
export type Chunkset = Set<ChunkId>;

export function getCommonChunks(tree1: HashedTree, tree2: HashedTree) {
    let chunks1 = getChunks(tree1);
    let chunks2 = getChunks(tree2);
    return Array.from(chunks1).filter(x => chunks2.has(x));
}

export function getChunks(tree: HashedTree): Chunkset {
    let chunks: Chunkset = new Set();
    // let current: ChunkId = 0;

    bfsVisit(tree, (node) => {
        chunks.add(node._hash);
        // chunks.add(current);
        // current++;
        return true
    })
    return chunks
}

export type SourceCodeRange = [number, number];
export interface ChunkLookup {
    [chunkId: string]: SourceCodeRange
};

export function makeChunkLookup(tree: HashedTreeWithLocs) : ChunkLookup {
    const chunkLookup: ChunkLookup = {};

    bfsVisit(tree, node => {
        if(!node._hash) return true;
        const hash = node._hash;
        // console.log(hash)

        // @ts-ignore this exists TODO
        chunkLookup[hash] = node.range;
        return true;
    });

    return chunkLookup
}