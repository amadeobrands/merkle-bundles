import { sha224 } from 'js-sha256';
import ab2str from 'arraybuffer-to-string';

export function hashesEqual(a: Hash, b: Hash) : boolean {
    return a === b;
}

// > ab2str(require('js-sha256').sha256.arrayBuffer('123'),'hex').length
export const hasher = (v: any) : Hash => {
    // return sha224(`${v}`).substring(0, 14);
    // return sha224.array(v);
    
    // Buffer as a string matches our usage of the hash
    // in dictionary lookups and for comparisons
    // while conserving space
    let buf: ArrayBuffer = sha224.arrayBuffer(`${v}`);
    // return ab2str(buf, 'binary');
    return ab2str(buf, 'base64');
}


export type Hash = string;