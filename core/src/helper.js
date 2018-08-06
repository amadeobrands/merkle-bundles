var getType = require('get-object-type');
const symDesc = require('symbol-description')

import { HASH } from './merkle';

export function isArrayFullOfPrimitives(arr) {
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
