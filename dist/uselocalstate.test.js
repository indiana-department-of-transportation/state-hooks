"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_hooks_1 = require("@testing-library/react-hooks");
const uselocalstate_1 = __importDefault(require("./uselocalstate"));
const localStorageMockFactory = () => {
    const store = {};
    return {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: (index) => null,
        removeItem: (key) => { },
    };
};
// const globalThis = globalThis || (new Function("return this;"))();
beforeEach(() => {
    globalThis.localStorage = localStorageMockFactory();
});
describe('useLocalState', () => {
    it('should store state updates in localStorage', async () => {
        const init = { hi: 5 };
        const { result } = react_hooks_1.renderHook(() => uselocalstate_1.default('/foo/bar', init));
        expect(globalThis.localStorage.getItem).toHaveBeenCalledWith('/foo/bar');
        const [state, updateState] = result.current;
        expect(state).toEqual(init);
        react_hooks_1.act(() => {
            updateState({ hi: 4 });
        });
        expect(result.current[0]).toEqual({ hi: 4 });
        expect(globalThis.localStorage.setItem)
            .toHaveBeenCalledWith('/foo/bar', JSON.stringify({ hi: 4 }));
    });
});
//# sourceMappingURL=uselocalstate.test.js.map