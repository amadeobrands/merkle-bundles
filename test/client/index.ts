import * as chai from 'chai';
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

import { resolve } from 'path';

import {
    BundleLoader,
} from '../../client/src/loader';

import { IDBBundleCacher } from '../../client/src/cache/indexeddb';

import { cd, cp, rm, ls } from 'shelljs';


describe('BundleLoader', function() {
    // const basedir = resolve(__dirname, "../resources/page1/dist");

    // beforeEach(async function() {
    //     this.context = new TestContext(basedir);
    //     this.context.getTmpDir();
    // })

    it('#new', async function() {
        let loader = new BundleLoader("");
        expect(loader.cacher).to.not.be.null;
    });
})

describe('BundleCacher', function() {
    it("#new", async function() {
        let cacher = new IDBBundleCacher();
        expect(cacher.db).to.not.be.null;
    })
})