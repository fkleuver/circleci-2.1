(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../../binding/binding-flags", "../lifecycle"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("../../binding/binding-flags");
    const lifecycle_1 = require("../lifecycle");
    class CompositionCoordinator {
        constructor() {
            this.onSwapComplete = kernel_1.PLATFORM.noop;
            this.queue = null;
            this.currentView = null;
            this.swapTask = lifecycle_1.Lifecycle.done;
            this.isBound = false;
            this.isAttached = false;
        }
        compose(value) {
            if (this.swapTask.done) {
                if (value instanceof Promise) {
                    this.enqueue(new PromiseSwap(this, value));
                    this.processNext();
                }
                else {
                    this.swap(value);
                }
            }
            else {
                if (value instanceof Promise) {
                    this.enqueue(new PromiseSwap(this, value));
                }
                else {
                    this.enqueue(value);
                }
                if (this.swapTask.canCancel()) {
                    this.swapTask.cancel();
                }
            }
        }
        binding(flags, scope) {
            this.scope = scope;
            this.isBound = true;
            if (this.currentView !== null) {
                this.currentView.$bind(flags, scope);
            }
        }
        attaching(encapsulationSource, lifecycle) {
            this.encapsulationSource = encapsulationSource;
            this.isAttached = true;
            if (this.currentView !== null) {
                this.currentView.$attach(encapsulationSource, lifecycle);
            }
        }
        detaching(lifecycle) {
            this.isAttached = false;
            if (this.currentView !== null) {
                this.currentView.$detach(lifecycle);
            }
        }
        unbinding(flags) {
            this.isBound = false;
            if (this.currentView !== null) {
                this.currentView.$unbind(flags);
            }
        }
        caching() {
            this.currentView = null;
        }
        enqueue(view) {
            if (this.queue === null) {
                this.queue = [];
            }
            this.queue.push(view);
        }
        swap(view) {
            if (this.currentView === view) {
                return;
            }
            const swapTask = new lifecycle_1.AggregateLifecycleTask();
            swapTask.addTask(this.detachAndUnbindCurrentView(this.isAttached
                ? lifecycle_1.LifecycleFlags.none
                : lifecycle_1.LifecycleFlags.noTasks));
            this.currentView = view;
            swapTask.addTask(this.bindAndAttachCurrentView());
            if (swapTask.done) {
                this.swapTask = lifecycle_1.Lifecycle.done;
                this.onSwapComplete();
            }
            else {
                this.swapTask = swapTask;
                this.swapTask.wait().then(() => {
                    this.onSwapComplete();
                    this.processNext();
                });
            }
        }
        processNext() {
            if (this.queue !== null && this.queue.length > 0) {
                const next = this.queue.pop();
                this.queue.length = 0;
                if (PromiseSwap.is(next)) {
                    this.swapTask = next.start();
                }
                else {
                    this.swap(next);
                }
            }
            else {
                this.swapTask = lifecycle_1.Lifecycle.done;
            }
        }
        detachAndUnbindCurrentView(detachFlags) {
            if (this.currentView === null) {
                return lifecycle_1.Lifecycle.done;
            }
            return lifecycle_1.Lifecycle.beginDetach(detachFlags | lifecycle_1.LifecycleFlags.unbindAfterDetached)
                .detach(this.currentView)
                .end();
        }
        bindAndAttachCurrentView() {
            if (this.currentView === null) {
                return lifecycle_1.Lifecycle.done;
            }
            if (this.isBound) {
                this.currentView.$bind(binding_flags_1.BindingFlags.fromBindableHandler, this.scope);
            }
            if (this.isAttached) {
                return lifecycle_1.Lifecycle.beginAttach(this.encapsulationSource, lifecycle_1.LifecycleFlags.none)
                    .attach(this.currentView)
                    .end();
            }
            return lifecycle_1.Lifecycle.done;
        }
    }
    exports.CompositionCoordinator = CompositionCoordinator;
    class PromiseSwap {
        constructor(coordinator, promise) {
            this.coordinator = coordinator;
            this.promise = promise;
            this.done = false;
            this.isCancelled = false;
        }
        static is(object) {
            return 'start' in object;
        }
        start() {
            if (this.isCancelled) {
                return lifecycle_1.Lifecycle.done;
            }
            this.promise = this.promise.then(x => {
                this.onResolve(x);
                return x;
            });
            return this;
        }
        canCancel() {
            return !this.done;
        }
        cancel() {
            if (this.canCancel()) {
                this.isCancelled = true;
            }
        }
        wait() {
            return this.promise;
        }
        onResolve(value) {
            if (this.isCancelled) {
                return;
            }
            this.done = true;
            this.coordinator.compose(value);
        }
    }
});
//# sourceMappingURL=composition-coordinator.js.map