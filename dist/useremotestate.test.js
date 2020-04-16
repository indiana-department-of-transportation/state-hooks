"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_ponyfill_1 = __importDefault(require("fetch-ponyfill"));
const react_hooks_1 = require("@testing-library/react-hooks");
const useremotestate_1 = __importDefault(require("./useremotestate"));
const { Request, Headers } = fetch_ponyfill_1.default();
globalThis.Request = Request;
globalThis.fetch = jest.fn();
const fakeResponseFactory = async (returnValue, status = 200) => ({
    json: () => new Promise(res => setTimeout(res, 0, returnValue)),
    status,
});
let fetch = jest.fn();
beforeEach(() => {
    fetch = jest.fn();
    globalThis.fetch = fetch;
});
describe('useRemoteState', () => {
    it('should sync to server via fetch', async () => {
        const init = { hi: 5 };
        fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));
        fetch.mockReturnValueOnce(Promise.resolve({ text: 'success', status: 200 }));
        const { result, waitForNextUpdate } = react_hooks_1.renderHook(() => useremotestate_1.default({
            initialState: init,
            url: '/foo/bar'
        }));
        expect(globalThis.fetch).toHaveBeenCalledWith('/foo/bar', { method: 'GET' });
        const [state, updateState] = result.current;
        expect(state).toEqual({ hi: 5 });
        await waitForNextUpdate();
        expect(result.current[0]).toEqual({ hi: 3 });
        react_hooks_1.act(() => {
            updateState({ hi: 4 });
        });
        expect(globalThis.fetch).toHaveBeenCalledWith('/foo/bar', {
            method: 'POST',
            body: JSON.stringify({ hi: 4 }),
        });
        expect(result.current[0]).toEqual({ hi: 4 });
    });
    it('should take an optional headers object', async () => {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept-Charset': 'utf-8',
        });
        fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));
        const { waitForNextUpdate } = react_hooks_1.renderHook(() => useremotestate_1.default({
            initialState: { hi: 5 },
            url: '/foo/bar',
            headers,
        }));
        await waitForNextUpdate();
        expect(globalThis.fetch).toHaveBeenCalledWith('/foo/bar', {
            method: 'GET',
            headers,
        });
    });
    it('should take an optional error handler', async () => {
        globalThis.fetch = async (...args) => {
            throw new Error('stopping');
        };
        const onError = jest.fn();
        react_hooks_1.renderHook(() => useremotestate_1.default({
            initialState: { hi: 5 },
            url: '/foo/bar',
            onError,
        }));
        await new Promise(res => setTimeout(res, 0));
        expect(onError).toHaveBeenCalledWith(new Error('stopping'));
    });
    it('should call errorHandler on a POST response not in range 200-399', async () => {
        const onError = jest.fn();
        fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));
        fetch.mockReturnValueOnce(Promise.resolve({ status: 500 }));
        const { result, waitForNextUpdate } = react_hooks_1.renderHook(() => useremotestate_1.default({
            initialState: { hi: 5 },
            url: '/foo/bar',
            onError,
        }));
        react_hooks_1.act(() => {
            result.current[1]({ hi: 4 });
        });
        await waitForNextUpdate();
        expect(onError).toHaveBeenCalledWith(new Error('POST for \'/foo/bar\' returned a 500 response.'));
    });
    it('should call errorHandler on a GET response not in range 200-399', async () => {
        const onError = jest.fn();
        fetch.mockReturnValueOnce(Promise.resolve({ status: 500 }));
        react_hooks_1.renderHook(() => useremotestate_1.default({
            initialState: { hi: 5 },
            url: '/foo/bar',
            onError,
        }));
        await new Promise(res => setTimeout(res, 0));
        expect(onError).toHaveBeenCalledWith(new Error('GET for \'/foo/bar\' returned a 500 response.'));
    });
});
//# sourceMappingURL=useremotestate.test.js.map