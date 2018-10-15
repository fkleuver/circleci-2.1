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
    function renderStrategy(nameOrSource) {
        return function (target) {
            return exports.RenderStrategyResource.define(nameOrSource, target);
        };
    }
    exports.renderStrategy = renderStrategy;
    exports.RenderStrategyResource = {
        name: 'render-strategy',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
            const Type = ctor;
            Type.kind = exports.RenderStrategyResource;
            Type.description = description;
            Type.register = function (container) {
                container.register(kernel_1.Registration.singleton(Type.kind.keyFrom(description.name), Type));
            };
            return Type;
        }
    };
});
//# sourceMappingURL=render-strategy.js.map