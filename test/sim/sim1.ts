import { resolve } from 'path';
import { cd, rm, cp, ls } from 'shelljs';
import chalk from 'chalk';

import { TestBundleServer, Addr, log, TestAppServer, TestBrowser } from "../helpers";

let bundleServer: TestBundleServer;
let appServer: TestAppServer;
let browser: TestBrowser;
const bundleName = 'bundle.js';


import { Simulation } from './helpers';

class Sim1 extends Simulation {
    async before() {
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

    }

    async after() {
        await Promise.all([
            bundleServer.close(),
            appServer.close()
        ]);
    }

    async sim() {
        let responses = {};

        await bundleServer.replaceAndWaitForReload('bundle.js', 'example1.js')
        browser.page.on('response', async (response) => {
            let k = response.request().url();
            let buf = await response.buffer();
            log(`Response ${k}, ${buf.length} bytes`)
            // responses[k] = await response.buffer();
        });
        await browser.page.goto(appServer.addr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
        
        await bundleServer.replaceAndWaitForReload('bundle.js', 'example2.js')
        browser.page.on('response', async (response) => {
            let k = response.request().url();
            let buf = await response.buffer();
            log(`Response ${k}, ${buf.length} bytes`)
            responses[k] = await response.buffer();
        });
        await browser.page.goto(appServer.addr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
        return new Promise((res, rej) => setTimeout(res, 100000));
    }
}


let sim = new Sim1();
sim.run();