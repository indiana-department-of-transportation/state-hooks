import { useState, useReducer, useEffect } from "react";

export const isPrimitiveValue = (x: any): boolean => {
  const type = typeof x;
  return type === 'number'
    || type === 'string'
    || type === 'undefined'
    || type === 'symbol'
    || type === 'boolean';
};

export const isThenable = (x: any): boolean => x && typeof x.then === 'function';

export const deepClone = <T>(obj: T, ..._args: any[]): T => {
  if (obj === null || isPrimitiveValue(obj)) return obj;
  // if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.entries(obj).reduce((acc: { [k: string]: any }, [key, value]) => {
    // For promise-like, assume immutability
    if ( isPrimitiveValue(value) || isThenable(value)) {
      acc[key] = value;
    // Defer to object's clone method if present.
    } else if (typeof value.clone === 'function') {
      acc[key] = value.clone();
    } else if (Array.isArray(value)) {
      acc[key] = value.map(deepClone);
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      acc[key] = deepClone(value);
    } else {
      console.warn(
        `Cannot clone object of type ${Object.prototype.toString.call(value)}, copying reference.`,
      );
      acc[key] = value;
    }

    return acc;
  }, {}) as T;
};

// const useLens = <T, K extends keyof T>(getter: (k: K) => T[K], setter: (k: K, v: T[K]) => void) => {

// };

// export const useSubState = <T>(state: T, setState: (update: T) => void) => {
//   return <K extends keyof T>(key: K): [T[K], (x: T[K]) => T] => {
//     const [subState, setSubState] = useState(state[key]);
//     const setter = (value: T[K]) => {
//       const newState = deepClone<T>(state);
//       newState[key] = value;
//       setState(newState);
//       setSubState(value);
//       return newState;
//     };
//     return [subState, setter];
//   }
// };

interface IReducerAction<T> {
  value: T,
  type: string
}

// Type of the reducer given to useReducer
type Reducer<S, A> = (prevState: S, action: A) => S

// Same as the type of the dispatch function returned from useReducer.
type Dispatch<A> = (action: A) => void

const reducer = <T, K extends keyof T>(prevState: T, action: IReducerAction<Partial<T>>) => {
  const newState = deepClone(prevState);
  return Object.assign(newState, action.value);
};

export const useSubState = <T, K extends keyof T>(state: T, setState: (update: T) => void) => {
  const [view, dispatch] = useReducer(reducer, state);

  useEffect(() => {
    setState(view as T);
  }, [view]);

  const f = <K extends keyof T>(key: K): [T[K], (update: T[K]) => {
    [x: string]: T[K];
  }] => {
    const setter = (update: T[K]) => {
      const value = { [key]: update };
      dispatch({
        type: 'update',
        value,
      });

      return value;
    };
    return [state[key], setter];
  };

  return f;
};
