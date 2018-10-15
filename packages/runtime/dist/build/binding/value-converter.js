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
    function valueConverter(nameOrSource) {
        return function (target) {
            return exports.ValueConverterResource.define(nameOrSource, target);
        };
    }
    exports.valueConverter = valueConverter;
    exports.ValueConverterResource = {
        name: 'value-converter',
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
            Type.kind = exports.ValueConverterResource;
            Type.description = description;
            Type.register = register;
            return Type;
        }
    };
    function register(container) {
        container.register(kernel_1.Registration.singleton(exports.ValueConverterResource.keyFrom(this.description.name), this));
    }
});
//# sourceMappingURL=value-converter.js.map