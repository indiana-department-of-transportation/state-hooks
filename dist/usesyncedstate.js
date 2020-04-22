"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * usesyncedstate.js
 *
 * @description Custom React hook for syncing state with a data store.
 * Supports both synchronous and asynchronous data storage.
 *
 * NOTE: No tests for this, as it's functionality is thoroughly tested
 * by the derivative hooks in this repo.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
const react_1 = require("react");
// Ensure we don't get from the store more than once for a given URL,
// i.e. only the very first time the hook is rendered.
const REGISTRY = new Set();
/**
 * @description useSyncedState
 *
 * Custom React hook to sync data to/from a data store. Supports both sync and
 * async storage.
 *
 * @param [args] The parameter object.
 * @param args.initialState The initial value. Should generally be a default that
 * is overridden by the stored value if present.
 * @param args.url The URL for the stored value.
 * @param args.getFromStore Function to retrieve a value from the data store.
 * @param args.syncToStore Function to save state changes to the data store.
 * @returns A tuple with the current state and a setter.
 */
exports.useSyncedState = ({ initialState, url, getFromStore, syncToStore, onError = console.error, registry = REGISTRY, }) => {
    const shouldSet = react_1.useRef(false);
    const [state, updateState] = react_1.useState(initialState);
    const setState = (state) => {
        shouldSet.current = true;
        updateState(state);
    };
    react_1.useEffect(() => {
        const fn = async () => {
            let cachedValue;
            try {
                cachedValue = await getFromStore(url);
            }
            catch (err) {
                onError(err);
                return;
            }
            if (cachedValue != null) {
                updateState(cachedValue);
            }
            else {
                try {
                    syncToStore(url, state);
                }
                catch (err) {
                    onError(err);
                }
            }
        };
        if (!registry.has(url)) {
            registry.add(url);
            fn();
        }
    }, []);
    react_1.useEffect(() => {
        const fn = async () => {
            // There are two cases where we don't want to sync back
            // to the store: one is where we just got the value from the
            // store and the other is that we don't want to sync the
            // default value provided to the hook back. We only want to
            // sync calls made from outside the hook, hence the flag that
            // the setter toggles.
            if (shouldSet.current) {
                shouldSet.current = false;
                try {
                    await syncToStore(url, state);
                }
                catch (err) {
                    onError(err);
                }
            }
        };
        fn();
    }, [url, state, syncToStore]);
    return [state, setState];
};
exports.default = exports.useSyncedState;
//# sourceMappingURL=usesyncedstate.js.map