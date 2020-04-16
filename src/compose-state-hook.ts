import { useCallback, useRef, useReducer } from 'react';

// import { IJSONObject, Nullable } from '@jasmith79/ts-utils';
// import { Opt } from './t';

type HookReturn<T> = [T, (state: T) => void]
type StateHook<T> = {
  (): HookReturn<T>
}

const c = <T>(hook1: StateHook<T>, hook2: StateHook<T>): () => [T, (state: T) => void] => {
  return (): [T, (state: T) => void] => {
    // console.log(`initial data: ${JSON.stringify(initialData)}`);
    const [data1, set1] = hook1();
    const [data2, set2] = hook2();
    const value = useRef(data2);
    const lastSet = useRef(data2);
    const setter = useCallback((state: T) => {
      // const newState = typeof value.current === 'object' && value.current !== null
      //   ? { ...value.current, ...state }
      //   : state;
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
      console.log('Setting!');
      console.log(newState);
      lastSet.current = newState;
      value.current = newState;
    }, []);

    const stringLast = JSON.stringify(lastSet.current);
    const string1 = JSON.stringify(data1);
    const string2 = JSON.stringify(data2);
    console.log('three strings');
    console.log(string1);
    console.log(string2);
    console.log(stringLast);
    if (string1 !== string2) {
      if (string2 !== stringLast) {
        console.log('string2 drift, updating...');
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

// const useCompose = <T>([data1, set1]: HookReturn<T>, [data2, set2]: HookReturn<T>): [T | undefined, (state: T) => void] => {
//   const lastSet = useRef(data2);
//   const value = useRef(data2);
//   const setter = useCallback((state: T) => {
//     const newState = typeof value.current === 'object' && value.current !== null
//       ? { ...value.current, ...state }
//       : state;
    
//     set1(newState);
//     set2(newState);
//     lastSet.current = newState;
//     value.current = newState;
//   }, []);

//   const stringLast = JSON.stringify(lastSet.current);
//   const string1 = JSON.stringify(data1);
//   const string2 = JSON.stringify(data2);
//   if (string1 !== string2) {
//     if (string2 !== stringLast) {
//       console.log('string2 drift, updating...');
//       set1(data2);
//       lastSet.current = data2;
//       value.current = data2;
//     } else if (string1 !== stringLast) {
//       value.current = data1;
//     }
//   }


//   const result: [T, (state: T) => void] = [value.current, setter];
//   return result;
// }

export default c;
