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
    class AttrSyntax {
        constructor(rawName, rawValue, target, command) {
            this.rawName = rawName;
            this.rawValue = rawValue;
            this.target = target;
            this.command = command;
        }
    }
    exports.AttrSyntax = AttrSyntax;
    exports.IAttributeParser = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(AttributeParser));
    /*@internal*/
    class AttributeParser {
        constructor() {
            this.cache = {};
        }
        parse(name, value) {
            let target;
            let command;
            const existing = this.cache[name];
            if (existing === undefined) {
                let lastIndex = 0;
                target = name;
                for (let i = 0, ii = name.length; i < ii; ++i) {
                    if (name.charCodeAt(i) === 46 /* Dot */) {
                        // set the targetName to only the part that comes before the first dot
                        if (name === target) {
                            target = name.slice(0, i);
                        }
                        lastIndex = i;
                    }
                }
                command = lastIndex > 0 ? name.slice(lastIndex + 1) : null;
                this.cache[name] = [target, command];
            }
            else {
                target = existing[0];
                command = existing[1];
            }
            return new AttrSyntax(name, value, target, command && command.length ? command : null);
        }
    }
    exports.AttributeParser = AttributeParser;
});
//# sourceMappingURL=attribute-parser.js.map