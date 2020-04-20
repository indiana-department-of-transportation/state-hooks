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
}

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
}: IUseSyncedStateArgs<T>): [T, (x: T | ((x: T) => T)) => void] => {
  const shouldSet = useRef(false);
  const [state, updateState] = useState(initialState);
  const setState = (state: T | ((x: T) => T)) => {
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
