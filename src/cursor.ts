/**
 * cursor.js
 *
 * @description Creates a cursor over nested data.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
import { useState, useMemo } from "react";
import { deepClone } from '@jasmith79/ts-utils';

/**
 * @description Hook factory for producing cursors over a nested state.
 *
 * @param state The nested state.
 * @param setState The setter for the nested state, e.g. returned by useState or one of
 * the state hooks in this repo.
 * @returns A hook to create a cursor over a key of the nested state.
 */
export const usePartialState = <T, K extends keyof T>(state: T, setState: (update: T) => void) => {
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

export default usePartialState;
