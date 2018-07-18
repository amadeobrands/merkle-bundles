// Webpack bootstrap code.

import { get, set } from './codecache';
import { ajaxGet } from './helpers';

const pjson = require('../../package.json');
const { name, version } = pjson;
const BOOTSTRAP_KEY = `${name}@${version}`;

export async function bootstrap(endpoint) {
    let client = window['MerkleAstBundleClient'];
    if(client) {
        throw new Error("MerkleAstBundleClient already loaded into window global. This is bad.")
    }

    let bundle = await get(BOOTSTRAP_KEY);
 
    if(!bundle) {
        console.log("Retrieving bundle...")
        try {
            let res = await ajaxGet(
                `${endpoint}/merkle-ast-client-bundle`,
                { responseType: 'text' }
            )
            bundle = res;

            await set(BOOTSTRAP_KEY, bundle);
        } catch(ex) {
            throw ex;
        }
    } else {
        console.log("Using cached bundle...")
    }

    eval(bundle);
    client = window['MerkleAstBundleClient'];
    return new client(endpoint);
}

export async function latestBootstrapLoaded() {
    return (await get(BOOTSTRAP_KEY)) !== null;
}