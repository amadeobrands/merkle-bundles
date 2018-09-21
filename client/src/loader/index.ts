import {
    ChunkId
} from '../../../core/chunks';

import {
    LightBundle
} from '../../../core/bundle/dumb';

import {
    Bundle
} from '../../../core/bundle/full';

import {
    ajaxGet
} from '../helpers';

import {
    unpackDiff,
    applyDiff
} from '../../../core/diff/apply';
// } from '../core/client';

import {
    BundleCacher
} from '../cache/cacher';
import { IDBBundleCacher } from '../cache/indexeddb';
// import { TurboJsConfig } from '../../../core/src';
// import { TurboJsConfig } from '../../../core/src';
import { TurboJsConfig } from '.././../../core/index';


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
            let conf: TurboJsConfig = {
                cached,
            };
            
            // console.log(Buffer.from(JSON.stringify(cached)).toString("base64"))
            let res = await ajaxGet(
                `${this.endpoint}/bundles/${id}`,  
                { 
                    responseType: 'arraybuffer',
                    headers: {
                        'X-TurboJS': Buffer.from(JSON.stringify(conf)).toString("base64")
                    }
                }
            );

            let diff = unpackDiff(res);

            let src = await applyDiff(
                (id) => this.cacher.getCodeForChunk(id),
                diff
            )

            console.log(`Building new bundle ${diff.hash}...`)
            await this.buildNewBundle(src)
            // TODO performance above.
            
            return src;
        }
    }

    async buildNewBundle(src: string) {
        let bundle = new Bundle("", src);
        
        console.log(`Build of bundle ${bundle.root} complete`)
        let newBundle: LightBundle = {
            src,
            name: "",
            root: bundle.root,
            chunks: bundle.chunks
        };

        console.log(`Storing bundle ${bundle.root}`)
        await this.cacher.storeBundle(newBundle);
    }

    async loadAndExec(id: ChunkId) {
        let src = await this.load(id);
        eval(src);
    }
}