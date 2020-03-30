import { IGetStoredStateFn, IStoreStateFn } from './usesyncedstate';
export declare const getFromLocalStorage: IGetStoredStateFn;
export declare const syncToLocalStorage: IStoreStateFn;
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
export declare const useLocalState: <T>(url: string, initialState: T) => [T, (x: T) => void];
export default useLocalState;
