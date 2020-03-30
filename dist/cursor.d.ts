export declare const isPrimitiveValue: (x: any) => boolean;
export declare const isThenable: (x: any) => boolean;
export declare const deepClone: <T>(obj: T, ..._args: any[]) => T;
export declare const usePartialState: <T, K extends keyof T>(state: T, setState: (update: T) => void) => <K_1 extends keyof T>(key: K_1) => [T[K_1], (update: T[K_1]) => void];
export default usePartialState;
