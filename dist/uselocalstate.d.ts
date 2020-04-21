/**
 * uselocalstate.js
 *
 * @description State hook that caches in localStorage.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
import { IUpdateStateFn } from './usesyncedstate';
/**
 * @description getLocal
 *
 * Gets a cached value from localStorage.
 *
 * @param url The URL for the cached resource. Can be any string but should
 * *uniquely* represent the resource.
 * @returns The value being stored in localStorage.
 */
export declare const getFromLocalStorage: <T>(url: string) => T;
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
export declare const syncToLocalStorage: <T>(url: string, value: T) => T;
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
export declare const useLocalState: <T>(url: string, initialState: T) => [T, IUpdateStateFn<T>];
export default useLocalState;
