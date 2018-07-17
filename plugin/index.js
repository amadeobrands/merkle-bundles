const fs = require('fs');
const path = require('path');

const {
	ConcatSource,
	OriginalSource,
	PrefixSource,
	RawSource
} = require("webpack-sources");



// const merkleTreeAst = require('./astex/dist/client.js');
let srcPath = path.resolve(__dirname + '/../astex/dist/client.js');
let merkleTreeAstCode = fs.readFileSync(path.resolve(__dirname + '/../astex/dist/client.js'), { encoding: "utf-8"})

const NAME = "MerkleAstBundlePlugin";
class FoobarPlugin {
    constructor(options) {}

    apply(compiler) {
        let outputs = [];

        compiler.hooks.compilation.tap(NAME, compilation => {
            let mainTempl = compilation.mainTemplate;

            const addOutput = (fname, content) => {
                outputs.push({ fname: `merkleast-${fname}`, content })
            }

            mainTempl.hooks.render.tap(NAME, (bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
                let source = new ConcatSource();

                source.add("/******/ (function(modules) { // webpackBootstrap\n");
                source.add(new PrefixSource("/******/", bootstrapSource));
                source.add("/******/ })\n");
                source.add(
                    "/************************************************************************/\n"
                );
                source.add("/******/ (");
                source.add(
                    // this.hooks.modules.call(
                    //     new RawSource(""),
                    //     chunk,
                    //     hash,
                    //     moduleTemplate,
                    //     dependencyTemplates
                    // )
                );
                source.add(")");

                let modules = mainTempl.hooks.modules.call(
                    new RawSource(""),
                    chunk,
                    hash,
                    moduleTemplate,
                    dependencyTemplates
                );

                addOutput(chunk.id, modules)
                addOutput("swag", 'asdads')
                

                source.add(`(${merkleTreeAstCode})`)

                return source;
            });

        })

        compiler.plugin('emit', (compilation, cb) => {
            outputs.map(({ fname, content }) => {
                compilation.assets[fname] = {
                    source: function() {
                        return content;
                    },
                    size: function() {
                        return content.length;
                    }
                };
            })
        })
    }
}

module.exports = FoobarPlugin;