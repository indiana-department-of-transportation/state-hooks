"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usesyncedstate_1 = require("./usesyncedstate");
/**
 * @description getLocal
 *
 * Gets a cached value from localStorage.
 *
 * @param url The URL for the cached resource. Can be any string but should
 * *uniquely* represent the resource.
 * @returns The value being stored in localStorage.
 */
const getLocal = (url) => {
    let cachedValue = localStorage.getItem(url);
    try {
        cachedValue = JSON.parse(cachedValue);
    }
    catch (err) {
        // no-op
    }
    return cachedValue;
};
exports.getFromLocalStorage = getLocal;
/**
 * @description syncLocal
 *
 * Stores a value in localStorage with the specified URL as the key.
 *
 * @param url The URL for the resource being cached. Can be any string but should
 * *uniquely* represent the resource.
 * @param value The value to store. Non-string values will be JSON.stringified.
 * @returns The value being stored.
 */
const syncLocal = (url, value) => {
    const valueToCache = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(url, valueToCache);
    return value;
};
exports.syncToLocalStorage = syncLocal;
/**
 * @description useLocalState
 *
 * Custom React hook to sync data to/from localStorage.
 *
 * @param initialState The initial value. Should generally be a default that
 * is overridden by the stored value if present.
 * @param url The URL for the stored value.  Can be any string but should
 * *uniquely* represent the resource.
 */
exports.useLocalState = (url, initialState) => {
    return usesyncedstate_1.useSyncedState({
        initialState,
        url,
        getFromStore: exports.getFromLocalStorage,
        syncToStore: exports.syncToLocalStorage,
    });
};
exports.default = exports.useLocalState;
//# sourceMappingURL=uselocalstate.js.map