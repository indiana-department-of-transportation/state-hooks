/**
 * @interface ISetRemoteArgs
 *
 * Arguments to set state to a server.
 */
interface ISetRemoteArgs<T> {
    state: T;
    url: string;
    headers?: Headers;
}
/**
 * @interface IUseRemoteArgs
 *
 * Arguments to the hook for syncing state with a server.
 */
interface IUseRemoteArgs<T> {
    initialState: T;
    url: string;
    headers?: Headers;
    onError?: (err: Error) => void;
}
/**
 * @interface IGetRemoteArgs
 *
 * Arguments for fetching state from a server.
 */
interface IGetRemoteArgs {
    url: string;
    headers?: Headers;
}
/**
 * @description POSTs state to a url.
 *
 * @param [args] The arguments object.
 * @param args.url The url to POST to.
 * @param args.state The state to POST.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
export declare const setServerState: <T>({ url, state, headers, }: ISetRemoteArgs<T>) => Promise<T>;
/**
 * @description Fetches state from a url.
 *
 * @param [args] The arguments object.
 * @param args.url The url to fetch.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
export declare const getServerState: <T>({ url, headers, }: IGetRemoteArgs) => Promise<T>;
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
export declare const useRemoteState: <T>({ url, initialState, headers, onError, }: IUseRemoteArgs<T>) => [T, (x: T) => void];
export default useRemoteState;
