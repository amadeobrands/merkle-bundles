import Bundle from './bundle';
import { set } from './codecache';

self.onmessage = async function (event) {
    let { bundleName, src } = event.data;
    let bundle = new Bundle(src);
    try {
        await set(bundleName, bundle)
    } catch(ex) {
        console.error(ex);
    }
};