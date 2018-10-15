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
    const proto = Map.prototype;
    exports.nativeSet = proto.set; // TODO: probably want to make these internal again
    exports.nativeClear = proto.clear;
    exports.nativeDelete = proto.delete;
    // note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
    // fortunately, map/delete/clear are easy to reconstruct for the indexMap
    // https://tc39.github.io/ecma262/#sec-map.prototype.map
    function observeSet(key, value) {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeSet.call(this, key, value);
        }
        const oldSize = this.size;
        exports.nativeSet.call(this, key, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            let i = 0;
            for (const entry of this.entries()) {
                if (entry[0] === key) {
                    if (entry[1] !== value) {
                        o.indexMap[i] = -2;
                    }
                    return this;
                }
                i++;
            }
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.callSubscribers('set', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-map.prototype.clear
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
    // https://tc39.github.io/ecma262/#sec-map.prototype.delete
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
    for (const observe of [observeSet, observeClear, observeDelete]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableMapObservation() {
        if (proto.set['observing'] !== true)
            proto.set = observeSet;
        if (proto.clear['observing'] !== true)
            proto.clear = observeClear;
        if (proto.delete['observing'] !== true)
            proto.delete = observeDelete;
    }
    exports.enableMapObservation = enableMapObservation;
    enableMapObservation();
    function disableMapObservation() {
        if (proto.set['observing'] === true)
            proto.set = exports.nativeSet;
        if (proto.clear['observing'] === true)
            proto.clear = exports.nativeClear;
        if (proto.delete['observing'] === true)
            proto.delete = exports.nativeDelete;
    }
    exports.disableMapObservation = disableMapObservation;
    let MapObserver = class MapObserver {
        constructor(changeSet, map) {
            this.changeSet = changeSet;
            map.$observer = this;
            this.collection = map;
            this.resetIndexMap();
        }
    };
    MapObserver = tslib_1.__decorate([
        collection_observer_1.collectionObserver(6 /* map */)
    ], MapObserver);
    exports.MapObserver = MapObserver;
    function getMapObserver(changeSet, map) {
        return map.$observer || new MapObserver(changeSet, map);
    }
    exports.getMapObserver = getMapObserver;
});
//# sourceMappingURL=map-observer.js.map