/**
 * usesyncedstate.js
 *
 * @description Custom React hook for syncing state with a data store.
 * Supports both synchronous and asynchronous data storage.
 *
 * @author jasmith79@gmail.com
 * @license MIT
 * @copyright INDOT, 2020
 */

import { useEffect, useState, useRef } from 'react';
// import { Nullable } from '@jasmith79/ts-utils';
import { Opt } from './t';

/**
 * @interface IStoreStateFn
 *
 * NOTE: The interface is defined with the return value being the state that was
 * stored (or a Promise thereof for async storage) to facilitate composition of
 * setters.
 */
export interface IStoreStateFn<T> {
  (url: string, value: Opt<T>): Opt<T> | Promise<Opt<T>>
}

/**
 * @interface IGetStoredStateFn
 * 
 * Getter for a stored state.
 */
export interface IGetStoredStateFn<T> {
  (url: string): Opt<T> | Promise<Opt<T>>
}

/**
 * @interface IUseSyncedStateArgs
 * 
 * Arguments for the main hook useSyncedState.
 */
interface IUseSyncedStateArgs<T> {
  initialState: Opt<T>,
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
}: IUseSyncedStateArgs<T>): [Opt<T>, (x: Opt<T>) => void] => {
  console.log('CALLED WITH');
  console.log(initialState);
  const shouldSet = useRef(false);
  const [state, updateState] = useState(initialState);
  const setState = (state: Opt<T>) => {
    console.log('setting state');
    console.log(state);
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
