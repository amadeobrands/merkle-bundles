
import astexServer, { events } from '../../server/src/index';

import chalk from 'chalk';
import puppeteer from 'puppeteer';
export const log = console.log;

export class Addr {
    host: string;
    port: number;

    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    url() {
        return `http://${this.host}:${this.port}`;
    }
}

export class TestBundleServer {
    addr: Addr;
    server: any;
    events: any;
    app: any;

    constructor() {}

    static async setup(addr: Addr, dir: string): Promise<TestBundleServer> {
        let s = new TestBundleServer;
        s.addr = addr;
        let { httpserver, app, events } = await astexServer(addr.host, addr.port, dir)
        log(chalk.blue("Setup bundle server"));
        s.server = httpserver;
        s.events = events;
        s.app = app;
        return s;
    }

    waitForFileReload(f: string, timeout=50000): Promise<any> {
        return new Promise((resolve, rej) => {
            events.on('reloaded', ({ fname }) => {
                if(fname == f) resolve();
            });
            setTimeout(rej, timeout)
        })
    }

    async close() {
        return await this.server.close();
    }
}

class Stats {
    constructor() {}

    put() {

    }
    
    write() {

    }
}

export class TestBrowser {
    browser: any;
    page: any;
    debug: boolean;

    constructor() {}

    static async setup(debug: boolean) {
        let self = new TestBrowser;
        self.debug = debug;
        self.browser = await puppeteer.launch({
            headless: !debug,
            args: ['--no-sandbox'],
            userDataDir: '/tmp/merkle-bundle-puppeteer' + new Date() // TODO HACK
        });

        self.page = await self.browser.newPage();
        self.page.on('console', msg => {
            log(chalk.gray('[console.log] '), msg.text())
        });
        self.page.on('pageerror', (x) => {
            log(chalk.red('[page error] ', x))
        });
        // page.setRequestInterception(true);
        log(chalk.blue("Setup headless browser"));
        return self;
    }

    waitForResponse(url, timeout=2000): Promise<any> {
        return new Promise((resolve, reject) => {
            this.page.on('response', (response) => {
                if(response.request().url() === url) {
                    resolve(response);
                }
            });
            setTimeout(reject, timeout);
        });
    }

    startDebug(done: Function) {
        this.browser.on('targetdestroyed', () => done());
        this.page.evaluate(() => {
            debugger;
        })
    }

    async close() {
        return await this.browser.close();
    }
}


import StaticServer = require('static-server');

export class TestAppServer {
    server: any;

    constructor() {}

    static async setup(addr: Addr, dir: string): Promise<TestAppServer> {
        let self = new TestAppServer;

        self.server = new StaticServer({
            rootPath: dir,
            host: addr.host,
            port: addr.port,
            cors: '*',
            followSymlink: false,  
        });

        return new Promise<TestAppServer>((resolve, reject) => {
            self.server.start(function() {
                log(chalk.blue("Setup static web app server"));
                resolve(self)
            });
        });
    }

    async close() {
        // return await this.server.close();
    }
}

export class TextContext {
    constructor() {}


}