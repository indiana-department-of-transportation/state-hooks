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

const { Request } = fetchPonyfill();

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


// const typey = typeof eval("global['localStorage']");
// if (typey === 'undefined') {
//   throw new Error("NO LOCAL STORAGE");
// } else {
//   console.log("Storage be fine, it's a " + typey);
// }

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
    const { result, waitForNextUpdate } = renderHook(() => useLocalState(init, "/foo/bar"));
    const [state, updateState] = result.current;
    expect(state).toEqual(init);
    act(() => {
      updateState({ hi: 4 });
    });
    console.log("STARTING WAIT");
    await waitForNextUpdate();
    console.log("AWAITED");
    expect(result.current[0]).toEqual({ hi: 4 });
  });
});
