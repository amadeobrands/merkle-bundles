// Webpack bootstrap code.

import { get, set } from './codecache';
import * as qwest from 'qwest';

const pjson = require('../../package.json');
const { name, version } = pjson;
const BOOTSTRAP_KEY = `${name}@${version}`;

export async function bootstrap(endpoint) {
    let bundle = await get(BOOTSTRAP_KEY);
    if(!bundle) {
        try {
            let promise = new Promise((resolve, reject) => {
                qwest.get(
                    `${endpoint}/bootstrap`,
                    { responseType: 'text' }
                ).then((xhr, res) => {
                    resolve(res)
                }).catch(ex => {
                    reject(ex);
                })
            })

            let res = await promise;

            await set(BOOTSTRAP_KEY, res);
            
        } catch(ex) {
            throw ex;
        }
    }
}

export async function latestBootstrapLoaded() {
    return (await get(BOOTSTRAP_KEY)) !== null;
}