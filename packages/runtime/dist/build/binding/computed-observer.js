(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "./binding-flags", "./observation", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("./binding-flags");
    const observation_1 = require("./observation");
    const subscriber_collection_1 = require("./subscriber-collection");
    function computed(config) {
        return function (target, key) {
            const computed = target.computed || (target.computed = {});
            computed[key] = config;
        };
    }
    exports.computed = computed;
    const noProxy = !(typeof Proxy !== undefined);
    const computedOverrideDefaults = { static: false, volatile: false };
    /* @internal */
    function createComputedObserver(observerLocator, dirtyChecker, changeSet, 
    // tslint:disable-next-line:no-reserved-keywords
    instance, propertyName, descriptor) {
        if (descriptor.configurable === false) {
            return dirtyChecker.createProperty(instance, propertyName);
        }
        if (descriptor.get) {
            const overrides = instance.constructor.computed
                ? instance.constructor.computed[propertyName] || computedOverrideDefaults
                : computedOverrideDefaults;
            if (descriptor.set) {
                if (overrides.volatile) {
                    return noProxy
                        ? dirtyChecker.createProperty(instance, propertyName)
                        : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
                }
                return new CustomSetterObserver(instance, propertyName, descriptor, changeSet);
            }
            return noProxy
                ? dirtyChecker.createProperty(instance, propertyName)
                : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
        }
        throw kernel_1.Reporter.error(18, propertyName);
    }
    exports.createComputedObserver = createComputedObserver;
    // Used when the getter is dependent solely on changes that happen within the setter.
    let CustomSetterObserver = class CustomSetterObserver {
        constructor(obj, propertyKey, descriptor, changeSet) {
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.changeSet = changeSet;
            this.observing = false;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(newValue) {
            this.obj[this.propertyKey] = newValue;
        }
        flushChanges() {
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            this.callSubscribers(newValue, oldValue, binding_flags_1.BindingFlags.updateTargetInstance | binding_flags_1.BindingFlags.fromFlushChanges);
        }
        subscribe(subscriber) {
            if (!this.observing) {
                this.convertProperty();
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        convertProperty() {
            const setter = this.descriptor.set;
            const that = this;
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            Reflect.defineProperty(this.obj, this.propertyKey, {
                set: function (newValue) {
                    setter.call(that.obj, newValue);
                    const oldValue = this.currentValue;
                    if (oldValue !== newValue) {
                        that.oldValue = oldValue;
                        that.changeSet.add(that);
                        that.currentValue = newValue;
                    }
                }
            });
        }
    };
    CustomSetterObserver = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection(observation_1.MutationKind.instance)
    ], CustomSetterObserver);
    exports.CustomSetterObserver = CustomSetterObserver;
    CustomSetterObserver.prototype.dispose = kernel_1.PLATFORM.noop;
    // Used when there is no setter, and the getter is dependent on other properties of the object;
    // Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
    /*@internal*/
    let GetterObserver = class GetterObserver {
        constructor(overrides, obj, propertyKey, descriptor, observerLocator, changeSet) {
            this.overrides = overrides;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.descriptor = descriptor;
            this.observerLocator = observerLocator;
            this.changeSet = changeSet;
            this.controller = new GetterController(overrides, obj, propertyKey, descriptor, this, observerLocator, changeSet);
        }
        getValue() {
            return this.controller.value;
        }
        // tslint:disable-next-line:no-empty
        setValue(newValue) { }
        flushChanges() {
            const oldValue = this.controller.value;
            const newValue = this.controller.getValueAndCollectDependencies();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, binding_flags_1.BindingFlags.updateTargetInstance);
            }
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
            this.controller.onSubscriberAdded();
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            this.controller.onSubscriberRemoved();
        }
    };
    GetterObserver = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection(observation_1.MutationKind.instance)
    ], GetterObserver);
    exports.GetterObserver = GetterObserver;
    GetterObserver.prototype.dispose = kernel_1.PLATFORM.noop;
    /*@internal*/
    class GetterController {
        constructor(overrides, instance, propertyName, descriptor, owner, observerLocator, changeSet) {
            this.overrides = overrides;
            this.instance = instance;
            this.propertyName = propertyName;
            this.owner = owner;
            this.changeSet = changeSet;
            this.isCollecting = false;
            this.dependencies = [];
            this.subscriberCount = 0;
            const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
            const getter = descriptor.get;
            const ctrl = this;
            Reflect.defineProperty(instance, propertyName, {
                get: function () {
                    if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
                        ctrl.value = getter.apply(proxy);
                    }
                    return ctrl.value;
                }
            });
        }
        addDependency(subscribable) {
            if (this.dependencies.includes(subscribable)) {
                return;
            }
            this.dependencies.push(subscribable);
        }
        onSubscriberAdded() {
            this.subscriberCount++;
            if (this.subscriberCount > 1) {
                return;
            }
            this.getValueAndCollectDependencies(true);
        }
        getValueAndCollectDependencies(requireCollect = false) {
            const dynamicDependencies = !this.overrides.static || requireCollect;
            if (dynamicDependencies) {
                this.unsubscribeAllDependencies();
                this.isCollecting = true;
            }
            this.value = this.instance[this.propertyName]; // triggers observer collection
            if (dynamicDependencies) {
                this.isCollecting = false;
                this.dependencies.forEach(x => x.subscribe(this));
            }
            return this.value;
        }
        onSubscriberRemoved() {
            this.subscriberCount--;
            if (this.subscriberCount === 0) {
                this.unsubscribeAllDependencies();
            }
        }
        handleChange() {
            this.changeSet.add(this.owner);
        }
        unsubscribeAllDependencies() {
            this.dependencies.forEach(x => x.unsubscribe(this));
            this.dependencies.length = 0;
        }
    }
    exports.GetterController = GetterController;
    function createGetterTraps(observerLocator, controller) {
        return {
            get: function (instance, key) {
                const value = instance[key];
                if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
                    return value;
                }
                // TODO: fix this
                if (instance instanceof Array) {
                    controller.addDependency(observerLocator.getArrayObserver(instance));
                    if (key === 'length') {
                        controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Map) {
                    controller.addDependency(observerLocator.getMapObserver(instance));
                    if (key === 'size') {
                        controller.addDependency(observerLocator.getMapObserver(instance).getLengthObserver());
                    }
                }
                else if (instance instanceof Set) {
                    controller.addDependency(observerLocator.getSetObserver(instance));
                    if (key === 'size') {
                        return observerLocator.getSetObserver(instance).getLengthObserver();
                    }
                }
                else {
                    controller.addDependency(observerLocator.getObserver(instance, key));
                }
                return proxyOrValue(observerLocator, controller, value);
            }
        };
    }
    function proxyOrValue(observerLocator, controller, value) {
        if (!(value instanceof Object)) {
            return value;
        }
        return new Proxy(value, createGetterTraps(observerLocator, controller));
    }
});
//# sourceMappingURL=computed-observer.js.map