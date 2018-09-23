
import { ChunkId } from './chunks';

export * from './helper';
export * from './merkle';
export * from './diff/build';
export * from './diff/diff';
export * from './chunks';
export * from './bundle/full';
export * from './helper';

export interface TurboJsConfig {
    bundleId: ChunkId | null;
    cached: ChunkId[];
}

export interface BundleDetail {
    name: string,
    id: ChunkId,
};