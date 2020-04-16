declare type HookReturn<T> = [T, (state: T) => void];
declare type StateHook<T> = {
    (): HookReturn<T>;
};
/**
 * @description Composes two state hooks. NOTE: if the setter of the
 * individual hooks is called from the outside, the second hooks changes
 * will overwrite the first hook but NOT vice-versa, although sets from
 * the first hook will affect the value returned by the composed hook.
 * This behavior is so for example `useRemoteState` and `useLocalState` can
 * be composed together without the cached value from localStorage
 * overwriting the server-side value with a POST.
 *
 * ```
 * const useLocallyCachedRemoteState = useComposedStateHook(
 *   () => useLocalState(url, initialValue), // <- must be first!
 *   () => useRemoteState({ url, initialValue }),
 * );
 * ```
 *
 * or `useLocalState` can be combined with a cursor safely:
 *
 * ```
 * const useCursor = usePartialState(someComplexState);
 * const key = 'someKey';
 * const usePartialWithLocalCache = useComposedStateHook(
 *   () => useCursor(key), // <- must be first!
 *   () => useLocalState(url, someComplexState[key]),
 * );
 * ```
 *
 * Just remember if you don't want independent changes of one hook to overwrite
 * the value of the other pass the subordinate hook *first*. If the values are
 * only ever set via the setter returned by the composed hook then the order
 * is not relevant.
 *
 * @param hook1 The first state hook to compose.
 * @param hook2 The second state hook to compose.
 * @returns A state hook with a setter that updates both the composed hooks.
 */
export declare const useComposedStateHook: <T>(hook1: StateHook<T>, hook2: StateHook<T>) => () => [T, (state: T) => void];
export default useComposedStateHook;
