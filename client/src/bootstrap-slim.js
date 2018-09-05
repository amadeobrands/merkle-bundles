// // Webpack bootstrap code.

// import { get } from './codecache';
// import { ajaxGet } from './helpers';
// import {
//     CLIENT_GLOBAL_NAME
// } from './vars';

// async function bootstrap(endpoint) {
//     // let client = window[CLIENT_GLOBAL_NAME];
//     if(window[CLIENT_GLOBAL_NAME]) {
//         throw new Error(`MerkleAstBundleClient already loaded into window global: ${client}`)
//     }

//     let bundle = await get(CLIENT_GLOBAL_NAME);
//     if(!bundle) throw new Error("Server indicated bundle already exists, but it doesn't. Unexpected!")

//     let x = eval(bundle);
//     let client = window[CLIENT_GLOBAL_NAME].default;
//     return new client(endpoint);
// }

// const parseUrl = (url) => {
//     let el = document.createElement('a');
//     el.href = url;
//     return el;
// }

// // let code = require('raw-loader!../dist/bundle.js');
// // import { set } from './codecache';
// // import {
// //     CLIENT_GLOBAL_NAME
// // } from './vars';

// // set(CLIENT_GLOBAL_NAME, code);
// // import Cookie from 'js-cookie';
// // Cookie.set(PACKAGE_JSON.name, PACKAGE_JSON.version);

// // require('./bootstrap-slim');