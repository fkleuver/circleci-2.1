(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../binding/binding-flags", "../binding/binding-mode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("../binding/binding-flags");
    const binding_mode_1 = require("../binding/binding-mode");
    /**
     * Decorator: Indicates that the decorated class is a custom attribute.
     */
    function customAttribute(nameOrSource) {
        return function (target) {
            return exports.CustomAttributeResource.define(nameOrSource, target);
        };
    }
    exports.customAttribute = customAttribute;
    /**
     * Decorator: Applied to custom attributes. Indicates that whatever element the
     * attribute is placed on should be converted into a template and that this
     * attribute controls the instantiation of the template.
     */
    function templateController(nameOrSource) {
        return function (target) {
            let source;
            if (typeof nameOrSource === 'string') {
                source = {
                    name: nameOrSource,
                    isTemplateController: true
                };
            }
            else {
                source = Object.assign({ isTemplateController: true }, nameOrSource);
            }
            return exports.CustomAttributeResource.define(source, target);
        };
    }
    exports.templateController = templateController;
    exports.CustomAttributeResource = {
        name: 'custom-attribute',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const Type = ctor;
            const proto = Type.prototype;
            const description = createCustomAttributeDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            Type.kind = exports.CustomAttributeResource;
            Type.description = description;
            Type.register = register;
            proto.$hydrate = hydrate;
            proto.$bind = bind;
            proto.$attach = attach;
            proto.$detach = detach;
            proto.$unbind = unbind;
            proto.$cache = cache;
            return Type;
        }
    };
    function register(container) {
        const description = this.description;
        const resourceKey = exports.CustomAttributeResource.keyFrom(description.name);
        const aliases = description.aliases;
        container.register(kernel_1.Registration.transient(resourceKey, this));
        for (let i = 0, ii = aliases.length; i < ii; ++i) {
            container.register(kernel_1.Registration.alias(resourceKey, aliases[i]));
        }
    }
    function hydrate(renderingEngine) {
        this.$isAttached = false;
        this.$isBound = false;
        this.$scope = null;
        renderingEngine.applyRuntimeBehavior(this.constructor, this);
        if (this.$behavior.hasCreated) {
            this.created();
        }
    }
    function bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags | binding_flags_1.BindingFlags.fromBind);
        }
        const behavior = this.$behavior;
        this.$scope = scope;
        if (behavior.hasBinding) {
            this.binding(flags | binding_flags_1.BindingFlags.fromBind);
        }
        this.$isBound = true;
        if (behavior.hasBound) {
            this.bound(flags | binding_flags_1.BindingFlags.fromBind, scope);
        }
    }
    function unbind(flags) {
        if (this.$isBound) {
            const behavior = this.$behavior;
            if (behavior.hasUnbinding) {
                this.unbinding(flags | binding_flags_1.BindingFlags.fromUnbind);
            }
            this.$isBound = false;
            if (this.$behavior.hasUnbound) {
                this.unbound(flags | binding_flags_1.BindingFlags.fromUnbind);
            }
        }
    }
    function attach(encapsulationSource, lifecycle) {
        if (this.$isAttached) {
            return;
        }
        if (this.$behavior.hasAttaching) {
            this.attaching(encapsulationSource, lifecycle);
        }
        this.$isAttached = true;
        if (this.$behavior.hasAttached) {
            lifecycle.queueAttachedCallback(this);
        }
    }
    function detach(lifecycle) {
        if (this.$isAttached) {
            if (this.$behavior.hasDetaching) {
                this.detaching(lifecycle);
            }
            this.$isAttached = false;
            if (this.$behavior.hasDetached) {
                lifecycle.queueDetachedCallback(this);
            }
        }
    }
    function cache() {
        if (this.$behavior.hasCaching) {
            this.caching();
        }
    }
    /*@internal*/
    function createCustomAttributeDescription(attributeSource, Type) {
        return {
            name: attributeSource.name,
            aliases: attributeSource.aliases || kernel_1.PLATFORM.emptyArray,
            defaultBindingMode: attributeSource.defaultBindingMode || binding_mode_1.BindingMode.toView,
            isTemplateController: attributeSource.isTemplateController || false,
            bindables: Object.assign({}, Type.bindables, attributeSource.bindables)
        };
    }
    exports.createCustomAttributeDescription = createCustomAttributeDescription;
});
//# sourceMappingURL=custom-attribute.js.map