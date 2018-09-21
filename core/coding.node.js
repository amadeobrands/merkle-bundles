
// const msgpack = require("msgpack-lite");
import notepack from 'notepack.io/lib';

export function encode(obj) {
    return notepack.encode(obj);
}

export function decode(buf) {
    return notepack.decode(buf);
}