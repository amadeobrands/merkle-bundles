import {
    ChunkId
} from '../../../core/src/chunks';

import {
    LightBundle
} from '../../../core/src/bundle/dumb';

// @ts-ignore
import localforage from 'localforage';

export class BundleCacher {
    constructor() {
        // super();
        localforage.config({
            storeName: 'merkleAstBundles',
            driver: localforage.INDEXEDDB
        })
    }

    async storeBundle(key: ChunkId, bundle: LightBundle) {
        await localforage.setItem(key, bundle)
    }

    async getBundle(key: ChunkId): Promise<LightBundle> {
        return await localforage.getItem(key) as LightBundle
    }

    async getCachedBundles(): Promise<ChunkId[]> {
        let keys = await localforage.keys() as ChunkId[];
        return keys;
    }
}