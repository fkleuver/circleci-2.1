(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ast", "./binding-flags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ast_1 = require("./ast");
    const binding_flags_1 = require("./binding-flags");
    class Call {
        constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.locator = locator;
            this.$isBound = false;
            this.targetObserver = observerLocator.getObserver(target, targetProperty);
        }
        callSource(args) {
            const overrideContext = this.$scope.overrideContext;
            Object.assign(overrideContext, args);
            const result = this.sourceExpression.evaluate(binding_flags_1.BindingFlags.mustEvaluate, this.$scope, this.locator);
            for (const prop in args) {
                delete overrideContext[prop];
            }
            return result;
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
            this.targetObserver.setValue($args => this.callSource($args), flags);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            const sourceExpression = this.sourceExpression;
            if (ast_1.hasUnbind(sourceExpression)) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.targetObserver.setValue(null, flags);
        }
        // tslint:disable:no-empty no-any
        observeProperty(obj, propertyName) { }
        handleChange(newValue, previousValue, flags) { }
    }
    exports.Call = Call;
});
//# sourceMappingURL=call.js.map