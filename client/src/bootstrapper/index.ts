import { BundleLoader } from "../loader/index";
import { parseUrl } from "../helpers";
import { ChunkId, BundleDetail } from "../../../core";

// Things we need:
// - identify current chunks from cache
// - client download new chunks from server, concat and exec bundle
// - save chunks and exec
// also I want in the design:
// a single script tag
// but a window-level API for loading bundles from the server

export const GLOBAL = "TurboJS";
export const EVENT_LOADED = `turbojs-loaded`;


function bootstrap(bundleDetails: BundleDetail[]) {
    let el = document.getElementById('turbojs') as HTMLScriptElement;
    if(!el) {
        throw new Error("Couldn't find TurboJS script. Did you forget to set <script id='turbojs' .../>?");
    }

    // let ids = bundleDetails.map(detail => detail.id);
    // console.log(`Loading scripts: ${JSON.stringify(ids)}`)

    // let scriptsToLoad = (el.getAttribute("data-scripts") || '').split(',');
    // if(!scriptsToLoad.length) {
    //     throw new Error("Was not provided with any scripts - try setting <script data-scripts='bundle.js,bundle2.js' .../>");
    // }
    
    let addr = parseUrl(el.src);
    let endpoint = `${addr.protocol}//${addr.host}`;

    let loader = new BundleLoader(endpoint);
    window[GLOBAL] = loader;
    document.dispatchEvent(new Event(EVENT_LOADED));
    
    bundleDetails.map(detail => {
        console.log(`Loading bundle ${detail.name}, root ${detail.id}`)
        loader.load(detail, true);
    });
}

// set(CLIENT_GLOBAL_NAME, code);
// import Cookie from 'js-cookie';
// Cookie.set(PACKAGE_JSON.name, PACKAGE_JSON.version);

export default bootstrap;