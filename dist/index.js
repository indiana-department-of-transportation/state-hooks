"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * index.js
 *
 * @description Main file for INDOT React state hooks.
 *
 * @author jarsmith@indot.in.gov
 * @license MIT
 * @copyright INDOT, 2020
 */
const usesyncedstate_1 = __importDefault(require("./usesyncedstate"));
exports.useSyncedState = usesyncedstate_1.default;
const uselocalstate_1 = __importDefault(require("./uselocalstate"));
exports.useLocalState = uselocalstate_1.default;
const useremotestate_1 = __importDefault(require("./useremotestate"));
exports.useRemoteState = useremotestate_1.default;
const cursor_1 = __importDefault(require("./cursor"));
exports.usePartialState = cursor_1.default;
const compose_state_hook_1 = __importDefault(require("./compose-state-hook"));
exports.useComposedState = compose_state_hook_1.default;
//# sourceMappingURL=index.js.map