(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./binding-flags", "./collection-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    // tslint:disable:no-reserved-keywords
    const binding_flags_1 = require("./binding-flags");
    const collection_observer_1 = require("./collection-observer");
    const proto = Array.prototype;
    exports.nativePush = proto.push; // TODO: probably want to make these internal again
    exports.nativeUnshift = proto.unshift;
    exports.nativePop = proto.pop;
    exports.nativeShift = proto.shift;
    exports.nativeSplice = proto.splice;
    exports.nativeReverse = proto.reverse;
    exports.nativeSort = proto.sort;
    // https://tc39.github.io/ecma262/#sec-array.prototype.push
    function observePush() {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativePush.apply(this, arguments);
        }
        const len = this.length;
        const argCount = arguments.length;
        if (argCount === 0) {
            return len;
        }
        this.length = o.indexMap.length = len + argCount;
        let i = len;
        while (i < this.length) {
            this[i] = arguments[i - len];
            o.indexMap[i] = -2;
            i++;
        }
        o.callSubscribers('push', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return this.length;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
    function observeUnshift() {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeUnshift.apply(this, arguments);
        }
        const argCount = arguments.length;
        const inserts = new Array(argCount);
        let i = 0;
        while (i < argCount) {
            inserts[i++] = -2;
        }
        exports.nativeUnshift.apply(o.indexMap, inserts);
        const len = exports.nativeUnshift.apply(this, arguments);
        o.callSubscribers('unshift', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return len;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.pop
    function observePop() {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativePop.call(this);
        }
        const indexMap = o.indexMap;
        const element = exports.nativePop.call(this);
        // only mark indices as deleted if they actually existed in the original array
        const index = indexMap.length - 1;
        if (indexMap[index] > -1) {
            exports.nativePush.call(indexMap.deletedItems, element);
        }
        exports.nativePop.call(indexMap);
        o.callSubscribers('pop', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return element;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.shift
    function observeShift() {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeShift.call(this);
        }
        const indexMap = o.indexMap;
        const element = exports.nativeShift.call(this);
        // only mark indices as deleted if they actually existed in the original array
        if (indexMap[0] > -1) {
            exports.nativePush.call(indexMap.deletedItems, element);
        }
        exports.nativeShift.call(indexMap);
        o.callSubscribers('shift', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return element;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.splice
    function observeSplice(start, deleteCount) {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeSplice.apply(this, arguments);
        }
        const indexMap = o.indexMap;
        if (deleteCount > 0) {
            let i = start || 0;
            const to = i + deleteCount;
            while (i < to) {
                if (indexMap[i] > -1) {
                    exports.nativePush.call(indexMap.deletedItems, this[i]);
                }
                i++;
            }
        }
        const argCount = arguments.length;
        if (argCount > 2) {
            const itemCount = argCount - 2;
            const inserts = new Array(itemCount);
            let i = 0;
            while (i < itemCount) {
                inserts[i++] = -2;
            }
            exports.nativeSplice.call(indexMap, start, deleteCount, ...inserts);
        }
        else if (argCount === 2) {
            exports.nativeSplice.call(indexMap, start, deleteCount);
        }
        const deleted = exports.nativeSplice.apply(this, arguments);
        o.callSubscribers('splice', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return deleted;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
    function observeReverse() {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeReverse.call(this);
        }
        const len = this.length;
        const middle = (len / 2) | 0;
        let lower = 0;
        while (lower !== middle) {
            const upper = len - lower - 1;
            const lowerValue = this[lower];
            const lowerIndex = o.indexMap[lower];
            const upperValue = this[upper];
            const upperIndex = o.indexMap[upper];
            this[lower] = upperValue;
            o.indexMap[lower] = upperIndex;
            this[upper] = lowerValue;
            o.indexMap[upper] = lowerIndex;
            lower++;
        }
        o.callSubscribers('reverse', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-array.prototype.sort
    // https://github.com/v8/v8/blob/master/src/js/array.js
    function observeSort(compareFn) {
        const o = this.$observer;
        if (o === undefined) {
            return exports.nativeSort.call(this, compareFn);
        }
        const len = this.length;
        if (len < 2) {
            return this;
        }
        quickSort(this, o.indexMap, 0, len, preSortCompare);
        let i = 0;
        while (i < len) {
            if (this[i] === undefined) {
                break;
            }
            i++;
        }
        if (compareFn === undefined || typeof compareFn !== 'function' /*spec says throw a TypeError, should we do that too?*/) {
            compareFn = sortCompare;
        }
        quickSort(this, o.indexMap, 0, i, compareFn);
        o.callSubscribers('sort', arguments, binding_flags_1.BindingFlags.isCollectionMutation);
        return this;
    }
    // https://tc39.github.io/ecma262/#sec-sortcompare
    function sortCompare(x, y) {
        if (x === y) {
            return 0;
        }
        x = x === null ? 'null' : x.toString();
        y = y === null ? 'null' : y.toString();
        return x < y ? -1 : 1;
    }
    function preSortCompare(x, y) {
        if (x === undefined) {
            if (y === undefined) {
                return 0;
            }
            else {
                return 1;
            }
        }
        if (y === undefined) {
            return -1;
        }
        return 0;
    }
    function insertionSort(arr, indexMap, from, to, compareFn) {
        let velement, ielement, vtmp, itmp, order;
        let i, j;
        for (i = from + 1; i < to; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            for (j = i - 1; j >= from; j--) {
                vtmp = arr[j];
                itmp = indexMap[j];
                order = compareFn(vtmp, velement);
                if (order > 0) {
                    arr[j + 1] = vtmp;
                    indexMap[j + 1] = itmp;
                }
                else {
                    break;
                }
            }
            arr[j + 1] = velement;
            indexMap[j + 1] = ielement;
        }
    }
    function quickSort(arr, indexMap, from, to, compareFn) {
        let thirdIndex = 0, i = 0;
        let v0, v1, v2;
        let i0, i1, i2;
        let c01, c02, c12;
        let vtmp, itmp;
        let vpivot, ipivot, lowEnd, highStart;
        let velement, ielement, order, vtopElement;
        // tslint:disable-next-line:no-constant-condition
        while (true) {
            if (to - from <= 10) {
                insertionSort(arr, indexMap, from, to, compareFn);
                return;
            }
            thirdIndex = from + ((to - from) >> 1);
            v0 = arr[from];
            i0 = indexMap[from];
            v1 = arr[to - 1];
            i1 = indexMap[to - 1];
            v2 = arr[thirdIndex];
            i2 = indexMap[thirdIndex];
            c01 = compareFn(v0, v1);
            if (c01 > 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v1;
                i0 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            c02 = compareFn(v0, v2);
            if (c02 >= 0) {
                vtmp = v0;
                itmp = i0;
                v0 = v2;
                i0 = i2;
                v2 = v1;
                i2 = i1;
                v1 = vtmp;
                i1 = itmp;
            }
            else {
                c12 = compareFn(v1, v2);
                if (c12 > 0) {
                    vtmp = v1;
                    itmp = i1;
                    v1 = v2;
                    i1 = i2;
                    v2 = vtmp;
                    i2 = itmp;
                }
            }
            arr[from] = v0;
            indexMap[from] = i0;
            arr[to - 1] = v2;
            indexMap[to - 1] = i2;
            vpivot = v1;
            ipivot = i1;
            lowEnd = from + 1;
            highStart = to - 1;
            arr[thirdIndex] = arr[lowEnd];
            indexMap[thirdIndex] = indexMap[lowEnd];
            arr[lowEnd] = vpivot;
            indexMap[lowEnd] = ipivot;
            partition: for (i = lowEnd + 1; i < highStart; i++) {
                velement = arr[i];
                ielement = indexMap[i];
                order = compareFn(velement, vpivot);
                if (order < 0) {
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
                else if (order > 0) {
                    do {
                        highStart--;
                        // tslint:disable-next-line:triple-equals
                        if (highStart == i) {
                            break partition;
                        }
                        vtopElement = arr[highStart];
                        order = compareFn(vtopElement, vpivot);
                    } while (order > 0);
                    arr[i] = arr[highStart];
                    indexMap[i] = indexMap[highStart];
                    arr[highStart] = velement;
                    indexMap[highStart] = ielement;
                    if (order < 0) {
                        velement = arr[i];
                        ielement = indexMap[i];
                        arr[i] = arr[lowEnd];
                        indexMap[i] = indexMap[lowEnd];
                        arr[lowEnd] = velement;
                        indexMap[lowEnd] = ielement;
                        lowEnd++;
                    }
                }
            }
            if (to - highStart < lowEnd - from) {
                quickSort(arr, indexMap, highStart, to, compareFn);
                to = lowEnd;
            }
            else {
                quickSort(arr, indexMap, from, lowEnd, compareFn);
                from = highStart;
            }
        }
    }
    for (const observe of [observePush, observeUnshift, observePop, observeShift, observeSplice, observeReverse, observeSort]) {
        Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
    }
    function enableArrayObservation() {
        if (proto.push['observing'] !== true)
            proto.push = observePush;
        if (proto.unshift['observing'] !== true)
            proto.unshift = observeUnshift;
        if (proto.pop['observing'] !== true)
            proto.pop = observePop;
        if (proto.shift['observing'] !== true)
            proto.shift = observeShift;
        if (proto.splice['observing'] !== true)
            proto.splice = observeSplice;
        if (proto.reverse['observing'] !== true)
            proto.reverse = observeReverse;
        if (proto.sort['observing'] !== true)
            proto.sort = observeSort;
    }
    exports.enableArrayObservation = enableArrayObservation;
    enableArrayObservation();
    function disableArrayObservation() {
        if (proto.push['observing'] === true)
            proto.push = exports.nativePush;
        if (proto.unshift['observing'] === true)
            proto.unshift = exports.nativeUnshift;
        if (proto.pop['observing'] === true)
            proto.pop = exports.nativePop;
        if (proto.shift['observing'] === true)
            proto.shift = exports.nativeShift;
        if (proto.splice['observing'] === true)
            proto.splice = exports.nativeSplice;
        if (proto.reverse['observing'] === true)
            proto.reverse = exports.nativeReverse;
        if (proto.sort['observing'] === true)
            proto.sort = exports.nativeSort;
    }
    exports.disableArrayObservation = disableArrayObservation;
    let ArrayObserver = class ArrayObserver {
        constructor(changeSet, array) {
            this.changeSet = changeSet;
            array.$observer = this;
            this.collection = array;
            this.resetIndexMap();
        }
    };
    ArrayObserver = tslib_1.__decorate([
        collection_observer_1.collectionObserver(9 /* array */)
    ], ArrayObserver);
    exports.ArrayObserver = ArrayObserver;
    function getArrayObserver(changeSet, array) {
        return array.$observer || new ArrayObserver(changeSet, array);
    }
    exports.getArrayObserver = getArrayObserver;
});
//# sourceMappingURL=array-observer.js.map