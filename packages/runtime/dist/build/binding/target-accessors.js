(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../dom", "./target-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const dom_1 = require("../dom");
    const target_observer_1 = require("./target-observer");
    // tslint:disable-next-line:no-http-string
    const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';
    let XLinkAttributeAccessor = class XLinkAttributeAccessor {
        // xlink namespaced attributes require getAttributeNS/setAttributeNS
        // (even though the NS version doesn't work for other namespaces
        // in html5 documents)
        // Using very HTML-specific code here since this isn't likely to get
        // called unless operating against a real HTML element.
        constructor(changeSet, obj, propertyKey, attributeName) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.attributeName = attributeName;
            this.oldValue = this.currentValue = this.getValue();
        }
        getValue() {
            return this.obj.getAttributeNS(xlinkAttributeNS, this.attributeName);
        }
        setValueCore(newValue) {
            this.obj.setAttributeNS(xlinkAttributeNS, this.attributeName, newValue);
        }
    };
    XLinkAttributeAccessor = tslib_1.__decorate([
        target_observer_1.targetObserver('')
    ], XLinkAttributeAccessor);
    exports.XLinkAttributeAccessor = XLinkAttributeAccessor;
    XLinkAttributeAccessor.prototype.attributeName = '';
    let DataAttributeAccessor = class DataAttributeAccessor {
        constructor(changeSet, obj, propertyKey) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.oldValue = this.currentValue = this.getValue();
        }
        getValue() {
            return dom_1.DOM.getAttribute(this.obj, this.propertyKey);
        }
        setValueCore(newValue) {
            if (newValue === null) {
                dom_1.DOM.removeAttribute(this.obj, this.propertyKey);
            }
            else {
                dom_1.DOM.setAttribute(this.obj, this.propertyKey, newValue);
            }
        }
    };
    DataAttributeAccessor = tslib_1.__decorate([
        target_observer_1.targetObserver()
    ], DataAttributeAccessor);
    exports.DataAttributeAccessor = DataAttributeAccessor;
    let StyleAttributeAccessor = class StyleAttributeAccessor {
        constructor(changeSet, obj) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.oldValue = this.currentValue = obj.style.cssText;
        }
        getValue() {
            return this.obj.style.cssText;
        }
        // tslint:disable-next-line:function-name
        _setProperty(style, value) {
            let priority = '';
            if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
                priority = 'important';
                value = value.replace('!important', '');
            }
            this.obj.style.setProperty(style, value, priority);
        }
        setValueCore(newValue) {
            const styles = this.styles || {};
            let style;
            let version = this.version;
            if (newValue !== null) {
                if (newValue instanceof Object) {
                    let value;
                    for (style in newValue) {
                        if (newValue.hasOwnProperty(style)) {
                            value = newValue[style];
                            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                            styles[style] = version;
                            this._setProperty(style, value);
                        }
                    }
                }
                else if (newValue.length) {
                    const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                    let pair;
                    while ((pair = rx.exec(newValue)) !== null) {
                        style = pair[1];
                        if (!style) {
                            continue;
                        }
                        styles[style] = version;
                        this._setProperty(style, pair[2]);
                    }
                }
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!styles.hasOwnProperty(style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    };
    StyleAttributeAccessor = tslib_1.__decorate([
        target_observer_1.targetObserver()
    ], StyleAttributeAccessor);
    exports.StyleAttributeAccessor = StyleAttributeAccessor;
    StyleAttributeAccessor.prototype.styles = null;
    StyleAttributeAccessor.prototype.version = 0;
    StyleAttributeAccessor.prototype.propertyKey = 'style';
    let ClassAttributeAccessor = class ClassAttributeAccessor {
        constructor(changeSet, obj) {
            this.changeSet = changeSet;
            this.obj = obj;
        }
        getValue() {
            return this.currentValue;
        }
        setValueCore(newValue) {
            const addClass = dom_1.DOM.addClass;
            const removeClass = dom_1.DOM.removeClass;
            const nameIndex = this.nameIndex || {};
            let version = this.version;
            let names;
            let name;
            // Add the classes, tracking the version at which they were added.
            if (newValue.length) {
                const node = this.obj;
                names = newValue.split(/\s+/);
                for (let i = 0, length = names.length; i < length; i++) {
                    name = names[i];
                    if (!name.length) {
                        continue;
                    }
                    nameIndex[name] = version;
                    addClass(node, name);
                }
            }
            // Update state variables.
            this.nameIndex = nameIndex;
            this.version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (name in nameIndex) {
                if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
                    continue;
                }
                // TODO: this has the side-effect that classes already present which are added again,
                // will be removed if they're not present in the next update.
                // Better would be do have some configurability for this behavior, allowing the user to
                // decide whether initial classes always need to be kept, always removed, or something in between
                removeClass(this.obj, name);
            }
        }
    };
    ClassAttributeAccessor = tslib_1.__decorate([
        target_observer_1.targetObserver('')
    ], ClassAttributeAccessor);
    exports.ClassAttributeAccessor = ClassAttributeAccessor;
    ClassAttributeAccessor.prototype.doNotCache = true;
    ClassAttributeAccessor.prototype.version = 0;
    ClassAttributeAccessor.prototype.nameIndex = null;
    let ElementPropertyAccessor = class ElementPropertyAccessor {
        constructor(changeSet, obj, propertyKey) {
            this.changeSet = changeSet;
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValueCore(value) {
            this.obj[this.propertyKey] = value;
        }
    };
    ElementPropertyAccessor = tslib_1.__decorate([
        target_observer_1.targetObserver('')
    ], ElementPropertyAccessor);
    exports.ElementPropertyAccessor = ElementPropertyAccessor;
    class PropertyAccessor {
        constructor(obj, propertyKey) {
            this.obj = obj;
            this.propertyKey = propertyKey;
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(value) {
            this.obj[this.propertyKey] = value;
        }
    }
    exports.PropertyAccessor = PropertyAccessor;
});
//# sourceMappingURL=target-accessors.js.map