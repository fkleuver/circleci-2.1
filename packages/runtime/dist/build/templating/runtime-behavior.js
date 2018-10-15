(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../binding/binding-flags", "../binding/observation", "../binding/property-observation", "../binding/subscriber-collection", "./custom-element"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const binding_flags_1 = require("../binding/binding-flags");
    const observation_1 = require("../binding/observation");
    const property_observation_1 = require("../binding/property-observation");
    const subscriber_collection_1 = require("../binding/subscriber-collection");
    const custom_element_1 = require("./custom-element");
    /** @internal */
    class RuntimeBehavior {
        constructor() {
            this.hasCreated = false;
            this.hasBinding = false;
            this.hasBound = false;
            this.hasAttaching = false;
            this.hasAttached = false;
            this.hasDetaching = false;
            this.hasDetached = false;
            this.hasUnbinding = false;
            this.hasUnbound = false;
            this.hasRender = false;
            this.hasCaching = false;
        }
        static create(Component, instance) {
            const behavior = new RuntimeBehavior();
            behavior.bindables = Component.description.bindables;
            behavior.hasCreated = 'created' in instance;
            behavior.hasBinding = 'binding' in instance;
            behavior.hasBound = 'bound' in instance;
            behavior.hasAttaching = 'attaching' in instance;
            behavior.hasAttached = 'attached' in instance;
            behavior.hasDetaching = 'detaching' in instance;
            behavior.hasDetached = 'detached' in instance;
            behavior.hasUnbinding = 'unbinding' in instance;
            behavior.hasUnbound = 'unbound' in instance;
            behavior.hasRender = 'render' in instance;
            behavior.hasCaching = 'caching' in instance;
            return behavior;
        }
        applyTo(instance, changeSet) {
            if ('$projector' in instance) {
                this.applyToElement(changeSet, instance);
            }
            else {
                this.applyToCore(changeSet, instance);
            }
        }
        applyToElement(changeSet, instance) {
            const observers = this.applyToCore(changeSet, instance);
            observers.$children = new ChildrenObserver(changeSet, instance);
            Reflect.defineProperty(instance, '$children', {
                enumerable: false,
                get: function () {
                    return this.$observers.$children.getValue();
                }
            });
        }
        applyToCore(changeSet, instance) {
            const observers = {};
            const bindables = this.bindables;
            const observableNames = Object.getOwnPropertyNames(bindables);
            for (let i = 0, ii = observableNames.length; i < ii; ++i) {
                const name = observableNames[i];
                observers[name] = new property_observation_1.Observer(instance, name, bindables[name].callback);
                createGetterSetter(instance, name);
            }
            Reflect.defineProperty(instance, '$observers', {
                enumerable: false,
                value: observers
            });
            instance.$behavior = this;
            return observers;
        }
    }
    exports.RuntimeBehavior = RuntimeBehavior;
    function createGetterSetter(instance, name) {
        Reflect.defineProperty(instance, name, {
            enumerable: true,
            get: function () { return this.$observers[name].getValue(); },
            set: function (value) { this.$observers[name].setValue(value, binding_flags_1.BindingFlags.updateTargetInstance); }
        });
    }
    /*@internal*/
    let ChildrenObserver = class ChildrenObserver {
        constructor(changeSet, customElement) {
            this.changeSet = changeSet;
            this.customElement = customElement;
            this.hasChanges = false;
            this.children = null;
            this.observing = false;
        }
        getValue() {
            if (!this.observing) {
                this.observing = true;
                this.customElement.$projector.subscribeToChildrenChange(() => this.onChildrenChanged());
                this.children = findElements(this.customElement.$projector.children);
            }
            return this.children;
        }
        setValue(newValue) { }
        flushChanges() {
            this.callSubscribers(this.children, undefined, binding_flags_1.BindingFlags.updateTargetInstance | binding_flags_1.BindingFlags.fromFlushChanges);
            this.hasChanges = false;
        }
        subscribe(subscriber) {
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
        }
        onChildrenChanged() {
            this.children = findElements(this.customElement.$projector.children);
            if ('$childrenChanged' in this.customElement) {
                this.customElement.$childrenChanged();
            }
            this.changeSet.add(this);
            this.hasChanges = true;
        }
    };
    ChildrenObserver = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection(observation_1.MutationKind.instance)
    ], ChildrenObserver);
    exports.ChildrenObserver = ChildrenObserver;
    const elementBehaviorFor = custom_element_1.CustomElementResource.behaviorFor;
    /*@internal*/
    function findElements(nodes) {
        const components = [];
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            const current = nodes[i];
            const component = elementBehaviorFor(current);
            if (component !== null) {
                components.push(component);
            }
        }
        return components;
    }
    exports.findElements = findElements;
});
//# sourceMappingURL=runtime-behavior.js.map