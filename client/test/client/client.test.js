import {
  set,
  get
} from '../../src/codecache';
import localforage from 'localforage';

import {
  latestBootstrapLoaded,
  bootstrap
} from '../../src/bootstrap';
import '../../src/index';


const assert = require("assert");


// Helper
// Since this test runs in browser, we can't just use fs.readFile.
// raw-loader automatically adds 'use strict' to the top of imports.
// So we need to strip these for comparison purposes later on.
const bundleA = require('raw-loader!./test-bundles/example1.js').split(`"use strict";\n\n`)[1];
const bundleB = require('raw-loader!./test-bundles/example2.js').split(`"use strict";\n\n`)[1];

before(async () => {
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

const endpoint = "http://localhost:3000";
const bundleName = 'example2.js';

describe("Bootstrapping", () => {
  let client;
  it("should load the bootstrap code from the server if it doesn't exist", async () => {
    assert.strictEqual(await latestBootstrapLoaded(), false);
    client = await bootstrap(endpoint);
    assert.strictEqual(await latestBootstrapLoaded(), true);
  });

  it("should return the client from bootstrap()", async () => {
    assert.strictEqual(client.endpoint, endpoint)
  })

  it(`should load the ${bundleName} in full if it doesnt exist`, async () => {
    // client = await bootstrap(endpoint);
    assert.strictEqual(await client.hasCachedBundle(bundleName), false); 
    let bundle = await client.load(bundleName);
    assert.notStrictEqual(bundle, null);
    assert.strictEqual(await client.hasCachedBundle(bundleName), true);
    assert.strictEqual(bundle.src, bundleB);
  });

  it(`should execute the bundle if option is set`, async () => {
    let bundle = await client.load(bundleName);
    assert.strictEqual(window.x, 2);
  })

  it('should store the bundle and its hash to the local storage backend', async () => {
    let info = await get(bundleName)
    assert.notStrictEqual(info.src, undefined);
    assert.notStrictEqual(info.tree._hash, undefined);
  });

  it('should apply a diff to a bundle already loaded', async () => {
    // load bundleA by key "bundle.js"
    // now reload with the same code
    // now load bundleB by key "bundle.js"
  })
});
