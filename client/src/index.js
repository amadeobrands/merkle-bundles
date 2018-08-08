import {
    decode,
    applyDiff,
} from 'astex-core/dist/bundle.web';
import Bundle from './bundle';

import {
    get,
    set
} from './codecache';
import merge from 'lodash.merge';
import {ajaxGet} from './helpers';

import BundleProcessor from './BundleProcessor.worker';



export default class MerkleBundleAstClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async hasCachedBundle(bundleName) {
        let bundle = await get(bundleName);
        return bundle !== null;
    }

    

    async load(bundleName, userOpts) {
        let opts = merge(
            {
                exec: true
            },
            userOpts
        );
        
        try {
            let bundle = await get(bundleName);
            if(!bundle) {
                bundle = new Bundle('');
            }
            
            // TODO
            // since we set bundle above
            // it will have a bundle.tree._hash
            // could be confusing later down the line
            // since it doesn't actually exist
            let res = await ajaxGet(
                `${this.endpoint}/${bundleName}/diff-by-root/${bundle.hash}`,  
                { responseType: 'arraybuffer', async: true }
            );

            res = decode(res);

            let src = applyDiff(bundle.src, bundle.chunkLookup, res);

            if(opts.exec) {
                try {
                    eval(src)
                } catch(ex) {
                    throw new Error(`Bundle loaded, but it threw errors: ${ex}`)
                }
            }

            let processor = new BundleProcessor();
            processor.postMessage({ bundleName, src });
            
            // return bundle;

        } catch(ex) {
            throw ex;
        }

        return null;
    }
}
