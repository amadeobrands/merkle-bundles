import localforage from 'localforage';


export function set(filename, cachedItem) {
    return localforage.setItem(filename, cachedItem)
}

export function get(filename) {
    return localforage.getItem(filename)
}