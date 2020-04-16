/**
 * @description Hook factory for producing cursors over a nested state.
 *
 * @param state The nested state.
 * @param setState The setter for the nested state, e.g. returned by useState or one of
 * the state hooks in this repo.
 * @returns A hook to create a cursor over a key of the nested state.
 */
export declare const usePartialState: <T, K extends keyof T>(state: T, setState: (update: T) => void) => <K_1 extends keyof T>(key: K_1) => [T[K_1], (update: T[K_1]) => void];
export default usePartialState;
