(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", ".", "./binding-mode", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const _1 = require(".");
    const binding_mode_1 = require("./binding-mode");
    const connectable_1 = require("./connectable");
    // tslint:disable:no-any
    const { toView, oneTime } = binding_mode_1.BindingMode;
    class MultiInterpolationBinding {
        constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
            this.observerLocator = observerLocator;
            this.interpolation = interpolation;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.locator = locator;
            this.$isBound = false;
            this.$scope = null;
            // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
            // value converters and binding behaviors.
            // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
            // in which case the renderer will create the TextBinding directly
            const expressions = interpolation.expressions;
            const parts = this.parts = Array(expressions.length);
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
            }
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
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$bind(flags, scope);
            }
        }
        $unbind(flags) {
            if (!this.$isBound) {
                return;
            }
            this.$isBound = false;
            this.$scope = null;
            const parts = this.parts;
            for (let i = 0, ii = parts.length; i < ii; ++i) {
                parts[i].$unbind(flags);
            }
        }
    }
    exports.MultiInterpolationBinding = MultiInterpolationBinding;
    let InterpolationBinding = class InterpolationBinding {
        constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
            this.sourceExpression = sourceExpression;
            this.interpolation = interpolation;
            this.target = target;
            this.targetProperty = targetProperty;
            this.mode = mode;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.isFirst = isFirst;
            this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        }
        updateTarget(value, flags) {
            this.targetObserver.setValue(value, flags | _1.BindingFlags.updateTargetInstance);
        }
        handleChange(newValue, previousValue, flags) {
            if (!this.$isBound) {
                return;
            }
            previousValue = this.targetObserver.getValue();
            newValue = this.interpolation.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((this.mode & oneTime) === 0) {
                this.version++;
                this.sourceExpression.connect(flags, this.$scope, this);
                this.unobserve(false);
            }
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
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this);
            }
            // since the interpolation already gets the whole value, we only need to let the first
            // text binding do the update if there are multiple
            if (this.isFirst) {
                this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator), flags);
            }
            if ((this.mode & toView) > 0) {
                sourceExpression.connect(flags, scope, this);
            }
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
    InterpolationBinding = tslib_1.__decorate([
        connectable_1.connectable()
    ], InterpolationBinding);
    exports.InterpolationBinding = InterpolationBinding;
});
//# sourceMappingURL=interpolation-binding.js.map