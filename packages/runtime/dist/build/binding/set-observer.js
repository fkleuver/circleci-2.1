(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./array-observer", "./binding-flags", "./collection-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    // tslint:disable:no-reserved-keywords
    const array_observer_1 = require("./array-observer");
    const binding_flags_1 = require("./binding-flags");
    const collection_observer_1 = require("./collection-observer");
    const proto = Set.prototype;
    exports.nativeAdd = proto.add; // TODO: probably want to make these internal again
    exports.nativeClear = proto.clear;
    exports.nativeDelete = proto.delete;
    // note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, add/delete/clear are easy to reconstruct for the indexMap
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    function observeAdd(value) {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeAdd.call(this, value);
        }
        const oldSize = this.size;
        exports.nativeAdd.call(this, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.callSubscribers('add', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-set.prototype.clear
    function observeClear() {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeClear.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            for (const entry of this.keys()) {
                if (indexMap[i] > -1) {
                    array_observer_1.nativePush.call(indexMap.deletedItems, entry);
                }
                i++;
            }
            exports.nativeClear.call(this);
            indexMap.length = 0;
            o.callSubscribers('clear', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        }
        return undefined;
    }
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    function observeDelete(value) {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeDelete.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    array_observer_1.nativePush.call(indexMap.deletedItems, entry);
                }
                array_observer_1.nativeSplice.call(indexMap, i, 1);
                return exports.nativeDelete.call(this, value);
            }
            i++;
        }
        o.callSubscribers('delete', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return false;
    }
    for (const observe of [observeAdd, observeClear, observeDelete]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableSetObservation() {
        if (proto.add['observing'] !== true)
            proto.add = observeAdd;
        if (proto.clear['observing'] !== true)
            proto.clear = observeClear;
        if (proto.delete['observing'] !== true)
            proto.delete = observeDelete;
    }
    exports.enableSetObservation = enableSetObservation;
    enableSetObservation();
    function disableSetObservation() {
        if (proto.add['observing'] === true)
            proto.add = exports.nativeAdd;
        if (proto.clear['observing'] === true)
            proto.clear = exports.nativeClear;
        if (proto.delete['observing'] === true)
            proto.delete = exports.nativeDelete;
    }
    exports.disableSetObservation = disableSetObservation;
    let SetObserver = class SetObserver {
        constructor(changeSet, set) {
            this.changeSet = changeSet;
            set.$observer = this;
            this.collection = set;
            this.resetIndexMap();
        }
    };
    SetObserver = tslib_1.__decorate([
        collection_observer_1.collectionObserver(7 /* set */)
    ], SetObserver);
    exports.SetObserver = SetObserver;
    function getSetObserver(changeSet, set) {
        return set.$observer || new SetObserver(changeSet, set);
    }
    exports.getSetObserver = getSetObserver;
});
//# sourceMappingURL=set-observer.js.map