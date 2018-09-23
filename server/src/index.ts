import * as path from 'path';
import program from 'commander';
import chokidar, { FSWatcher } from 'chokidar';
import { readFileSync } from 'fs';

import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

import { Hash } from '../../core/hash';

import { EventEmitter } from 'events';
export let events: EventEmitter;

import {
    Bundle,
    packDiff,
    BinaryDiff,
    buildDiff,
    ChunkId,
    TurboJsConfig,
    getCommonChunks,
    BundleDetail
} from '../../core/index';

import winston, { createLogger, Logger, LoggerOptions } from 'winston';
import { setCoder } from '../../core/coding';

let loggerConfig = {
    level: 'error',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console()
    ]
};

let logger = createLogger(loggerConfig);

let fmgr: FileMgr;


export function command() {
    program
    .version('0.1.0')
    .option('-d, --dir  [dir]', 'Directory of JS bundles to serve')
    .option('-a, --addr [addr]', 'Address to listen on')
    .option('-p, --port [port]', 'Port to listen on')
    .parse(process.argv);

    logger.configure({
        ...loggerConfig,
        level: 'info',
    })

    // console.log('turbojs - with <3 from @liamzebedee');
    const basePath = path.resolve(program.dir);
    const port = program.port;
    const addr = program.addr;
    const watch = !(process.env.NODE_ENV === 'test') || true;

    astexServer(addr, port, basePath, 'info');
}

export default async function astexServer(
    addr: string = '127.0.0.1', 
    port: number = 3000, 
    basePath: string,
    logLevel: string)
{
    logger.configure({
        ...loggerConfig,
        level: logLevel,
    })
    logger.info(`Serving bundles from path: \n${basePath}`)
    logger.info(`Preloading into cache...`)
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

export class FileMgr {
    watcher: FSWatcher;
    basePath: string;
    bundles: BundleStore = {};
    latest: LatestBundleStore = {};
    latestReverse = {};

    constructor(basePath: string) {
        this.basePath = basePath;
        events = new EventEmitter();
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

        logger.info(`Watching ${bundleFileGlob}`);
        
        this.watcher = chokidar.watch(bundleFileGlob).on('all', (event: string, fpath: string) => {
            logger.debug(`${event} ${fpath}`);

            if(!['change', 'add'].includes(event)) {
                logger.debug(`ignoring file ${event} ${fpath}`)
                return;
            }

            let fname = path.parse(fpath).base;
            this.onFileUpdate(fname, fpath);
        });
    }

    onFileUpdate(fname: string, fpath: string) {
        logger.info(`reloading: ${fname}`)
        const content: string = readFileSync(fpath, 'utf-8');
        let bundle = new Bundle(fname, content);
        this.bundles[bundle.root] = bundle;
        this.latest[fname] = bundle.root;
        this.latestReverse[bundle.root] = fname;

        events.emit('reloaded', { fname, root: bundle.root });
        logger.info(`reloading complete: ${fname}, new root ${bundle.root}`)
    }

    generateDiff(latestId: ChunkId, conf: TurboJsConfig): BinaryDiff {
        // https://github.com/binast/binjs-ref
        
        // let latestId = this.latestReverse[bundleName];
        let latest = this.bundles[latestId];
        console.log(this.latest)

        // let oldestId = conf.bundleId;
        // let bundleName = this.latestReverse[conf.bundleId];
        // let latestId = this.latest[bundleName];
        
        // let old = this.bundles[oldestId];
        // let latest = this.bundles[latestId];
        
        // if(!old) {
        //     throw new Error(`Couldn't find bundle that client mentioned: ${bundleName}`);
        // }
        if(!latest) {
            throw new Error(`Couldn't find bundle that client mentioned: ${latestId}`);
            // throw new Error(`No loaded file found for ${fname} with root ${clientRoot}`)
        }

        let common = getCommonChunks(latest, conf.cached.map((id: ChunkId) => {
            return this.bundles[id];
        }).filter(Boolean))

        let diff = buildDiff(latest, common);
        logger.debug(`Sending diff:`)
        logger.debug(JSON.stringify(diff, null, 1))
        return packDiff(diff);
    }

    stop() {
        this.watcher.close();
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

    renderJS(bundleDetails: BundleDetail[]) {
        // if(this.loadedBefore) {
        //     return readFile('bootstrap-slim.js');
        // }
        
        // https://github.com/webpack/webpack-dev-middleware

        return `${readFile('bundle.js')};
        TurbojsBootstrapper.default(${JSON.stringify(bundleDetails)});
        `;
    }
}

import * as coder from '../../core/coding.node';
setCoder(coder);

let clientInfo = require('/Users/liamz/Documents/open-source/js-merkle-bundles/client/package.json');

const OUR_BEAUTIFUL_NAME = clientInfo.name;
const OUR_BEAUTIFUL_META = clientInfo.version;

const app = express();
app.use(cors())
app.use(cookieParser());
// app.use(function (err, req, res, next) {
//     if(err) {
//         logger.error(err);
//         res.status(500).send('Something broke!')
//     }
// })

app.get('/turbo.js', (req, res) => {
    // let cookies = req.cookies;
    // let loadedBefore = cookies[OUR_BEAUTIFUL_NAME] === OUR_BEAUTIFUL_META;
    // logger.info(`Loaded before: ${loadedBefore}`)
    // loadedBefore = false;
    // if(loadedBefore) {
    //     console.log("Loaded before");
    // } else {
    //     res.cookie(OUR_BEAUTIFUL_NAME, OUR_BEAUTIFUL_META, { maxAge: 900000, httpOnly: true });
    // }

    // TODO
    // obvious RCE vulns here

    let bundlesByName = req.query.bundles.split(',');
    let bundleDetails: BundleDetail[] = bundlesByName.map((name): BundleDetail => {
        let id = fmgr.latest[name];
        if(!id) throw new Error(`No loaded bundle named ${name} found`);
        return {
            id,
            name,
        }
    })
    let bs = new Bootstrapper(false);
    res.write(bs.renderJS(bundleDetails), 'utf-8');
    res.end();
});



app.get('/bundles/:id', (req, res) => {
    let bundleId = req.params.id;
    let turboJsData = req.get('X-TurboJS');
    let turboJsConfig = JSON.parse(Buffer.from(turboJsData, 'base64').toString());
    logger.info(`Request with data ${JSON.stringify(turboJsConfig,null,1)}`)

    let diff = fmgr.generateDiff(bundleId, turboJsConfig);
    res.write(diff, 'binary');
    res.end(null, 'binary');
})


class Server {
    static run(addr: string, port: number): 
        Promise<{ app: express.Express, httpserver: Server, events: EventEmitter}> 
    {
        return new Promise((resolve, reject) => {
            let httpserver = app.listen(port, addr, () => {
                logger.info(`Now running server on http://${addr}:${port}`)
                logger.info(`Serving client: ${OUR_BEAUTIFUL_NAME} = ${OUR_BEAUTIFUL_META}`);
                resolve({ app, httpserver, events })
            });
        });
    }
}