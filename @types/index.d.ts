declare module "get-object-type" {
    export default function(obj: any): 'String' | 'Object' | 'Array';
}

declare module "js-sha256" {
    namespace sha224 {
        export function arrayBuffer(val: any): ArrayBuffer;
    }
}

declare module "arraybuffer-to-string" {
    export default function(buf: ArrayBuffer, typ: string): string;
}

declare module "commander";
declare module "q";
declare module "sha256";
declare module "lodash.merge";
