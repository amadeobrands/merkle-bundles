import * as chai from 'chai';
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

import { resolve } from 'path';
import { TestBundleServer, TestContext, Addr } from '../helpers';


import {
    FileMgr,
    events
} from '../../server/src/index';
import { cd, cp, rm, ls } from 'shelljs';


describe('FileMgr', function() {
    const basedir = resolve(__dirname, "../resources/page1/dist");

    beforeEach(async function() {
        this.context = new TestContext(basedir);
        this.context.getTmpDir();
    })

    it('constructs a filemgr', async function() {
        const fileMgr = new FileMgr(this.context.tmpdir);
        expect(fileMgr.basePath == this.context.tmpdir);
        expect(fileMgr.bundles).to.deep.equal({});
        expect(fileMgr.latest).to.deep.equal({});
    });

    describe('watch()', function() {
        it('should load all files in dir initially', async function() {
            const fileMgr = new FileMgr(this.context.tmpdir);
            await fileMgr.watch();
            expect(fileMgr.watcher).to.not.be.undefined;
            
            let files = ['bundle.js'];

            let filesLoaded = files.map(name => {
                return new Promise((res, rej) => {
                    events.on('reloaded', ({ fname }) => {
                        if(fname === name) res();
                    });
                })
            })
            expect(Promise.all(filesLoaded)).to.be.fulfilled;
            
            files.map(file => {
                let hash = fileMgr.latest[file];
                expect(hash).to.not.be.undefined;
                let bundle = fileMgr.bundles[hash];
                expect(bundle).to.not.be.undefined;
            })
        });

        // it.only('should handle a file being deleted', async function() {
        //     cp('example1.js', 'bundle.js');

        //     const fileMgr = new FileMgr(this.context.tmpdir);
        //     await fileMgr.watch();
        //     await this.context.waitForReload(events, 'bundle.js');
        //     expect(fileMgr.latest['bundle.js']).to.not.be.undefined;
        //     rm('bundle.js');
        //     await this.context.waitForReload(events, 'bundle.js');
        //     expect(fileMgr.latest['bundle.js']).to.be.undefined;
        // })

        it.only('should reload a file and update the latest mapping', async function() {
            cp('example1.js', 'bundle.js');
            
        })
    })

    // describe("generateDiff()", () => {})
    

    // describe('when a file is updated', async () => {
    //     it('should reload it', async () => {
            
    //     })
    // })
    

    // it('does its thing', async () => {
    //     await TestBundleServer.setup(new Addr("localhost", 8080), dir);
        
    // })
})