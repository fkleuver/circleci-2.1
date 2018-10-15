(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../dom", "./binding-flags", "./target-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const dom_1 = require("../dom");
    const binding_flags_1 = require("./binding-flags");
    const target_observer_1 = require("./target-observer");
    const inputValueDefaults = {
        ['button']: '',
        ['checkbox']: 'on',
        ['color']: '#000000',
        ['date']: '',
        ['datetime-local']: '',
        ['email']: '',
        ['file']: '',
        ['hidden']: '',
        ['image']: '',
        ['month']: '',
        ['number']: '',
        ['password']: '',
        ['radio']: 'on',
        ['range']: '50',
        ['reset']: '',
        ['search']: '',
        ['submit']: '',
        ['tel']: '',
        ['text']: '',
        ['time']: '',
        ['url']: '',
        ['week']: ''
    };
    const handleEventFlags = binding_flags_1.BindingFlags.fromDOMEvent | binding_flags_1.BindingFlags.updateSourceExpression;
    let ValueAttributeObserver = class ValueAttributeObserver {
        constructor(changeSet, obj, propertyKey, handler) {
            // note: input.files can be assigned and this was fixed in Firefox 57:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.handler = handler;
            // input.value (for type='file') however, can only be assigned an empty string
            if (propertyKey === 'value') {
                const nodeType = obj['type'];
                this.defaultValue = inputValueDefaults[nodeType || 'text'];
                if (nodeType === 'file') {
                    this.flushChanges = this.flushFileChanges;
                }
            }
            else {
                this.defaultValue = '';
            }
            this.oldValue = this.currentValue = obj[propertyKey];
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(newValue, flags) {
            this.obj[this.propertyKey] = newValue;
            if (flags & binding_flags_1.BindingFlags.fromBind) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const newValue = this.currentValue = this.getValue();
            if (oldValue !== newValue) {
                this.callSubscribers(newValue, oldValue, handleEventFlags);
                this.oldValue = newValue;
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.oldValue = this.getValue();
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        flushFileChanges() {
            const currentValue = this.currentValue;
            if (this.oldValue !== currentValue) {
                if (currentValue === '') {
                    this.setValueCore(currentValue, this.currentFlags);
                    this.oldValue = this.currentValue;
                }
            }
        }
    };
    ValueAttributeObserver = tslib_1.__decorate([
        target_observer_1.targetObserver('')
    ], ValueAttributeObserver);
    exports.ValueAttributeObserver = ValueAttributeObserver;
    ValueAttributeObserver.prototype.propertyKey = '';
    ValueAttributeObserver.prototype.handler = null;
    const defaultHandleBatchedChangeFlags = binding_flags_1.BindingFlags.fromFlushChanges | binding_flags_1.BindingFlags.updateTargetInstance;
    let CheckedObserver = class CheckedObserver {
        constructor(changeSet, obj, handler, observerLocator) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            if (!this.valueObserver) {
                this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
                if (this.valueObserver) {
                    this.valueObserver.subscribe(this);
                }
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeElement();
        }
        // handleBatchedCollectionChange (todo: rename to make this explicit?)
        handleBatchedChange() {
            this.synchronizeElement();
            this.notify(defaultHandleBatchedChangeFlags);
        }
        // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
        handleChange(newValue, previousValue, flags) {
            this.synchronizeElement();
            this.notify(flags);
        }
        synchronizeElement() {
            const value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            const isRadio = element.type === 'radio';
            const matcher = element['matcher'] || ((a, b) => a === b);
            if (isRadio) {
                element.checked = !!matcher(value, elementValue);
            }
            else if (value === true) {
                element.checked = true;
            }
            else if (Array.isArray(value)) {
                element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else {
                element.checked = false;
            }
        }
        notify(flags) {
            if (flags & binding_flags_1.BindingFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(this.currentValue, this.oldValue, flags);
        }
        handleEvent() {
            let value = this.currentValue;
            const element = this.obj;
            const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
            let index;
            const matcher = element['matcher'] || defaultMatcher;
            if (element.type === 'checkbox') {
                if (Array.isArray(value)) {
                    index = value.findIndex(item => !!matcher(item, elementValue));
                    if (element.checked && index === -1) {
                        value.push(elementValue);
                    }
                    else if (!element.checked && index !== -1) {
                        value.splice(index, 1);
                    }
                    // when existing value is array, do not invoke callback as only the array element has changed
                    return;
                }
                value = element.checked;
            }
            else if (element.checked) {
                value = elementValue;
            }
            else {
                return;
            }
            this.oldValue = this.currentValue;
            this.currentValue = value;
            this.notify(handleEventFlags);
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        unbind() {
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (this.valueObserver) {
                this.valueObserver.unsubscribe(this);
            }
        }
    };
    CheckedObserver = tslib_1.__decorate([
        target_observer_1.targetObserver()
    ], CheckedObserver);
    exports.CheckedObserver = CheckedObserver;
    CheckedObserver.prototype.handler = null;
    CheckedObserver.prototype.observerLocator = null;
    const childObserverOptions = {
        childList: true,
        subtree: true,
        characterData: true
    };
    function defaultMatcher(a, b) {
        return a === b;
    }
    let SelectValueObserver = class SelectValueObserver {
        constructor(changeSet, obj, handler, observerLocator) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.handler = handler;
            this.observerLocator = observerLocator;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue, flags) {
            const isArray = Array.isArray(newValue);
            if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
            if (isArray) {
                this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
                this.arrayObserver.subscribeBatched(this);
            }
            this.synchronizeOptions();
            this.notify(flags);
        }
        // called when the array mutated (items sorted/added/removed, etc)
        handleBatchedChange(indexMap) {
            // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
            // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
            this.synchronizeOptions(indexMap);
        }
        // called when a different value was assigned
        handleChange(newValue, previousValue, flags) {
            this.setValue(newValue, flags);
        }
        notify(flags) {
            if (flags & binding_flags_1.BindingFlags.fromBind) {
                return;
            }
            const oldValue = this.oldValue;
            const newValue = this.currentValue;
            if (newValue === oldValue) {
                return;
            }
            this.callSubscribers(newValue, oldValue, flags);
        }
        handleEvent() {
            // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(handleEventFlags);
            }
        }
        synchronizeOptions(indexMap) {
            const currentValue = this.currentValue;
            const isArray = Array.isArray(currentValue);
            const obj = this.obj;
            const matcher = obj.matcher || defaultMatcher;
            const options = obj.options;
            let i = options.length;
            while (i--) {
                const option = options.item(i);
                const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
                if (isArray) {
                    option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                    continue;
                }
                option.selected = !!matcher(optionValue, currentValue);
            }
        }
        synchronizeValue() {
            // Spec for synchronizing value from `SelectObserver` to `<select/>`
            // When synchronizing value to observed <select/> element, do the following steps:
            // A. If `<select/>` is multiple
            //    1. Check if current value, called `currentValue` is an array
            //      a. If not an array, return true to signal value has changed
            //      b. If is an array:
            //        i. gather all current selected <option/>, in to array called `values`
            //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
            //        iii. loop through the `values` array and add items that are selected based on matcher
            //        iv. Return false to signal value hasn't changed
            // B. If the select is single
            //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
            //    2. assign `this.currentValue` to `this.oldValue`
            //    3. assign `value` to `this.currentValue`
            //    4. return `true` to signal value has changed
            const obj = this.obj;
            const options = obj.options;
            const len = options.length;
            const currentValue = this.currentValue;
            let i = 0;
            if (obj.multiple) {
                // A.
                if (!Array.isArray(currentValue)) {
                    // A.1.a
                    return true;
                }
                // A.1.b
                // multi select
                let option;
                const matcher = obj.matcher || defaultMatcher;
                // A.1.b.i
                const values = [];
                while (i < len) {
                    option = options.item(i);
                    if (option.selected) {
                        values.push(option.hasOwnProperty('model')
                            ? option.model
                            : option.value);
                    }
                    ++i;
                }
                // A.1.b.ii
                i = 0;
                while (i < currentValue.length) {
                    const a = currentValue[i];
                    // Todo: remove arrow fn
                    if (values.findIndex(b => !!matcher(a, b)) === -1) {
                        currentValue.splice(i, 1);
                    }
                    else {
                        ++i;
                    }
                }
                // A.1.b.iii
                i = 0;
                while (i < values.length) {
                    const a = values[i];
                    // Todo: remove arrow fn
                    if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                        currentValue.push(a);
                    }
                    ++i;
                }
                // A.1.b.iv
                return false;
            }
            // B. single select
            // B.1
            let value = null;
            while (i < len) {
                const option = options.item(i);
                if (option.selected) {
                    value = option.hasOwnProperty('model')
                        ? option.model
                        : option.value;
                    break;
                }
                ++i;
            }
            // B.2
            this.oldValue = this.currentValue;
            // B.3
            this.currentValue = value;
            // B.4
            return true;
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
        bind() {
            this.nodeObserver = dom_1.DOM.createNodeObserver(this.obj, this.handleNodeChange.bind(this), childObserverOptions);
        }
        unbind() {
            this.nodeObserver.disconnect();
            this.nodeObserver = null;
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeBatched(this);
                this.arrayObserver = null;
            }
        }
        handleNodeChange() {
            this.synchronizeOptions();
            const shouldNotify = this.synchronizeValue();
            if (shouldNotify) {
                this.notify(handleEventFlags);
            }
        }
    };
    SelectValueObserver = tslib_1.__decorate([
        target_observer_1.targetObserver()
    ], SelectValueObserver);
    exports.SelectValueObserver = SelectValueObserver;
    SelectValueObserver.prototype.handler = null;
    SelectValueObserver.prototype.observerLocator = null;
});
//# sourceMappingURL=element-observation.js.map