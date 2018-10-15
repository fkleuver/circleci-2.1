(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../binding/binding-mode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_mode_1 = require("../binding/binding-mode");
    /**
     * Decorator: Specifies custom behavior for a bindable property.
     * @param configOrTarget The overrides.
     */
    function bindable(configOrTarget, key, descriptor) {
        let deco = function (target, key2, descriptor2) {
            target = target.constructor;
            let bindables = target.bindables || (target.bindables = {});
            let config = configOrTarget || {};
            if (!config.attribute) {
                config.attribute = kernel_1.PLATFORM.kebabCase(key2);
            }
            if (!config.callback) {
                config.callback = `${key2}Changed`;
            }
            if (!config.mode) {
                config.mode = binding_mode_1.BindingMode.toView;
            }
            config.property = key2;
            bindables[key2] = config;
        };
        if (key) { //placed on a property without parens
            var target = configOrTarget;
            configOrTarget = null; //ensure that the closure captures the fact that there's actually no config
            return deco(target, key, descriptor);
        }
        return deco;
    }
    exports.bindable = bindable;
});
//# sourceMappingURL=bindable.js.map