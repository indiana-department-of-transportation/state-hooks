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

import React, { useState, useEffect, useRef } from 'react';

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
 * @interface ISetRemoteArgs
 * 
 * Arguments to set state to a server.
 */
interface ISetRemoteArgs<T> {
  state: T,
  url: string,
  headers?: Headers,
}

/**
 * @interface IUseRemoteArgs
 * 
 * Arguments to the hook for syncing state with a server.
 */
interface IUseRemoteArgs<T> {
  initialState: T,
  url: string,
  headers?: Headers,
  onError?: (err: Error) => void,
}

/**
 * @interface IGetRemoteArgs
 * 
 * Arguments for fetching state from a server.
 */
interface IGetRemoteArgs {
  url: string,
  headers?: Headers,
}

/**
 * @interface IUseSyncedStateArgs
 * 
 * Arguments for the main hook useSyncedState.
 */
interface IUseSyncedStateArgs<T> {
  initialState: T,
  url: string,
  getFromStore: IGetStoredStateFn,
  syncToStore: IStoreStateFn,
  onError?: (err: Error) => void,
}

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

/**
 * @description POSTs state to a url.
 *
 * @param [args] The arguments object.
 * @param args.url The url to POST to.
 * @param args.state The state to POST.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
export const setServerState = async <T>({
  url,
  state,
  headers,
}: ISetRemoteArgs<T>): Promise<T> => {
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
  console.log("CALLING FETCH POST " + url + " " + params.body);
  const resp = await fetch(url, params);

  // There really isn't a good way here to plumb an unsuccessful POST
  // out to the user except to throw an error and let them catch it.
  if (resp.status < 200 || resp.status >= 400) {
    throw new Error(`POST for '${url}' returned a ${resp.status} response.`);
  }

  return state;
};

/**
 * @description Fetches state from a url.
 *
 * @param [args] The arguments object.
 * @param args.url The url to fetch.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
export const getServerState = async <T>({
  url,
  headers,
}: IGetRemoteArgs): Promise<T> => {
  const params: {
    method: 'GET',
    headers?: Headers,
  } = {
    method: 'GET',
  };

  if (headers) {
    params.headers = headers;
  }
  console.log("CALLING FETCH GET " + url);
  const response = await fetch(url, params);

  // There really isn't a good way here to plumb an unsuccessful fetch
  // out to the user except to throw an error and let them catch it.
  if (response.status < 200 || response.status >= 400) {
    throw new Error(`GET for '${url}' returned a ${response.status} response.`);
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
 * @param [args] The parameter object.
 * @param args.initialState The initial value. Should generally be a default that
 * is overridden by the stored value if present.
 * @param args.url The URL for the stored value.
 * @param args.getFromStore Function to retrieve a value from the data store.
 * @param args.syncToStore Function to save state changes to the data store.
 * @returns A tuple with the current state and a setter.
 */
export const useSyncedState = <T>({
  initialState,
  url,
  getFromStore,
  syncToStore,
  onError = console.error,
}: IUseSyncedStateArgs<T>): [T, (x: T) => void] => {
  const shouldSet = useRef(false);
  const [state, updateState] = useState(initialState);
  const setState = (state: T) => {
    shouldSet.current = true;
    updateState(state);
  };

  useEffect(() => {
    const fn = async () => {
      console.log("Fetching from store...");
      let cachedValue;
      try {
        cachedValue = await getFromStore(url);
      } catch (err) {
        onError(err);
        return;
      }

      if (cachedValue != null) {
        updateState(cachedValue);
      } else {
        console.log("Cached value null, syncing to store");
        try {
          syncToStore(url, state);
        } catch (err) {
          onError(err);
        }
      }
    };

    fn();
  }, []);

  useEffect(() => {
    const fn = async () => {
      // There are two cases where we don't want to sync back
      // to the store: one is where we just got the value from the
      // store and the other is that we don't want to sync the
      // default value provided to the hook back. We only want to
      // sync calls made from outside the hook, hence the flag that
      // the setter toggles.
      if (shouldSet.current) {
        shouldSet.current = false;
        console.log("Syncing to store...")
        try {
          await syncToStore(url, state);
        } catch (err) {
          onError(err);
        }
      }
    };

    fn();
  }, [url, state, syncToStore]);

  console.log("RETURNING STATE: " + JSON.stringify(state));
  return [state as T, setState];
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
export const useLocalState = <T>(initialState: T, url: string): [T, (x: T) => void] => {
  return useSyncedState<T>({
    initialState,
    url,
    getFromStore: getFromLocalStorage,
    syncToStore: syncToLocalStorage,
  });
};

/**
 * @description Syncs the passed-in state with a remote server. Follows the
 * semantics of the setter returned from useState.
 *
 * @param [args] The parameter object.
 * @param args.url The url for the data.
 * @param args.initialState The default value for the data.
 * @param args.headers The optional headers object.
 * @param args.onError The optional error handler, defaults to console.error.
 * @returns A tuple with the current state and a setter.
 */
export const useRemoteState = <T>({
  url,
  initialState,
  headers,
  onError,
}: IUseRemoteArgs<T>): [T, (x: T) => void] => {
  const getRemote: IGetStoredStateFn = (url: string) => getServerState({
    url,
    headers,
  });

  const setRemoteFn = <U>(url: string, state: U) => setServerState<U>({
    url,
    state,
    headers,
  });

  const setRemote: IStoreStateFn = setRemoteFn;

  return useSyncedState<T>({
    initialState,
    url,
    getFromStore: getRemote,
    syncToStore: setRemote,
    onError,
  });
};
