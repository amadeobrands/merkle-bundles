const fs = require('fs');
const symDesc = require('symbol-description')

import { HASH } from './merkle';


export function log(type, name, content) {
    let x = JSON.stringify(content, (k, v) => {
        if(v instanceof Array) {
            let newObj = {};
            v.map((v, i) => {
                newObj[i] = v;
            })
            newObj[HASH] = v[HASH];
            return newObj;
            // console.log(v)
            // return Object.assign(v.map((v, i) => {
            //     return { [i]: v }
            // }), { [HASH]: v[HASH] })
        } else return v;
    }, 1);

    let fname = `${symDesc(type)}.${name}.json`;
    fs.writeFileSync(`${__dirname}/output/${fname}`, x);
}