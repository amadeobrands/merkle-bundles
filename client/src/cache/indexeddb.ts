import {
    ChunkId, SourceCodeRange
} from '../../../core/chunks';

import {
    LightBundle
} from '../../../core/bundle/dumb';


import Dexie from 'dexie';
import { BundleCacher } from './cacher';


export class IDBBundleCacher extends BundleCacher {
    db = null;

    constructor() {
        super();

        this.db = new Dexie('turbojs');
        this.db.version(1).stores({
            bundles: '&root',
            chunks: '&id'
        });
    }

    async storeBundle(bundle: LightBundle) {
        await this.db.bundles.put(bundle)

        let chunks = Object.entries(bundle.chunks).map(([ id, range ]) => {
            return {
                bundleId: bundle.root,
                range,
                id,
            }
        });

        try {
            await this.db.chunks.bulkPut(chunks);
        } catch(err) {
            err.failures.forEach(failure => {
                console.error (failure.message);
            });
        }
    }

    async getBundle(key: ChunkId): Promise<LightBundle> {
        let bundles = this.db.bundles.where('root').equals(key).limit(1);
        if(await bundles.count() == 0) return null;
        let bundles_ = await bundles.toArray();
        let bundle = bundles_[0];
        return bundle;
    }

    async getCachedBundles(): Promise<ChunkId[]> {
        let ids = await this.db.bundles.orderBy('root').primaryKeys() as ChunkId[];
        return ids;
    }

    async getCodeForChunk(id: ChunkId): Promise<string> {
        let chunks = this.db.chunks.where('id').equals(id).limit(1);
        if(await chunks.count() == 0) throw new Error(`Couldn't find chunk by id ${id}`);
        let chunks_ = await chunks.toArray();
        let chunk = chunks_[0];
        let [from, to] = chunk.range;
        
        let bundle = await this.getBundle(chunk.bundleId);
        return bundle.src.substring(from, to);
    }
}