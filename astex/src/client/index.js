
// const msgpack = require("msgpack-lite");
import {
    decode
} from '../coding';

import {
    get,
    set
} from './codecache';
import merge from 'lodash.merge';
import {ajaxGet} from './helpers';

import {
    applyDiff,
    parse,
    getHashedTree,
} from '../merkle';

class Bundle {
    get root () {
        return this.tree.root;
    }

    constructor(src) {
        this.src = src;
        let ast = parse(src, false);
        let astLocations = parse(src, true);
        let tree = getHashedTree(ast);

        this.tree = merge(astLocations, tree.val);
    }
}

module.exports = class MerkleBundleAstClient {
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
        )

        let bundle = await get(bundleName);
        if(!bundle) {
            bundle = new Bundle('');
        }
        
        try {
            let res = await ajaxGet(
                `${this.endpoint}/bundle-diffs/${bundleName}/by-root/${bundle.root}`,  
                { responseType: 'arraybuffer', async: true }
            );

            res = decode(res);

            let src = applyDiff(bundle.src, res);
            bundle = new Bundle(src);
            await set(bundleName, bundle)
            return bundle;

        } catch(ex) {
            throw ex;
        }

        return null;
    }
}
