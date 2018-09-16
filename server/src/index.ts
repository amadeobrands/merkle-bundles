import * as path from 'path';
// @ts-ignore
import program from 'commander';
// @ts-ignore
import * as Q from 'q';
// @ts-ignore
import * as chokidar from 'chokidar';
import { readFileSync } from 'fs';

const EventEmitter = require('events');
// class MyEmitter extends EventEmitter {}
export const events = new EventEmitter();




import {
    Bundle,
    packDiff,
    BinaryDiff,
    buildDiff
} from '../../core/src/index';



let fmgr: FileMgr;


export function command() {
    program
    .version('0.1.0')
    .option('-d, --dir  [dir]', 'Directory of JS bundles to serve')
    .option('-a, --addr [addr]', 'Address to listen on')
    .option('-p, --port [port]', 'Port to listen on')
    .parse(process.argv);

    console.log('turbojs - with <3 from @liamzebedee');
    const basePath = path.resolve(program.dir);
    const port = program.port;
    const addr = program.addr;
    const watch = !(process.env.NODE_ENV === 'test') || true;

    astexServer(addr, port, basePath);
}

export default async function astexServer(
    addr: string = '127.0.0.1', 
    port: number = 3000, 
    basePath: string)
{
    console.log(`Serving bundles from path: \n${basePath}`)
    console.log(`Preloading into cache...`)
    fmgr = new FileMgr(basePath);
    await fmgr.watch()
    return await Server.run(addr, port);
}

interface BundleStore {
    [key: string]: Bundle;
};

interface LatestBundleStore {
    [key: string]: Hash
}

class FileMgr {
    basePath: string;
    bundles: BundleStore = {};
    latest: LatestBundleStore = {};

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    async watch(): Promise<any> {
        const jsGlob = "*.js";
        let bundleFileGlob = path.join(this.basePath, '/', jsGlob);
        
        let fileLoaded = {};

        const glob = require("glob");

        let filesToLoad = (glob.sync(jsGlob, {
            nodir: true,
            cwd: this.basePath
        }))

        await Promise.all(filesToLoad.map(async fname => {
            await this.onFileUpdate(fname, path.join(this.basePath, '/', fname));
        }))

        console.log(`Watching ${bundleFileGlob}`);
        chokidar.watch(bundleFileGlob)
        .on('all', (event: string, fpath: string) => {
            let fname = path.parse(fpath).base;
            this.onFileUpdate(fname, fpath);
        });
    }

    onFileUpdate(fname: string, fpath: string) {
        console.log(`reloading: ${fname}`)
        const content: string = readFileSync(fpath, 'utf-8');
        let bundle = new Bundle(fname, content);
        events.emit('reloaded', { fname, root: bundle.root });
        this.latest[fname] = bundle.root;
        console.log(`reloading complete: ${fname}, new root ${bundle.root}`)
    }

    generateDiff(fname: string, clientRoot: string): BinaryDiff {
        // https://github.com/binast/binjs-ref
        let latestRoot = this.latest[fname];
        console.log(fname, clientRoot, latestRoot);

        let old = this.bundles[clientRoot];
        let latest = this.bundles[latestRoot];
        
        if(!old) {
            throw new Error(`Couldn't find bundle that client mentioned: ${clientRoot}`)
        }
        if(!latest) {
            throw new Error(`No loaded file found for ${fname} with root ${clientRoot}`)
        }

        let diff = buildDiff(old, latest);
        // buildDiff(content, tree, commonChunks);
        return packDiff(diff);
    }
}

function readFile(fname: string) {
    return readFileSync(`/Users/liamz/Documents/open-source/js-merkle-bundles/client/dist/${fname}`);
}

class Bootstrapper {
    loadedBefore: boolean;

    constructor(loadedBefore: boolean) {
        this.loadedBefore = loadedBefore;
    }

    renderJS() {
        // if(this.loadedBefore) {
        //     return readFile('bootstrap-slim.js');
        // }
        return readFile('bundle.js');
    }
}

import * as express from 'express';
import * as cors from "cors";
import * as cookieParser from 'cookie-parser';
import { Hash } from '../../core/src/hash';

const app = express();
app.use(cors())
app.use(cookieParser());

let clientInfo = require('/Users/liamz/Documents/open-source/js-merkle-bundles/client/package.json');

const OUR_BEAUTIFUL_NAME = clientInfo.name;
const OUR_BEAUTIFUL_META = clientInfo.version;

console.log(`Serving client: ${OUR_BEAUTIFUL_NAME} = ${OUR_BEAUTIFUL_META}`);

app.get('/turbo.js', (req, res) => {
    let cookies = req.cookies;
    let loadedBefore = cookies[OUR_BEAUTIFUL_NAME] === OUR_BEAUTIFUL_META;
    console.log(`Loaded before: ${loadedBefore}`)
    loadedBefore = false;
    // if(loadedBefore) {
    //     console.log("Loaded before");
    // } else {
    //     res.cookie(OUR_BEAUTIFUL_NAME, OUR_BEAUTIFUL_META, { maxAge: 900000, httpOnly: true });
    // }
    
    let bs = new Bootstrapper(loadedBefore);
    res.write(bs.renderJS(), 'utf-8');
    res.end();
});

app.get('/:bundles/:root', (req, res) => {
    let fname: string = req.params.fname;
    let root = req.params.root || null;
    // let diff = generateDiff(bundleFilename, root);
    let diff = fmgr.generateDiff(fname, root);
    res.write(diff, 'binary');
    res.end(null, 'binary');
})

class Server {
    static run(addr: string, port: number): Promise<any> {
        return new Promise((resolve, reject) => {
            let httpserver = app.listen(port, addr, () => {
                console.log(`Now running server on http://${addr}:${port}`)
                resolve({ app, httpserver, events })
            });
        });
    }
}