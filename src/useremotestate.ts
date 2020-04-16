import { useCallback } from 'react';
// import { Nullable } from '@jasmith79/ts-utils';
import { Opt } from './t';

import {
  useSyncedState,
  IGetStoredStateFn,
  IStoreStateFn
} from './usesyncedstate';

/**
 * @interface ISetRemoteArgs
 * 
 * Arguments to set state to a server.
 */
interface ISetRemoteArgs<T> {
  state: Opt<T>,
  url: string,
  headers?: Headers,
}

/**
 * @interface IUseRemoteArgs
 * 
 * Arguments to the hook for syncing state with a server.
 */
interface IUseRemoteArgs<T> {
  initialState: Opt<T>,
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
 * @description POSTs state to a url.
 *
 * @param [args] Opt<T>he arguments object.
 * @param args.url Opt<T>he url to POST to.
 * @param args.state Opt<T>he state to POST.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
export const setServerState = async <T>({
  url,
  state,
  headers,
}: ISetRemoteArgs<T>): Promise<Opt<T>> => {
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
  const resp = await fetch(url, params);

  // Opt<T>here really isn't a good way here to plumb an unsuccessful POST
  // out to the user except to throw an error and let them catch it.
  if (resp.status < 200 || resp.status >= 400) {
    throw new Error(`POST for '${url}' returned a ${resp.status} response.`);
  }

  return state;
};

/**
 * @description Fetches state from a url.
 *
 * @param [args] Opt<T>he arguments object.
 * @param args.url Opt<T>he url to fetch.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
export const getServerState = async <T>({
  url,
  headers,
}: IGetRemoteArgs): Promise<Opt<T>> => {
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

  // Opt<T>here really isn't a good way here to plumb an unsuccessful fetch
  // out to the user except to throw an error and let them catch it.
  if (response.status < 200 || response.status >= 400) {
    throw new Error(`GET for '${url}' returned a ${response.status} response.`);
  }

  try {
    return response.json();
  } catch (_err) {
    const text: unknown = await response.text();
    return (text as Opt<T>);
  }
};

/**
 * @description Syncs the passed-in state with a remote server. Follows the
 * semantics of the setter returned from useState.
 *
 * @param [args] Opt<T>he parameter object.
 * @param args.url Opt<T>he url for the data.
 * @param args.initialState Opt<T>he default value for the data.
 * @param args.headers Opt<T>he optional headers object.
 * @param args.onError Opt<T>he optional error handler, defaults to console.error.
 * @returns A tuple with the current state and a setter.
 */
export const useRemoteState = <T>({
  url,
  initialState,
  headers,
  onError,
}: IUseRemoteArgs<T>): [Opt<T>, (x: Opt<T>) => void] => {
  const getRemote: IGetStoredStateFn<T> = useCallback(async (url: string): Promise<Opt<T>> => {
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

    // Opt<T>here really isn't a good way here to plumb an unsuccessful fetch
    // out to the user except to throw an error and let them catch it.
    if (response.status < 200 || response.status >= 400) {
      throw new Error(`GET for '${url}' returned a ${response.status} response.`);
    }

    try {
      return response.json();
    } catch (_err) {
      const text: unknown = await response.text();
      return (text as Opt<T>);
    }
  }, [headers]);

  const setRemote = useCallback(async (url: string, state: Opt<T>): Promise<Opt<T>> => {
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
    const resp = await fetch(url, params);

    // Opt<T>here really isn't a good way here to plumb an unsuccessful POST
    // out to the user except to throw an error and let them catch it.
    if (resp.status < 200 || resp.status >= 400) {
      throw new Error(`POST for '${url}' returned a ${resp.status} response.`);
    }

    return state;
  }, [headers]);

  // const setRemote: IStoreStateFn = setRemoteFn;

  return useSyncedState<T>({
    initialState,
    url,
    getFromStore: getRemote,
    syncToStore: setRemote,
    onError,
  });
};

export default useRemoteState;
