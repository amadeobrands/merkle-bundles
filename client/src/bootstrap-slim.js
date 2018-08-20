// Webpack bootstrap code.

import { get } from './codecache';
import { ajaxGet } from './helpers';
import {
    CLIENT_GLOBAL_NAME
} from './vars';

export async function bootstrap(endpoint) {
    // let client = window[CLIENT_GLOBAL_NAME];
    if(window[CLIENT_GLOBAL_NAME]) {
        throw new Error(`MerkleAstBundleClient already loaded into window global: ${client}`)
    }

    let bundle = await get(CLIENT_GLOBAL_NAME);
    if(!bundle) throw new Error("Server indicated bundle already exists, but it doesn't. Unexpected!")

    let x = eval(bundle);
    let client = window[CLIENT_GLOBAL_NAME].default;
    return new client(endpoint);
}

const parseUrl = (url) => {
    let el = document.createElement('a');
    el.href = url;
    return el;
}

(async function() {
    let scriptTag = document.getElementById('turbojs');
    let scripts = (scriptTag.getAttribute("data-scripts") || '').split(',');

    let addr = parseUrl(scriptTag.src);
    let endpoint = `${addr.protocol}//${addr.host}`;

    let client = await bootstrap(endpoint);
    client.load(scripts[0]);
})()