(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../binding/binding-context", "../binding/binding-flags", "../dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_context_1 = require("../binding/binding-context");
    const binding_flags_1 = require("../binding/binding-flags");
    const dom_1 = require("../dom");
    /**
     * Decorator: Indicates that the decorated class is a custom element.
     */
    // tslint:disable-next-line:no-any
    function customElement(nameOrSource) {
        return function (target) {
            return exports.CustomElementResource.define(nameOrSource, target);
        };
    }
    exports.customElement = customElement;
    const defaultShadowOptions = {
        mode: 'open'
    };
    /**
     * Decorator: Indicates that the custom element should render its view in Shadow
     * DOM.
     */
    // tslint:disable-next-line:no-any
    function useShadowDOM(targetOrOptions) {
        const options = typeof targetOrOptions === 'function' || !targetOrOptions
            ? defaultShadowOptions
            : targetOrOptions;
        const deco = function (target) {
            target.shadowOptions = options;
            return target;
        };
        return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
    }
    exports.useShadowDOM = useShadowDOM;
    /**
     * Decorator: Indicates that the custom element should be rendered without its
     * element container.
     */
    // tslint:disable-next-line:no-any
    function containerless(maybeTarget) {
        const deco = function (target) {
            target.containerless = true;
            return target;
        };
        return maybeTarget ? deco(maybeTarget) : deco;
    }
    exports.containerless = containerless;
    exports.CustomElementResource = {
        name: 'custom-element',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(Type) {
            return Type.kind === this;
        },
        behaviorFor(node) {
            return node.$customElement || null;
        },
        define(nameOrSource, ctor = null) {
            const Type = (ctor === null ? class HTMLOnlyElement {
            } : ctor);
            const description = createCustomElementDescription(typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource, Type);
            const proto = Type.prototype;
            Type.kind = exports.CustomElementResource;
            Type.description = description;
            Type.register = register;
            proto.$hydrate = hydrate;
            proto.$bind = bind;
            proto.$attach = attach;
            proto.$detach = detach;
            proto.$unbind = unbind;
            proto.$cache = cache;
            proto.$addNodes = addNodes;
            proto.$removeNodes = removeNodes;
            return Type;
        }
    };
    function register(container) {
        container.register(kernel_1.Registration.transient(exports.CustomElementResource.keyFrom(this.description.name), this));
    }
    function hydrate(renderingEngine, host, options = kernel_1.PLATFORM.emptyObject) {
        const Type = this.constructor;
        const description = Type.description;
        this.$bindables = [];
        this.$attachables = [];
        this.$isAttached = false;
        this.$isBound = false;
        this.$scope = binding_context_1.Scope.create(this, null); // TODO: get the parent from somewhere?
        this.$projector = determineProjector(this, host, description);
        renderingEngine.applyRuntimeBehavior(Type, this);
        let template;
        if (this.$behavior.hasRender) {
            const result = this.render(host, options.parts);
            if ('getElementTemplate' in result) {
                template = result.getElementTemplate(renderingEngine, Type);
            }
            else {
                this.$nodes = result;
            }
        }
        else {
            template = renderingEngine.getElementTemplate(description, Type);
        }
        if (template) {
            this.$context = template.renderContext;
            this.$nodes = template.createFor(this, host, options.parts);
        }
        if (this.$behavior.hasCreated) {
            this.created();
        }
    }
    function bind(flags) {
        if (this.$isBound) {
            return;
        }
        const behavior = this.$behavior;
        if (behavior.hasBinding) {
            this.binding(flags | binding_flags_1.BindingFlags.fromBind);
        }
        const scope = this.$scope;
        const bindables = this.$bindables;
        for (let i = 0, ii = bindables.length; i < ii; ++i) {
            bindables[i].$bind(flags | binding_flags_1.BindingFlags.fromBind, scope);
        }
        this.$isBound = true;
        if (behavior.hasBound) {
            this.bound(flags | binding_flags_1.BindingFlags.fromBind);
        }
    }
    function unbind(flags) {
        if (this.$isBound) {
            const behavior = this.$behavior;
            if (behavior.hasUnbinding) {
                this.unbinding(flags | binding_flags_1.BindingFlags.fromUnbind);
            }
            const bindables = this.$bindables;
            let i = bindables.length;
            while (i--) {
                bindables[i].$unbind(flags | binding_flags_1.BindingFlags.fromUnbind);
            }
            this.$isBound = false;
            if (behavior.hasUnbound) {
                this.unbound(flags | binding_flags_1.BindingFlags.fromUnbind);
            }
        }
    }
    function attach(encapsulationSource, lifecycle) {
        if (this.$isAttached) {
            return;
        }
        encapsulationSource = this.$projector.provideEncapsulationSource(encapsulationSource);
        if (this.$behavior.hasAttaching) {
            this.attaching(encapsulationSource, lifecycle);
        }
        const attachables = this.$attachables;
        for (let i = 0, ii = attachables.length; i < ii; ++i) {
            attachables[i].$attach(encapsulationSource, lifecycle);
        }
        lifecycle.queueAddNodes(this);
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
            lifecycle.queueRemoveNodes(this);
            const attachables = this.$attachables;
            let i = attachables.length;
            while (i--) {
                attachables[i].$detach(lifecycle);
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
        const attachables = this.$attachables;
        let i = attachables.length;
        while (i--) {
            attachables[i].$cache();
        }
    }
    function addNodes() {
        this.$projector.project(this.$nodes);
    }
    function removeNodes() {
        this.$projector.onElementRemoved();
    }
    /*@internal*/
    function createCustomElementDescription(templateSource, Type) {
        return {
            name: templateSource.name || 'unnamed',
            templateOrNode: templateSource.templateOrNode || null,
            cache: 0,
            build: templateSource.build || {
                required: false,
                compiler: 'default'
            },
            bindables: Object.assign({}, Type.bindables, templateSource.bindables),
            instructions: templateSource.instructions ? kernel_1.PLATFORM.toArray(templateSource.instructions) : kernel_1.PLATFORM.emptyArray,
            dependencies: templateSource.dependencies ? kernel_1.PLATFORM.toArray(templateSource.dependencies) : kernel_1.PLATFORM.emptyArray,
            surrogates: templateSource.surrogates ? kernel_1.PLATFORM.toArray(templateSource.surrogates) : kernel_1.PLATFORM.emptyArray,
            containerless: templateSource.containerless || Type.containerless || false,
            shadowOptions: templateSource.shadowOptions || Type.shadowOptions || null,
            hasSlots: templateSource.hasSlots || false
        };
    }
    exports.createCustomElementDescription = createCustomElementDescription;
    function determineProjector($customElement, host, definition) {
        if (definition.shadowOptions || definition.hasSlots) {
            if (definition.containerless) {
                throw kernel_1.Reporter.error(21);
            }
            return new ShadowDOMProjector($customElement, host, definition);
        }
        if (definition.containerless) {
            return new ContainerlessProjector($customElement, host);
        }
        return new HostProjector($customElement, host);
    }
    const childObserverOptions = { childList: true };
    class ShadowDOMProjector {
        constructor($customElement, host, definition) {
            this.host = host;
            this.shadowRoot = dom_1.DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
            host.$customElement = $customElement;
            this.shadowRoot.$customElement = $customElement;
        }
        get children() {
            return this.host.childNodes;
        }
        subscribeToChildrenChange(callback) {
            dom_1.DOM.createNodeObserver(this.host, callback, childObserverOptions);
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            return this.shadowRoot;
        }
        project(nodes) {
            nodes.appendTo(this.host);
            this.project = kernel_1.PLATFORM.noop;
        }
        onElementRemoved() {
            // No special behavior is required because the host element removal
            // will result in the projected nodes being removed, since they are in
            // the ShadowDOM.
        }
    }
    exports.ShadowDOMProjector = ShadowDOMProjector;
    class ContainerlessProjector {
        constructor($customElement, host) {
            this.$customElement = $customElement;
            this.requiresMount = true;
            if (host.childNodes.length) {
                this.childNodes = kernel_1.PLATFORM.toArray(host.childNodes);
            }
            else {
                this.childNodes = kernel_1.PLATFORM.emptyArray;
            }
            this.host = dom_1.DOM.convertToRenderLocation(host);
            this.host.$customElement = $customElement;
        }
        get children() {
            return this.childNodes;
        }
        subscribeToChildrenChange(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            if (!parentEncapsulationSource) {
                throw kernel_1.Reporter.error(22);
            }
            return parentEncapsulationSource;
        }
        project(nodes) {
            if (this.requiresMount) {
                this.requiresMount = false;
                nodes.insertBefore(this.host);
            }
        }
        onElementRemoved() {
            this.requiresMount = true;
            this.$customElement.$nodes.remove();
        }
    }
    exports.ContainerlessProjector = ContainerlessProjector;
    class HostProjector {
        constructor($customElement, host) {
            this.host = host;
            host.$customElement = $customElement;
        }
        get children() {
            return kernel_1.PLATFORM.emptyArray;
        }
        subscribeToChildrenChange(callback) {
            // Do nothing since this scenario will never have children.
        }
        provideEncapsulationSource(parentEncapsulationSource) {
            return parentEncapsulationSource || this.host;
        }
        project(nodes) {
            nodes.appendTo(this.host);
            this.project = kernel_1.PLATFORM.noop;
        }
        onElementRemoved() {
            // No special behavior is required because the host element removal
            // will result in the projected nodes being removed, since they are children.
        }
    }
    exports.HostProjector = HostProjector;
});
// TODO
// ## DefaultSlotProjector
// An implementation of IElementProjector that can handle a subset of default
// slot projection scenarios without needing real Shadow DOM.
// ### Conditions
// We can do a one-time, static composition of the content and view,
// to emulate shadow DOM, if the following constraints are met:
// * There must be exactly one slot and it must be a default slot.
// * The default slot must not have any fallback content.
// * The default slot must not have a custom element as its immediate parent or
//   a slot attribute (re-projection).
// ### Projection
// The projector copies all content nodes to the slot's location.
// The copy process should inject a comment node before and after the slotted
// content, so that the bounds of the content can be clearly determined,
// even if the slotted content has template controllers or string interpolation.
// ### Encapsulation Source
// Uses the same strategy as HostProjector.
// ### Children
// The projector adds a mutation observer to the parent node of the
// slot comment. When direct children of that node change, the projector
// will gather up all nodes between the start and end slot comments.
//# sourceMappingURL=custom-element.js.map