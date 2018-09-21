import {
    Diff,
    BinaryDiff
} from './diff';

import {
    ChunkId
} from '../chunks';

import {
    LightBundle
} from '../bundle/dumb';

import getType from 'get-object-type';

// @ts-ignore
import { decode } from '../coding.web';

/*
Looks up the source code of a chunk

e.g. 

let [from, to] = bundle.chunks[chunkId];
return bundle.src.substring(from, to);

*/
interface chunkCodeLookupFn {
    (id: ChunkId): Promise<string>;
}

export async function applyDiff(lookupChunkCode: chunkCodeLookupFn, diff: Diff) {
    console.log("Received diff: ", diff)

    let newSrc = (await Promise.all(
        diff.delta.map(async x => {
            if(getType(x) == 'String') return x;
            else if(x === '') return '';
            else {
                let chunkIdx = <number> x;
                let chunkId = <ChunkId> diff.chunkLookup[chunkIdx];
                return await lookupChunkCode(chunkId);
            }
        }
    ))).join('')
    
    return newSrc;
}

export function unpackDiff(buf: BinaryDiff): Diff {
    return decode(buf);
}



