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
/**
 * @interface IStoreStateFn
 *
 * NOTE: The interface is defined with the return value being the state that was
 * stored (or a Promise thereof for async storage) to facilitate composition of
 * setters.
 */
export interface IStoreStateFn {
    <T>(url: string, value: T): T | Promise<T>;
}
/**
 * @interface IGetStoredStateFn
 *
 * Getter for a stored state.
 */
export interface IGetStoredStateFn {
    <T>(url: string): T | Promise<T>;
}
/**
 * @interface IUseSyncedStateArgs
 *
 * Arguments for the main hook useSyncedState.
 */
interface IUseSyncedStateArgs<T> {
    initialState: T;
    url: string;
    getFromStore: IGetStoredStateFn;
    syncToStore: IStoreStateFn;
    onError?: (err: Error) => void;
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
export declare const useSyncedState: <T>({ initialState, url, getFromStore, syncToStore, onError, }: IUseSyncedStateArgs<T>) => [T, (x: T) => void];
export default useSyncedState;
