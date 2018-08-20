import {
    bfsVisit,
    Hash,
} from './merkle';

import {
    HashedTreeWithLocs,
    Chunkset,
    ChunkId,
    SourceCodeRange,
    ChunkLookup
} from './chunks';

// @ts-ignore
import { encode, decode } from 'coding';
import getType from 'get-object-type';

const findIndex = require('lodash.findindex');

interface Diff {
    hash: Hash,
    diff: Array<string | ChunkId>,
    chunkLookup: ChunkId[]
};

interface chunkWithLoc {
    id: ChunkId,
    from: number,
    to: number
}

export function buildDiff(src: string, tree: HashedTreeWithLocs, commonChunkset: Chunkset): Diff {
    let commonChunks: chunkWithLoc[] = [];

    if(commonChunkset.size == 0) {
        return {
            hash: tree._hash,
            diff: [src],
            chunkLookup: [],
        }
    }

    bfsVisit(tree, (node) => {
        const id = node._hash;
        
        if(commonChunkset.has(id)) {
            // @ts-ignore this works TODO 
            if(!node.range) return true;
            
            let [from, to] = node.range;
            commonChunks.push({ from, to, id })
            return false
        }

        return true;
    });

    const chunkId = (id: ChunkId) => findIndex(commonChunks, { id });

    let g = commonChunks
    .reduce((prev, curr) => {
        let before = prev[prev.length - 1];

        return [
            ...prev,
            Object.assign(curr, {
                prevTo: (before && before.to) || 0,
            })
        ]
    }, [])

    let lastBit = [ src.substring(g[g.length - 1].to) ];

    g = g
    .reduce((prev, curr) => {
        return [
            ...prev,
            src.substring(curr.prevTo, curr.from),
            chunkId(curr.id),
        ]
    }, [])
    .concat(lastBit)

    return {
        chunkLookup: commonChunks.map(chunk => chunk.id),
        diff: g,
        hash: tree._hash
    }
}

export function applyDiff(src: string, chunkLookup: ChunkLookup, diff: Diff) {
    console.log("Received diff: ", diff)
    if(!chunkLookup) throw new Error("need chunk lookup");

    let newSrc = diff.diff.map(x => {
        if(getType(x) == 'String') return x;
        if(x === '') return '';
        else {
            // @ts-ignore
            let chunkIdx: number = x;
            let id = diff.chunkLookup[chunkIdx];

            // console.log(diff.chunks)
            let [ from, to ] = chunkLookup[id];
            return src.substring(from, to);
        }
    }).join('')
    
    return newSrc;
}


export function packDiff(diff: Diff): ArrayBuffer {
    let val = diff;
    var buffer = encode(val);
    return buffer;
}

export function unpackDiff(buf: ArrayBuffer) : Diff {
    return decode(buf);
}