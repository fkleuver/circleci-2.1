(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../dom", "./array-observer", "./change-set", "./computed-observer", "./dirty-checker", "./element-observation", "./event-manager", "./map-observer", "./property-observation", "./set-observer", "./svg-analyzer", "./target-accessors"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const dom_1 = require("../dom");
    const array_observer_1 = require("./array-observer");
    const change_set_1 = require("./change-set");
    const computed_observer_1 = require("./computed-observer");
    const dirty_checker_1 = require("./dirty-checker");
    const element_observation_1 = require("./element-observation");
    const event_manager_1 = require("./event-manager");
    const map_observer_1 = require("./map-observer");
    const property_observation_1 = require("./property-observation");
    const set_observer_1 = require("./set-observer");
    const svg_analyzer_1 = require("./svg-analyzer");
    const target_accessors_1 = require("./target-accessors");
    const toStringTag = Object.prototype.toString;
    exports.IObserverLocator = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(ObserverLocator));
    function getPropertyDescriptor(subject, name) {
        let pd = Object.getOwnPropertyDescriptor(subject, name);
        let proto = Object.getPrototypeOf(subject);
        while (pd === undefined && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
        }
        return pd;
    }
    let ObserverLocator = 
    /*@internal*/
    class ObserverLocator {
        constructor(changeSet, eventManager, dirtyChecker, svgAnalyzer) {
            this.changeSet = changeSet;
            this.eventManager = eventManager;
            this.dirtyChecker = dirtyChecker;
            this.svgAnalyzer = svgAnalyzer;
            this.adapters = [];
        }
        getObserver(obj, propertyName) {
            if (obj.$synthetic === true) {
                return obj.getObservers().getOrCreate(obj, propertyName);
            }
            let observersLookup = obj.$observers;
            let observer;
            if (observersLookup && propertyName in observersLookup) {
                return observersLookup[propertyName];
            }
            observer = this.createPropertyObserver(obj, propertyName);
            if (!observer.doNotCache) {
                if (observersLookup === undefined) {
                    observersLookup = this.getOrCreateObserversLookup(obj);
                }
                observersLookup[propertyName] = observer;
            }
            return observer;
        }
        addAdapter(adapter) {
            this.adapters.push(adapter);
        }
        getAccessor(obj, propertyName) {
            if (dom_1.DOM.isNodeInstance(obj)) {
                const tagName = obj['tagName'];
                // this check comes first for hot path optimization
                if (propertyName === 'textContent') {
                    return new target_accessors_1.ElementPropertyAccessor(this.changeSet, obj, propertyName);
                }
                // TODO: optimize and make pluggable
                if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css'
                    || propertyName === 'value' && (tagName === 'INPUT' || tagName === 'SELECT')
                    || propertyName === 'checked' && tagName === 'INPUT'
                    || propertyName === 'model' && tagName === 'INPUT'
                    || /^xlink:.+$/.exec(propertyName)) {
                    return this.getObserver(obj, propertyName);
                }
                if (/^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
                    || tagName === 'IMG' && propertyName === 'src'
                    || tagName === 'A' && propertyName === 'href') {
                    return new target_accessors_1.DataAttributeAccessor(this.changeSet, obj, propertyName);
                }
                return new target_accessors_1.ElementPropertyAccessor(this.changeSet, obj, propertyName);
            }
            return new target_accessors_1.PropertyAccessor(obj, propertyName);
        }
        getArrayObserver(array) {
            return array_observer_1.getArrayObserver(this.changeSet, array);
        }
        getMapObserver(map) {
            return map_observer_1.getMapObserver(this.changeSet, map);
        }
        // tslint:disable-next-line:no-reserved-keywords
        getSetObserver(set) {
            return set_observer_1.getSetObserver(this.changeSet, set);
        }
        getOrCreateObserversLookup(obj) {
            return obj.$observers || this.createObserversLookup(obj);
        }
        createObserversLookup(obj) {
            const value = {};
            if (!Reflect.defineProperty(obj, '$observers', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: value
            })) {
                kernel_1.Reporter.write(0, obj);
            }
            return value;
        }
        getAdapterObserver(obj, propertyName, descriptor) {
            for (let i = 0, ii = this.adapters.length; i < ii; i++) {
                const adapter = this.adapters[i];
                const observer = adapter.getObserver(obj, propertyName, descriptor);
                if (observer) {
                    return observer;
                }
            }
            return null;
        }
        createPropertyObserver(obj, propertyName) {
            if (!(obj instanceof Object)) {
                return new property_observation_1.PrimitiveObserver(obj, propertyName);
            }
            let isNode;
            if (dom_1.DOM.isNodeInstance(obj)) {
                if (propertyName === 'class') {
                    return new target_accessors_1.ClassAttributeAccessor(this.changeSet, obj);
                }
                if (propertyName === 'style' || propertyName === 'css') {
                    return new target_accessors_1.StyleAttributeAccessor(this.changeSet, obj);
                }
                const tagName = obj['tagName'];
                const handler = this.eventManager.getElementHandler(obj, propertyName);
                if (propertyName === 'value' && tagName === 'SELECT') {
                    return new element_observation_1.SelectValueObserver(this.changeSet, obj, handler, this);
                }
                if (propertyName === 'checked' && tagName === 'INPUT') {
                    return new element_observation_1.CheckedObserver(this.changeSet, obj, handler, this);
                }
                if (handler) {
                    return new element_observation_1.ValueAttributeObserver(this.changeSet, obj, propertyName, handler);
                }
                const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
                if (xlinkResult) {
                    return new target_accessors_1.XLinkAttributeAccessor(this.changeSet, obj, propertyName, xlinkResult[1]);
                }
                if (propertyName === 'role'
                    || /^\w+:|^data-|^aria-/.test(propertyName)
                    || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
                    return new target_accessors_1.DataAttributeAccessor(this.changeSet, obj, propertyName);
                }
                isNode = true;
            }
            const tag = toStringTag.call(obj);
            switch (tag) {
                case '[object Array]':
                    if (propertyName === 'length') {
                        return this.getArrayObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Map]':
                    if (propertyName === 'size') {
                        return this.getMapObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
                case '[object Set]':
                    if (propertyName === 'size') {
                        return this.getSetObserver(obj).getLengthObserver();
                    }
                    return this.dirtyChecker.createProperty(obj, propertyName);
            }
            const descriptor = getPropertyDescriptor(obj, propertyName);
            if (descriptor) {
                if (descriptor.get || descriptor.set) {
                    if (descriptor.get && descriptor.get.getObserver) {
                        return descriptor.get.getObserver(obj);
                    }
                    // attempt to use an adapter before resorting to dirty checking.
                    const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                    if (adapterObserver) {
                        return adapterObserver;
                    }
                    if (isNode) {
                        // TODO: use MutationObserver
                        return this.dirtyChecker.createProperty(obj, propertyName);
                    }
                    return computed_observer_1.createComputedObserver(this, this.dirtyChecker, this.changeSet, obj, propertyName, descriptor);
                }
            }
            return new property_observation_1.SetterObserver(obj, propertyName);
        }
    };
    ObserverLocator = tslib_1.__decorate([
        kernel_1.inject(change_set_1.IChangeSet, event_manager_1.IEventManager, dirty_checker_1.IDirtyChecker, svg_analyzer_1.ISVGAnalyzer)
        /*@internal*/
    ], ObserverLocator);
    exports.ObserverLocator = ObserverLocator;
    function getCollectionObserver(changeSet, collection) {
        switch (toStringTag.call(collection)) {
            case '[object Array]':
                return array_observer_1.getArrayObserver(changeSet, collection);
            case '[object Map]':
                return map_observer_1.getMapObserver(changeSet, collection);
            case '[object Set]':
                return set_observer_1.getSetObserver(changeSet, collection);
        }
        return null;
    }
    exports.getCollectionObserver = getCollectionObserver;
});
//# sourceMappingURL=observer-locator.js.map