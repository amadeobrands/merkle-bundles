import {
    Hash,
} from './hash';

import {
    bfsVisit,
} from './merkle';

import {
    HashedTreeWithLocs,
    Chunkset,
    ChunkId,
    ChunkLookup,
    HashedTreeNodeWithCodeRange,
    getCommonChunks,
} from './chunks';

// @ts-ignore
import { encode, decode } from 'coding';
import getType from 'get-object-type';
import { Bundle, LightBundle } from './bundle';

const findIndex = require('lodash.findindex');


interface Diff {
    hash: Hash,
    delta: Array<string | number>,
    chunkLookup: ChunkId[]
};

export class DiffFactory {
    static build(old: Bundle, latest: Bundle) {
        let common = getCommonChunks(old, latest);
        return this._build(latest, common);
    }

    static _build(latest: Bundle, commonChunks: Chunkset): Diff {
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

    static apply(bundle: LightBundle, diff: Diff) {
        console.log("Received diff: ", diff)
        if(!bundle.chunks) throw new Error("need chunk lookup");
    
        let newSrc = diff.delta.map(x => {
            if(getType(x) == 'String') return x;
            else if(x === '') return '';
            else {
                let chunkIdx = <number> x;
                let chunkId = diff.chunkLookup[chunkIdx];
                let [from, to] = bundle.chunks[chunkId];
                return bundle.src.substring(from, to);
            }
        }).join('')
        
        return newSrc;
    }
}

export type BinaryDiff = ArrayBuffer;

export function packDiff(diff: Diff): BinaryDiff {
    let val = diff;
    var buffer = encode(val);
    return buffer;
}

export function unpackDiff(buf: BinaryDiff): Diff {
    return decode(buf);
}