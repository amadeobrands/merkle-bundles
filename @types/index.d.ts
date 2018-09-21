declare module "get-object-type" {
    export default function(obj: any): 'String' | 'Object' | 'Array';
}

declare module "js-sha256" {
    namespace sha224 {
        export function arrayBuffer(val: any): ArrayBuffer;
    }
}

// declare module "console";
declare module "arraybuffer-to-string" {
    export default function(buf: ArrayBuffer, typ: 'binary'): string;
}

// declare var localforage: any;

// import '../../core/src/declarations';

declare module "commander";
declare module "q";
declare module "sha256";
declare module "lodash.merge";

// interface Set<T> {
//     add(value: T): Set<T>;
//     clear(): void;
//     delete(value: T): boolean;
//     entries(): IterableIterator<[T, T]>;
//     forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
//     has(value: T): boolean;
//     keys(): IterableIterator<T>;
//     size: number;
//     values(): IterableIterator<T>;
//     [Symbol.iterator]():IterableIterator<T>;
// }

// interface SetConstructor {
//     new <T>(): Set<T>;
//     new <T>(iterable: Iterable<T>): Set<T>;
//     prototype: Set<any>;
// }
// declare var Set: SetConstructor;

interface ArrayConstructor {
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;
    from<T>(arrayLike: ArrayLike<T>): Array<T>;
}