interface ICoder {
    encode(obj: any): ArrayBuffer;
    decode(buf: any): any;
}

let coder_: ICoder;

export function setCoder(coder: ICoder) {
    coder_ = coder;
}

export function getCoder(): ICoder {
    return coder_;
}