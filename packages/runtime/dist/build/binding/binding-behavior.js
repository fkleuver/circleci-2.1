(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    function bindingBehavior(nameOrSource) {
        return function (target) {
            return exports.BindingBehaviorResource.define(nameOrSource, target);
        };
    }
    exports.bindingBehavior = bindingBehavior;
    exports.BindingBehaviorResource = {
        name: 'binding-behavior',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const description = typeof nameOrSource === 'string'
                ? { name: nameOrSource }
                : nameOrSource;
            Type.kind = exports.BindingBehaviorResource;
            Type.description = description;
            Type.register = register;
            return Type;
        }
    };
    function register(container) {
        container.register(kernel_1.Registration.singleton(exports.BindingBehaviorResource.keyFrom(this.description.name), this));
    }
});
//# sourceMappingURL=binding-behavior.js.map