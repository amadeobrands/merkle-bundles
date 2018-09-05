import {
    ChunkId
} from '../../../core/src/chunks';

import {
    LightBundle
} from '../../../core/src/bundle/dumb';

import {
    Bundle
} from '../../../core/src/bundle/full';

import {
    ajaxGet
} from '../helpers';

import {
    unpackDiff,
    applyDiff
} from '../../../core/src/diff/apply';

import {
    BundleCacher
} from '../cache/cacher';
import { IDBBundleCacher } from '../cache/indexeddb';


export class BundleLoader {
    endpoint: string;
    cacher: BundleCacher;
    
    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.cacher = new IDBBundleCacher();
    }

    async load(id: ChunkId): Promise<string> {
        let cached = await this.cacher.getCachedBundles();
        if(id in cached) return (await this.cacher.getBundle(id)).src;
        
        else {
            let res = await ajaxGet(
                `${this.endpoint}/bundles/${id}`,  
                { 
                    responseType: 'arraybuffer',
                    headers: {
                        'X-TurboJS-Cached': cached.join(',')
                    }
                }
            );

            let diff = unpackDiff(res);

            let src = await applyDiff(
                this.cacher.getCodeForChunk,
                diff
            )

            console.log(`Building new bundle ${diff.hash}...`)
            this.buildNewBundle(src)
            return src;
        }
    }

    buildNewBundle(src: string) {
        let bundle = new Bundle("", src);
        
        console.log(`Build of bundle ${bundle.root} complete`)
        let newBundle: LightBundle = {
            src,
            name: "",
            root: bundle.root,
            chunks: bundle.chunks
        };

        console.log(`Storing bundle ${bundle.root}`)
        this.cacher.storeBundle(newBundle);
    }

    async loadAndExec(id: ChunkId) {
        let src = await this.load(id);
        eval(src);
    }
}