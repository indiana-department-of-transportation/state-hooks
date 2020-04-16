"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * cursor.js
 *
 * @description Creates a cursor over nested data.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
const react_1 = require("react");
const ts_utils_1 = require("@jasmith79/ts-utils");
/**
 * @description Hook factory for producing cursors over a nested state.
 *
 * @param state The nested state.
 * @param setState The setter for the nested state, e.g. returned by useState or one of
 * the state hooks in this repo.
 * @returns A hook to create a cursor over a key of the nested state.
 */
exports.usePartialState = (state, setState) => {
    const useCursor = (key) => {
        const [cursorState, updateCursor] = react_1.useState(state[key]);
        react_1.useMemo(() => {
            const value = { [key]: cursorState };
            const clone = ts_utils_1.deepClone(state);
            setState(Object.assign(clone, value));
        }, [cursorState]);
        return [cursorState, updateCursor];
    };
    return useCursor;
};
exports.default = exports.usePartialState;
//# sourceMappingURL=cursor.js.map