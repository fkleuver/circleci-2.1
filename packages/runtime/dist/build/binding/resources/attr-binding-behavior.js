(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding-behavior", "../change-set", "../target-accessors"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_behavior_1 = require("../binding-behavior");
    const change_set_1 = require("../change-set");
    const target_accessors_1 = require("../target-accessors");
    let AttrBindingBehavior = class AttrBindingBehavior {
        bind(flags, scope, binding) {
            binding.targetObserver = new target_accessors_1.DataAttributeAccessor(binding.locator.get(change_set_1.IChangeSet), binding.target, binding.targetProperty);
        }
        // tslint:disable-next-line:no-empty
        unbind(flags, scope, binding) { }
    };
    AttrBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('attr')
    ], AttrBindingBehavior);
    exports.AttrBindingBehavior = AttrBindingBehavior;
});
//# sourceMappingURL=attr-binding-behavior.js.map