import {
  useSyncedState,
  IGetStoredStateFn,
  IStoreStateFn
} from './usesyncedstate';

/**
 * @description getLocal
 * 
 * Gets a cached value from localStorage.
 *
 * @param url The URL for the cached resource. Can be any string but should
 * *uniquely* represent the resource.
 * @returns The value being stored in localStorage.
 */
const getLocal = <T>(url: string): T => {
  let cachedValue: unknown = localStorage.getItem(url);
  try {
    cachedValue = JSON.parse(cachedValue as string);
  } catch (err) {
    // no-op
  }

  return (cachedValue as T);
};

export const getFromLocalStorage: IGetStoredStateFn = getLocal;

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
const syncLocal = <T>(url: string, value: T): T => {
  const valueToCache = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(url, valueToCache);
  return value;
};

export const syncToLocalStorage: IStoreStateFn = syncLocal;

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
export const useLocalState = <T>(url: string, initialState: T): [T, (x: T) => void] => {
  return useSyncedState<T>({
    initialState,
    url,
    getFromStore: getFromLocalStorage,
    syncToStore: syncToLocalStorage,
  });
};

export default useLocalState;
