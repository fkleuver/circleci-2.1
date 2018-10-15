(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding", "../binding-behavior", "../binding-mode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_1 = require("../binding");
    const binding_behavior_1 = require("../binding-behavior");
    const binding_mode_1 = require("../binding-mode");
    /*@internal*/
    function throttle(newValue) {
        let state = this.throttleState;
        let elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === null) {
            state.timeoutId = setTimeout(() => {
                state.timeoutId = null;
                state.last = +new Date();
                this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
        }
    }
    exports.throttle = throttle;
    let ThrottleBindingBehavior = class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToThrottle;
            if (binding instanceof binding_1.Binding) {
                if (binding.mode === binding_mode_1.BindingMode.twoWay) {
                    methodToThrottle = 'updateSource';
                }
                else {
                    methodToThrottle = 'updateTarget';
                }
            }
            else {
                methodToThrottle = 'callSource';
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.throttledMethod = binding[methodToThrottle];
            binding.throttledMethod.originalName = methodToThrottle;
            // replace the original method with the throttling version.
            binding[methodToThrottle] = throttle;
            // create the throttle state.
            binding.throttleState = {
                delay: delay,
                last: 0,
                timeoutId: null
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            let methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        }
    };
    ThrottleBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('throttle')
    ], ThrottleBindingBehavior);
    exports.ThrottleBindingBehavior = ThrottleBindingBehavior;
});
//# sourceMappingURL=throttle-binding-behavior.js.map