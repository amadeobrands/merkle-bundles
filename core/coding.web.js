
// const msgpack = require("msgpack-lite");
// var notepack = require('./vendor/notepack');;
import decodeN from 'notepack.io/browser/decode';
import encodeN from 'notepack.io/browser/encode';

export function encode(obj) {
    return encodeN(obj);
}

export function decode(buf) {
    return decodeN(buf);
}