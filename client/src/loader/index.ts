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
import { TurboJsConfig, BundleDetail } from '.././../../core/index';
import { setCoder } from '../../../core/coding';

import * as coder from '../../../core/coding.web';


export class BundleLoader {
    endpoint: string;
    cacher: BundleCacher;
    
    constructor(endpoint: string) {
        this.endpoint = endpoint;
        this.cacher = new IDBBundleCacher();
        setCoder(coder);
    }   

    async load(detail: BundleDetail, exec: boolean): Promise<string> {
        let { id } = detail;
        let cached = await this.cacher.getCachedBundles();

        if(cached.includes(id)) {
            console.log(`Loading cached bundle ${detail.name} with root ${id}`)
            return (await this.cacher.getBundle(id)).src;
        }

        else {
            let conf: TurboJsConfig = {
                cached,
                bundleId: null
            };
            
            // console.log(Buffer.from(JSON.stringify(cached)).toString("base64"))
            let res = await ajaxGet(
                `${this.endpoint}/bundles/${encodeURIComponent(id)}`,  
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
            
            // let src = await this.load(id);
            if(exec) {
                try {
                    eval(src);
                } catch(ex) {
                    throw new Error(`${detail.name}: error while running bundle \n${ex}`)
                }
            }
            
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

    // async loadAndExecById(id: ChunkId) {

    // }
}