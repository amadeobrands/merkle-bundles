import * as path from 'path';
import program from 'commander';
import * as Q from 'q';
import * as chokidar from 'chokidar';
import * as sha256 from 'sha256';
import { readFileSync } from 'fs';


const EventEmitter = require('events');
const glob = require("glob")
import merge from 'lodash.merge';
import {
    parse,
    getHashedTree,
    getChunks,
    buildDiff,
    compactDiff
} from 'astex-core/dist/bundle.node';


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
    const port = program.port || 3000;
    const addr = program.addr || '127.0.0.1';
    const watch = !(process.env.NODE_ENV === 'test') || true;

    console.log(`Serving bundles from path: \n${basePath}`)
    console.log(`Preloading into cache...`)

    fmgr = new FileMgr(basePath);
    fmgr.watch()
    .then(() => {
        Server.run(addr, port);
    })
    
}



type FileId = string;
type FileContent = {
    content: string,
    chunks: any,
    fname: string,
    tree: any,
};

interface FileMgrStore {
    [key: string]: FileContent;
};

interface FileLatestStore {
    [key: string]: FileId
}

class FileMgr {
    basePath: string;
    store: FileMgrStore = {};
    latest: FileLatestStore = {};

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    watch() {
        let bundleFileGlob = path.join(this.basePath, "/*.js");
        console.log(`Watching ${bundleFileGlob}`);
    
        let dfd = new Q.defer();
    
        chokidar.watch(bundleFileGlob)
        .on('all', (event: string, fpath: string) => {
            let fname = path.parse(fpath).base;
            this.onFileUpdate(fname, fpath);
        });
        dfd.resolve();
    
        return dfd.promise;
    }

    onFileUpdate(fname: string, fpath: string) {
        console.log(`reloading: ${fname}`)
        const content: string = readFileSync(fpath, 'utf-8');

        let ast, astLocs;
        try {
            ast = parse(content, false);
            astLocs = parse(content, true);
        } catch(ex) {
            console.error(`Couldn't load ${fname} due to parsing errors:`)
            console.error(ex)
            return;
        }
    
        const hashedTree = getHashedTree(ast);
        const tree = merge(astLocs, hashedTree.val);
        const chunks = getChunks(tree);


        const k = hashedTree.hash;
        this.store[k] = {
            fname,
            content,
            chunks,
            tree,
        };
        // events.emit('reloaded', { bundleFilename, root: hashedTree.hash })
        this.latest[fname] = k;
        console.log(`reloading complete: ${fname}, new root ${k}`)
    }

    generateDiff(fname: string, clientRoot: string) {
        // https://github.com/binast/binjs-ref
        
        let latestRoot = this.latest[fname];
        console.log(fname, clientRoot, latestRoot)
        let { chunks, tree, content } = this.store[latestRoot];
        
        let clientChunks = [];
        if(this.store[clientRoot]) {
            clientChunks = this.store[clientRoot].chunks;
        } else {
            console.warn(`No loaded file found for ${fname} with root ${clientRoot}`)
        }

        let commonChunks = new Set(Array.from(clientChunks).filter(x => chunks.has(x)));
        let diff = buildDiff(content, tree, commonChunks);
        return compactDiff(diff);
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
        if(this.loadedBefore) {
            return readFile('bootstrap-slim.js');
        }
        return readFile('bootstrap.js');
    }
}

import * as express from 'express';
import * as cors from "cors";
import * as cookieParser from 'cookie-parser';
import { loadavg } from 'os';

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

app.get('/:fname/diff-by-root/:root', (req, res) => {
    let fname: string = req.params.fname;
    let root = req.params.root || null;
    // let diff = generateDiff(bundleFilename, root);
    let diff = fmgr.generateDiff(fname, root);
    res.write(diff, 'binary');
    res.end(null, 'binary');
})

class Server {
    static run(addr: string, port: number) {
        app.listen(port, addr, () => {
            console.log(`Now running server on http://${addr}:${port}`)
        });
    }
}