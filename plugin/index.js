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

class FoobarPlugin {
    constructor(options) {}

    apply(compiler) {
        compiler.hooks.compilation.tap("FoobarPlugin", compilation => {
            let mainTempl = compilation.mainTemplate;
            let modulesArr;
            let id;

            mainTempl.hooks.render.tap("FoobarPlugin", (bootstrapSource, chunk, hash, moduleTemplate, dependencyTemplates) => {
                const source = new ConcatSource();
                // return source;

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

                // source.add(`(${merkleTreeAstCode})`)
                // source.add(merkleTreeAstCode)

                // console.log(source)

                // modulesArr = mainTempl.hooks.modules.call(
                //     new RawSource(""),
                //     chunk,
                //     hash,
                //     moduleTemplate,
                //     dependencyTemplates
                // );
                // id = ;

                compiler.plugin('emit', (compilation, cb) => {
                    let key = `${chunk.hash}.js`;
                    compilation.assets[key] = {
                        source: function() {
                            return modulesArr;
                        },
                        size: function() {
                            return modulesArr.length;
                        }
                    }
                })

                // return source;
            });

            
            // compiler.plugin('emit', (compilation, cb) => {
            //     let key = `${id}.js`;
            //     compilation.assets[key] = {
            //         source: function() {
            //             return modulesArr;
            //         },
            //         size: function() {
            //             return modulesArr.length;
            //         }
            //     }
            // })

        })
    }
}

module.exports = FoobarPlugin;