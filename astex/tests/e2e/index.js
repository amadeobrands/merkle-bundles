const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


class Addr {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    url() {
        return `http://${this.host}:${this.port}/`;
    }
}

let webappServer;
const webappServerAddr = new Addr('localhost', 9001)

let bundleServer;
const bundleServerAddr = new Addr('localhost', 9002)

const dir = path.resolve(__dirname, "./page1");
let browser, page;

const setupBrowser = async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setRequestInterception(true);
}

const setupBundleServer = async () => {
    let app = await require('../../dist/bin/server')(dir);
    let x = new Promise((resolve, reject) => {
        bundleServer = app
        .listen(bundleServerAddr.port, bundleServerAddr.host, resolve);
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
        });
    });
    return x;
}

before(async () => {
    await setupBundleServer();
    console.log("Setup bundle server");
    await setupWebappServer()
    console.log("Setup static web app server");
    await setupBrowser();
    console.log("Setup headless browser");
})

after(async () => {
    await page.close();
    await [
        browser.close(),
        bundleServer.close(),
        webappServer.close()
    ];
})

describe('1st load of page', () => {
    it('should request the bootstrap and bundle code', async () => {
        
        // Calling `done()` twice is an error
        // setImmediate(done);        

        // page.on('request', request => {
        //     request.continue();
        // });
        await page.goto(webappServerAddr.url());
        
        return true;
    });
})

// first load we request the bootstrap code
// second load we don't have to request this
// we also dont request the bundle again since it's the same

// now we change the bundle
// third load it loads the diff from the server