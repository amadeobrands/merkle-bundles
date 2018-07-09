const fs = require('fs');
const path = require('path');

// const writeOriginalSource = (source, filename) => {
//     // self.assets['bundle.js'].source()
//     fs.writeFileSync(filename)
// }

class FoobarPlugin {
    constructor(options) {}

    apply(compiler) {
        compiler.hooks.compilation.tap("FoobarPlugin", compilation => {
            compilation.hooks.record.tap("FoobarPlugin", self => {
                compiler.plugin('emit', (compilation, cb) => {
                    // debugger;
                    let modules = Array.from(self.chunks[0]._modules);

                    modules.map(module => {
                        if(!module._source) return;
                        let source = module._source.source();
                        let key = `module-${module.id}.js`;

                        compilation.assets[key] = {
                            source: function() {
                                return source;
                            },
                            size: function() {
                                return source.length;
                            }
                        };
                    })

                    // Object.keys(self.assets).map(filename => {
                    //     let src = self.assets[filename].source();
                    //     let key = `chunk.${filename}`;
                    //     compilation.assets[key] = {
                    //         source: function() {
                    //             return src;
                    //         },
                    //         size: function() {
                    //             return src.length;
                    //         }
                    //     };
                    // })
                    
                    cb();
                });
            })
        })
    }
}

module.exports = FoobarPlugin;