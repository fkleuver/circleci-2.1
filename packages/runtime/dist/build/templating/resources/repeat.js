(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../../binding", "../../dom", "../bindable", "../custom-attribute", "../lifecycle", "../renderable", "../view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_1 = require("../../binding");
    const dom_1 = require("../../dom");
    const bindable_1 = require("../bindable");
    const custom_attribute_1 = require("../custom-attribute");
    const lifecycle_1 = require("../lifecycle");
    const renderable_1 = require("../renderable");
    const view_1 = require("../view");
    const batchedChangesFlags = binding_1.BindingFlags.fromFlushChanges | binding_1.BindingFlags.fromBind;
    let Repeat = class Repeat {
        constructor(changeSet, location, renderable, factory) {
            this.changeSet = changeSet;
            this.location = location;
            this.renderable = renderable;
            this.factory = factory;
            this.encapsulationSource = null;
            this.views = [];
            this.observer = null;
            this.hasPendingInstanceMutation = false;
        }
        bound(flags) {
            this.forOf = this.renderable.$bindables.find(b => b.target === this).sourceExpression;
            this.local = this.forOf.declaration.evaluate(flags, this.$scope, null);
            this.processViews(null, flags);
            this.checkCollectionObserver();
        }
        attaching(encapsulationSource, lifecycle) {
            const { views, location } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.mount(location);
                view.$attach(encapsulationSource, lifecycle);
            }
        }
        detaching(lifecycle) {
            const { views } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.$detach(lifecycle);
                view.release();
            }
        }
        unbound(flags) {
            this.checkCollectionObserver();
            const { views } = this;
            for (let i = 0, ii = views.length; i < ii; ++i) {
                const view = views[i];
                view.$unbind(flags);
            }
        }
        // called by SetterObserver (sync)
        itemsChanged(newValue, oldValue, flags) {
            this.checkCollectionObserver();
            this.processViews(null, flags | binding_1.BindingFlags.updateTargetInstance);
        }
        // called by a CollectionObserver (async)
        handleBatchedChange(indexMap) {
            this.processViews(indexMap, binding_1.BindingFlags.fromFlushChanges | binding_1.BindingFlags.updateTargetInstance);
        }
        // if the indexMap === null, it is an instance mutation, otherwise it's an items mutation
        processViews(indexMap, flags) {
            const views = this.views;
            if (this.$isBound) {
                const { local, $scope, factory, forOf, items } = this;
                const oldLength = views.length;
                const newLength = forOf.count(items);
                if (oldLength < newLength) {
                    views.length = newLength;
                    for (let i = oldLength; i < newLength; ++i) {
                        views[i] = factory.create();
                    }
                }
                else if (newLength < oldLength) {
                    const lifecycle = lifecycle_1.Lifecycle.beginDetach(lifecycle_1.LifecycleFlags.unbindAfterDetached);
                    for (let i = newLength, view = views[i]; i < oldLength; view = views[++i]) {
                        view.release();
                        lifecycle.detach(view);
                    }
                    lifecycle.end();
                    views.length = newLength;
                    if (newLength === 0) {
                        return;
                    }
                }
                else if (newLength === 0) {
                    return;
                }
                if (indexMap === null) {
                    forOf.iterate(items, (arr, i, item) => {
                        const view = views[i];
                        if (!!view.$scope && view.$scope.bindingContext[local] === item) {
                            view.$bind(flags, binding_1.Scope.fromParent($scope, view.$scope.bindingContext));
                        }
                        else {
                            view.$bind(flags, binding_1.Scope.fromParent($scope, binding_1.BindingContext.create(local, item)));
                        }
                    });
                }
                else {
                    forOf.iterate(items, (arr, i, item) => {
                        const view = views[i];
                        if (indexMap[i] === i) {
                            view.$bind(flags, binding_1.Scope.fromParent($scope, view.$scope.bindingContext));
                        }
                        else {
                            view.$bind(flags, binding_1.Scope.fromParent($scope, binding_1.BindingContext.create(local, item)));
                        }
                    });
                }
            }
            if (this.$isAttached) {
                const { location } = this;
                const lifecycle = lifecycle_1.Lifecycle.beginAttach(this.encapsulationSource, lifecycle_1.LifecycleFlags.none);
                if (indexMap === null) {
                    for (let i = 0, ii = views.length; i < ii; ++i) {
                        const view = views[i];
                        view.mount(location);
                        lifecycle.attach(view);
                    }
                }
                else {
                    for (let i = 0, ii = views.length; i < ii; ++i) {
                        if (indexMap[i] !== i) {
                            const view = views[i];
                            view.mount(location);
                            lifecycle.attach(view);
                        }
                    }
                }
                lifecycle.end();
            }
        }
        checkCollectionObserver() {
            const oldObserver = this.observer;
            if (this.$isBound) {
                const newObserver = this.observer = binding_1.getCollectionObserver(this.changeSet, this.items);
                if (oldObserver !== newObserver) {
                    if (oldObserver) {
                        oldObserver.unsubscribeBatched(this);
                    }
                    if (newObserver) {
                        newObserver.subscribeBatched(this);
                    }
                }
            }
            else if (oldObserver) {
                oldObserver.unsubscribeBatched(this);
            }
        }
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], Repeat.prototype, "items", void 0);
    Repeat = tslib_1.__decorate([
        kernel_1.inject(binding_1.IChangeSet, dom_1.IRenderLocation, renderable_1.IRenderable, view_1.IViewFactory),
        custom_attribute_1.templateController('repeat')
    ], Repeat);
    exports.Repeat = Repeat;
});
//# sourceMappingURL=repeat.js.map