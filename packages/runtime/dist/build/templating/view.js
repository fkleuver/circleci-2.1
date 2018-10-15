(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    exports.IViewFactory = kernel_1.DI.createInterface().noDefault();
    /*@internal*/
    class View {
        constructor(factory, template) {
            this.factory = factory;
            this.template = template;
            this.$bindables = [];
            this.$attachables = [];
            this.$scope = null;
            this.$nodes = null;
            this.$isBound = false;
            this.$isAttached = false;
            this.requiresNodeAdd = false;
            this.isFree = false;
            this.$nodes = this.template.createFor(this);
        }
        mount(location) {
            if (!location.parentNode) { // unmet invariant: location must be a child of some other node
                throw kernel_1.Reporter.error(60); // TODO: organize error codes
            }
            this.location = location;
            if (this.$nodes.lastChild && this.$nodes.lastChild.nextSibling !== location) {
                this.requiresNodeAdd = true;
            }
        }
        lockScope(scope) {
            this.$scope = scope;
            this.$bind = lockedBind;
        }
        release() {
            this.isFree = true;
            if (this.$isAttached) {
                return this.factory.canReturnToCache(this);
            }
            else {
                return this.$removeNodes();
            }
        }
        $bind(flags, scope) {
            if (this.$isBound) {
                if (this.$scope === scope) {
                    return;
                }
                this.$unbind(flags);
            }
            this.$scope = scope;
            const bindables = this.$bindables;
            for (let i = 0, ii = bindables.length; i < ii; ++i) {
                bindables[i].$bind(flags, scope);
            }
            this.$isBound = true;
        }
        $addNodes() {
            this.requiresNodeAdd = false;
            this.$nodes.insertBefore(this.location);
        }
        $removeNodes() {
            this.requiresNodeAdd = true;
            this.$nodes.remove();
            if (this.isFree) {
                this.isFree = false;
                return this.factory.tryReturnToCache(this);
            }
            return false;
        }
        $attach(encapsulationSource, lifecycle) {
            if (this.$isAttached) {
                return;
            }
            const attachables = this.$attachables;
            for (let i = 0, ii = attachables.length; i < ii; ++i) {
                attachables[i].$attach(encapsulationSource, lifecycle);
            }
            if (this.requiresNodeAdd) {
                lifecycle.queueAddNodes(this);
            }
            this.$isAttached = true;
        }
        $detach(lifecycle) {
            if (this.$isAttached) {
                lifecycle.queueRemoveNodes(this);
                const attachables = this.$attachables;
                let i = attachables.length;
                while (i--) {
                    attachables[i].$detach(lifecycle);
                }
                this.$isAttached = false;
            }
        }
        $unbind(flags) {
            if (this.$isBound) {
                const bindables = this.$bindables;
                let i = bindables.length;
                while (i--) {
                    bindables[i].$unbind(flags);
                }
                this.$isBound = false;
                this.$scope = null;
            }
        }
        $cache() {
            const attachables = this.$attachables;
            for (let i = 0, ii = attachables.length; i < ii; ++i) {
                attachables[i].$cache();
            }
        }
    }
    exports.View = View;
    /*@internal*/
    class ViewFactory {
        constructor(name, template) {
            this.name = name;
            this.template = template;
            this.isCaching = false;
            this.cacheSize = -1;
            this.cache = null;
        }
        setCacheSize(size, doNotOverrideIfAlreadySet) {
            if (size) {
                if (size === '*') {
                    size = ViewFactory.maxCacheSize;
                }
                else if (typeof size === 'string') {
                    size = parseInt(size, 10);
                }
                if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                    this.cacheSize = size;
                }
            }
            if (this.cacheSize > 0) {
                this.cache = [];
            }
            else {
                this.cache = null;
            }
            this.isCaching = this.cacheSize > 0;
        }
        canReturnToCache(view) {
            return this.cache !== null && this.cache.length < this.cacheSize;
        }
        tryReturnToCache(view) {
            if (this.canReturnToCache(view)) {
                view.$cache();
                this.cache.push(view);
                return true;
            }
            return false;
        }
        create() {
            const cache = this.cache;
            if (cache !== null && cache.length > 0) {
                return cache.pop();
            }
            return new View(this, this.template);
        }
    }
    ViewFactory.maxCacheSize = 0xFFFF;
    exports.ViewFactory = ViewFactory;
    function lockedBind(flags) {
        if (this.$isBound) {
            return;
        }
        const lockedScope = this.$scope;
        const bindables = this.$bindables;
        for (let i = 0, ii = bindables.length; i < ii; ++i) {
            bindables[i].$bind(flags, lockedScope);
        }
        this.$isBound = true;
    }
});
//# sourceMappingURL=view.js.map