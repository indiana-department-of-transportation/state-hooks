"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * uselocalstate.js
 *
 * @description State hook that caches in localStorage.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
const usesyncedstate_1 = __importDefault(require("./usesyncedstate"));
const REGISTRY = new Set();
/**
 * @description getLocal
 *
 * Gets a cached value from localStorage.
 *
 * @param url The URL for the cached resource. Can be any string but should
 * *uniquely* represent the resource.
 * @returns The value being stored in localStorage.
 */
exports.getFromLocalStorage = (url) => {
    let cachedValue = localStorage.getItem(url);
    try {
        return JSON.parse(cachedValue);
    }
    catch (err) {
        // no-op
    }
    return cachedValue;
};
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
exports.syncToLocalStorage = (url, value) => {
    const valueToCache = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(url, valueToCache);
    return value;
};
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
    return usesyncedstate_1.default({
        initialState,
        url,
        getFromStore: exports.getFromLocalStorage,
        syncToStore: exports.syncToLocalStorage,
        registry: REGISTRY,
    });
};
exports.default = exports.useLocalState;
//# sourceMappingURL=uselocalstate.js.map