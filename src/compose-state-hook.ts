import { useCallback, useRef } from 'react';

type HookReturn<T> = [T, (state: T) => void]
type StateHook<T> = {
  (): HookReturn<T>
}

const useComposedStateHook = <T>(
  hook1: StateHook<T>,
  hook2: StateHook<T>
): () => [T, (state: T) => void] => {
  return (): [T, (state: T) => void] => {
    const [data1, set1] = hook1();
    const [data2, set2] = hook2();
    const value = useRef(data2);
    const lastSet = useRef(data2);
    const setter = useCallback((state: T) => {
      let newState: T;
      if (typeof value.current === 'object'
        && typeof state === 'object'
        && value.current !== null
        && state !== null
      ) {
        newState = { ...value.current, ...state };
      } else {
        newState = state;
      }

      set1(newState);
      set2(newState);
      lastSet.current = newState;
      value.current = newState;
    }, []);

    const stringLast = JSON.stringify(lastSet.current);
    const string1 = JSON.stringify(data1);
    const string2 = JSON.stringify(data2);
    if (string1 !== string2) {
      if (string2 !== stringLast) {
        set1(data2);
        lastSet.current = data2;
        value.current = data2;
      } else if (string1 !== stringLast) {
        value.current = data1;
      }
    }

    const result: [T, (state: T) => void] = [value.current, setter];
    return result;
  };
};

export default useComposedStateHook;
