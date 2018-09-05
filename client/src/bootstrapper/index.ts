import { BundleLoader } from "../loader/index";
import { parseUrl } from "../helpers";

// Things we need:
// - identify current chunks from cache
// - client download new chunks from server, concat and exec bundle
// - save chunks and exec
// also I want in the design:
// a single script tag
// but a window-level API for loading bundles from the server

export const GLOBAL = "TurboJS";
export const EVENT_LOADED = `turbojs-loaded`;

function bootstrap() {
    let el = document.getElementById('turbojs') as HTMLScriptElement;
    if(!el) {
        throw new Error("Couldn't find TurboJS script. Did you forget to set <script id='turbojs' .../>?");
    }

    let scriptsToLoad = (el.getAttribute("data-scripts") || '').split(',');
    if(!scriptsToLoad.length) {
        throw new Error("Was not provided with any scripts - try setting <script data-scripts='bundle.js,bundle2.js' .../>");
    }
    
    let addr = parseUrl(el.src);
    let endpoint = `${addr.protocol}//${addr.host}`;

    let loader = new BundleLoader(endpoint);
    window[GLOBAL] = loader;
    document.dispatchEvent(new Event(EVENT_LOADED));
    
    scriptsToLoad.map(script => loader.loadAndExec(script));
}

(async function() {
    bootstrap()
})()