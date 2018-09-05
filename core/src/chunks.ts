import {
    Hash,
} from './hash';

import {
    IHashed,
    HashedTreeNode,
    HashedTree,
    bfsVisit
} from './merkle';

import { LightBundle } from './bundle/dumb';

interface IWithCodeRanges {
    range: SourceCodeRange
};

export type HashedTreeNodeWithCodeRange = HashedTreeNode & IWithCodeRanges;

export interface HashedTreeWithLocs extends IHashed, IWithCodeRanges
{
    [k: string]: HashedTreeNode | Hash | SourceCodeRange,
};




// index of chunk
export type ChunkId = Hash;
export type Chunkset = Set<ChunkId>;

export function getCommonChunks(a: LightBundle, b: LightBundle): Chunkset {
    let chunks1 = Object.keys(a.chunks);
    let chunks2 = new Set(Object.keys(b.chunks));
    return new Set(chunks1.filter((x: ChunkId) => chunks2.has(x)))
}

export function getChunks(tree: HashedTreeWithLocs): Chunkset {
    let chunks: Chunkset = new Set();
    bfsVisit(tree, (node) => {
        chunks.add(node._hash);
        return true
    })
    return chunks
}

export type SourceCodeRange = [number, number];
export interface ChunkLookup {
    [chunkId: string]: SourceCodeRange
};

export function makeChunkLookup(tree: HashedTreeWithLocs): ChunkLookup {
    const chunkLookup: ChunkLookup = {};

    bfsVisit(tree, node => {
        if(!node._hash) return true;
        const hash = node._hash;

        // TODO brittle
        chunkLookup[hash] = (node as HashedTreeNodeWithCodeRange).range;
        return true;
    });

    return chunkLookup
}