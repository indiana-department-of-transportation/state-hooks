/**
 * usesyncedstate.js
 *
 * @description Custom React hook for syncing state with a data store.
 * Supports both synchronous and asynchronous data storage.
 * 
 * NOTE: No tests for this, as it's functionality is thoroughly tested
 * by the derivative hooks in this repo.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
import { useEffect, useState, useRef } from 'react';

export interface IUpdateStateFn<T> {
  (x: T): void;
  (x: ((y: T) => T)): void;
}

/**
 * @interface IStoreStateFn
 *
 * NOTE: The interface is defined with the return value being the state that was
 * stored (or a Promise thereof for async storage) to facilitate composition of
 * setters.
 */
export interface IStoreStateFn<T> {
  (url: string, value: T): T | Promise<T>
}

/**
 * @interface IGetStoredStateFn
 * 
 * Getter for a stored state.
 */
export interface IGetStoredStateFn<T> {
  (url: string): T | Promise<T>
}

/**
 * @interface IUseSyncedStateArgs
 * 
 * Arguments for the main hook useSyncedState.
 */
interface IUseSyncedStateArgs<T> {
  initialState: T,
  url: string,
  getFromStore: IGetStoredStateFn<T>,
  syncToStore: IStoreStateFn<T>,
  onError?: (err: Error) => void,
  registry?: Set<string>,
}

// Ensure we don't get from the store more than once for a given URL,
// i.e. only the very first time the hook is rendered.
const REGISTRY = new Set<string>();

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
  registry = REGISTRY,
}: IUseSyncedStateArgs<T>): [T, IUpdateStateFn<T>] => {
  const shouldSet = useRef(false);
  const [state, updateState] = useState(initialState);
  const setState: IUpdateStateFn<T> = (state: any) => {
    shouldSet.current = true;
    updateState(state);
  };

  useEffect(() => {
    const fn = async () => {
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
        try {
          syncToStore(url, state);
        } catch (err) {
          onError(err);
        }
      }
    };

    if (!registry.has(url)) {
      registry.add(url);
      fn();
    }
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
        try {
          await syncToStore(url, state);
        } catch (err) {
          onError(err);
        }
      }
    };

    fn();
  }, [url, state, syncToStore]);

  return [state, setState];
};

export default useSyncedState;
