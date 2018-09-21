import {
    Hash,
} from '../hash';

import {
    ChunkId,
} from '../chunks';

export interface Diff {
    hash: Hash,
    delta: Array<string | number>,
    chunkLookup: ChunkId[]
};

export type BinaryDiff = ArrayBuffer;