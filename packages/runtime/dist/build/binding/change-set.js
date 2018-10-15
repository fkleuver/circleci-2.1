(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./set-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const set_observer_1 = require("./set-observer");
    exports.IChangeSet = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(ChangeSet));
    /*@internal*/
    class ChangeSet extends Set {
        constructor() {
            super(...arguments);
            this.flushing = false;
            /*@internal*/
            this.promise = Promise.resolve();
            /**
             * This particular implementation is recursive; any changes added as a side-effect of flushing changes, will be flushed during the same tick.
             */
            this.flushChanges = () => {
                this.flushing = true;
                while (this.size > 0) {
                    const items = this.toArray();
                    this.clear();
                    const len = items.length;
                    let i = 0;
                    while (i < len) {
                        items[i++].flushChanges();
                    }
                }
                this.flushing = false;
            };
        }
        toArray() {
            const items = new Array(this.size);
            let i = 0;
            for (const item of this.keys()) {
                items[i++] = item;
            }
            return items;
        }
        add(changeTracker) {
            if (this.size === 0) {
                this.flushed = this.promise.then(this.flushChanges);
            }
            set_observer_1.nativeAdd.call(this, changeTracker);
            return this.flushed;
        }
    }
    exports.ChangeSet = ChangeSet;
});
//# sourceMappingURL=change-set.js.map