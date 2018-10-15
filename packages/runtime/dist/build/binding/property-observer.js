(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./binding-flags", "./observation", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("./binding-flags");
    const observation_1 = require("./observation");
    const subscriber_collection_1 = require("./subscriber-collection");
    const defineProperty = Reflect.defineProperty;
    // note: we're reusing the same object for setting all descriptors, just changing some properties as needed
    //   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
    // see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
    const observedPropertyDescriptor = {
        get: undefined,
        set: undefined,
        enumerable: true,
        configurable: true
    };
    function subscribe(subscriber) {
        if (this.observing === false) {
            this.observing = true;
            const { obj, propertyKey } = this;
            this.currentValue = obj[propertyKey];
            observedPropertyDescriptor.get = () => this.getValue();
            observedPropertyDescriptor.set = value => this.setValue(value, binding_flags_1.BindingFlags.updateTargetInstance);
            if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
                kernel_1.Reporter.write(1, propertyKey, obj);
            }
        }
        this.addSubscriber(subscriber);
    }
    function dispose() {
        delete this.obj[this.propertyKey];
        this.obj = null;
        this.propertyKey = null;
        this.currentValue = null;
    }
    function propertyObserver() {
        return function (target) {
            subscriber_collection_1.subscriberCollection(observation_1.MutationKind.instance)(target);
            const proto = target.prototype;
            proto.observing = false;
            proto.obj = null;
            proto.propertyKey = null;
            // Note: this will generate some "false positive" changes when setting a target undefined from a source undefined,
            // but those aren't harmful because the changes won't be propagated through to subscribers during $bind anyway.
            // It will, however, solve some "false negative" changes when the source value is undefined but the target value is not;
            // in such cases, this.currentValue in the observer being undefined will block the change from propagating to the target.
            // This is likely not working correctly in vCurrent either.
            proto.currentValue = Symbol();
            proto.subscribe = proto.subscribe || subscribe;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.dispose = proto.dispose || dispose;
        };
    }
    exports.propertyObserver = propertyObserver;
});
//# sourceMappingURL=property-observer.js.map