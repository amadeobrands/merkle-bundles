

const assert = require("assert");
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const log = console.log;
const path = require('path');
const shell = require('shelljs');
const Q = require('q');


class Addr {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    url() {
        return `http://${this.host}:${this.port}`;
    }
}

let webappServer;
const webappServerAddr = new Addr('localhost', 9001)

let bundleServer;
const bundleServerAddr = new Addr('localhost', 9002)

const dir = path.resolve(__dirname, "./page1/dist");
console.log(`Loading E2E test in ${dir}`);

const AstexServer = require('astex-server');

const setupBundleServer = async () => {
    let app = await AstexServer.makeApp(dir);
    let x = new Promise((resolve, reject) => {
        bundleServer = app
        .listen(bundleServerAddr.port, bundleServerAddr.host, () => {
            log(chalk.blue("Setup bundle server"));
            resolve()
        });
    });
    return x;
}

const setupWebappServer = async () => {
    let x = new Promise((resolve, reject) => {
        const StaticServer = require('static-server');
        webappServer = new StaticServer({
            rootPath: dir,
            host: webappServerAddr.host,
            port: webappServerAddr.port,
            cors: '*',        
            followSymlink: false,  
        });
        webappServer.start(function() {
            webappServer = this;
            log(chalk.blue("Setup static web app server"));
            resolve()
        });
    });
    return x;
}

let browser, page;
const setupBrowser = async () => {
    browser = await puppeteer.launch({
        headless: !DEBUG_BROWSER,
        args: ['--no-sandbox'],
        userDataDir: '/tmp/merkle-bundle-puppeteer' + new Date() // TODO HACK
    });
    page = await browser.newPage();
    page.on('console', msg => console.log('[console.log] ', msg.text()));
    page.on('pageerror', (x) => console.log('[page error] ', x))
    // page.setRequestInterception(true);
    log(chalk.blue("Setup headless browser"));
}

const trackResponseLoaded = (page, url) => {
    return new Promise((resolve, reject) => {
        page.on('response', (response) => {
            if(response.request().url() === url) {
                resolve(response);
            }
        });
    });
}








// const {
//     webappServer,
//     webappServerAddr,
//     bundleServer,
//     bundleServerAddr,

//     setupBundleServer,
//     setupWebappServer,
//     setupBrowser,

//     browser,
//     page,

//     dir
// } = require('./setup');

let DEBUG_BROWSER;
// DEBUG_BROWSER = true;

function debugBrowser(done) {
    if(typeof done !== 'Function') throw new Error("done callback must be passed");
    if(DEBUG_BROWSER) {
        browser.on('targetdestroyed', () => done());
        page.evaluate(() => {
            debugger;
        })
    }
}

class Stats {
    constructor() {}

    put() {

    }
    
    write() {

    }
}

const setup = async () => {
    shell.cd(dir);
    try {
        shell.rm('bundle.js')
    } catch(ex) {}

    return await Promise.all([
        setupBundleServer(),
        setupWebappServer(),
        setupBrowser(),
    ])
};

const teardown = async () => {
    // await page.close();
    if(!DEBUG_BROWSER) await browser.close();
    return await Promise.all([
        bundleServer.close(),
        webappServer.close()
    ])
};


const bundlePath = path.join(dir, 'bundle.js');





describe('1st load of page', function() {
    this.timeout(15 * 1000);

    before(async function() {
        await setup();
        log(chalk.blue("Setup complete!"));
        shell.cp('example1.js', 'bundle.js')
    })
    
    after(async () => {
        await teardown();
    });
    
    it('should request the bootstrap and bundle code', async () => {
        let bootstrap = trackResponseLoaded(page, `${webappServerAddr.url()}/bootstrapper.js`).then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        let client = trackResponseLoaded(page, `${bundleServerAddr.url()}/merkle-ast-client-bundle`).then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/undefined`).then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
        await Promise.all([
            bootstrap,
            client,
            bundle
        ]);
    });

    // this.timeout(0)
    it('should not request the bundle again',  async () => {
        // debugBrowser(done);
        // First load.
        await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

        let resourcesLoaded = {};
        page.on('response', async (response) => {
            let k = response.request().url();
            resourcesLoaded[k] = await response.buffer();
        });

        let bootstrap = trackResponseLoaded(page, `${webappServerAddr.url()}/bootstrapper.js`).then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`).then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        // Second load
        await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
        
        await Promise.all([
            bootstrap,
            bundle,
        ]);
        
        // console.log(resourcesLoaded)

        assert.strictEqual(resourcesLoaded[`${bundleServerAddr.url()}/merkle-ast-client-bundle`], undefined, "don't reload merkle client");
        assert.strictEqual(resourcesLoaded[`${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/undefined`], undefined, "should load the bundle from its tree hash, not from undefined");
        assert.notStrictEqual(resourcesLoaded[`${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`], undefined, "bundle diff should be loaded");

        return await Promise.all([]);
    })



    it.only(`should load a diff of the new bundle code`, async () => {
        // First load
        // ----------

        shell.cp('example1.js', 'bundle.js')
        await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

        // let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`).then(response => {
        //     assert(!response.fromCache());
        //     return Promise.resolve();
        // })


        // Second load
        // -----------

        let resourcesLoaded = {};
        page.on('response', async (response) => {
            let k = response.request().url();
            resourcesLoaded[k] = await response.buffer();
        });

        let serverReload = new Q.defer();
        AstexServer.events.on('reloaded', (ev) => {
            serverReload.resolve()
        })
        shell.cp('example2.js', 'bundle.js')
        await serverReload.promise;
        
        // let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`).then(response => {
        //     assert(!response.fromCache());
        //     return Promise.resolve();
        // })

        await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

        assert.notStrictEqual(
            resourcesLoaded[`${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`], 
            undefined, 
            "bundle should be loaded from previous root"
        );

        return await Promise.all([]);
    })
})