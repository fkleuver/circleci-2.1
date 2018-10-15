(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding", "../binding-behavior", "../binding-flags", "../binding-mode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_1 = require("../binding");
    const binding_behavior_1 = require("../binding-behavior");
    const binding_flags_1 = require("../binding-flags");
    const binding_mode_1 = require("../binding-mode");
    const unset = {};
    /*@internal*/
    function debounceCallSource(event) {
        const state = this.debounceState;
        clearTimeout(state.timeoutId);
        state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
    }
    exports.debounceCallSource = debounceCallSource;
    /*@internal*/
    function debounceCall(newValue, oldValue, flags) {
        const state = this.debounceState;
        clearTimeout(state.timeoutId);
        if (!(flags & state.callContextToDebounce)) {
            state.oldValue = unset;
            this.debouncedMethod(newValue, oldValue, flags);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        state.timeoutId = setTimeout(() => {
            const ov = state.oldValue;
            state.oldValue = unset;
            this.debouncedMethod(newValue, ov, flags);
        }, state.delay);
    }
    exports.debounceCall = debounceCall;
    const fromView = binding_mode_1.BindingMode.fromView;
    let DebounceBindingBehavior = class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToDebounce;
            let callContextToDebounce;
            let debouncer;
            if (binding instanceof binding_1.Binding) {
                methodToDebounce = 'handleChange';
                debouncer = debounceCall;
                callContextToDebounce = binding.mode & fromView ? binding_flags_1.BindingFlags.updateSourceExpression : binding_flags_1.BindingFlags.updateTargetInstance;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = binding_flags_1.BindingFlags.updateTargetInstance;
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.debouncedMethod = binding[methodToDebounce];
            binding.debouncedMethod.originalName = methodToDebounce;
            // replace the original method with the debouncing version.
            binding[methodToDebounce] = debouncer;
            // create the debounce state.
            binding.debounceState = {
                callContextToDebounce,
                delay,
                timeoutId: 0,
                oldValue: unset
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.debouncedMethod.originalName;
            binding[methodToRestore] = binding.debouncedMethod;
            binding.debouncedMethod = null;
            clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        }
    };
    DebounceBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('debounce')
    ], DebounceBindingBehavior);
    exports.DebounceBindingBehavior = DebounceBindingBehavior;
});
//# sourceMappingURL=debounce-binding-behavior.js.map