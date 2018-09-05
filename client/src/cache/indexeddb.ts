import {
    ChunkId
} from '../../../core/src/chunks';

import {
    LightBundle
} from '../../../core/src/bundle/dumb';

// @ts-ignore
import Dexie from 'dexie';
import { BundleCacher } from './cacher';


export class IDBBundleCacher extends BundleCacher {
    db = null;

    constructor() {
        super();

        this.db = new Dexie('turbojs');
        this.db.version(1).stores({
            bundles: 'root',
            chunks: 'id'
        });
    }

    async storeBundle(bundle: LightBundle) {
        await this.db.bundles.add(bundle)

        let chunks = Object.entries(bundle.chunks).map(([ id, range ]) => {
            return {
                bundleId: bundle.root,
                range,
                id,
            }
        });

        await this.db.chunks.bulkAdd(chunks);
    }

    async getBundle(key: ChunkId): Promise<LightBundle> {
        let bundles = this.db.bundles.where(':root').equals(key).limit(1);
        if(await bundles.count() == 0) return null;
        return bundles.toArray()[0];
    }

    async getCachedBundles(): Promise<ChunkId[]> {
        let ids = await this.db.bundles.primaryKeys() as ChunkId[];
        return ids;
    }

    async getCodeForChunk(id: ChunkId): Promise<string> {
        let chunks = this.db.chunks.where(':id').equals(id).limit(1);
        if(await chunks.count() == 0) throw new Error(`Couldn't find chunk by id ${id}`);
        let chunk = chunks.toArray()[0];
        let [from, to] = chunk.range;
        
        let bundle = await this.getBundle(chunk.bundleId);
        return bundle.src.substring(from, to);
    }
}