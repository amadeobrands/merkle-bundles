const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const assert = require("assert");

let DEBUG_BROWSER;
DEBUG_BROWSER = true;
function debugBrowser(done) {
    if(typeof done !== 'Function') throw new Error("done callback must be passed");
    if(DEBUG_BROWSER) {
        browser.on('targetdestroyed', () => done());
        page.evaluate(() => {
            debugger;
        })
    }
}

class Addr {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    url() {
        return `http://${this.host}:${this.port}/`;
    }
}

class Stats {
    constructor() {}

    put() {

    }
    
    write() {

    }
}

let webappServer;
const webappServerAddr = new Addr('localhost', 9001)

let bundleServer;
const bundleServerAddr = new Addr('localhost', 9002)

const dir = path.resolve(__dirname, "./page1");
console.log(`Loading E2E test in ${dir}`);


const setupBundleServer = async () => {
    let app = await require('../../dist/bin/server')(dir);
    let x = new Promise((resolve, reject) => {
        bundleServer = app
        .listen(bundleServerAddr.port, bundleServerAddr.host, resolve);
        console.log("Setup bundle server");
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
            resolve()
            console.log("Setup static web app server");
        });
    });
    return x;
}

let browser, page;
const setupBrowser = async () => {
    browser = await puppeteer.launch({
        headless: !DEBUG_BROWSER,
        args: ['--no-sandbox'],
        // userDataDir: dir
    });
    page = await browser.newPage();
    page.on('console', msg => console.log('[console.log] ', msg.text()));
    page.on('pageerror', (x) => console.log('[page error] ', x))
    console.log("Setup headless browser");
    // await page.setRequestInterception(true);
}

const setup = async () => {
    shell.cd(dir);
    shell.rm('bundle.js')

    return await Promise.all([
        setupBundleServer(),
        setupWebappServer(),
        setupBrowser(),
    ])
};

const teardown = (async () => {
    // await page.close();
    if(!DEBUG_BROWSER) await browser.close();
    return await Promise.all([
        bundleServer.close(),
        webappServer.close()
    ])
})


const bundlePath = path.join(dir, 'bundle.js');

const trackResponseLoaded = (page, url) => {
    return new Promise((resolve, reject) => {
        page.on('response', (response) => {
            if(response.request().url() === url) {
                resolve(response);
            }
        });
    });
}


describe('1st load of page', function() {
    this.timeout(15 * 1000);

    before(async function() {
        await setup();
        shell.cp('example1.js', 'bundle.js')
    })
    
    after(async () => {
        await teardown();
    })
    
    it('should request the bootstrap and bundle code', async () => {
        let bootstrap = trackResponseLoaded(page, "http://localhost:9001/dist/bootstrap.js").then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        let client = trackResponseLoaded(page, "http://localhost:9002/merkle-ast-client-bundle").then(response => {
            assert(!response.fromCache());
            return Promise.resolve();
        })

        let bundle = trackResponseLoaded(page, "http://localhost:9002/bundle-diffs/bundle.js/by-root/undefined").then(response => {
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

    it.only('should not request the bundle again', function(done) {
        // this.timeout(0)
        // debugBrowser(done);

        (async function() {
            // First load.
            await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

            let resourcesLoaded = {};
            page.on('response', async (response) => {
                let k = response.request().url();
                resourcesLoaded[k] = await response.buffer();
            });

            let bootstrap = trackResponseLoaded(page, "http://localhost:9001/dist/bootstrap.js").then(response => {
                assert(!response.fromCache());
                return Promise.resolve();
            })

            let bundle = trackResponseLoaded(page, "http://localhost:9002/bundle-diffs/bundle.js/by-root/0a7435c0e287f6").then(response => {
                assert(!response.fromCache());
                return Promise.resolve();
            })



            // Second load
            await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
            

            await Promise.all([
                bootstrap,
                bundle,
            ]);
            
            console.log(resourcesLoaded)


            assert.strictEqual(resourcesLoaded["http://localhost:9002/merkle-ast-client-bundle"], undefined, "don't reload merkle client");
            assert.strictEqual(resourcesLoaded["http://localhost:9002/bundle-diffs/bundle.js/by-root/undefined"], undefined, "should load the bundle from its tree hash, not from undefined");        

            // return Promise.resolve()
            // done();
        })()
    })
})