(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "./ast", "./binding-flags", "./binding-mode", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const ast_1 = require("./ast");
    const binding_flags_1 = require("./binding-flags");
    const binding_mode_1 = require("./binding-mode");
    const connectable_1 = require("./connectable");
    // BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
    const { oneTime, toView, fromView } = binding_mode_1.BindingMode;
    // pre-combining flags for bitwise checks is a minor perf tweak
    const toViewOrOneTime = toView | oneTime;
    let Binding = class Binding {
        constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.$isBound = false;
            this.$scope = null;
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | binding_flags_1.BindingFlags.updateTargetInstance);
        }
        updateSource(value, flags) {
            this.sourceExpression.assign(flags | binding_flags_1.BindingFlags.updateSourceExpression, this.$scope, this.locator, value);
        }
        handleChange(newValue, previousValue, flags) {
            if (!this.$isBound) {
                return;
            }
            const sourceExpression = this.sourceExpression;
            const $scope = this.$scope;
            const locator = this.locator;
            if (flags & binding_flags_1.BindingFlags.updateTargetInstance) {
                const targetObserver = this.targetObserver;
                const mode = this.mode;
                previousValue = targetObserver.getValue();
                // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
                if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                    newValue = sourceExpression.evaluate(flags, $scope, locator);
                }
                if (newValue !== previousValue) {
                    this.updateTarget(newValue, flags);
                }
                if ((mode & oneTime) === 0) {
                    this.version++;
                    sourceExpression.connect(flags, $scope, this);
                    this.unobserve(false);
                }
                return;
            }
            if (flags & binding_flags_1.BindingFlags.updateSourceExpression) {
                if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
                    this.updateSource(newValue, flags);
                }
                return;
            }
            throw kernel_1.Reporter.error(15, binding_flags_1.BindingFlags[flags]);
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
            let sourceExpression = this.sourceExpression;
            if (ast_1.hasBind(sourceExpression)) {
                sourceExpression.bind(flags, scope, this);
            }
            const mode = this.mode;
            let targetObserver = this.targetObserver;
            if (!targetObserver) {
                if (mode & fromView) {
                    targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
                }
                else {
                    targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
                }
            }
            if (targetObserver.bind) {
                targetObserver.bind(flags);
            }
            // during bind, binding behavior might have changed sourceExpression
            sourceExpression = this.sourceExpression;
            if (mode & toViewOrOneTime) {
                targetObserver.setValue(sourceExpression.evaluate(flags, scope, this.locator), flags);
            }
            if (mode & toView) {
                sourceExpression.connect(flags, scope, this);
            }
            if (mode & fromView) {
                targetObserver.subscribe(this);
            }
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
            const targetObserver = this.targetObserver;
            if (targetObserver.unbind) {
                targetObserver.unbind(flags);
            }
            if (targetObserver.unsubscribe) {
                targetObserver.unsubscribe(this);
            }
            this.unobserve(true);
        }
    };
    Binding = tslib_1.__decorate([
        connectable_1.connectable()
    ], Binding);
    exports.Binding = Binding;
});
//# sourceMappingURL=binding.js.map