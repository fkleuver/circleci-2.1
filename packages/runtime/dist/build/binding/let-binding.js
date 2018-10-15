(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "./binding-flags", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("./binding-flags");
    const connectable_1 = require("./connectable");
    let LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
            this.sourceExpression = sourceExpression;
            this.targetProperty = targetProperty;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.toViewModel = toViewModel;
            this.$isBound = false;
            this.$scope = null;
            this.target = null;
        }
        handleChange(newValue, previousValue, flags) {
            if (!this.$isBound) {
                return;
            }
            if (flags & binding_flags_1.BindingFlags.updateTargetInstance) {
                const { target, targetProperty } = this;
                previousValue = target[targetProperty];
                newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw kernel_1.Reporter.error(15, flags);
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
            this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(binding_flags_1.BindingFlags.fromBind, scope, this.locator);
            this.sourceExpression.connect(flags, scope, this);
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this);
            }
            this.$scope = null;
            this.unobserve(true);
        }
    };
    LetBinding = tslib_1.__decorate([
        connectable_1.connectable()
    ], LetBinding);
    exports.LetBinding = LetBinding;
});
//# sourceMappingURL=let-binding.js.map