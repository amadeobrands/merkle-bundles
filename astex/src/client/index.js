
const msgpack = require("msgpack-lite");
import * as qwest from 'qwest';
import localforage from 'localforage';
import _ from 'lodash';
import {
    applyDiff,
    parse,
} from './merkle';

localforage.config({
    storeName: 'merkleAstBundles',
})

export class Client {
    lookup = {};

    constructor(endpoint) {
        this.endpoint = endpoint;
        localforage.getItem('lookup').then(lookup => {
            this.lookup = lookup;
        });
    }

    getBundle(bundleFilename) {
        let dfd = new Promise();

        let info = this.lookup[bundleFilename];
        let root = (info && info.tree.hash) || 0;

        qwest.get(
            `${this.endpoint}/${bundleFilename}/by-root/${root}`,  
            { dataType: 'arraybuffer', responseType: 'arraybuffer' 
        })
        .then((xhr, res) => {
            // console.log(response)
            res = msgpack.decode(res);

            let src;

            if(!info) {
                src = res.diff;
            } else {
                let { tree } = info;
                src = applyDiff(tree.val, res);
            }

            // build new tree

            let ast = parse(src, false);
            let astLocations = parse(src, true);
            let tree = getHashedTree(ast);
            
            let newInfo = {
                src,
                tree: {
                    ...tree,
                    val: _.merge(astLocations, tree.val)
                }
            }
            this.lookup[bundleFilename] = newInfo;
            localforage.setItem('lookup', this.lookup);

            dfd.resolve(src);
        })

        return dfd;
    }
}