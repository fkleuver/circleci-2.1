(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../binding"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const binding_1 = require("../binding");
    var LifecycleFlags;
    (function (LifecycleFlags) {
        LifecycleFlags[LifecycleFlags["none"] = 1] = "none";
        LifecycleFlags[LifecycleFlags["noTasks"] = 2] = "noTasks";
        LifecycleFlags[LifecycleFlags["unbindAfterDetached"] = 4] = "unbindAfterDetached";
    })(LifecycleFlags = exports.LifecycleFlags || (exports.LifecycleFlags = {}));
    class AggregateLifecycleTask {
        constructor() {
            this.done = true;
            /*@internal*/
            this.owner = null;
            this.tasks = [];
            this.waiter = null;
            this.resolve = null;
        }
        addTask(task) {
            if (!task.done) {
                this.done = false;
                this.tasks.push(task);
                task.wait().then(() => this.tryComplete());
            }
        }
        canCancel() {
            if (this.done) {
                return false;
            }
            return this.tasks.every(x => x.canCancel());
        }
        cancel() {
            if (this.canCancel()) {
                this.tasks.forEach(x => x.cancel());
                this.done = false;
            }
        }
        wait() {
            if (this.waiter === null) {
                if (this.done) {
                    this.waiter = Promise.resolve();
                }
                else {
                    // tslint:disable-next-line:promise-must-complete
                    this.waiter = new Promise((resolve) => this.resolve = resolve);
                }
            }
            return this.waiter;
        }
        tryComplete() {
            if (this.done) {
                return;
            }
            if (this.tasks.every(x => x.done)) {
                this.complete(true);
            }
        }
        complete(notCancelled) {
            this.done = true;
            if (notCancelled && this.owner !== null) {
                this.owner.processAll();
            }
            if (this.resolve !== null) {
                this.resolve();
            }
        }
    }
    exports.AggregateLifecycleTask = AggregateLifecycleTask;
    /*@internal*/
    class AttachLifecycleController {
        constructor(flags, parent = null, encapsulationSource = null) {
            this.flags = flags;
            this.parent = parent;
            this.encapsulationSource = encapsulationSource;
            this.task = null;
            this.addNodesTail = this.addNodesHead = this;
            this.attachedTail = this.attachedHead = this;
        }
        attach(requestor) {
            requestor.$attach(this.encapsulationSource, this);
            return this;
        }
        queueAddNodes(requestor) {
            this.addNodesTail.$nextAddNodes = requestor;
            this.addNodesTail = requestor;
        }
        queueAttachedCallback(requestor) {
            this.attachedTail.$nextAttached = requestor;
            this.attachedTail = requestor;
        }
        registerTask(task) {
            if (this.parent !== null) {
                this.parent.registerTask(task);
            }
            else {
                if (this.task === null) {
                    this.task = new AggregateLifecycleTask();
                }
                this.task.addTask(task);
            }
        }
        createChild() {
            const lifecycle = new AttachLifecycleController(this.flags, this);
            this.queueAddNodes(lifecycle);
            this.queueAttachedCallback(lifecycle);
            return lifecycle;
        }
        end() {
            if (this.task !== null && !this.task.done) {
                this.task.owner = this;
                return this.task;
            }
            this.processAll();
            return exports.Lifecycle.done;
        }
        /*@internal*/
        processAll() {
            this.processAddNodes();
            this.processAttachedCallbacks();
        }
        /*@internal*/
        $addNodes() {
            if (this.parent !== null) {
                this.processAddNodes();
            }
        }
        /*@internal*/
        attached() {
            if (this.parent !== null) {
                this.processAttachedCallbacks();
            }
        }
        processAddNodes() {
            let currentAddNodes = this.addNodesHead;
            let nextAddNodes;
            while (currentAddNodes) {
                currentAddNodes.$addNodes();
                nextAddNodes = currentAddNodes.$nextAddNodes;
                currentAddNodes.$nextAddNodes = null;
                currentAddNodes = nextAddNodes;
            }
        }
        processAttachedCallbacks() {
            let currentAttached = this.attachedHead;
            let nextAttached;
            while (currentAttached) {
                currentAttached.attached();
                nextAttached = currentAttached.$nextAttached;
                currentAttached.$nextAttached = null;
                currentAttached = nextAttached;
            }
        }
    }
    exports.AttachLifecycleController = AttachLifecycleController;
    /*@internal*/
    class DetachLifecycleController {
        constructor(flags, parent = null) {
            this.flags = flags;
            this.parent = parent;
            this.task = null;
            this.allowNodeRemoves = true;
            this.detachedTail = this.detachedHead = this;
            this.removeNodesTail = this.removeNodesHead = this;
        }
        detach(requestor) {
            this.allowNodeRemoves = true;
            if (requestor.$isAttached) {
                requestor.$detach(this);
            }
            else if (isNodeRemovable(requestor)) {
                this.queueRemoveNodes(requestor);
            }
            return this;
        }
        queueRemoveNodes(requestor) {
            if (this.allowNodeRemoves) {
                this.removeNodesTail.$nextRemoveNodes = requestor;
                this.removeNodesTail = requestor;
                this.allowNodeRemoves = false; // only remove roots
            }
        }
        queueDetachedCallback(requestor) {
            this.detachedTail.$nextDetached = requestor;
            this.detachedTail = requestor;
        }
        registerTask(task) {
            if (this.parent !== null) {
                this.parent.registerTask(task);
            }
            else {
                if (this.task === null) {
                    this.task = new AggregateLifecycleTask();
                }
                this.task.addTask(task);
            }
        }
        createChild() {
            const lifecycle = new DetachLifecycleController(this.flags, this);
            this.queueRemoveNodes(lifecycle);
            this.queueDetachedCallback(lifecycle);
            return lifecycle;
        }
        end() {
            if (this.task !== null && !this.task.done) {
                this.task.owner = this;
                return this.task;
            }
            this.processAll();
            return exports.Lifecycle.done;
        }
        /*@internal*/
        $removeNodes() {
            if (this.parent !== null) {
                this.processRemoveNodes();
            }
        }
        /*@internal*/
        detached() {
            if (this.parent !== null) {
                this.processDetachedCallbacks();
            }
        }
        /*@internal*/
        processAll() {
            this.processRemoveNodes();
            this.processDetachedCallbacks();
        }
        processRemoveNodes() {
            let currentRemoveNodes = this.removeNodesHead;
            if (this.flags & LifecycleFlags.unbindAfterDetached) {
                while (currentRemoveNodes) {
                    currentRemoveNodes.$removeNodes();
                    currentRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
                }
            }
            else {
                let nextRemoveNodes;
                while (currentRemoveNodes) {
                    currentRemoveNodes.$removeNodes();
                    nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
                    currentRemoveNodes.$nextRemoveNodes = null;
                    currentRemoveNodes = nextRemoveNodes;
                }
            }
        }
        processDetachedCallbacks() {
            let currentDetached = this.detachedHead;
            let nextDetached;
            while (currentDetached) {
                currentDetached.detached();
                nextDetached = currentDetached.$nextDetached;
                currentDetached.$nextDetached = null;
                currentDetached = nextDetached;
            }
            if (this.flags & LifecycleFlags.unbindAfterDetached) {
                let currentRemoveNodes = this.removeNodesHead;
                let nextRemoveNodes;
                while (currentRemoveNodes) {
                    if (isUnbindable(currentRemoveNodes)) {
                        currentRemoveNodes.$unbind(binding_1.BindingFlags.fromUnbind);
                    }
                    nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
                    currentRemoveNodes.$nextRemoveNodes = null;
                    currentRemoveNodes = nextRemoveNodes;
                }
            }
        }
    }
    exports.DetachLifecycleController = DetachLifecycleController;
    function isNodeRemovable(requestor) {
        return '$removeNodes' in requestor;
    }
    function isUnbindable(requestor) {
        return '$unbind' in requestor;
    }
    exports.Lifecycle = {
        beginAttach(encapsulationSource, flags) {
            return new AttachLifecycleController(flags, null, encapsulationSource);
        },
        beginDetach(flags) {
            return new DetachLifecycleController(flags);
        },
        done: {
            done: true,
            canCancel() { return false; },
            // tslint:disable-next-line:no-empty
            cancel() { },
            wait() { return Promise.resolve(); }
        }
    };
});
//# sourceMappingURL=lifecycle.js.map