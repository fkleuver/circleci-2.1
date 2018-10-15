(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_behavior_1 = require("../binding-behavior");
    /*@internal*/
    function findOriginalEventTarget(event) {
        return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
    }
    exports.findOriginalEventTarget = findOriginalEventTarget;
    /*@internal*/
    function handleSelfEvent(event) {
        const target = findOriginalEventTarget(event);
        if (this.target !== target) {
            return;
        }
        return this.selfEventCallSource(event);
    }
    exports.handleSelfEvent = handleSelfEvent;
    let SelfBindingBehavior = class SelfBindingBehavior {
        bind(flags, scope, binding) {
            if (!binding.callSource || !binding.targetEvent) {
                throw kernel_1.Reporter.error(8);
            }
            binding.selfEventCallSource = binding.callSource;
            binding.callSource = handleSelfEvent;
        }
        unbind(flags, scope, binding) {
            binding.callSource = binding.selfEventCallSource;
            binding.selfEventCallSource = null;
        }
    };
    SelfBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('self')
    ], SelfBindingBehavior);
    exports.SelfBindingBehavior = SelfBindingBehavior;
});
//# sourceMappingURL=self-binding-behavior.js.map