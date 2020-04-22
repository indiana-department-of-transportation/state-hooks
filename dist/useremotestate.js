"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * useremotestate.js
 *
 * @description Synchronizises state changes with a remote server.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
const react_1 = require("react");
const usesyncedstate_1 = require("./usesyncedstate");
const REGISTRY = new Set();
/**
 * @description POSTs state to a url.
 *
 * @param [args] The arguments object.
 * @param args.url The url to POST to.
 * @param args.state The state to POST.
 * @param args.headers Optional headers.
 * @returns A promise of the state.
 */
exports.setServerState = async ({ url, state, headers, }) => {
    const params = {
        body: typeof state === 'string' ? state : JSON.stringify(state),
        method: 'POST',
    };
    if (headers) {
        params.headers = headers;
    }
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
exports.getServerState = async ({ url, headers, }) => {
    const params = {
        method: 'GET',
    };
    if (headers) {
        params.headers = headers;
    }
    const response = await fetch(url, params);
    // There really isn't a good way here to plumb an unsuccessful fetch
    // out to the user except to throw an error and let them catch it.
    if (response.status < 200 || response.status >= 400) {
        throw new Error(`GET for '${url}' returned a ${response.status} response.`);
    }
    try {
        return response.json();
    }
    catch (_err) {
        const text = await response.text();
        return text;
    }
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
exports.useRemoteState = ({ url, initialState, headers, onError, }) => {
    const getRemote = react_1.useCallback(async (url) => {
        const params = {
            method: 'GET',
        };
        if (headers) {
            params.headers = headers;
        }
        const response = await fetch(url, params);
        // There really isn't a good way here to plumb an unsuccessful fetch
        // out to the user except to throw an error and let them catch it.
        // Always wear an ErrorBoundaries kids!
        if (response.status < 200 || response.status >= 400) {
            throw new Error(`GET for '${url}' returned a ${response.status} response.`);
        }
        try {
            return response.json();
        }
        catch (_err) {
            const text = await response.text();
            return text;
        }
    }, [headers]);
    const setRemote = react_1.useCallback(async (url, state) => {
        const params = {
            body: typeof state === 'string' ? state : JSON.stringify(state),
            method: 'POST',
        };
        if (headers) {
            params.headers = headers;
        }
        const resp = await fetch(url, params);
        // There really isn't a good way here to plumb an unsuccessful POST
        // out to the user except to throw an error and let them catch it.
        if (resp.status < 200 || resp.status >= 400) {
            throw new Error(`POST for '${url}' returned a ${resp.status} response.`);
        }
        return state;
    }, [headers]);
    // const setRemote: IStoreStateFn = setRemoteFn;
    return usesyncedstate_1.useSyncedState({
        initialState,
        url,
        getFromStore: getRemote,
        syncToStore: setRemote,
        onError,
        registry: REGISTRY,
    });
};
exports.default = exports.useRemoteState;
//# sourceMappingURL=useremotestate.js.map