import 'jsdom-global/register';
import '@testing-library/jest-dom/extend-expect';

import fetchPonyfill from 'fetch-ponyfill';
import { renderHook, act } from '@testing-library/react-hooks';

import useRemoteState from './useremotestate';

const { Request, Headers } = fetchPonyfill();

const localStorageMockFactory = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
};

globalThis.Request = Request;
globalThis.fetch = jest.fn();

const fakeResponseFactory = async (returnValue: any, status: number = 200) => ({
  json: () => new Promise(res => setTimeout(res, 0, returnValue)),
  status,
});

let fetch = jest.fn()
beforeEach(() => {
  fetch = jest.fn()
  globalThis.fetch = fetch;
});

describe('useRemoteState', () => {
  it('should sync to server via fetch', async () => {
    const init = { hi: 5 };
    fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));
    fetch.mockReturnValueOnce(Promise.resolve({ text: 'success', status: 200 }));
    const { result, waitForNextUpdate } = renderHook(() => useRemoteState({
      initialState: init,
      url: '/foo/bar'
    }));

    expect(globalThis.fetch).toHaveBeenCalledWith('/foo/bar', { method: 'GET' });
    const [state, updateState] = result.current;
    expect(state).toEqual({ hi: 5 });
    await waitForNextUpdate();
    expect(result.current[0]).toEqual({ hi: 3 });
    act(() => {
      updateState({ hi: 4 });
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/foo/bar',
      {
        method: 'POST',
        body: JSON.stringify({ hi: 4 }),
      },
    );
    expect(result.current[0]).toEqual({ hi: 4 });
  });

  it('should take an optional headers object', async () => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept-Charset': 'utf-8',
    });

    fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));

    const { waitForNextUpdate } = renderHook(() => useRemoteState({
      initialState: { hi: 5 },
      url: '/foo/bar',
      headers,
    }));

    await waitForNextUpdate();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/foo/bar',
      {
        method: 'GET',
        headers,
      });
  });

  it('should take an optional error handler', async () => {
    globalThis.fetch = async (...args: any[]) => {
      throw new Error('stopping');
    };

    const onError = jest.fn();

    renderHook(() => useRemoteState({
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

    const { result, waitForNextUpdate } = renderHook(() => useRemoteState({
      initialState: { hi: 5 },
      url: '/foo/bar',
      onError,
    }));

    act(() => {
      result.current[1]({ hi: 4 });
    });

    await waitForNextUpdate();
    expect(onError).toHaveBeenCalledWith(new Error('POST for \'/foo/bar\' returned a 500 response.'));
  });

  it('should call errorHandler on a GET response not in range 200-399', async () => {
    const onError = jest.fn();
    fetch.mockReturnValueOnce(Promise.resolve({ status: 500 }));

    renderHook(() => useRemoteState({
      initialState: { hi: 5 },
      url: '/foo/bar',
      onError,
    }));

    await new Promise(res => setTimeout(res, 0));
    expect(onError).toHaveBeenCalledWith(new Error('GET for \'/foo/bar\' returned a 500 response.'));
  });
});
