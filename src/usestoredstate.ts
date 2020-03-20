/**
 * usestoredstate.js
 *
 * @description Custom React hook for syncing state with a data store.
 * Supports both synchronous and asynchronous data storage.
 *
 * @author jasmith79@gmail.com
 * @license MIT
 * @copyright INDOT, 2020
 */

import React, { useState, useEffect } from 'react';

/**
 * @interface IStoreStateFn
 *
 * NOTE: The interface is defined with the return value being the state that was
 * stored (or a Promise thereof for async storage) to facilitate composition of
 * setters.
 */
export interface IStoreStateFn {
  <T>(url: string, value: T): T | Promise<T>
}

/**
 * @interface IGetStoredStateFn
 * 
 * Getter for a stored state.
 */
export interface IGetStoredStateFn {
  <T>(url: string): T | Promise<T>
}

/**
 * @description isThenable
 * 
 * Duck-types the passed in value as Promise-like.
 *
 * @param x The value to check for thenability.
 * @returns True for Promise-like objects, false for everything else.
 */
export const isThenable = (x: any): boolean => x && typeof x.then === 'function';

/**
 * @description bindP
 * 
 * Although due to their auto-flattening Promises do not strictly speaking
 * comprise a monad, it's close enough for our purposes here. This function will
 * serve the role of a monadic bind to facilitate composition of the storage setters.
 *
 * @param fn The function to lift a function or method into the Promise not-quite-a-monad.
 * @returns A Promise of the value returned from the passed-in function.
 */
export const bindP = <T, U>(fn: (x: T) => U | Promise<U>): ((y: Promise<T>) => Promise<U>) => {
  return async function(this: any, p: Promise<T>) {
    const value = await p;
    return fn.call(this, value);
  };
};

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

export const setServerState = async <T>(url: string, state: T, headers: Headers, responseHandler: (r: Response) => void): Promise<T> => {
  const params: {
    body: string,
    method: 'POST',
    headers?: Headers,
  } = {
    body: typeof state === 'string' ? state : JSON.stringify(state),
    method: 'POST',
  };

  if (headers) {
    params.headers = headers;
  }

  const response = await fetch(url, params);
  if (responseHandler) {
    responseHandler(response);
  }

  return state;
};

export const getServerState = async <T>(url: string, headers: Headers, responseHandler: (r: Response) => void): Promise<T> => {
  const params: {
    method: 'GET',
    headers?: Headers,
  } = {
    method: 'GET',
  };

  if (headers) {
    params.headers = headers;
  }

  const response = await fetch(url, params);
  if (responseHandler) {
    responseHandler(response);
  }

  try {
    return response.json();
  } catch (_err) {
    const text: unknown = await response.text();
    return (text as T);
  }
};

/**
 * @description useSyncedState
 * 
 * Custom React hook to sync data to/from a data store. Supports both sync and
 * async storage.
 *
 * @param initialState The initial value. Should generally be a default that
 * is overridden by the stored value if present.
 * @param url The URL for the stored value.
 * @param getFromStore Function to retrieve a value from the data store.
 * @param syncToStore Function to save state changes to the data store.
 */
export const useSyncedState = <T>(
  initialState: T,
  url: string,
  getFromStore: IGetStoredStateFn,
  syncToStore: IStoreStateFn,
): [T, (x: T) => void] => {
  const [state, updateState] = useState(initialState);
  useEffect(() => {
    const cachedValue = getFromStore(url);
    if (isThenable(cachedValue)) {
      (cachedValue as Promise<T>).then(value => updateState(value));
    } else {
      if (cachedValue != null) updateState(cachedValue as T);
    }
  }, [getFromStore, updateState]);

  useEffect(() => {
    syncToStore(url, state);
  });

  console.log("RETURNING STATE: " + JSON.stringify(state));
  return [state as T, updateState];
};

// export const useLocalState = <T>(initialState: T, url: string): [T, (x: T) => void] => {
//   let cachedValue = localStorage.getItem(url);
//   try {
//     cachedValue = JSON.parse(cachedValue as string);
//   } catch (err) {
//     // no-op
//   }

//   const init = cachedValue == null ? initialState : cachedValue;
//   const [state, updateState] = useState(cachedValue || init);
//   useEffect(() => {
//     const valueToCache = typeof state === 'string' ? state: JSON.stringify(state);
//     localStorage.setItem(url, valueToCache);
//   }, [state]);

//   return [state as T, updateState];
// };

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
export const useLocalState = <T>(initialState: T, url: string): [T, (x: T) => void] => {
  return useSyncedState<T>(
    initialState,
    url,
    getFromLocalStorage,
    syncToLocalStorage,
  );
};

export const useRemoteState = <T>(initialState: T, url: string, headers: Headers, responseHandler: (r: Response) => void): [T, (x: T) => void] => {
  const getRemote: IGetStoredStateFn = (url: string) => getServerState(url, headers, responseHandler);
  const setRemoteFn = <U>(url: string, state: U) => setServerState<U>(
    url,
    state,
    headers,
    responseHandler,
  );

  const setRemote: IStoreStateFn = setRemoteFn;

  return useSyncedState<T>(
    initialState,
    url,
    getRemote,
    setRemote,
  );
};
