"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_hooks_1 = require("@testing-library/react-hooks");
const ts_utils_1 = require("@jasmith79/ts-utils");
const cursor_1 = require("./cursor");
describe('testing', () => {
    it('should work', () => {
        const foo = {
            a: 3,
            b: [
                'c'
            ]
        };
        const bar = ts_utils_1.deepClone(foo);
        expect(foo).toEqual(bar);
        expect(foo === bar).toBe(false);
        foo.b = ['c', 'd'];
        expect(foo).not.toEqual(bar);
    });
    it('should also work', async () => {
        const init = { hi: 5 };
        const { result: result1 } = react_hooks_1.renderHook(() => react_1.useState(init));
        const [state, setState] = result1.current;
        const { result: result2 } = react_hooks_1.renderHook(() => cursor_1.usePartialState(state, setState));
        const useCursor = result2.current;
        const { result: result3 } = react_hooks_1.renderHook(() => useCursor('hi'));
        const [hi, setHi] = result3.current;
        expect(hi).toBe(5);
        react_hooks_1.act(() => {
            setHi(4);
        });
        await new Promise(res => setTimeout(res, 0));
        expect(result1.current[0]).toEqual({ hi: 4 });
        expect(result3.current[0]).toBe(4);
    });
});
//# sourceMappingURL=cursor.test.js.map