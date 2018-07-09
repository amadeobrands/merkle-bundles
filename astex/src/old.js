export function makeTree(thing) {
    let typ = getType(thing);
    switch(typ) {
    case 'Object':
        return {
            val: null,
            children: Object.keys(thing).map(k => thing[k]).map(val => {
                return makeTree(val)
            })
        }
    case 'Array':
        if(isArrayFullOfPrimitives(thing)) {
            return {
                val: thing,
                children: []
            }
        } else {
            return {
                val: null,
                children: thing.map(makeTree)
            }
        }
    default:
        return {
            val: thing,
            children: []
        }
    }
}