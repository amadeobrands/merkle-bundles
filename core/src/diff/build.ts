import {
    Diff,
    BinaryDiff
} from './diff';

import {
    Bundle
} from '../bundle/full';

import {
    bfsVisit,
} from '../merkle';

import {
    Chunkset,
    ChunkId,
    HashedTreeNodeWithCodeRange,
    getCommonChunks,
} from '../chunks';

// @ts-ignore
import { encode } from '../coding.node';

export function buildDiff(old: Bundle, latest: Bundle) {
    let common = getCommonChunks(old, latest);
    return _build(latest, common);
}

function _build(latest: Bundle, commonChunks: Chunkset): Diff {
    if(commonChunks.size == 0) {
        return {
            hash: latest.tree._hash,
            delta: [latest.src],
            chunkLookup: [],
        }
    }
    
    interface ChunkInfo {
        from: number,
        to: number,
        id: ChunkId
    };

    let chunks: Array<ChunkInfo> = [];

    bfsVisit(latest.tree, (node) => {
        const id = node._hash;
        
        if(commonChunks.has(id)) {
            let range = (node as HashedTreeNodeWithCodeRange).range;
            if(!range) return true;
            let [from,to] = range;
            
            chunks.push({ 
                from,
                to,
                id,
            })

            // don't traverse down, we don't need to list all common chunks, only the
            // shallowest parents that are common
            return false;
        }

        return true;
    });

    const chunkId = (id: ChunkId): number => {
        for(let [i, chunk] of chunks.entries()) {
            if(chunk.id == id) return i;
        }
        throw new Error("unexpected: couldn't get chunk id")
    }

    let g = chunks
    .reduce((prev, curr) => {
        let before = prev[prev.length - 1];

        return [
            ...prev,
            Object.assign(curr, {
                prevTo: (before && before.to) || 0,
            })
        ]
    }, [])

    let lastBit = [ latest.src.substring(g[g.length - 1].to) ];

    g = g
    .reduce((prev: any, curr: any) => {
        return [
            ...prev,
            latest.src.substring(curr.prevTo, curr.from),
            chunkId(curr.id),
        ]
    }, [])
    .concat(lastBit)

    return {
        chunkLookup: chunks.map(chunk => chunk.id),
        delta: g,
        hash: latest.tree._hash
    }
}

export function packDiff(diff: Diff): BinaryDiff {
    let val = diff;
    var buffer = encode(val);
    // @ts-ignore
    // TODO       TS2322: Type 'Buffer' is not assignable to type 'ArrayBuffer'.
    return buffer;
}