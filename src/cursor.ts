/**
 * cursor.js
 *
 * @description Creates a cursor over nested data.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
import { useState, useMemo, useRef, useEffect } from "react";
import { deepClone } from '@jasmith79/ts-utils';
import { IUpdateStateFn } from './usesyncedstate';

/**
 * @description Hook factory for producing cursors over a nested state.
 *
 * @param state The nested state.
 * @param setState The setter for the nested state, e.g. returned by useState or one of
 * the state hooks in this repo.
 * @returns A hook to create a cursor over a key of the nested state.
 */
export const usePartialState = <T, K extends keyof T>(
  state: T,
  setState: IUpdateStateFn<T>,
) => {
  const useCursor = <K extends keyof T>(
    key: K,
  ): [T[K], IUpdateStateFn<T[K]>] => {
    const [cursorState, updateCursor] = useState(state[key]);
    const shouldUpdate = useRef(false);
    const update: IUpdateStateFn<T[K]> = (state: any) => {
      shouldUpdate.current = true;
      updateCursor(state);
    };

    useEffect(() => {
      if (shouldUpdate.current) {
        shouldUpdate.current = false;
        const value = { [key]: cursorState };
        const clone = deepClone(state);
        setState(Object.assign(clone, value));
      }
    });

    return [cursorState, update];
  };

  return useCursor;
};

export default usePartialState;
