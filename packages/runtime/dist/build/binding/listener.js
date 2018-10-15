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
    class Listener {
        constructor(targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
            this.targetEvent = targetEvent;
            this.delegationStrategy = delegationStrategy;
            this.sourceExpression = sourceExpression;
            this.target = target;
            this.preventDefault = preventDefault;
            this.eventManager = eventManager;
            this.locator = locator;
            this.$isBound = false;
        }
        callSource(event) {
            const overrideContext = this.$scope.overrideContext;
            overrideContext['$event'] = event;
            const result = this.sourceExpression.evaluate(binding_flags_1.BindingFlags.mustEvaluate, this.$scope, this.locator);
            delete overrideContext['$event'];
            if (result !== true && this.preventDefault) {
                event.preventDefault();
            }
            return result;
        }
        handleEvent(event) {
            this.callSource(event);
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
            this.handler = this.eventManager.addEventListener(this.target, this.targetEvent, this, this.delegationStrategy);
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
            this.handler.dispose();
            this.handler = null;
        }
        // tslint:disable:no-empty no-any
        observeProperty(obj, propertyName) { }
        handleChange(newValue, previousValue, flags) { }
    }
    exports.Listener = Listener;
});
//# sourceMappingURL=listener.js.map