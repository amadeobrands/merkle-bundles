import { dirname } from 'path';

const request = require('supertest');
const assert = require('assert');
const path = require('path');
const msgpack = require("msgpack-lite");
const fs = require('fs');
const arrayBufferToHex = require('array-buffer-to-hex')
import Q from 'q';


let app = require('../bin/server');
import {
    loadInitialModules,
    events
} from '../server_core';


function binaryParser(res, callback) {
    res.setEncoding('binary');
    res.data = '';
    res.on('data', function (chunk) {
        res.data += chunk;
    });
    res.on('end', function () {
        callback(null, new Buffer(res.data, 'binary'));
    });
}

let filesPath = path.join(__dirname + '/server/');
const bundleFilename = 'file.js';

fs.writeFileSync(
    path.join(filesPath, `/watch/file.js`), 
    fs.readFileSync(path.join(filesPath, `/file.orig.js`))
)

describe('handles bundles', function() {
    beforeEach((done) => {
        loadInitialModules(filesPath + '/watch').then(() => {
            done()
        })
    })

    it('responds with full bundle without root', () => {
        return request(app)
        .get(`/bundle-diffs/${bundleFilename}/by-root/0`)
        .expect(200)
        .parse(binaryParser)
        .buffer()
        .then(res => {
            let diff = msgpack.decode(res.body);
            assert.equal(diff.diff, 'blockchain = true;\niot = false;\nlove = NaN;');
            assert.deepEqual(diff.chunks, []);

            fs.writeFileSync(
                path.join(filesPath, `/watch/file.js`), 
                fs.readFileSync(path.join(filesPath, `/file.modified.js`))
            )

            let dfd = new Q.defer();
            events.on('reloaded', (ev) => {
                dfd.resolve()
            })
            return dfd.promise;
        })
        .then(() => {
            // responds with the updated bundle, including chunks we already have

            let root = 'c4befccbca742d';
            return request(app)
            .get(`/bundle-diffs/${bundleFilename}/by-root/${root}`)
            .expect(200)
            .parse(binaryParser)
            .buffer()
            .then(res => {
                let diff = msgpack.decode(res.body);
                assert.deepEqual(diff.diff, [
                    "",
                    0,
                    "\nfunction howToBuzzword() {\n    return ",
                    1,
                    ";\n}\n",
                    2,
                    ""
                   ]
                );

                assert.deepEqual(diff.chunks.map(arrayBufferToHex), [ '3c269449a9b275', '19abca412ed4e3', 'a10d55a9d473be' ]);

                // applyDiff(_.merge(clientAstLocations, clientTree), diff);
                // assert.deepEqual(diff.chunks, []);
            })
        })
    });
});