import {
    decode,
    applyDiff,
    parse,
    getHashedTree,
} from 'astex-core';

import {
    get,
    set
} from './codecache';
import merge from 'lodash.merge';
import {ajaxGet} from './helpers';


class Bundle {
    constructor(src) {
        this.src = src;
        let ast = parse(src, false);
        let astLocations = parse(src, true);
        let tree = getHashedTree(ast);
        this.tree = merge(astLocations, tree.val);
    }
}

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
            // console.log(bundle)
            
            let res = await ajaxGet(
                `${this.endpoint}/bundle-diffs/${bundleName}/by-root/${bundle.tree._hash}`,  
                { responseType: 'arraybuffer', async: true }
            );

            res = decode(res);

            let src = applyDiff(bundle.src, res);
            bundle = new Bundle(src);
            await set(bundleName, bundle)

            if(opts.exec) {
                try {
                    eval(bundle.src)
                } catch(ex) {
                    throw new Error(`Bundle loaded, but it threw errors: ${ex}`)
                }
            }
            
            return bundle;

        } catch(ex) {
            throw ex;
        }

        return null;
    }
}
