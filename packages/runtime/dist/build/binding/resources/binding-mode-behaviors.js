(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding-behavior", "../binding-mode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_behavior_1 = require("../binding-behavior");
    const binding_mode_1 = require("../binding-mode");
    const { oneTime, toView, fromView, twoWay } = binding_mode_1.BindingMode;
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
        }
        bind(flags, scope, binding) {
            binding.originalMode = binding.mode;
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = binding.originalMode;
            binding.originalMode = null;
        }
    }
    exports.BindingModeBehavior = BindingModeBehavior;
    let OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(oneTime);
        }
    };
    OneTimeBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('oneTime')
    ], OneTimeBindingBehavior);
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(toView);
        }
    };
    ToViewBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('toView')
    ], ToViewBindingBehavior);
    exports.ToViewBindingBehavior = ToViewBindingBehavior;
    let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(fromView);
        }
    };
    FromViewBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('fromView')
    ], FromViewBindingBehavior);
    exports.FromViewBindingBehavior = FromViewBindingBehavior;
    let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(twoWay);
        }
    };
    TwoWayBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('twoWay')
    ], TwoWayBindingBehavior);
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
});
//# sourceMappingURL=binding-mode-behaviors.js.map