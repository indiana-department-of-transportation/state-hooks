import fetchPonyfill from 'fetch-ponyfill';
import { useState } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import useLocalState from './uselocalstate';
import useRemoteState from './useremotestate';
import useComposedState from './compose-state-hook';
import usePartialState from './cursor';
import useCompose from './compose-state-hook';

const { Request, Headers } = fetchPonyfill();

const localStorageMockFactory = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: (index: number) => null,
    removeItem: (key: string) => { },
  };
};

globalThis.Request = Request;
globalThis.fetch = jest.fn();

const fakeResponseFactory = async (returnValue: any, status: number = 200, timeout: number = 0) => ({
  json: () => new Promise(res => setTimeout(res, timeout, returnValue)),
  status,
});

let fetch = jest.fn()
beforeEach(() => {
  fetch = jest.fn()
  globalThis.fetch = fetch;
});

describe('useComposedState', () => {
  it('should compose two state hooks', async () => {
    const init = { hi: 5 };
    const ls = localStorageMockFactory();
    ls.getItem.mockReturnValueOnce({ hi: 4 });
    globalThis.localStorage = ls;
    fetch.mockReturnValueOnce(fakeResponseFactory({ hi: 3 }, 200, 10));

    const initial = {
      initialState: init,
      url: '/foo/bar',
    };

    const url = '/foo/bar';
    const useWrappedLocal = () => useLocalState(url, init);
    const useWrappedRemote = () => useRemoteState(initial);
  
    const useLocalAndRemote = useComposedState(useWrappedLocal, useWrappedRemote);
    const { result, waitForNextUpdate } = renderHook(useLocalAndRemote);

    await waitForNextUpdate();
    expect(result.current[0]).toEqual({ hi: 4 });
    expect(ls.getItem).toHaveBeenCalledWith('/foo/bar');

    await waitForNextUpdate();
    expect(result.current[0]).toEqual({ hi: 3 });
    expect(ls.setItem).toHaveBeenLastCalledWith('/foo/bar', JSON.stringify({ hi: 3 }));
  });

  it('should work with cursor-ified state hooks', async () => {
    const url = '/foo/bar';
    const hooky = () => {
      const [state, setState] = useState({
        hi: 5,
      });

      const useCursor = usePartialState(state, setState);
      const [hi, setHi] = useCursor('hi');
      const useComposed = useComposedState(() => [hi, setHi], () => useLocalState(url, 5));
      const [alsoHi, setter] = useComposed();
      return {
        state,
        hi,
        alsoHi,
        setter,
      };
    };

    const ls = localStorageMockFactory();
    globalThis.localStorage = ls;
    ls.getItem.mockReturnValueOnce(null);

    const { result, waitForNextUpdate } = renderHook(hooky);
    expect(result.current.state.hi).toBe(5);
    expect(result.current.hi).toBe(5);
    expect(result.current.alsoHi).toBe(5);
    await new Promise(res => setTimeout(res, 0));

    act(() => {
      result.current.setter(4);
    });

    await new Promise(res => setTimeout(res, 0));
    console.log(JSON.stringify(result.current.state));
    expect(result.current.state.hi).toBe(4);
    expect(result.current.hi).toBe(4);
    expect(result.current.alsoHi).toBe(4);
    expect(ls.setItem).toHaveBeenLastCalledWith(url, '4');
  });
});
