(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./binding-flags", "./observation", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const binding_flags_1 = require("./binding-flags");
    const observation_1 = require("./observation");
    const subscriber_collection_1 = require("./subscriber-collection");
    function setValue(newValue, flags) {
        const currentValue = this.currentValue;
        newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if (flags & binding_flags_1.BindingFlags.fromFlushChanges) {
                this.setValueCore(newValue, flags);
            }
            else {
                this.currentFlags = flags;
                return this.changeSet.add(this);
            }
        }
        return Promise.resolve();
    }
    const defaultFlushChangesFlags = binding_flags_1.BindingFlags.fromFlushChanges | binding_flags_1.BindingFlags.updateTargetInstance;
    function flushChanges() {
        const currentValue = this.currentValue;
        // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
        // in which case the target doesn't need to be updated
        if (this.oldValue !== currentValue) {
            this.setValueCore(currentValue, this.currentFlags | defaultFlushChangesFlags);
            this.oldValue = this.currentValue;
        }
    }
    function dispose() {
        this.currentValue = null;
        this.oldValue = null;
        this.defaultValue = null;
        this.obj = null;
        this.propertyKey = '';
        this.changeSet = null;
    }
    function targetObserver(defaultValue = null) {
        return function (target) {
            subscriber_collection_1.subscriberCollection(observation_1.MutationKind.instance)(target);
            const proto = target.prototype;
            proto.currentValue = defaultValue;
            proto.oldValue = defaultValue;
            proto.defaultValue = defaultValue;
            proto.obj = null;
            proto.propertyKey = '';
            proto.setValue = proto.setValue || setValue;
            proto.flushChanges = proto.flushChanges || flushChanges;
            proto.dispose = proto.dispose || dispose;
            proto.changeSet = null;
        };
    }
    exports.targetObserver = targetObserver;
});
//# sourceMappingURL=target-observer.js.map