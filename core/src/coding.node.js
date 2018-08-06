
// const msgpack = require("msgpack-lite");
var notepack = require('notepack.io');

export function encode(obj) {
    return notepack.encode(obj);
}

export function decode(buf) {
    return notepack.decode(buf);
}