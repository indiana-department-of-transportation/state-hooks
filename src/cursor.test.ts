
import { useState } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { deepClone } from '@jasmith79/ts-utils';

import {
  usePartialState,
} from './cursor';

describe('testing', () => {
  it('should work', () => {
    const foo = {
      a: 3,
      b: [
        'c'
      ]
    };

    const bar = deepClone(foo);
    expect(foo).toEqual(bar);
    expect(foo === bar).toBe(false);
    foo.b = ['c', 'd'];
    expect(foo).not.toEqual(bar);
  });

  it('should also work', async () => {
    const init = { hi: 5 };
    const { result: result1 } = renderHook(() => useState(init));
    const [state, setState] = result1.current;
    const { result: result2 } = renderHook(() => usePartialState(state, setState));
    const useCursor = result2.current;
    const { result: result3 } = renderHook(() => useCursor('hi'));
    const [hi, setHi] = result3.current;
    expect(hi).toBe(5);
    act(() => {
      setHi(4);
    });

    await new Promise(res => setTimeout(res, 10));
    expect(result3.current[0]).toBe(4);
    expect(result1.current[0]).toEqual({ hi: 4 });
  });
});
