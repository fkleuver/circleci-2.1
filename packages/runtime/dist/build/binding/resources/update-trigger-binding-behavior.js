(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../binding-behavior", "../binding-mode", "../event-manager", "../observer-locator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_behavior_1 = require("../binding-behavior");
    const binding_mode_1 = require("../binding-mode");
    const event_manager_1 = require("../event-manager");
    const observer_locator_1 = require("../observer-locator");
    let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
        constructor(observerLocator) {
            this.observerLocator = observerLocator;
        }
        bind(flags, scope, binding, ...events) {
            if (events.length === 0) {
                throw kernel_1.Reporter.error(9);
            }
            if (binding.mode !== binding_mode_1.BindingMode.twoWay && binding.mode !== binding_mode_1.BindingMode.fromView) {
                throw kernel_1.Reporter.error(10);
            }
            // ensure the binding's target observer has been set.
            const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
            if (!targetObserver.handler) {
                throw kernel_1.Reporter.error(10);
            }
            binding.targetObserver = targetObserver;
            // stash the original element subscribe function.
            targetObserver.originalHandler = binding.targetObserver.handler;
            // replace the element subscribe function with one that uses the correct events.
            targetObserver.handler = new event_manager_1.EventSubscriber(events);
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            binding.targetObserver.handler.dispose();
            binding.targetObserver.handler = binding.targetObserver.originalHandler;
            binding.targetObserver.originalHandler = null;
        }
    };
    UpdateTriggerBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('updateTrigger'),
        kernel_1.inject(observer_locator_1.IObserverLocator)
    ], UpdateTriggerBindingBehavior);
    exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;
});
//# sourceMappingURL=update-trigger-binding-behavior.js.map