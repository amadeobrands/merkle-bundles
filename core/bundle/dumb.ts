import { ChunkLookup } from "../chunks";
import { Hash } from "../hash";

export interface LightBundle {
    name: string;
    src: string;
    chunks: ChunkLookup;
    root: Hash;
}