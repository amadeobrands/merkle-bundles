declare module "get-object-type" {
    export default function(obj: any): 'String' | 'Object' | 'Array';
}

// declare var esprima: any;
// declare module "esprima" {
    // export default { export function parse(src: string, opts: any): any; }
// }

// declare module "lodash.merge";
declare module "js-sha256" {
    namespace sha224 {
        export function arrayBuffer(val: any): ArrayBuffer;
    }
}
// declare module "lodash.includes";
declare module "console";
declare module "arraybuffer-to-string" {
    export default function(buf: ArrayBuffer, typ: 'binary'): string;
}

declare var require: any;