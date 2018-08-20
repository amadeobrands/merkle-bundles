import getType from 'get-object-type';

export function isArrayFullOfPrimitives(arr: any[]): boolean {
    for(let item of arr) {
        let typ = getType(item);
        if(typ === 'Object') return false;
    }
    return true;
}

type keyval = {
    k: string,
    v: any,
};

export function getKeyVals(obj: any): keyval[] {
    return Object.entries(obj).map(entry => {
        return {
            k: entry[0],
            v: entry[1]
        }
    })
}
