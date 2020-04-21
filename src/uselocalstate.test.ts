
import { renderHook, act } from '@testing-library/react-hooks';
import useLocalState from './uselocalstate';

const localStorageMockFactory = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: (index: number) => null,
    removeItem: (key: string) => {},
  };
};

// const globalThis = globalThis || (new Function("return this;"))();

beforeEach(() => {
  globalThis.localStorage = localStorageMockFactory();
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

  it('should work with an update function', async () => {
    const init = false;
    const { result } = renderHook(() => useLocalState('/foo/bar', init));
    expect(globalThis.localStorage.getItem).toHaveBeenCalledWith('/foo/bar');
    const [state, updateState] = result.current;
    expect(state).toEqual(init);
    act(() => {
      updateState((prev: boolean) => !prev);
    });

    expect(result.current[0]).toBe(true);
    expect(globalThis.localStorage.setItem)
      .toHaveBeenCalledWith('/foo/bar', 'true');
  });
});
