import { useState, useMemo } from "react";

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
    if (isPrimitiveValue(value) || isThenable(value)) {
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

export const useSubState = <T, K extends keyof T>(state: T, setState: (update: T) => void) => {
  const useCursor = <K extends keyof T>(key: K): [T[K], (update: T[K]) => void] => {
    const [cursorState, updateCursor] = useState(state[key]);
    useMemo(() => {
      const value = { [key]: cursorState };
      const clone = deepClone(state);
      setState(Object.assign(clone, value));
    }, [cursorState]);

    return [cursorState, updateCursor];
  };

  return useCursor;
};
