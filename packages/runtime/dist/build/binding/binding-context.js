(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./property-observation"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const property_observation_1 = require("./property-observation");
    /*@internal*/
    class InternalObserversLookup {
        getOrCreate(obj, key) {
            let observer = this[key];
            if (observer === undefined) {
                observer = this[key] = new property_observation_1.SetterObserver(obj, key);
            }
            return observer;
        }
    }
    exports.InternalObserversLookup = InternalObserversLookup;
    class BindingContext {
        constructor(keyOrObj, value) {
            this.$synthetic = true;
            if (keyOrObj !== undefined) {
                if (value !== undefined) {
                    // if value is defined then it's just a property and a value to initialize with
                    // tslint:disable-next-line:no-any
                    this[keyOrObj] = value;
                }
                else {
                    // can either be some random object or another bindingContext to clone from
                    for (const prop in keyOrObj) {
                        if (keyOrObj.hasOwnProperty(prop)) {
                            this[prop] = keyOrObj[prop];
                        }
                    }
                }
            }
        }
        static create(keyOrObj, value) {
            return new BindingContext(keyOrObj, value);
        }
        // tslint:disable-next-line:no-reserved-keywords
        static get(scope, name, ancestor) {
            if (scope === undefined) {
                throw kernel_1.Reporter.error(250 /* UndefinedScope */);
            }
            if (scope === null) {
                throw kernel_1.Reporter.error(251 /* NullScope */);
            }
            let overrideContext = scope.overrideContext;
            if (ancestor > 0) {
                // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
                while (ancestor > 0) {
                    if (overrideContext.parentOverrideContext === null) {
                        return undefined;
                    }
                    ancestor--;
                    overrideContext = overrideContext.parentOverrideContext;
                }
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // traverse the context and it's ancestors, searching for a context that has the name.
            while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
                overrideContext = overrideContext.parentOverrideContext;
            }
            if (overrideContext) {
                // we located a context with the property.  return it.
                return name in overrideContext ? overrideContext : overrideContext.bindingContext;
            }
            // the name wasn't found.  return the root binding context.
            return scope.bindingContext || scope.overrideContext;
        }
        getObservers() {
            let observers = this.$observers;
            if (observers === undefined) {
                this.$observers = observers = new InternalObserversLookup();
            }
            return observers;
        }
    }
    exports.BindingContext = BindingContext;
    class Scope {
        constructor(bindingContext, overrideContext) {
            this.bindingContext = bindingContext;
            this.overrideContext = overrideContext;
        }
        static create(bc, oc) {
            return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
        }
        static fromOverride(oc) {
            if (oc === null || oc === undefined) {
                throw kernel_1.Reporter.error(252 /* NilOverrideContext */);
            }
            return new Scope(oc.bindingContext, oc);
        }
        static fromParent(ps, bc) {
            if (ps === null || ps === undefined) {
                throw kernel_1.Reporter.error(253 /* NilParentScope */);
            }
            return new Scope(bc, OverrideContext.create(bc, ps.overrideContext));
        }
    }
    exports.Scope = Scope;
    class OverrideContext {
        constructor(bindingContext, parentOverrideContext) {
            this.bindingContext = bindingContext;
            this.parentOverrideContext = parentOverrideContext;
            this.$synthetic = true;
        }
        static create(bc, poc) {
            return new OverrideContext(bc, poc === undefined ? null : poc);
        }
        getObservers() {
            let observers = this.$observers;
            if (observers === undefined) {
                this.$observers = observers = new InternalObserversLookup();
            }
            return observers;
        }
    }
    exports.OverrideContext = OverrideContext;
});
//# sourceMappingURL=binding-context.js.map