(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "./binding-flags", "./property-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("./binding-flags");
    const property_observer_1 = require("./property-observer");
    const noop = kernel_1.PLATFORM.noop;
    // note: string.length is the only property of any primitive that is not a function,
    // so we can hardwire it to that and simply return undefined for anything else
    // note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
    class PrimitiveObserver {
        constructor(obj, propertyKey) {
            this.doNotCache = true;
            // we don't need to store propertyName because only 'length' can return a useful value
            if (propertyKey === 'length') {
                // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
                this.obj = obj;
                this.getValue = this.getStringLength;
            }
            else {
                this.getValue = this.returnUndefined;
            }
        }
        getStringLength() {
            return this.obj.length;
        }
        returnUndefined() {
            return undefined;
        }
    }
    exports.PrimitiveObserver = PrimitiveObserver;
    PrimitiveObserver.prototype.setValue = noop;
    PrimitiveObserver.prototype.subscribe = noop;
    PrimitiveObserver.prototype.unsubscribe = noop;
    PrimitiveObserver.prototype.dispose = noop;
    let SetterObserver = class SetterObserver {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & binding_flags_1.BindingFlags.fromBind)) {
                    this.callSubscribers(newValue, currentValue, flags);
                }
                // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
                // so calling obj[propertyKey] will actually return this.currentValue.
                // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
                // is unmodified and we need to explicitly set the property value.
                // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
                // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
                if (!this.observing) {
                    this.obj[this.propertyKey] = newValue;
                }
            }
        }
    };
    SetterObserver = tslib_1.__decorate([
        property_observer_1.propertyObserver()
    ], SetterObserver);
    exports.SetterObserver = SetterObserver;
    let Observer = class Observer {
        constructor(instance, propertyName, callbackName) {
            this.obj = instance;
            this.propertyKey = propertyName;
            this.currentValue = instance[propertyName];
            this.callback = callbackName in instance
                ? instance[callbackName].bind(instance)
                : noop;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            const currentValue = this.currentValue;
            if (currentValue !== newValue) {
                this.currentValue = newValue;
                if (!(flags & binding_flags_1.BindingFlags.fromBind)) {
                    const coercedValue = this.callback(newValue, currentValue);
                    if (coercedValue !== undefined) {
                        this.currentValue = newValue = coercedValue;
                    }
                    this.callSubscribers(newValue, currentValue, flags);
                }
            }
        }
    };
    Observer = tslib_1.__decorate([
        property_observer_1.propertyObserver()
    ], Observer);
    exports.Observer = Observer;
});
//# sourceMappingURL=property-observation.js.map