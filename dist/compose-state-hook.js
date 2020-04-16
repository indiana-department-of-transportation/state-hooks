"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * compose-state-hooks.js
 *
 * @description Enables composition of two state hooks.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
const react_1 = require("react");
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
exports.useComposedStateHook = (hook1, hook2) => {
    return () => {
        const [data1, set1] = hook1();
        const [data2, set2] = hook2();
        const value = react_1.useRef(data2);
        const lastSet = react_1.useRef(data2);
        const setter = react_1.useCallback((state) => {
            let newState;
            if (typeof value.current === 'object'
                && typeof state === 'object'
                && value.current !== null
                && state !== null) {
                newState = { ...value.current, ...state };
            }
            else {
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
            }
            else if (string1 !== stringLast) {
                value.current = data1;
            }
        }
        const result = [value.current, setter];
        return result;
    };
};
exports.default = exports.useComposedStateHook;
//# sourceMappingURL=compose-state-hook.js.map