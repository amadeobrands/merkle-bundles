import * as chai from 'chai';

import Dexie from 'dexie';

chai.use(require("chai-as-promised"));
const expect = chai.expect;
const assert = chai.assert;

import { resolve } from 'path';

import {
    BundleLoader,
} from '../../client/src/loader';

import { IDBBundleCacher } from '../../client/src/cache/indexeddb';


describe('BundleLoader', function() {
    // const basedir = resolve(__dirname, "../resources/page1/dist");

    // beforeEach(async function() {
    //     this.context = new TestContext(basedir);
    //     this.context.getTmpDir();
    // })

    it('#new', function() {
        let loader = new BundleLoader("");
        expect(loader.cacher).to.not.be.null;
    });
})

describe('BundleCacher', function() {
    it("#new", function() {
        let cacher = new IDBBundleCacher();
        expect(cacher.db).to.be.an.instanceof(Dexie);
    })
})