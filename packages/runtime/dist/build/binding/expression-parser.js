(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const ast_1 = require("./ast");
    exports.IExpressionParser = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(ExpressionParser));
    /*@internal*/
    class ExpressionParser {
        constructor() {
            this.expressionLookup = Object.create(null);
            this.interpolationLookup = Object.create(null);
            this.forOfLookup = Object.create(null);
        }
        parse(expression, bindingType) {
            switch (bindingType) {
                case 2048 /* Interpolation */:
                    {
                        let found = this.interpolationLookup[expression];
                        if (found === undefined) {
                            found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                        }
                        return found;
                    }
                case 539 /* ForCommand */:
                    {
                        let found = this.forOfLookup[expression];
                        if (found === undefined) {
                            found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
                        }
                        return found;
                    }
                default:
                    {
                        // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                        // But don't cache it, because empty strings are always invalid for any other type of binding
                        if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                            return ast_1.PrimitiveLiteral.$empty;
                        }
                        let found = this.expressionLookup[expression];
                        if (found === undefined) {
                            found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
                        }
                        return found;
                    }
            }
        }
        cache(expressions) {
            const { forOfLookup, expressionLookup, interpolationLookup } = this;
            for (const expression in expressions) {
                const expr = expressions[expression];
                switch (expr.$kind) {
                    case 24 /* Interpolation */:
                        interpolationLookup[expression] = expr;
                        break;
                    case 55 /* ForOfStatement */:
                        forOfLookup[expression] = expr;
                        break;
                    default:
                        expressionLookup[expression] = expr;
                }
            }
        }
        parseCore(expression, bindingType) {
            try {
                const parts = expression.split('.');
                const firstPart = parts[0];
                let current;
                if (firstPart.endsWith('()')) {
                    current = new ast_1.CallScope(firstPart.replace('()', ''), kernel_1.PLATFORM.emptyArray);
                }
                else {
                    current = new ast_1.AccessScope(parts[0]);
                }
                let index = 1;
                while (index < parts.length) {
                    const currentPart = parts[index];
                    if (currentPart.endsWith('()')) {
                        current = new ast_1.CallMember(current, currentPart.replace('()', ''), kernel_1.PLATFORM.emptyArray);
                    }
                    else {
                        current = new ast_1.AccessMember(current, parts[index]);
                    }
                    index++;
                }
                return current;
            }
            catch (e) {
                throw kernel_1.Reporter.error(3, e);
            }
        }
    }
    exports.ExpressionParser = ExpressionParser;
});
//# sourceMappingURL=expression-parser.js.map