

// import { dirname } from 'path';

// const request = require('supertest');
// const assert = require('assert');
// const path = require('path');
// const msgpack = require("msgpack-lite");
// const fs = require('fs');
// const arrayBufferToHex = require('array-buffer-to-hex')

import {
  set,
  get
} from '../../src/client/codecache';
import localforage from 'localforage';

import {
  latestBootstrapLoaded,
  bootstrap
} from '../../src/client/bootstrap';

const assert = require("assert");

const bundleA = require('raw-loader!../example1.js');
const bundleB = require('raw-loader!../example2.js');

beforeEach(async () => {
  await localforage.clear();
})

describe("code cache", () => {
  it("should set code into a cache", async () => {
    assert.deepStrictEqual(await get('bundle.js'), null);

    let cached = {
      code: bundleA
    }
    await set('bundle.js', cached);

    assert.deepStrictEqual(await get('bundle.js'), cached);
  });
});

describe("Example page", () => {
  it("should load the bootstrap code from the server if it doesn't exist", async () => {
    assert.strictEqual(await latestBootstrapLoaded(), false);
    await bootstrap("http://localhost:3000");
    assert.strictEqual(await latestBootstrapLoaded(), true);
  });

  // it("should request a bundle from the server if it doesnt exist", () => {
  //   let bundleName = 'bundle.js';


  //   // console.log(MerkleAstBundles)

  // })
});