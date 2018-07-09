var getType = require('get-object-type');
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

export function isArrayFullOfPrimitives(arr: any[]) {
    for(let item of arr) {
        let typ = getType(item);
        if(typ === 'Object') return false;
    }
    return true;
}

export const getKeyVals = (obj) => {
    return Object.entries(obj).map(entry => {
        return {
            k: entry[0],
            v: entry[1]
        }
    })
}

export const readText = (f) => fs.readFileSync(__dirname + f, 'utf-8')
