const fs = require('fs');
const symDesc = require('symbol-description')

import { HASH } from './merkle';


export function log(type, name, content) {
    let x = JSON.stringify(content, (k, v) => {
        if(v instanceof Array && v.hasOwnProperty(HASH)) {
            let newObj = {};
            v.map((v, i) => {
                newObj[i] = v;
            })
            newObj[HASH] = v[HASH];
            return newObj;
        } else return v;
    }, 1);

    let fname = `${symDesc(type)}.${name}.json`;
    fs.writeFileSync(`${__dirname}/output/${fname}`, x);
}