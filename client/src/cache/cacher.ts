import { ChunkId } from "../../../core/chunks";
import { LightBundle } from "../../../core/bundle/dumb";

export abstract class BundleCacher {
    abstract async storeBundle(bundle: LightBundle);
    abstract async getBundle(key: ChunkId): Promise<LightBundle>;
    abstract async getCachedBundles(): Promise<ChunkId[]>;
    abstract async getCodeForChunk(id: ChunkId): Promise<string>;
}