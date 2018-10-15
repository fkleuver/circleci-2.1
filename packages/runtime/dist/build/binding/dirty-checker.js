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
    exports.IDirtyChecker = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(DirtyChecker));
    /*@internal*/
    class DirtyChecker {
        constructor() {
            this.tracked = [];
            this.checkDelay = 120;
        }
        createProperty(obj, propertyName) {
            return new DirtyCheckProperty(this, obj, propertyName);
        }
        addProperty(property) {
            const tracked = this.tracked;
            tracked.push(property);
            if (tracked.length === 1) {
                this.scheduleDirtyCheck();
            }
        }
        removeProperty(property) {
            const tracked = this.tracked;
            tracked.splice(tracked.indexOf(property), 1);
        }
        scheduleDirtyCheck() {
            setTimeout(() => this.check(), this.checkDelay);
        }
        check() {
            const tracked = this.tracked;
            let i = tracked.length;
            while (i--) {
                const current = tracked[i];
                if (current.isDirty()) {
                    current.flushChanges();
                }
            }
            if (tracked.length) {
                this.scheduleDirtyCheck();
            }
        }
    }
    exports.DirtyChecker = DirtyChecker;
    /*@internal*/
    let DirtyCheckProperty = class DirtyCheckProperty {
        constructor(dirtyChecker, obj, propertyKey) {
            this.dirtyChecker = dirtyChecker;
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        isDirty() {
            return this.oldValue !== this.obj[this.propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flushChanges() {
            const oldValue = this.oldValue;
            const newValue = this.getValue();
            this.callSubscribers(newValue, oldValue, binding_flags_1.BindingFlags.updateTargetInstance | binding_flags_1.BindingFlags.fromFlushChanges);
            this.oldValue = newValue;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.dirtyChecker.addProperty(this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.dirtyChecker.removeProperty(this);
            }
        }
    };
    DirtyCheckProperty = tslib_1.__decorate([
        property_observer_1.propertyObserver()
    ], DirtyCheckProperty);
    exports.DirtyCheckProperty = DirtyCheckProperty;
});
//# sourceMappingURL=dirty-checker.js.map