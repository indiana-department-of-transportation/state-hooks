"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
exports.isPrimitiveValue = (x) => {
    const type = typeof x;
    return type === 'number'
        || type === 'string'
        || type === 'undefined'
        || type === 'symbol'
        || type === 'boolean';
};
exports.isThenable = (x) => x && typeof x.then === 'function';
exports.deepClone = (obj, ..._args) => {
    if (obj === null || exports.isPrimitiveValue(obj))
        return obj;
    // if (Array.isArray(obj)) return obj.map(deepClone);
    return Object.entries(obj).reduce((acc, [key, value]) => {
        // For promise-like, assume immutability
        if (exports.isPrimitiveValue(value) || exports.isThenable(value)) {
            acc[key] = value;
            // Defer to object's clone method if present.
        }
        else if (typeof value.clone === 'function') {
            acc[key] = value.clone();
        }
        else if (Array.isArray(value)) {
            acc[key] = value.map(exports.deepClone);
        }
        else if (Object.prototype.toString.call(value) === '[object Object]') {
            acc[key] = exports.deepClone(value);
        }
        else {
            console.warn(`Cannot clone object of type ${Object.prototype.toString.call(value)}, copying reference.`);
            acc[key] = value;
        }
        return acc;
    }, {});
};
exports.usePartialState = (state, setState) => {
    const useCursor = (key) => {
        const [cursorState, updateCursor] = react_1.useState(state[key]);
        react_1.useMemo(() => {
            const value = { [key]: cursorState };
            const clone = exports.deepClone(state);
            setState(Object.assign(clone, value));
        }, [cursorState]);
        return [cursorState, updateCursor];
    };
    return useCursor;
};
exports.default = exports.usePartialState;
//# sourceMappingURL=cursor.js.map