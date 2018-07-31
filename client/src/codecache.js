import localforage from 'localforage';

localforage.config({
    storeName: 'merkleAstBundles',
    driver: localforage.INDEXEDDB
})

export function set(filename, cachedItem) {
    return localforage.setItem(filename, cachedItem)
}

export function get(filename) {
    return localforage.getItem(filename)
}