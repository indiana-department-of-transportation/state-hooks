/**
 * usestoredstate.test.js
 *
 * @description Custom hook tests.
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */

import 'jsdom-global/register';
import '@testing-library/jest-dom/extend-expect';

import { useState } from 'react';
import fetchPonyfill from 'fetch-ponyfill';
import { renderHook, act } from '@testing-library/react-hooks';

import {
  bindP,
  useSyncedState,
  useLocalState,
  useRemoteState,
  getFromLocalStorage,
  syncToLocalStorage,
  getServerState,
  setServerState,
} from './usestoredstate';

const { Request, Headers } = fetchPonyfill();

const localStorageMockFactory = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
};

const globalThis = (new Function("return this;"))();
globalThis.Request = Request;

const fakeResponseFactory = async (returnValue: any, status: number = 200) => ({
  json: () => new Promise(res => setTimeout(res, 0, returnValue)),
  status,
});

beforeEach(() => {
  globalThis.fetch = jest.fn();
  globalThis.localStorage = localStorageMockFactory();
});

describe('bindP', () => {
  it('should turn a normal function into a Promise-accepting one.', (done) => {
    const add3 = (x: number) => x + 3;
    bindP(add3)(Promise.resolve(2)).then(val => {
      expect(val).toBe(5);
      done();
    });
  });

  it('should preserve ctx for methods', (done) => {
    type Obj = {
      a: number,
      fn: (x: Promise<number>) => Promise<number>,
    };

    let obj: Obj = {
      a: 1,
      fn: bindP(function (this: Obj, b) { return this.a + b; })
    };

    obj.fn(Promise.resolve(2)).then(val => {
      expect(val).toBe(3);
      done();
    });
  });
});

describe('useLocalState', () => {
  it('should store state updates in localStorage', async () => {
    const init = { hi: 5 };
    const { result } = renderHook(() => useLocalState('/foo/bar', init));
    expect(globalThis.localStorage.getItem).toHaveBeenCalledWith('/foo/bar');
    const [state, updateState] = result.current;
    expect(state).toEqual(init);
    act(() => {
      updateState({ hi: 4 });
    });

    expect(result.current[0]).toEqual({ hi: 4 });
    expect(globalThis.localStorage.setItem)
      .toHaveBeenCalledWith('/foo/bar', JSON.stringify({ hi: 4 }));
  });
});

describe('useRemoteState', () => {
  it('should sync to server via fetch', async () => {
    const init = { hi: 5 };
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));
    globalThis.fetch.mockReturnValueOnce(Promise.resolve({ text: 'success', status: 200 }));
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

    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));

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
    globalThis.fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }));
    globalThis.fetch.mockReturnValueOnce(Promise.resolve({ status: 500 }));

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
    globalThis.fetch.mockReturnValueOnce(Promise.resolve({ status: 500 }));

    renderHook(() => useRemoteState({
      initialState: { hi: 5 },
      url: '/foo/bar',
      onError,
    }));

    await new Promise(res => setTimeout(res, 0));
    expect(onError).toHaveBeenCalledWith(new Error('GET for \'/foo/bar\' returned a 500 response.'));
  });
});
