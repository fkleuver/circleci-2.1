(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../binding-behavior", "../signaler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_behavior_1 = require("../binding-behavior");
    const signaler_1 = require("../signaler");
    let SignalBindingBehavior = class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
        }
        bind(flags, scope, binding) {
            if (!binding.updateTarget) {
                throw kernel_1.Reporter.error(11);
            }
            if (arguments.length === 4) {
                let name = arguments[3];
                this.signaler.addSignalListener(name, binding);
                binding.signal = name;
            }
            else if (arguments.length > 4) {
                let names = Array.prototype.slice.call(arguments, 3);
                let i = names.length;
                while (i--) {
                    let name = names[i];
                    this.signaler.addSignalListener(name, binding);
                }
                binding.signal = names;
            }
            else {
                throw kernel_1.Reporter.error(12);
            }
        }
        unbind(flags, scope, binding) {
            let name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                let names = name;
                let i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    };
    SignalBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('signal'),
        kernel_1.inject(signaler_1.ISignaler)
    ], SignalBindingBehavior);
    exports.SignalBindingBehavior = SignalBindingBehavior;
});
//# sourceMappingURL=signals.js.map