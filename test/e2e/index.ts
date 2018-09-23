import { resolve } from 'path';
import { cd, rm, cp, ls } from 'shelljs';
import chalk from 'chalk';
import * as chai from 'chai';

chai.use(require("chai-as-promised"));
const expect = chai.expect;
const assert = chai.assert;

import { TestBundleServer, Addr, log, TestAppServer, TestBrowser } from "../helpers";



let bundleServer: TestBundleServer;
let appServer: TestAppServer;
let browser: TestBrowser;

const bundleName = 'bundle.js';

describe('1st load of page', function() {
    this.timeout(15 * 1000);
    this.timeout(0 * 1000);

    before(async () => {
        const dir = resolve(__dirname, "../resources/page1/dist");
        log(`Loading E2E test in ${dir}`);

        try {
            cd(dir);
            rm('bundle.js')
        } catch(ex) {};
    
        [
            bundleServer,
            appServer,
            browser
        ] = await Promise.all([
            TestBundleServer.setup(new Addr('localhost', 9002), dir),
            TestAppServer.setup(new Addr('localhost', 9001), dir),
            TestBrowser.setup(false),
        ]);

        let bundleLoaded = bundleServer.waitForFileReload(bundleName);
        cp('example1.js', bundleName);
        await bundleLoaded;
        log(chalk.blue("Setup complete!"));
    })
    
    after(async () => {
        await Promise.all([
            bundleServer.close(),
            appServer.close()
        ])
    });

    it('Loads the bundle loader', async function() {
        await browser.page.goto(appServer.addr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
        await browser.page.goto(appServer.addr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
        return new Promise((res, rej) => setTimeout(res, 100000));
    });
})