(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ast"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ast_1 = require("./ast");
    class Ref {
        constructor(sourceExpression, target, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.locator = locator;
            this.$isBound = false;
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$isBound = true;
            this.$scope = scope;
            const sourceExpression = this.sourceExpression;
            if (ast_1.hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
                this.sourceExpression.assign(flags, this.$scope, this.locator, null);
            }
            const sourceExpression = this.sourceExpression;
            if (ast_1.hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
        }
        // tslint:disable:no-empty no-any
        observeProperty(obj, propertyName) { }
        handleChange(newValue, previousValue, flags) { }
    }
    exports.Ref = Ref;
});
//# sourceMappingURL=ref.js.map