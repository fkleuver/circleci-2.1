import { Registration, DI, PLATFORM, Reporter, inject, all, IContainer } from '@au-test/kernel';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function bindingBehavior(nameOrSource) {
    return function (target) {
        return BindingBehaviorResource.define(nameOrSource, target);
    };
}
const BindingBehaviorResource = {
    name: 'binding-behavior',
    keyFrom(name) {
        return `${this.name}:${name}`;
    },
    isType(type) {
        return type.kind === this;
    },
    define(nameOrSource, ctor) {
        const Type = ctor;
        const description = typeof nameOrSource === 'string'
            ? { name: nameOrSource }
            : nameOrSource;
        Type.kind = BindingBehaviorResource;
        Type.description = description;
        Type.register = register;
        return Type;
    }
};
function register(container) {
    container.register(Registration.singleton(BindingBehaviorResource.keyFrom(this.description.name), this));
}

var BindingFlags;
(function (BindingFlags) {
    BindingFlags[BindingFlags["none"] = 0] = "none";
    BindingFlags[BindingFlags["mustEvaluate"] = 1073741824] = "mustEvaluate";
    BindingFlags[BindingFlags["mutation"] = 3] = "mutation";
    BindingFlags[BindingFlags["isCollectionMutation"] = 1] = "isCollectionMutation";
    BindingFlags[BindingFlags["isInstanceMutation"] = 2] = "isInstanceMutation";
    BindingFlags[BindingFlags["update"] = 28] = "update";
    BindingFlags[BindingFlags["updateTargetObserver"] = 4] = "updateTargetObserver";
    BindingFlags[BindingFlags["updateTargetInstance"] = 8] = "updateTargetInstance";
    BindingFlags[BindingFlags["updateSourceExpression"] = 16] = "updateSourceExpression";
    BindingFlags[BindingFlags["from"] = 8160] = "from";
    BindingFlags[BindingFlags["fromFlushChanges"] = 32] = "fromFlushChanges";
    BindingFlags[BindingFlags["fromStartTask"] = 64] = "fromStartTask";
    BindingFlags[BindingFlags["fromStopTask"] = 128] = "fromStopTask";
    BindingFlags[BindingFlags["fromBind"] = 256] = "fromBind";
    BindingFlags[BindingFlags["fromUnbind"] = 512] = "fromUnbind";
    BindingFlags[BindingFlags["fromDOMEvent"] = 1024] = "fromDOMEvent";
    BindingFlags[BindingFlags["fromObserverSetter"] = 2048] = "fromObserverSetter";
    BindingFlags[BindingFlags["fromBindableHandler"] = 4096] = "fromBindableHandler";
})(BindingFlags || (BindingFlags = {}));

/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
var MutationKind;
(function (MutationKind) {
    MutationKind[MutationKind["instance"] = 1] = "instance";
    MutationKind[MutationKind["collection"] = 2] = "collection";
})(MutationKind || (MutationKind = {}));

function subscriberCollection(mutationKind) {
    return function (target) {
        const proto = target.prototype;
        proto._subscriberFlags = 0 /* None */;
        proto._subscriber0 = null;
        proto._subscriber1 = null;
        proto._subscriber2 = null;
        proto._subscribersRest = null;
        proto.addSubscriber = addSubscriber;
        proto.removeSubscriber = removeSubscriber;
        proto.hasSubscriber = hasSubscriber;
        proto.hasSubscribers = hasSubscribers;
        proto.callSubscribers = (mutationKind === MutationKind.instance ? callPropertySubscribers : callCollectionSubscribers);
    };
}
function addSubscriber(subscriber) {
    if (this.hasSubscriber(subscriber)) {
        return false;
    }
    const subscriberFlags = this._subscriberFlags;
    if (!(subscriberFlags & 1 /* Subscriber0 */)) {
        this._subscriber0 = subscriber;
        this._subscriberFlags |= 1 /* Subscriber0 */;
        return true;
    }
    if (!(subscriberFlags & 2 /* Subscriber1 */)) {
        this._subscriber1 = subscriber;
        this._subscriberFlags |= 2 /* Subscriber1 */;
        return true;
    }
    if (!(subscriberFlags & 4 /* Subscriber2 */)) {
        this._subscriber2 = subscriber;
        this._subscriberFlags |= 4 /* Subscriber2 */;
        return true;
    }
    if (!(subscriberFlags & 8 /* SubscribersRest */)) {
        this._subscribersRest = [subscriber];
        this._subscriberFlags |= 8 /* SubscribersRest */;
        return true;
    }
    this._subscribersRest.push(subscriber);
    return true;
}
function removeSubscriber(subscriber) {
    const subscriberFlags = this._subscriberFlags;
    if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
        this._subscriber0 = null;
        this._subscriberFlags &= ~1 /* Subscriber0 */;
        return true;
    }
    if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
        this._subscriber1 = null;
        this._subscriberFlags &= ~2 /* Subscriber1 */;
        return true;
    }
    if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
        this._subscriber2 = null;
        this._subscriberFlags &= ~4 /* Subscriber2 */;
        return true;
    }
    if (subscriberFlags & 8 /* SubscribersRest */) {
        const subscribers = this._subscribersRest;
        for (let i = 0, ii = subscribers.length; i < ii; ++i) {
            if (subscribers[i] === subscriber) {
                subscribers.splice(i, 1);
                if (ii === 1) {
                    this._subscriberFlags &= ~8 /* SubscribersRest */;
                }
                return true;
            }
        }
    }
    return false;
}
function callPropertySubscribers(newValue, previousValue, flags) {
    /**
     * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
     * callSubscribers invocation, so we're caching them all before invoking any.
     * Subscribers added during this invocation are not invoked (and they shouldn't be).
     * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
     * however this is accounted for via $isBound and similar flags on the subscriber objects)
     */
    const subscriber0 = this._subscriber0;
    const subscriber1 = this._subscriber1;
    const subscriber2 = this._subscriber2;
    let subscribers = this._subscribersRest;
    if (subscribers !== null) {
        subscribers = subscribers.slice();
    }
    if (subscriber0 !== null) {
        subscriber0.handleChange(newValue, previousValue, flags);
    }
    if (subscriber1 !== null) {
        subscriber1.handleChange(newValue, previousValue, flags);
    }
    if (subscriber2 !== null) {
        subscriber2.handleChange(newValue, previousValue, flags);
    }
    const length = subscribers && subscribers.length || 0;
    if (length > 0) {
        for (let i = 0; i < length; ++i) {
            const subscriber = subscribers[i];
            if (subscriber !== null) {
                subscriber.handleChange(newValue, previousValue, flags);
            }
        }
    }
}
function callCollectionSubscribers(origin, args, flags) {
    const subscriber0 = this._subscriber0;
    const subscriber1 = this._subscriber1;
    const subscriber2 = this._subscriber2;
    let subscribers = this._subscribersRest;
    if (subscribers !== null) {
        subscribers = subscribers.slice();
    }
    if (subscriber0 !== null) {
        subscriber0.handleChange(origin, args, flags);
    }
    if (subscriber1 !== null) {
        subscriber1.handleChange(origin, args, flags);
    }
    if (subscriber2 !== null) {
        subscriber2.handleChange(origin, args, flags);
    }
    const length = subscribers && subscribers.length || 0;
    if (length > 0) {
        for (let i = 0; i < length; ++i) {
            const subscriber = subscribers[i];
            if (subscriber !== null) {
                subscriber.handleChange(origin, args, flags);
            }
        }
    }
    this.changeSet.add(this);
}
function hasSubscribers() {
    return this._subscriberFlags !== 0 /* None */;
}
function hasSubscriber(subscriber) {
    // Flags here is just a perf tweak
    // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
    // and minor slow-down when it does, and the former is more common than the latter.
    const subscriberFlags = this._subscriberFlags;
    if ((subscriberFlags & 1 /* Subscriber0 */) && this._subscriber0 === subscriber) {
        return true;
    }
    if ((subscriberFlags & 2 /* Subscriber1 */) && this._subscriber1 === subscriber) {
        return true;
    }
    if ((subscriberFlags & 4 /* Subscriber2 */) && this._subscriber2 === subscriber) {
        return true;
    }
    if (subscriberFlags & 8 /* SubscribersRest */) {
        // no need to check length; if the flag is set, there's always at least one
        const subscribers = this._subscribersRest;
        for (let i = 0, ii = subscribers.length; i < ii; ++i) {
            if (subscribers[i] === subscriber) {
                return true;
            }
        }
    }
    return false;
}
function batchedSubscriberCollection() {
    return function (target) {
        const proto = target.prototype;
        proto._batchedSubscriberFlags = 0 /* None */;
        proto._batchedSubscriber0 = null;
        proto._batchedSubscriber1 = null;
        proto._batchedSubscriber2 = null;
        proto._batchedSubscribersRest = null;
        proto.addBatchedSubscriber = addBatchedSubscriber;
        proto.removeBatchedSubscriber = removeBatchedSubscriber;
        proto.hasBatchedSubscriber = hasBatchedSubscriber;
        proto.hasBatchedSubscribers = hasBatchedSubscribers;
        proto.callBatchedSubscribers = callBatchedCollectionSubscribers;
    };
}
function addBatchedSubscriber(subscriber) {
    if (this.hasBatchedSubscriber(subscriber)) {
        return false;
    }
    const subscriberFlags = this._batchedSubscriberFlags;
    if (!(subscriberFlags & 1 /* Subscriber0 */)) {
        this._batchedSubscriber0 = subscriber;
        this._batchedSubscriberFlags |= 1 /* Subscriber0 */;
        return true;
    }
    if (!(subscriberFlags & 2 /* Subscriber1 */)) {
        this._batchedSubscriber1 = subscriber;
        this._batchedSubscriberFlags |= 2 /* Subscriber1 */;
        return true;
    }
    if (!(subscriberFlags & 4 /* Subscriber2 */)) {
        this._batchedSubscriber2 = subscriber;
        this._batchedSubscriberFlags |= 4 /* Subscriber2 */;
        return true;
    }
    if (!(subscriberFlags & 8 /* SubscribersRest */)) {
        this._batchedSubscribersRest = [subscriber];
        this._batchedSubscriberFlags |= 8 /* SubscribersRest */;
        return true;
    }
    this._batchedSubscribersRest.push(subscriber);
    return true;
}
function removeBatchedSubscriber(subscriber) {
    const subscriberFlags = this._batchedSubscriberFlags;
    if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
        this._batchedSubscriber0 = null;
        this._batchedSubscriberFlags &= ~1 /* Subscriber0 */;
        return true;
    }
    if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
        this._batchedSubscriber1 = null;
        this._batchedSubscriberFlags &= ~2 /* Subscriber1 */;
        return true;
    }
    if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
        this._batchedSubscriber2 = null;
        this._batchedSubscriberFlags &= ~4 /* Subscriber2 */;
        return true;
    }
    if (subscriberFlags & 8 /* SubscribersRest */) {
        const subscribers = this._batchedSubscribersRest;
        for (let i = 0, ii = subscribers.length; i < ii; ++i) {
            if (subscribers[i] === subscriber) {
                subscribers.splice(i, 1);
                if (ii === 1) {
                    this._batchedSubscriberFlags &= ~8 /* SubscribersRest */;
                }
                return true;
            }
        }
    }
    return false;
}
function callBatchedCollectionSubscribers(indexMap) {
    const subscriber0 = this._batchedSubscriber0;
    const subscriber1 = this._batchedSubscriber1;
    const subscriber2 = this._batchedSubscriber2;
    let subscribers = this._batchedSubscribersRest;
    if (subscribers !== null) {
        subscribers = subscribers.slice();
    }
    if (subscriber0 !== null) {
        subscriber0.handleBatchedChange(indexMap);
    }
    if (subscriber1 !== null) {
        subscriber1.handleBatchedChange(indexMap);
    }
    if (subscriber2 !== null) {
        subscriber2.handleBatchedChange(indexMap);
    }
    const length = subscribers && subscribers.length || 0;
    if (length > 0) {
        for (let i = 0; i < length; ++i) {
            const subscriber = subscribers[i];
            if (subscriber !== null) {
                subscriber.handleBatchedChange(indexMap);
            }
        }
    }
}
function hasBatchedSubscribers() {
    return this._batchedSubscriberFlags !== 0 /* None */;
}
function hasBatchedSubscriber(subscriber) {
    // Flags here is just a perf tweak
    // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
    // and minor slow-down when it does, and the former is more common than the latter.
    const subscriberFlags = this._batchedSubscriberFlags;
    if ((subscriberFlags & 1 /* Subscriber0 */) && this._batchedSubscriber0 === subscriber) {
        return true;
    }
    if ((subscriberFlags & 2 /* Subscriber1 */) && this._batchedSubscriber1 === subscriber) {
        return true;
    }
    if ((subscriberFlags & 4 /* Subscriber2 */) && this._batchedSubscriber2 === subscriber) {
        return true;
    }
    if (subscriberFlags & 8 /* SubscribersRest */) {
        // no need to check length; if the flag is set, there's always at least one
        const subscribers = this._batchedSubscribersRest;
        for (let i = 0, ii = subscribers.length; i < ii; ++i) {
            if (subscribers[i] === subscriber) {
                return true;
            }
        }
    }
    return false;
}

function setValue(newValue, flags) {
    const currentValue = this.currentValue;
    newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
    if (currentValue !== newValue) {
        this.currentValue = newValue;
        if (flags & BindingFlags.fromFlushChanges) {
            this.setValueCore(newValue, flags);
        }
        else {
            this.currentFlags = flags;
            return this.changeSet.add(this);
        }
    }
    return Promise.resolve();
}
const defaultFlushChangesFlags = BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance;
function flushChanges() {
    const currentValue = this.currentValue;
    // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
    // in which case the target doesn't need to be updated
    if (this.oldValue !== currentValue) {
        this.setValueCore(currentValue, this.currentFlags | defaultFlushChangesFlags);
        this.oldValue = this.currentValue;
    }
}
function dispose() {
    this.currentValue = null;
    this.oldValue = null;
    this.defaultValue = null;
    this.obj = null;
    this.propertyKey = '';
    this.changeSet = null;
}
function targetObserver(defaultValue = null) {
    return function (target) {
        subscriberCollection(MutationKind.instance)(target);
        const proto = target.prototype;
        proto.currentValue = defaultValue;
        proto.oldValue = defaultValue;
        proto.defaultValue = defaultValue;
        proto.obj = null;
        proto.propertyKey = '';
        proto.setValue = proto.setValue || setValue;
        proto.flushChanges = proto.flushChanges || flushChanges;
        proto.dispose = proto.dispose || dispose;
        proto.changeSet = null;
    };
}

function flushChanges$1() {
    this.callBatchedSubscribers(this.indexMap);
    this.resetIndexMap();
}
function dispose$1() {
    this.collection.$observer = undefined;
    this.collection = null;
    this.indexMap = null;
}
function resetIndexMapIndexed() {
    const len = this.collection.length;
    const indexMap = (this.indexMap = Array(len));
    let i = 0;
    while (i < len) {
        indexMap[i] = i++;
    }
    indexMap.deletedItems = [];
}
function resetIndexMapKeyed() {
    const len = this.collection.size;
    const indexMap = (this.indexMap = Array(len));
    let i = 0;
    while (i < len) {
        indexMap[i] = i++;
    }
    indexMap.deletedItems = [];
}
function getLengthObserver() {
    return this.lengthObserver || (this.lengthObserver = new CollectionLengthObserver(this, this.lengthPropertyName));
}
function collectionObserver(kind) {
    return function (target) {
        subscriberCollection(MutationKind.collection)(target);
        batchedSubscriberCollection()(target);
        const proto = target.prototype;
        proto.collection = null;
        proto.indexMap = null;
        proto.hasChanges = false;
        proto.lengthPropertyName = kind & 8 /* indexed */ ? 'length' : 'size';
        proto.collectionKind = kind;
        proto.resetIndexMap = kind & 8 /* indexed */ ? resetIndexMapIndexed : resetIndexMapKeyed;
        proto.flushChanges = flushChanges$1;
        proto.dispose = dispose$1;
        proto.getLengthObserver = getLengthObserver;
        proto.subscribe = proto.subscribe || proto.addSubscriber;
        proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
        proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
        proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
    };
}
let CollectionLengthObserver = class CollectionLengthObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = obj[propertyKey];
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValueCore(newValue) {
        this.obj[this.propertyKey] = newValue;
    }
    subscribe(subscriber) {
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
    }
};
CollectionLengthObserver = __decorate([
    targetObserver()
], CollectionLengthObserver);

const proto = Array.prototype;
const nativePush = proto.push; // TODO: probably want to make these internal again
const nativeUnshift = proto.unshift;
const nativePop = proto.pop;
const nativeShift = proto.shift;
const nativeSplice = proto.splice;
const nativeReverse = proto.reverse;
const nativeSort = proto.sort;
// https://tc39.github.io/ecma262/#sec-array.prototype.push
function observePush() {
    const o = this.$observer;
    if (o === undefined) {
        return nativePush.apply(this, arguments);
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
    o.callSubscribers('push', arguments, BindingFlags.isCollectionMutation);
    return this.length;
}
// https://tc39.github.io/ecma262/#sec-array.prototype.unshift
function observeUnshift() {
    const o = this.$observer;
    if (o === undefined) {
        return nativeUnshift.apply(this, arguments);
    }
    const argCount = arguments.length;
    const inserts = new Array(argCount);
    let i = 0;
    while (i < argCount) {
        inserts[i++] = -2;
    }
    nativeUnshift.apply(o.indexMap, inserts);
    const len = nativeUnshift.apply(this, arguments);
    o.callSubscribers('unshift', arguments, BindingFlags.isCollectionMutation);
    return len;
}
// https://tc39.github.io/ecma262/#sec-array.prototype.pop
function observePop() {
    const o = this.$observer;
    if (o === undefined) {
        return nativePop.call(this);
    }
    const indexMap = o.indexMap;
    const element = nativePop.call(this);
    // only mark indices as deleted if they actually existed in the original array
    const index = indexMap.length - 1;
    if (indexMap[index] > -1) {
        nativePush.call(indexMap.deletedItems, element);
    }
    nativePop.call(indexMap);
    o.callSubscribers('pop', arguments, BindingFlags.isCollectionMutation);
    return element;
}
// https://tc39.github.io/ecma262/#sec-array.prototype.shift
function observeShift() {
    const o = this.$observer;
    if (o === undefined) {
        return nativeShift.call(this);
    }
    const indexMap = o.indexMap;
    const element = nativeShift.call(this);
    // only mark indices as deleted if they actually existed in the original array
    if (indexMap[0] > -1) {
        nativePush.call(indexMap.deletedItems, element);
    }
    nativeShift.call(indexMap);
    o.callSubscribers('shift', arguments, BindingFlags.isCollectionMutation);
    return element;
}
// https://tc39.github.io/ecma262/#sec-array.prototype.splice
function observeSplice(start, deleteCount) {
    const o = this.$observer;
    if (o === undefined) {
        return nativeSplice.apply(this, arguments);
    }
    const indexMap = o.indexMap;
    if (deleteCount > 0) {
        let i = start || 0;
        const to = i + deleteCount;
        while (i < to) {
            if (indexMap[i] > -1) {
                nativePush.call(indexMap.deletedItems, this[i]);
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
        nativeSplice.call(indexMap, start, deleteCount, ...inserts);
    }
    else if (argCount === 2) {
        nativeSplice.call(indexMap, start, deleteCount);
    }
    const deleted = nativeSplice.apply(this, arguments);
    o.callSubscribers('splice', arguments, BindingFlags.isCollectionMutation);
    return deleted;
}
// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
function observeReverse() {
    const o = this.$observer;
    if (o === undefined) {
        return nativeReverse.call(this);
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
    o.callSubscribers('reverse', arguments, BindingFlags.isCollectionMutation);
    return this;
}
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
// https://github.com/v8/v8/blob/master/src/js/array.js
function observeSort(compareFn) {
    const o = this.$observer;
    if (o === undefined) {
        return nativeSort.call(this, compareFn);
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
    o.callSubscribers('sort', arguments, BindingFlags.isCollectionMutation);
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
enableArrayObservation();
function disableArrayObservation() {
    if (proto.push['observing'] === true)
        proto.push = nativePush;
    if (proto.unshift['observing'] === true)
        proto.unshift = nativeUnshift;
    if (proto.pop['observing'] === true)
        proto.pop = nativePop;
    if (proto.shift['observing'] === true)
        proto.shift = nativeShift;
    if (proto.splice['observing'] === true)
        proto.splice = nativeSplice;
    if (proto.reverse['observing'] === true)
        proto.reverse = nativeReverse;
    if (proto.sort['observing'] === true)
        proto.sort = nativeSort;
}
let ArrayObserver = class ArrayObserver {
    constructor(changeSet, array) {
        this.changeSet = changeSet;
        array.$observer = this;
        this.collection = array;
        this.resetIndexMap();
    }
};
ArrayObserver = __decorate([
    collectionObserver(9 /* array */)
], ArrayObserver);
function getArrayObserver(changeSet, array) {
    return array.$observer || new ArrayObserver(changeSet, array);
}

const proto$1 = Set.prototype;
const nativeAdd = proto$1.add; // TODO: probably want to make these internal again
const nativeClear = proto$1.clear;
const nativeDelete = proto$1.delete;
// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap
// https://tc39.github.io/ecma262/#sec-set.prototype.add
function observeAdd(value) {
    const o = this.$observer;
    if (o === undefined) {
        return nativeAdd.call(this, value);
    }
    const oldSize = this.size;
    nativeAdd.call(this, value);
    const newSize = this.size;
    if (newSize === oldSize) {
        return this;
    }
    o.indexMap[oldSize] = -2;
    o.callSubscribers('add', arguments, BindingFlags.isCollectionMutation);
    return this;
}
// https://tc39.github.io/ecma262/#sec-set.prototype.clear
function observeClear() {
    const o = this.$observer;
    if (o === undefined) {
        return nativeClear.call(this);
    }
    const size = this.size;
    if (size > 0) {
        const indexMap = o.indexMap;
        let i = 0;
        for (const entry of this.keys()) {
            if (indexMap[i] > -1) {
                nativePush.call(indexMap.deletedItems, entry);
            }
            i++;
        }
        nativeClear.call(this);
        indexMap.length = 0;
        o.callSubscribers('clear', arguments, BindingFlags.isCollectionMutation);
    }
    return undefined;
}
// https://tc39.github.io/ecma262/#sec-set.prototype.delete
function observeDelete(value) {
    const o = this.$observer;
    if (o === undefined) {
        return nativeDelete.call(this, value);
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
                nativePush.call(indexMap.deletedItems, entry);
            }
            nativeSplice.call(indexMap, i, 1);
            return nativeDelete.call(this, value);
        }
        i++;
    }
    o.callSubscribers('delete', arguments, BindingFlags.isCollectionMutation);
    return false;
}
for (const observe of [observeAdd, observeClear, observeDelete]) {
    Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
function enableSetObservation() {
    if (proto$1.add['observing'] !== true)
        proto$1.add = observeAdd;
    if (proto$1.clear['observing'] !== true)
        proto$1.clear = observeClear;
    if (proto$1.delete['observing'] !== true)
        proto$1.delete = observeDelete;
}
enableSetObservation();
function disableSetObservation() {
    if (proto$1.add['observing'] === true)
        proto$1.add = nativeAdd;
    if (proto$1.clear['observing'] === true)
        proto$1.clear = nativeClear;
    if (proto$1.delete['observing'] === true)
        proto$1.delete = nativeDelete;
}
let SetObserver = class SetObserver {
    constructor(changeSet, set) {
        this.changeSet = changeSet;
        set.$observer = this;
        this.collection = set;
        this.resetIndexMap();
    }
};
SetObserver = __decorate([
    collectionObserver(7 /* set */)
], SetObserver);
function getSetObserver(changeSet, set) {
    return set.$observer || new SetObserver(changeSet, set);
}

const IChangeSet = DI.createInterface()
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
        nativeAdd.call(this, changeTracker);
        return this.flushed;
    }
}

const INode = DI.createInterface().noDefault();
const IRenderLocation = DI.createInterface().noDefault();
/*@internal*/
function createNodeSequenceFromFragment(fragment) {
    return new FragmentNodeSequence(fragment.cloneNode(true));
}
function removeNormal(node) {
    node.remove();
}
function removePolyfilled(node) {
    // not sure if we still actually need this, this used to be an IE9/10 thing
    node.parentNode.removeChild(node);
}
const DOM = {
    createFactoryFromMarkupOrNode(markupOrNode) {
        let template;
        if (markupOrNode instanceof Node) {
            if (markupOrNode.content) {
                template = markupOrNode;
            }
            else {
                template = DOM.createTemplate();
                template.content.appendChild(markupOrNode);
            }
        }
        else {
            template = DOM.createTemplate();
            template.innerHTML = markupOrNode;
        }
        // bind performs a bit better and gives a cleaner closure than an arrow function
        return createNodeSequenceFromFragment.bind(null, template.content);
    },
    createElement(name) {
        return document.createElement(name);
    },
    createText(text) {
        return document.createTextNode(text);
    },
    createNodeObserver(target, callback, options) {
        const observer = new MutationObserver(callback);
        observer.observe(target, options);
        return observer;
    },
    attachShadow(host, options) {
        return host.attachShadow(options);
    },
    /*@internal*/
    createTemplate() {
        return document.createElement('template');
    },
    cloneNode(node, deep) {
        return node.cloneNode(deep !== false); // use true unless the caller explicitly passes in false
    },
    migrateChildNodes(currentParent, newParent) {
        const append = DOM.appendChild;
        while (currentParent.firstChild) {
            append(newParent, currentParent.firstChild);
        }
    },
    isNodeInstance(potentialNode) {
        return potentialNode instanceof Node;
    },
    isElementNodeType(node) {
        return node.nodeType === 1;
    },
    isTextNodeType(node) {
        return node.nodeType === 3;
    },
    remove(node) {
        // only check the prototype once and then permanently set a polyfilled or non-polyfilled call to save a few cycles
        if (Element.prototype.remove === undefined) {
            (DOM.remove = removePolyfilled)(node);
        }
        else {
            (DOM.remove = removeNormal)(node);
        }
    },
    replaceNode(newChild, oldChild) {
        if (oldChild.parentNode) {
            oldChild.parentNode.replaceChild(newChild, oldChild);
        }
    },
    appendChild(parent, child) {
        parent.appendChild(child);
    },
    insertBefore(nodeToInsert, referenceNode) {
        referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
    },
    getAttribute(node, name) {
        return node.getAttribute(name);
    },
    setAttribute(node, name, value) {
        node.setAttribute(name, value);
    },
    removeAttribute(node, name) {
        node.removeAttribute(name);
    },
    hasClass(node, className) {
        return node.classList.contains(className);
    },
    addClass(node, className) {
        node.classList.add(className);
    },
    removeClass(node, className) {
        node.classList.remove(className);
    },
    addEventListener(eventName, subscriber, publisher, options) {
        (publisher || document).addEventListener(eventName, subscriber, options);
    },
    removeEventListener(eventName, subscriber, publisher, options) {
        (publisher || document).removeEventListener(eventName, subscriber, options);
    },
    isAllWhitespace(node) {
        if (node.auInterpolationTarget === true) {
            return false;
        }
        const text = node.textContent;
        const len = text.length;
        let i = 0;
        // for perf benchmark of this compared to the regex method: http://jsben.ch/p70q2 (also a general case against using regex)
        while (i < len) {
            // charCodes 0-0x20(32) can all be considered whitespace (non-whitespace chars in this range don't have a visual representation anyway)
            if (text.charCodeAt(i) > 0x20) {
                return false;
            }
            i++;
        }
        return true;
    },
    treatAsNonWhitespace(node) {
        // see isAllWhitespace above
        node.auInterpolationTarget = true;
    },
    convertToRenderLocation(node) {
        const location = document.createComment('au-loc');
        // let this throw if node does not have a parent
        node.parentNode.replaceChild(location, node);
        return location;
    },
    registerElementResolver(container, resolver) {
        container.registerResolver(INode, resolver);
        container.registerResolver(Element, resolver);
        container.registerResolver(HTMLElement, resolver);
        container.registerResolver(SVGElement, resolver);
    }
};
// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence = {
    firstChild: null,
    lastChild: null,
    childNodes: PLATFORM.emptyArray,
    findTargets() { return PLATFORM.emptyArray; },
    insertBefore(refNode) { },
    appendTo(parent) { },
    remove() { }
};
const NodeSequence = {
    empty: emptySequence
};
// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/*@internal*/
class FragmentNodeSequence {
    constructor(fragment) {
        this.fragment = fragment;
        this.firstChild = fragment.firstChild;
        this.lastChild = fragment.lastChild;
        this.childNodes = PLATFORM.toArray(fragment.childNodes);
    }
    findTargets() {
        return this.fragment.querySelectorAll('.au');
    }
    insertBefore(refNode) {
        refNode.parentNode.insertBefore(this.fragment, refNode);
    }
    appendTo(parent) {
        parent.appendChild(this.fragment);
    }
    remove() {
        const fragment = this.fragment;
        let current = this.firstChild;
        if (current.parentNode !== fragment) {
            // this bind is a small perf tweak to minimize member accessors
            const append = fragment.appendChild.bind(fragment);
            const end = this.lastChild;
            let next;
            while (current) {
                next = current.nextSibling;
                append(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
    }
}

// tslint:disable-next-line:no-http-string
const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';
let XLinkAttributeAccessor = class XLinkAttributeAccessor {
    // xlink namespaced attributes require getAttributeNS/setAttributeNS
    // (even though the NS version doesn't work for other namespaces
    // in html5 documents)
    // Using very HTML-specific code here since this isn't likely to get
    // called unless operating against a real HTML element.
    constructor(changeSet, obj, propertyKey, attributeName) {
        this.changeSet = changeSet;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.attributeName = attributeName;
        this.oldValue = this.currentValue = this.getValue();
    }
    getValue() {
        return this.obj.getAttributeNS(xlinkAttributeNS, this.attributeName);
    }
    setValueCore(newValue) {
        this.obj.setAttributeNS(xlinkAttributeNS, this.attributeName, newValue);
    }
};
XLinkAttributeAccessor = __decorate([
    targetObserver('')
], XLinkAttributeAccessor);
XLinkAttributeAccessor.prototype.attributeName = '';
let DataAttributeAccessor = class DataAttributeAccessor {
    constructor(changeSet, obj, propertyKey) {
        this.changeSet = changeSet;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.oldValue = this.currentValue = this.getValue();
    }
    getValue() {
        return DOM.getAttribute(this.obj, this.propertyKey);
    }
    setValueCore(newValue) {
        if (newValue === null) {
            DOM.removeAttribute(this.obj, this.propertyKey);
        }
        else {
            DOM.setAttribute(this.obj, this.propertyKey, newValue);
        }
    }
};
DataAttributeAccessor = __decorate([
    targetObserver()
], DataAttributeAccessor);
let StyleAttributeAccessor = class StyleAttributeAccessor {
    constructor(changeSet, obj) {
        this.changeSet = changeSet;
        this.obj = obj;
        this.oldValue = this.currentValue = obj.style.cssText;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    // tslint:disable-next-line:function-name
    _setProperty(style, value) {
        let priority = '';
        if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
            priority = 'important';
            value = value.replace('!important', '');
        }
        this.obj.style.setProperty(style, value, priority);
    }
    setValueCore(newValue) {
        const styles = this.styles || {};
        let style;
        let version = this.version;
        if (newValue !== null) {
            if (newValue instanceof Object) {
                let value;
                for (style in newValue) {
                    if (newValue.hasOwnProperty(style)) {
                        value = newValue[style];
                        style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
                        styles[style] = version;
                        this._setProperty(style, value);
                    }
                }
            }
            else if (newValue.length) {
                const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
                let pair;
                while ((pair = rx.exec(newValue)) !== null) {
                    style = pair[1];
                    if (!style) {
                        continue;
                    }
                    styles[style] = version;
                    this._setProperty(style, pair[2]);
                }
            }
        }
        this.styles = styles;
        this.version += 1;
        if (version === 0) {
            return;
        }
        version -= 1;
        for (style in styles) {
            if (!styles.hasOwnProperty(style) || styles[style] !== version) {
                continue;
            }
            this.obj.style.removeProperty(style);
        }
    }
};
StyleAttributeAccessor = __decorate([
    targetObserver()
], StyleAttributeAccessor);
StyleAttributeAccessor.prototype.styles = null;
StyleAttributeAccessor.prototype.version = 0;
StyleAttributeAccessor.prototype.propertyKey = 'style';
let ClassAttributeAccessor = class ClassAttributeAccessor {
    constructor(changeSet, obj) {
        this.changeSet = changeSet;
        this.obj = obj;
    }
    getValue() {
        return this.currentValue;
    }
    setValueCore(newValue) {
        const addClass = DOM.addClass;
        const removeClass = DOM.removeClass;
        const nameIndex = this.nameIndex || {};
        let version = this.version;
        let names;
        let name;
        // Add the classes, tracking the version at which they were added.
        if (newValue.length) {
            const node = this.obj;
            names = newValue.split(/\s+/);
            for (let i = 0, length = names.length; i < length; i++) {
                name = names[i];
                if (!name.length) {
                    continue;
                }
                nameIndex[name] = version;
                addClass(node, name);
            }
        }
        // Update state variables.
        this.nameIndex = nameIndex;
        this.version += 1;
        // First call to setValue?  We're done.
        if (version === 0) {
            return;
        }
        // Remove classes from previous version.
        version -= 1;
        for (name in nameIndex) {
            if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
                continue;
            }
            // TODO: this has the side-effect that classes already present which are added again,
            // will be removed if they're not present in the next update.
            // Better would be do have some configurability for this behavior, allowing the user to
            // decide whether initial classes always need to be kept, always removed, or something in between
            removeClass(this.obj, name);
        }
    }
};
ClassAttributeAccessor = __decorate([
    targetObserver('')
], ClassAttributeAccessor);
ClassAttributeAccessor.prototype.doNotCache = true;
ClassAttributeAccessor.prototype.version = 0;
ClassAttributeAccessor.prototype.nameIndex = null;
let ElementPropertyAccessor = class ElementPropertyAccessor {
    constructor(changeSet, obj, propertyKey) {
        this.changeSet = changeSet;
        this.obj = obj;
        this.propertyKey = propertyKey;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValueCore(value) {
        this.obj[this.propertyKey] = value;
    }
};
ElementPropertyAccessor = __decorate([
    targetObserver('')
], ElementPropertyAccessor);
class PropertyAccessor {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(value) {
        this.obj[this.propertyKey] = value;
    }
}

let AttrBindingBehavior = class AttrBindingBehavior {
    bind(flags, scope, binding) {
        binding.targetObserver = new DataAttributeAccessor(binding.locator.get(IChangeSet), binding.target, binding.targetProperty);
    }
    // tslint:disable-next-line:no-empty
    unbind(flags, scope, binding) { }
};
AttrBindingBehavior = __decorate([
    bindingBehavior('attr')
], AttrBindingBehavior);

/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
var BindingMode;
(function (BindingMode) {
    BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
    BindingMode[BindingMode["toView"] = 2] = "toView";
    BindingMode[BindingMode["fromView"] = 4] = "fromView";
    BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
    BindingMode[BindingMode["default"] = 8] = "default";
})(BindingMode || (BindingMode = {}));

const { oneTime, toView, fromView, twoWay } = BindingMode;
class BindingModeBehavior {
    constructor(mode) {
        this.mode = mode;
    }
    bind(flags, scope, binding) {
        binding.originalMode = binding.mode;
        binding.mode = this.mode;
    }
    unbind(flags, scope, binding) {
        binding.mode = binding.originalMode;
        binding.originalMode = null;
    }
}
let OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(oneTime);
    }
};
OneTimeBindingBehavior = __decorate([
    bindingBehavior('oneTime')
], OneTimeBindingBehavior);
let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(toView);
    }
};
ToViewBindingBehavior = __decorate([
    bindingBehavior('toView')
], ToViewBindingBehavior);
let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(fromView);
    }
};
FromViewBindingBehavior = __decorate([
    bindingBehavior('fromView')
], FromViewBindingBehavior);
let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(twoWay);
    }
};
TwoWayBindingBehavior = __decorate([
    bindingBehavior('twoWay')
], TwoWayBindingBehavior);

const defineProperty = Reflect.defineProperty;
// note: we're reusing the same object for setting all descriptors, just changing some properties as needed
//   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
// see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
const observedPropertyDescriptor = {
    get: undefined,
    set: undefined,
    enumerable: true,
    configurable: true
};
function subscribe(subscriber) {
    if (this.observing === false) {
        this.observing = true;
        const { obj, propertyKey } = this;
        this.currentValue = obj[propertyKey];
        observedPropertyDescriptor.get = () => this.getValue();
        observedPropertyDescriptor.set = value => this.setValue(value, BindingFlags.updateTargetInstance);
        if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
            Reporter.write(1, propertyKey, obj);
        }
    }
    this.addSubscriber(subscriber);
}
function dispose$2() {
    delete this.obj[this.propertyKey];
    this.obj = null;
    this.propertyKey = null;
    this.currentValue = null;
}
function propertyObserver() {
    return function (target) {
        subscriberCollection(MutationKind.instance)(target);
        const proto = target.prototype;
        proto.observing = false;
        proto.obj = null;
        proto.propertyKey = null;
        // Note: this will generate some "false positive" changes when setting a target undefined from a source undefined,
        // but those aren't harmful because the changes won't be propagated through to subscribers during $bind anyway.
        // It will, however, solve some "false negative" changes when the source value is undefined but the target value is not;
        // in such cases, this.currentValue in the observer being undefined will block the change from propagating to the target.
        // This is likely not working correctly in vCurrent either.
        proto.currentValue = Symbol();
        proto.subscribe = proto.subscribe || subscribe;
        proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
        proto.dispose = proto.dispose || dispose$2;
    };
}

const noop = PLATFORM.noop;
// note: string.length is the only property of any primitive that is not a function,
// so we can hardwire it to that and simply return undefined for anything else
// note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
class PrimitiveObserver {
    constructor(obj, propertyKey) {
        this.doNotCache = true;
        // we don't need to store propertyName because only 'length' can return a useful value
        if (propertyKey === 'length') {
            // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
            this.obj = obj;
            this.getValue = this.getStringLength;
        }
        else {
            this.getValue = this.returnUndefined;
        }
    }
    getStringLength() {
        return this.obj.length;
    }
    returnUndefined() {
        return undefined;
    }
}
PrimitiveObserver.prototype.setValue = noop;
PrimitiveObserver.prototype.subscribe = noop;
PrimitiveObserver.prototype.unsubscribe = noop;
PrimitiveObserver.prototype.dispose = noop;
let SetterObserver = class SetterObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        const currentValue = this.currentValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if (!(flags & BindingFlags.fromBind)) {
                this.callSubscribers(newValue, currentValue, flags);
            }
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.currentValue.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
            if (!this.observing) {
                this.obj[this.propertyKey] = newValue;
            }
        }
    }
};
SetterObserver = __decorate([
    propertyObserver()
], SetterObserver);
let Observer = class Observer {
    constructor(instance, propertyName, callbackName) {
        this.obj = instance;
        this.propertyKey = propertyName;
        this.currentValue = instance[propertyName];
        this.callback = callbackName in instance
            ? instance[callbackName].bind(instance)
            : noop;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        const currentValue = this.currentValue;
        if (currentValue !== newValue) {
            this.currentValue = newValue;
            if (!(flags & BindingFlags.fromBind)) {
                const coercedValue = this.callback(newValue, currentValue);
                if (coercedValue !== undefined) {
                    this.currentValue = newValue = coercedValue;
                }
                this.callSubscribers(newValue, currentValue, flags);
            }
        }
    }
};
Observer = __decorate([
    propertyObserver()
], Observer);

/*@internal*/
class InternalObserversLookup {
    getOrCreate(obj, key) {
        let observer = this[key];
        if (observer === undefined) {
            observer = this[key] = new SetterObserver(obj, key);
        }
        return observer;
    }
}
class BindingContext {
    constructor(keyOrObj, value) {
        this.$synthetic = true;
        if (keyOrObj !== undefined) {
            if (value !== undefined) {
                // if value is defined then it's just a property and a value to initialize with
                // tslint:disable-next-line:no-any
                this[keyOrObj] = value;
            }
            else {
                // can either be some random object or another bindingContext to clone from
                for (const prop in keyOrObj) {
                    if (keyOrObj.hasOwnProperty(prop)) {
                        this[prop] = keyOrObj[prop];
                    }
                }
            }
        }
    }
    static create(keyOrObj, value) {
        return new BindingContext(keyOrObj, value);
    }
    // tslint:disable-next-line:no-reserved-keywords
    static get(scope, name, ancestor) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */);
        }
        let overrideContext = scope.overrideContext;
        if (ancestor > 0) {
            // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
            while (ancestor > 0) {
                if (overrideContext.parentOverrideContext === null) {
                    return undefined;
                }
                ancestor--;
                overrideContext = overrideContext.parentOverrideContext;
            }
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // traverse the context and it's ancestors, searching for a context that has the name.
        while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
            overrideContext = overrideContext.parentOverrideContext;
        }
        if (overrideContext) {
            // we located a context with the property.  return it.
            return name in overrideContext ? overrideContext : overrideContext.bindingContext;
        }
        // the name wasn't found.  return the root binding context.
        return scope.bindingContext || scope.overrideContext;
    }
    getObservers() {
        let observers = this.$observers;
        if (observers === undefined) {
            this.$observers = observers = new InternalObserversLookup();
        }
        return observers;
    }
}
class Scope {
    constructor(bindingContext, overrideContext) {
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
    }
    static create(bc, oc) {
        return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
    }
    static fromOverride(oc) {
        if (oc === null || oc === undefined) {
            throw Reporter.error(252 /* NilOverrideContext */);
        }
        return new Scope(oc.bindingContext, oc);
    }
    static fromParent(ps, bc) {
        if (ps === null || ps === undefined) {
            throw Reporter.error(253 /* NilParentScope */);
        }
        return new Scope(bc, OverrideContext.create(bc, ps.overrideContext));
    }
}
class OverrideContext {
    constructor(bindingContext, parentOverrideContext) {
        this.bindingContext = bindingContext;
        this.parentOverrideContext = parentOverrideContext;
        this.$synthetic = true;
    }
    static create(bc, poc) {
        return new OverrideContext(bc, poc === undefined ? null : poc);
    }
    getObservers() {
        let observers = this.$observers;
        if (observers === undefined) {
            this.$observers = observers = new InternalObserversLookup();
        }
        return observers;
    }
}

const ISignaler = DI.createInterface().withDefault(x => x.singleton(Signaler));
/*@internal*/
class Signaler {
    constructor() {
        this.signals = Object.create(null);
    }
    dispatchSignal(name, flags) {
        const listeners = this.signals[name];
        if (listeners === undefined) {
            return;
        }
        for (const listener of listeners.keys()) {
            listener.handleChange(undefined, undefined, flags | BindingFlags.updateTargetInstance);
        }
    }
    addSignalListener(name, listener) {
        const signals = this.signals;
        const listeners = signals[name];
        if (listeners === undefined) {
            signals[name] = new Set([listener]);
        }
        else {
            listeners.add(listener);
        }
    }
    removeSignalListener(name, listener) {
        const listeners = this.signals[name];
        if (listeners) {
            listeners.delete(listener);
        }
    }
}

function valueConverter(nameOrSource) {
    return function (target) {
        return ValueConverterResource.define(nameOrSource, target);
    };
}
const ValueConverterResource = {
    name: 'value-converter',
    keyFrom(name) {
        return `${this.name}:${name}`;
    },
    isType(type) {
        return type.kind === this;
    },
    define(nameOrSource, ctor) {
        const Type = ctor;
        const description = typeof nameOrSource === 'string'
            ? { name: nameOrSource }
            : nameOrSource;
        Type.kind = ValueConverterResource;
        Type.description = description;
        Type.register = register$1;
        return Type;
    }
};
function register$1(container) {
    container.register(Registration.singleton(ValueConverterResource.keyFrom(this.description.name), this));
}

function connects(expr) {
    return (expr.$kind & 32 /* Connects */) === 32 /* Connects */;
}
function observes(expr) {
    return (expr.$kind & 64 /* Observes */) === 64 /* Observes */;
}
function callsFunction(expr) {
    return (expr.$kind & 128 /* CallsFunction */) === 128 /* CallsFunction */;
}
function hasAncestor(expr) {
    return (expr.$kind & 256 /* HasAncestor */) === 256 /* HasAncestor */;
}
function isAssignable(expr) {
    return (expr.$kind & 8192 /* IsAssignable */) === 8192 /* IsAssignable */;
}
function isLeftHandSide(expr) {
    return (expr.$kind & 1024 /* IsLeftHandSide */) === 1024 /* IsLeftHandSide */;
}
function isPrimary(expr) {
    return (expr.$kind & 512 /* IsPrimary */) === 512 /* IsPrimary */;
}
function isResource(expr) {
    return (expr.$kind & 32768 /* IsResource */) === 32768 /* IsResource */;
}
function hasBind(expr) {
    return (expr.$kind & 2048 /* HasBind */) === 2048 /* HasBind */;
}
function hasUnbind(expr) {
    return (expr.$kind & 4096 /* HasUnbind */) === 4096 /* HasUnbind */;
}
function isLiteral(expr) {
    return (expr.$kind & 16384 /* IsLiteral */) === 16384 /* IsLiteral */;
}
function arePureLiterals(expressions) {
    const len = expressions && expressions.length || 0;
    if (len === 0) {
        return true;
    }
    for (let i = 0; i < len; ++i) {
        if (!isPureLiteral(expressions[i])) {
            return false;
        }
    }
    return true;
}
function isPureLiteral(expr) {
    if (isLiteral(expr)) {
        switch (expr.$kind) {
            case 17955 /* ArrayLiteral */:
                return arePureLiterals(expr.elements);
            case 17956 /* ObjectLiteral */:
                return arePureLiterals(expr.values);
            case 17958 /* Template */:
                return arePureLiterals(expr.expressions);
            case 17925 /* PrimitiveLiteral */:
                return true;
        }
    }
    return false;
}
class BindingBehavior {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.behaviorKey = BindingBehaviorResource.keyFrom(this.name);
        this.expressionHasBind = hasBind(expression);
        this.expressionHasUnbind = hasUnbind(expression);
    }
    evaluate(flags, scope, locator) {
        return this.expression.evaluate(flags, scope, locator);
    }
    assign(flags, scope, locator, value) {
        return this.expression.assign(flags, scope, locator, value);
    }
    connect(flags, scope, binding) {
        this.expression.connect(flags, scope, binding);
    }
    bind(flags, scope, binding) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */, this);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */, this);
        }
        if (!binding) {
            throw Reporter.error(206 /* NoBinding */, this);
        }
        const locator = binding.locator;
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        if (this.expressionHasBind) {
            this.expression.bind(flags, scope, binding);
        }
        const behaviorKey = this.behaviorKey;
        const behavior = locator.get(behaviorKey);
        if (!behavior) {
            throw Reporter.error(203 /* NoBehaviorFound */, this);
        }
        if (binding[behaviorKey] !== undefined) {
            throw Reporter.error(204 /* BehaviorAlreadyApplied */, this);
        }
        binding[behaviorKey] = behavior;
        behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
    }
    unbind(flags, scope, binding) {
        const behaviorKey = this.behaviorKey;
        binding[behaviorKey].unbind(flags, scope, binding);
        binding[behaviorKey] = null;
        if (this.expressionHasUnbind) {
            this.expression.unbind(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitBindingBehavior(this);
    }
}
class ValueConverter {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.converterKey = ValueConverterResource.keyFrom(this.name);
    }
    evaluate(flags, scope, locator) {
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        if ('toView' in converter) {
            const args = this.args;
            const len = args.length;
            const result = Array(len + 1);
            result[0] = this.expression.evaluate(flags, scope, locator);
            for (let i = 0; i < len; ++i) {
                result[i + 1] = args[i].evaluate(flags, scope, locator);
            }
            return converter.toView.apply(converter, result);
        }
        return this.expression.evaluate(flags, scope, locator);
    }
    assign(flags, scope, locator, value) {
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        if ('fromView' in converter) {
            value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
        }
        return this.expression.assign(flags, scope, locator, value);
    }
    connect(flags, scope, binding) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */, this);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */, this);
        }
        if (!binding) {
            throw Reporter.error(206 /* NoBinding */, this);
        }
        const locator = binding.locator;
        if (!locator) {
            throw Reporter.error(202 /* NoLocator */, this);
        }
        this.expression.connect(flags, scope, binding);
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, binding);
        }
        const converter = locator.get(this.converterKey);
        if (!converter) {
            throw Reporter.error(205 /* NoConverterFound */, this);
        }
        const signals = converter.signals;
        if (signals === undefined) {
            return;
        }
        const signaler = locator.get(ISignaler);
        for (let i = 0, ii = signals.length; i < ii; ++i) {
            signaler.addSignalListener(signals[i], binding);
        }
    }
    unbind(flags, scope, binding) {
        const locator = binding.locator;
        const converter = locator.get(this.converterKey);
        const signals = converter.signals;
        if (signals === undefined) {
            return;
        }
        const signaler = locator.get(ISignaler);
        for (let i = 0, ii = signals.length; i < ii; ++i) {
            signaler.removeSignalListener(signals[i], binding);
        }
    }
    accept(visitor) {
        return visitor.visitValueConverter(this);
    }
}
class Assign {
    constructor(target, value) {
        this.target = target;
        this.value = value;
    }
    evaluate(flags, scope, locator) {
        return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
    }
    connect(flags, scope, binding) { }
    assign(flags, scope, locator, value) {
        this.value.assign(flags, scope, locator, value);
        return this.target.assign(flags, scope, locator, value);
    }
    accept(visitor) {
        return visitor.visitAssign(this);
    }
}
class Conditional {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }
    evaluate(flags, scope, locator) {
        return (!!this.condition.evaluate(flags, scope, locator))
            ? this.yes.evaluate(flags, scope, locator)
            : this.no.evaluate(flags, scope, locator);
    }
    connect(flags, scope, binding) {
        const condition = this.condition;
        if (condition.evaluate(flags, scope, null)) {
            this.condition.connect(flags, scope, binding);
            this.yes.connect(flags, scope, binding);
        }
        else {
            this.condition.connect(flags, scope, binding);
            this.no.connect(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitConditional(this);
    }
}
class AccessThis {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator) {
        if (scope === undefined) {
            throw Reporter.error(250 /* UndefinedScope */, this);
        }
        if (scope === null) {
            throw Reporter.error(251 /* NullScope */, this);
        }
        let oc = scope.overrideContext;
        let i = this.ancestor;
        while (i-- && oc) {
            oc = oc.parentOverrideContext;
        }
        return i < 1 && oc ? oc.bindingContext : undefined;
    }
    accept(visitor) {
        return visitor.visitAccessThis(this);
    }
}
AccessThis.$this = new AccessThis(0);
AccessThis.$parent = new AccessThis(1);
class AccessScope {
    constructor(name, ancestor = 0) {
        this.name = name;
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator) {
        const name = this.name;
        return BindingContext.get(scope, name, this.ancestor)[name];
    }
    assign(flags, scope, locator, value) {
        const name = this.name;
        const context = BindingContext.get(scope, name, this.ancestor);
        return context ? (context[name] = value) : undefined;
    }
    connect(flags, scope, binding) {
        const name = this.name;
        const context = BindingContext.get(scope, name, this.ancestor);
        binding.observeProperty(context, name);
    }
    accept(visitor) {
        return visitor.visitAccessScope(this);
    }
}
class AccessMember {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    evaluate(flags, scope, locator) {
        const instance = this.object.evaluate(flags, scope, locator);
        return instance === null || instance === undefined ? instance : instance[this.name];
    }
    assign(flags, scope, locator, value) {
        let instance = this.object.evaluate(flags, scope, locator);
        if (instance === null || typeof instance !== 'object') {
            instance = {};
            this.object.assign(flags, scope, locator, instance);
        }
        instance[this.name] = value;
        return value;
    }
    connect(flags, scope, binding) {
        const obj = this.object.evaluate(flags, scope, null);
        this.object.connect(flags, scope, binding);
        if (obj) {
            binding.observeProperty(obj, this.name);
        }
    }
    accept(visitor) {
        return visitor.visitAccessMember(this);
    }
}
class AccessKeyed {
    constructor(object, key) {
        this.object = object;
        this.key = key;
    }
    evaluate(flags, scope, locator) {
        const instance = this.object.evaluate(flags, scope, locator);
        if (instance === null || instance === undefined) {
            return undefined;
        }
        const key = this.key.evaluate(flags, scope, locator);
        // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
        // and the runtime does this this faster
        // tslint:disable-next-line:no-any
        return instance[key];
    }
    assign(flags, scope, locator, value) {
        const instance = this.object.evaluate(flags, scope, locator);
        const key = this.key.evaluate(flags, scope, locator);
        // tslint:disable-next-line:no-any
        return instance[key] = value;
    }
    connect(flags, scope, binding) {
        const obj = this.object.evaluate(flags, scope, null);
        this.object.connect(flags, scope, binding);
        if (typeof obj === 'object' && obj !== null) {
            this.key.connect(flags, scope, binding);
            const key = this.key.evaluate(flags, scope, null);
            // observe the property represented by the key as long as it's not an array indexer
            // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
            if (!(Array.isArray(obj) && isNumeric(key))) {
                binding.observeProperty(obj, key);
            }
        }
    }
    accept(visitor) {
        return visitor.visitAccessKeyed(this);
    }
}
class CallScope {
    constructor(name, args, ancestor = 0) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
    }
    evaluate(flags, scope, locator) {
        const args = evalList(flags, scope, locator, this.args);
        const context = BindingContext.get(scope, this.name, this.ancestor);
        const func = getFunction(flags, context, this.name);
        if (func) {
            return func.apply(context, args);
        }
        return undefined;
    }
    connect(flags, scope, binding) {
        const args = this.args;
        for (let i = 0, ii = args.length; i < ii; ++i) {
            args[i].connect(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitCallScope(this);
    }
}
class CallMember {
    constructor(object, name, args) {
        this.object = object;
        this.name = name;
        this.args = args;
    }
    evaluate(flags, scope, locator) {
        const instance = this.object.evaluate(flags, scope, locator);
        const args = evalList(flags, scope, locator, this.args);
        const func = getFunction(flags, instance, this.name);
        if (func) {
            return func.apply(instance, args);
        }
        return undefined;
    }
    connect(flags, scope, binding) {
        const obj = this.object.evaluate(flags, scope, null);
        this.object.connect(flags, scope, binding);
        if (getFunction(flags & ~BindingFlags.mustEvaluate, obj, this.name)) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
    }
    accept(visitor) {
        return visitor.visitCallMember(this);
    }
}
class CallFunction {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }
    evaluate(flags, scope, locator) {
        const func = this.func.evaluate(flags, scope, locator); // not sure why this cast is needed..
        if (typeof func === 'function') {
            return func.apply(null, evalList(flags, scope, locator, this.args));
        }
        if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
            return undefined;
        }
        throw Reporter.error(207 /* NotAFunction */, this);
    }
    connect(flags, scope, binding) {
        const func = this.func.evaluate(flags, scope, null);
        this.func.connect(flags, scope, binding);
        if (typeof func === 'function') {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
    }
    accept(visitor) {
        return visitor.visitCallFunction(this);
    }
}
class Binary {
    constructor(operation, left, right) {
        this.operation = operation;
        this.left = left;
        this.right = right;
        // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
        // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
        // work to do; we can do this because the operation can't change after it's parsed
        this.evaluate = this[operation];
    }
    evaluate(flags, scope, locator) {
        throw Reporter.error(208 /* UnknownOperator */, this);
    }
    connect(flags, scope, binding) {
        const left = this.left.evaluate(flags, scope, null);
        this.left.connect(flags, scope, binding);
        if (this.operation === '&&' && !left || this.operation === '||' && left) {
            return;
        }
        this.right.connect(flags, scope, binding);
    }
    ['&&'](f, s, l) {
        return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
    }
    ['||'](f, s, l) {
        return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
    }
    ['=='](f, s, l) {
        // tslint:disable-next-line:triple-equals
        return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
    }
    ['==='](f, s, l) {
        return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
    }
    ['!='](f, s, l) {
        // tslint:disable-next-line:triple-equals
        return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
    }
    ['!=='](f, s, l) {
        return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
    }
    ['instanceof'](f, s, l) {
        const right = this.right.evaluate(f, s, l);
        if (typeof right === 'function') {
            return this.left.evaluate(f, s, l) instanceof right;
        }
        return false;
    }
    ['in'](f, s, l) {
        const right = this.right.evaluate(f, s, l);
        if (right !== null && typeof right === 'object') {
            return this.left.evaluate(f, s, l) in right;
        }
        return false;
    }
    // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
    // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
    // this makes bugs in user code easier to track down for end users
    // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
    ['+'](f, s, l) {
        // tslint:disable-next-line:no-any
        return this.left.evaluate(f, s, l) + this.right.evaluate(f, s, l);
    }
    ['-'](f, s, l) {
        // tslint:disable-next-line:no-any
        return this.left.evaluate(f, s, l) - this.right.evaluate(f, s, l);
    }
    ['*'](f, s, l) {
        // tslint:disable-next-line:no-any
        return this.left.evaluate(f, s, l) * this.right.evaluate(f, s, l);
    }
    ['/'](f, s, l) {
        // tslint:disable-next-line:no-any
        return this.left.evaluate(f, s, l) / this.right.evaluate(f, s, l);
    }
    ['%'](f, s, l) {
        // tslint:disable-next-line:no-any
        return this.left.evaluate(f, s, l) % this.right.evaluate(f, s, l);
    }
    ['<'](f, s, l) {
        return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
    }
    ['>'](f, s, l) {
        return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
    }
    ['<='](f, s, l) {
        return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
    }
    ['>='](f, s, l) {
        return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
    }
    // tslint:disable-next-line:member-ordering
    accept(visitor) {
        return visitor.visitBinary(this);
    }
}
class Unary {
    constructor(operation, expression) {
        this.operation = operation;
        this.expression = expression;
        // see Binary (we're doing the same thing here)
        // tslint:disable-next-line:no-any
        this.evaluate = this[operation];
    }
    evaluate(flags, scope, locator) {
        throw Reporter.error(208 /* UnknownOperator */, this);
    }
    connect(flags, scope, binding) {
        this.expression.connect(flags, scope, binding);
    }
    ['void'](f, s, l) {
        return void this.expression.evaluate(f, s, l);
    }
    ['typeof'](f, s, l) {
        return typeof this.expression.evaluate(f, s, l);
    }
    ['!'](f, s, l) {
        return !this.expression.evaluate(f, s, l);
    }
    ['-'](f, s, l) {
        return -this.expression.evaluate(f, s, l);
    }
    ['+'](f, s, l) {
        return +this.expression.evaluate(f, s, l);
    }
    // tslint:disable-next-line:member-ordering
    accept(visitor) {
        return visitor.visitUnary(this);
    }
}
class PrimitiveLiteral {
    constructor(value) {
        this.value = value;
    }
    evaluate(flags, scope, locator) {
        return this.value;
    }
    accept(visitor) {
        return visitor.visitPrimitiveLiteral(this);
    }
}
PrimitiveLiteral.$undefined = new PrimitiveLiteral(undefined);
PrimitiveLiteral.$null = new PrimitiveLiteral(null);
PrimitiveLiteral.$true = new PrimitiveLiteral(true);
PrimitiveLiteral.$false = new PrimitiveLiteral(false);
PrimitiveLiteral.$empty = new PrimitiveLiteral('');
class HtmlLiteral {
    constructor(parts) {
        this.parts = parts;
    }
    evaluate(flags, scope, locator) {
        const elements = this.parts;
        let result = '';
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            const value = elements[i].evaluate(flags, scope, locator);
            if (value === undefined || value === null) {
                continue;
            }
            result += value;
        }
        return result;
    }
    connect(flags, scope, binding) {
        for (let i = 0, ii = this.parts.length; i < ii; ++i) {
            this.parts[i].connect(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitHtmlLiteral(this);
    }
}
class ArrayLiteral {
    constructor(elements) {
        this.elements = elements;
    }
    evaluate(flags, scope, locator) {
        const elements = this.elements;
        const length = elements.length;
        const result = Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = elements[i].evaluate(flags, scope, locator);
        }
        return result;
    }
    connect(flags, scope, binding) {
        const elements = this.elements;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            elements[i].connect(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitArrayLiteral(this);
    }
}
ArrayLiteral.$empty = new ArrayLiteral(PLATFORM.emptyArray);
class ObjectLiteral {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    evaluate(flags, scope, locator) {
        const instance = {};
        const keys = this.keys;
        const values = this.values;
        for (let i = 0, ii = keys.length; i < ii; ++i) {
            instance[keys[i]] = values[i].evaluate(flags, scope, locator);
        }
        return instance;
    }
    connect(flags, scope, binding) {
        const keys = this.keys;
        const values = this.values;
        for (let i = 0, ii = keys.length; i < ii; ++i) {
            values[i].connect(flags, scope, binding);
        }
    }
    accept(visitor) {
        return visitor.visitObjectLiteral(this);
    }
}
ObjectLiteral.$empty = new ObjectLiteral(PLATFORM.emptyArray, PLATFORM.emptyArray);
class Template {
    constructor(cooked, expressions) {
        this.cooked = cooked;
        this.expressions = expressions;
        this.expressions = expressions || PLATFORM.emptyArray;
    }
    evaluate(flags, scope, locator) {
        const expressions = this.expressions;
        const cooked = this.cooked;
        let result = cooked[0];
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            result += expressions[i].evaluate(flags, scope, locator);
            result += cooked[i + 1];
        }
        return result;
    }
    connect(flags, scope, binding) {
        const expressions = this.expressions;
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            expressions[i].connect(flags, scope, binding);
            i++;
        }
    }
    accept(visitor) {
        return visitor.visitTemplate(this);
    }
}
Template.$empty = new Template(['']);
class TaggedTemplate {
    constructor(cooked, raw, func, expressions) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        cooked.raw = raw;
        this.expressions = expressions || PLATFORM.emptyArray;
    }
    evaluate(flags, scope, locator) {
        const expressions = this.expressions;
        const len = expressions.length;
        const results = Array(len);
        for (let i = 0, ii = len; i < ii; ++i) {
            results[i] = expressions[i].evaluate(flags, scope, locator);
        }
        const func = this.func.evaluate(flags, scope, locator); // not sure why this cast is needed..
        if (typeof func !== 'function') {
            throw Reporter.error(207 /* NotAFunction */, this);
        }
        return func.apply(null, [this.cooked].concat(results));
    }
    connect(flags, scope, binding) {
        const expressions = this.expressions;
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            expressions[i].connect(flags, scope, binding);
        }
        this.func.connect(flags, scope, binding);
    }
    accept(visitor) {
        return visitor.visitTaggedTemplate(this);
    }
}
class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
    }
    // tslint:disable-next-line:no-any
    evaluate(flags, scope, locator) {
        // TODO
    }
    // tslint:disable-next-line:no-any
    assign(flags, scope, locator, obj) {
        // TODO
    }
    connect(flags, scope, binding) { }
    accept(visitor) {
        return visitor.visitArrayBindingPattern(this);
    }
}
class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    // tslint:disable-next-line:no-any
    evaluate(flags, scope, locator) {
        // TODO
    }
    // tslint:disable-next-line:no-any
    assign(flags, scope, locator, obj) {
        // TODO
    }
    connect(flags, scope, binding) { }
    accept(visitor) {
        return visitor.visitObjectBindingPattern(this);
    }
}
class BindingIdentifier {
    constructor(name) {
        this.name = name;
    }
    evaluate(flags, scope, locator) {
        return this.name;
    }
    connect(flags, scope, binding) { }
    accept(visitor) {
        return visitor.visitBindingIdentifier(this);
    }
}
const toStringTag = Object.prototype.toString;
// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
class ForOfStatement {
    constructor(declaration, iterable) {
        this.declaration = declaration;
        this.iterable = iterable;
    }
    evaluate(flags, scope, locator) {
        return this.iterable.evaluate(flags, scope, locator);
    }
    count(result) {
        return CountForOfStatement[toStringTag.call(result)](result);
    }
    // tslint:disable-next-line:no-any
    iterate(result, func) {
        IterateForOfStatement[toStringTag.call(result)](result, func);
    }
    connect(flags, scope, binding) {
        this.declaration.connect(flags, scope, binding);
        this.iterable.connect(flags, scope, binding);
    }
    accept(visitor) {
        return visitor.visitForOfStatement(this);
    }
}
/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
class Interpolation {
    constructor(parts, expressions) {
        this.parts = parts;
        this.expressions = expressions;
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
    evaluate(flags, scope, locator) {
        if (this.isMulti) {
            const expressions = this.expressions;
            const parts = this.parts;
            let result = parts[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator);
                result += parts[i + 1];
            }
            return result;
        }
        else {
            const parts = this.parts;
            return parts[0] + this.firstExpression.evaluate(flags, scope, locator) + parts[1];
        }
    }
    connect(flags, scope, binding) { }
    accept(visitor) {
        return visitor.visitInterpolation(this);
    }
}
/*
* Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
* (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
*
* This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
*/
BindingBehavior.prototype.$kind = 38962 /* BindingBehavior */;
ValueConverter.prototype.$kind = 36913 /* ValueConverter */;
Assign.prototype.$kind = 8208 /* Assign */;
Conditional.prototype.$kind = 63 /* Conditional */;
AccessThis.prototype.$kind = 1793 /* AccessThis */;
AccessScope.prototype.$kind = 10082 /* AccessScope */;
AccessMember.prototype.$kind = 9323 /* AccessMember */;
AccessKeyed.prototype.$kind = 9324 /* AccessKeyed */;
CallScope.prototype.$kind = 1448 /* CallScope */;
CallMember.prototype.$kind = 1161 /* CallMember */;
CallFunction.prototype.$kind = 1162 /* CallFunction */;
Binary.prototype.$kind = 46 /* Binary */;
Unary.prototype.$kind = 39 /* Unary */;
PrimitiveLiteral.prototype.$kind = 17925 /* PrimitiveLiteral */;
HtmlLiteral.prototype.$kind = 51 /* HtmlLiteral */;
ArrayLiteral.prototype.$kind = 17955 /* ArrayLiteral */;
ObjectLiteral.prototype.$kind = 17956 /* ObjectLiteral */;
Template.prototype.$kind = 17958 /* Template */;
TaggedTemplate.prototype.$kind = 1197 /* TaggedTemplate */;
ArrayBindingPattern.prototype.$kind = 65556 /* ArrayBindingPattern */;
ObjectBindingPattern.prototype.$kind = 65557 /* ObjectBindingPattern */;
BindingIdentifier.prototype.$kind = 65558 /* BindingIdentifier */;
ForOfStatement.prototype.$kind = 55 /* ForOfStatement */;
Interpolation.prototype.$kind = 24 /* Interpolation */;
/// Evaluate the [list] in context of the [scope].
function evalList(flags, scope, locator, list) {
    const len = list.length;
    const result = Array(len);
    for (let i = 0; i < len; ++i) {
        result[i] = list[i].evaluate(flags, scope, locator);
    }
    return result;
}
function getFunction(flags, obj, name) {
    const func = obj === null || obj === undefined ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(flags & BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
        return null;
    }
    throw Reporter.error(207 /* NotAFunction */, obj, name, func);
}
function isNumeric(value) {
    // tslint:disable-next-line:no-reserved-keywords
    const type = typeof value;
    if (type === 'number')
        return true;
    if (type !== 'string')
        return false;
    const len = value.length;
    if (len === 0)
        return false;
    for (let i = 0; i < len; ++i) {
        const char = value.charCodeAt(i);
        if (char < 0x30 /*0*/ || char > 0x39 /*9*/) {
            return false;
        }
    }
    return true;
}
/*@internal*/
const IterateForOfStatement = {
    ['[object Array]'](result, func) {
        for (let i = 0, ii = result.length; i < ii; ++i) {
            func(result, i, result[i]);
        }
    },
    ['[object Map]'](result, func) {
        const arr = Array(result.size);
        let i = -1;
        for (const entry of result.entries()) {
            arr[++i] = entry;
        }
        IterateForOfStatement['[object Array]'](arr, func);
    },
    ['[object Set]'](result, func) {
        const arr = Array(result.size);
        let i = -1;
        for (const key of result.keys()) {
            arr[++i] = key;
        }
        IterateForOfStatement['[object Array]'](arr, func);
    },
    ['[object Number]'](result, func) {
        const arr = Array(result);
        for (let i = 0; i < result; ++i) {
            arr[i] = i;
        }
        IterateForOfStatement['[object Array]'](arr, func);
    },
    ['[object Null]'](result, func) { },
    ['[object Undefined]'](result, func) { }
};
/*@internal*/
const CountForOfStatement = {
    ['[object Array]'](result) { return result.length; },
    ['[object Map]'](result) { return result.size; },
    ['[object Set]'](result) { return result.size; },
    ['[object Number]'](result) { return result; },
    ['[object Null]'](result) { return 0; },
    ['[object Undefined]'](result) { return 0; }
};
// Give each AST class a noop for each interface method if and only if it's not already defined
// This accomplishes the following:
//   1) no runtime error due to bad AST structure (it's the parser's job to guard against that)
//   2) no runtime error due to a bad binding such as two-way on a literal (no need, since it doesn't threaten the integrity of the app's state)
//   3) should we decide something else, we can easily change the global behavior of 1) and 2) by simply assigning a different method here (either in the source or via AOT)
const ast = [AccessThis, AccessScope, ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template, Unary, CallFunction, CallMember, CallScope, AccessMember, AccessKeyed, TaggedTemplate, Binary, Conditional, Assign, ForOfStatement];
for (let i = 0, ii = ast.length; i < ii; ++i) {
    const proto = ast[i].prototype;
    // tslint:disable-next-line:no-any
    proto.assign = proto.assign || PLATFORM.noop;
    proto.connect = proto.connect || PLATFORM.noop;
}

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time
const slotNames = [];
const versionSlotNames = [];
let lastSlot = -1;
function ensureEnoughSlotNames(currentSlot) {
    if (currentSlot === lastSlot) {
        lastSlot += 5;
        const ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
        for (let i = currentSlot + 1; i < ii; ++i) {
            slotNames[i] = `_observer${i}`;
            versionSlotNames[i] = `_observerVersion${i}`;
        }
    }
}
ensureEnoughSlotNames(-1);
/*@internal*/
function addObserver(observer) {
    // find the observer.
    const observerSlots = this.observerSlots === undefined ? 0 : this.observerSlots;
    let i = observerSlots;
    while (i-- && this[slotNames[i]] !== observer)
        ;
    // if we are not already observing, put the observer in an open slot and subscribe.
    if (i === -1) {
        i = 0;
        while (this[slotNames[i]]) {
            i++;
        }
        this[slotNames[i]] = observer;
        observer.subscribe(this);
        // increment the slot count.
        if (i === observerSlots) {
            this.observerSlots = i + 1;
        }
    }
    // set the "version" when the observer was used.
    if (this.version === undefined) {
        this.version = 0;
    }
    this[versionSlotNames[i]] = this.version;
    ensureEnoughSlotNames(i);
}
/*@internal*/
function observeProperty(obj, propertyName) {
    const observer = this.observerLocator.getObserver(obj, propertyName);
    /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
     *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
     *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
     *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
     *
     * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
     */
    this.addObserver(observer);
}
/*@internal*/
function unobserve(all$$1) {
    const slots = this.observerSlots;
    let slotName;
    let observer;
    if (all$$1 === true) {
        for (let i = 0; i < slots; ++i) {
            slotName = slotNames[i];
            observer = this[slotName];
            if (observer !== null && observer !== undefined) {
                this[slotName] = null;
                observer.unsubscribe(this);
            }
        }
    }
    else {
        const version = this.version;
        for (let i = 0; i < slots; ++i) {
            if (this[versionSlotNames[i]] !== version) {
                slotName = slotNames[i];
                observer = this[slotName];
                if (observer !== null && observer !== undefined) {
                    this[slotName] = null;
                    observer.unsubscribe(this);
                }
            }
        }
    }
}
function connectableDecorator(target) {
    const proto = target.prototype;
    if (!proto.hasOwnProperty('observeProperty'))
        proto.observeProperty = observeProperty;
    if (!proto.hasOwnProperty('unobserve'))
        proto.unobserve = unobserve;
    if (!proto.hasOwnProperty('addObserver'))
        proto.addObserver = addObserver;
    return target;
}
function connectable(target) {
    return target === undefined ? connectableDecorator : connectableDecorator(target);
}

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime: oneTime$1, toView: toView$1, fromView: fromView$1 } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView$1 | oneTime$1;
let Binding = class Binding {
    constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.$isBound = false;
        this.$scope = null;
    }
    updateTarget(value, flags) {
        this.targetObserver.setValue(value, flags | BindingFlags.updateTargetInstance);
    }
    updateSource(value, flags) {
        this.sourceExpression.assign(flags | BindingFlags.updateSourceExpression, this.$scope, this.locator, value);
    }
    handleChange(newValue, previousValue, flags) {
        if (!this.$isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const $scope = this.$scope;
        const locator = this.locator;
        if (flags & BindingFlags.updateTargetInstance) {
            const targetObserver = this.targetObserver;
            const mode = this.mode;
            previousValue = targetObserver.getValue();
            // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
            if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.observerSlots > 1) {
                newValue = sourceExpression.evaluate(flags, $scope, locator);
            }
            if (newValue !== previousValue) {
                this.updateTarget(newValue, flags);
            }
            if ((mode & oneTime$1) === 0) {
                this.version++;
                sourceExpression.connect(flags, $scope, this);
                this.unobserve(false);
            }
            return;
        }
        if (flags & BindingFlags.updateSourceExpression) {
            if (newValue !== sourceExpression.evaluate(flags, $scope, locator)) {
                this.updateSource(newValue, flags);
            }
            return;
        }
        throw Reporter.error(15, BindingFlags[flags]);
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        let sourceExpression = this.sourceExpression;
        if (hasBind(sourceExpression)) {
            sourceExpression.bind(flags, scope, this);
        }
        const mode = this.mode;
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            if (mode & fromView$1) {
                targetObserver = this.targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
            }
            else {
                targetObserver = this.targetObserver = this.observerLocator.getAccessor(this.target, this.targetProperty);
            }
        }
        if (targetObserver.bind) {
            targetObserver.bind(flags);
        }
        // during bind, binding behavior might have changed sourceExpression
        sourceExpression = this.sourceExpression;
        if (mode & toViewOrOneTime) {
            targetObserver.setValue(sourceExpression.evaluate(flags, scope, this.locator), flags);
        }
        if (mode & toView$1) {
            sourceExpression.connect(flags, scope, this);
        }
        if (mode & fromView$1) {
            targetObserver.subscribe(this);
        }
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        const sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        const targetObserver = this.targetObserver;
        if (targetObserver.unbind) {
            targetObserver.unbind(flags);
        }
        if (targetObserver.unsubscribe) {
            targetObserver.unsubscribe(this);
        }
        this.unobserve(true);
    }
};
Binding = __decorate([
    connectable()
], Binding);

const unset = {};
/*@internal*/
function debounceCallSource(event) {
    const state = this.debounceState;
    clearTimeout(state.timeoutId);
    state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
}
/*@internal*/
function debounceCall(newValue, oldValue, flags) {
    const state = this.debounceState;
    clearTimeout(state.timeoutId);
    if (!(flags & state.callContextToDebounce)) {
        state.oldValue = unset;
        this.debouncedMethod(newValue, oldValue, flags);
        return;
    }
    if (state.oldValue === unset) {
        state.oldValue = oldValue;
    }
    state.timeoutId = setTimeout(() => {
        const ov = state.oldValue;
        state.oldValue = unset;
        this.debouncedMethod(newValue, ov, flags);
    }, state.delay);
}
const fromView$2 = BindingMode.fromView;
let DebounceBindingBehavior = class DebounceBindingBehavior {
    bind(flags, scope, binding, delay = 200) {
        let methodToDebounce;
        let callContextToDebounce;
        let debouncer;
        if (binding instanceof Binding) {
            methodToDebounce = 'handleChange';
            debouncer = debounceCall;
            callContextToDebounce = binding.mode & fromView$2 ? BindingFlags.updateSourceExpression : BindingFlags.updateTargetInstance;
        }
        else {
            methodToDebounce = 'callSource';
            debouncer = debounceCallSource;
            callContextToDebounce = BindingFlags.updateTargetInstance;
        }
        // stash the original method and it's name.
        // note: a generic name like "originalMethod" is not used to avoid collisions
        // with other binding behavior types.
        binding.debouncedMethod = binding[methodToDebounce];
        binding.debouncedMethod.originalName = methodToDebounce;
        // replace the original method with the debouncing version.
        binding[methodToDebounce] = debouncer;
        // create the debounce state.
        binding.debounceState = {
            callContextToDebounce,
            delay,
            timeoutId: 0,
            oldValue: unset
        };
    }
    unbind(flags, scope, binding) {
        // restore the state of the binding.
        const methodToRestore = binding.debouncedMethod.originalName;
        binding[methodToRestore] = binding.debouncedMethod;
        binding.debouncedMethod = null;
        clearTimeout(binding.debounceState.timeoutId);
        binding.debounceState = null;
    }
};
DebounceBindingBehavior = __decorate([
    bindingBehavior('debounce')
], DebounceBindingBehavior);

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ISanitizer = DI.createInterface()
    .withDefault(x => x.singleton(class {
    sanitize(input) {
        return input.replace(SCRIPT_REGEX, '');
    }
}));
/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
let SanitizeValueConverter = class SanitizeValueConverter {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
        this.sanitizer = sanitizer;
    }
    /**
     * Process the provided markup that flows to the view.
     * @param untrustedMarkup The untrusted markup to be sanitized.
     */
    toView(untrustedMarkup) {
        if (untrustedMarkup === null || untrustedMarkup === undefined) {
            return null;
        }
        return this.sanitizer.sanitize(untrustedMarkup);
    }
};
SanitizeValueConverter = __decorate([
    valueConverter('sanitize'),
    inject(ISanitizer)
], SanitizeValueConverter);

/*@internal*/
function findOriginalEventTarget(event) {
    return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
}
/*@internal*/
function handleSelfEvent(event) {
    const target = findOriginalEventTarget(event);
    if (this.target !== target) {
        return;
    }
    return this.selfEventCallSource(event);
}
let SelfBindingBehavior = class SelfBindingBehavior {
    bind(flags, scope, binding) {
        if (!binding.callSource || !binding.targetEvent) {
            throw Reporter.error(8);
        }
        binding.selfEventCallSource = binding.callSource;
        binding.callSource = handleSelfEvent;
    }
    unbind(flags, scope, binding) {
        binding.callSource = binding.selfEventCallSource;
        binding.selfEventCallSource = null;
    }
};
SelfBindingBehavior = __decorate([
    bindingBehavior('self')
], SelfBindingBehavior);

let SignalBindingBehavior = class SignalBindingBehavior {
    constructor(signaler) {
        this.signaler = signaler;
    }
    bind(flags, scope, binding) {
        if (!binding.updateTarget) {
            throw Reporter.error(11);
        }
        if (arguments.length === 4) {
            let name = arguments[3];
            this.signaler.addSignalListener(name, binding);
            binding.signal = name;
        }
        else if (arguments.length > 4) {
            let names = Array.prototype.slice.call(arguments, 3);
            let i = names.length;
            while (i--) {
                let name = names[i];
                this.signaler.addSignalListener(name, binding);
            }
            binding.signal = names;
        }
        else {
            throw Reporter.error(12);
        }
    }
    unbind(flags, scope, binding) {
        let name = binding.signal;
        binding.signal = null;
        if (Array.isArray(name)) {
            let names = name;
            let i = names.length;
            while (i--) {
                this.signaler.removeSignalListener(names[i], binding);
            }
        }
        else {
            this.signaler.removeSignalListener(name, binding);
        }
    }
};
SignalBindingBehavior = __decorate([
    bindingBehavior('signal'),
    inject(ISignaler)
], SignalBindingBehavior);

/*@internal*/
function throttle(newValue) {
    let state = this.throttleState;
    let elapsed = +new Date() - state.last;
    if (elapsed >= state.delay) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
        state.last = +new Date();
        this.throttledMethod(newValue);
        return;
    }
    state.newValue = newValue;
    if (state.timeoutId === null) {
        state.timeoutId = setTimeout(() => {
            state.timeoutId = null;
            state.last = +new Date();
            this.throttledMethod(state.newValue);
        }, state.delay - elapsed);
    }
}
let ThrottleBindingBehavior = class ThrottleBindingBehavior {
    bind(flags, scope, binding, delay = 200) {
        let methodToThrottle;
        if (binding instanceof Binding) {
            if (binding.mode === BindingMode.twoWay) {
                methodToThrottle = 'updateSource';
            }
            else {
                methodToThrottle = 'updateTarget';
            }
        }
        else {
            methodToThrottle = 'callSource';
        }
        // stash the original method and it's name.
        // note: a generic name like "originalMethod" is not used to avoid collisions
        // with other binding behavior types.
        binding.throttledMethod = binding[methodToThrottle];
        binding.throttledMethod.originalName = methodToThrottle;
        // replace the original method with the throttling version.
        binding[methodToThrottle] = throttle;
        // create the throttle state.
        binding.throttleState = {
            delay: delay,
            last: 0,
            timeoutId: null
        };
    }
    unbind(flags, scope, binding) {
        // restore the state of the binding.
        let methodToRestore = binding.throttledMethod.originalName;
        binding[methodToRestore] = binding.throttledMethod;
        binding.throttledMethod = null;
        clearTimeout(binding.throttleState.timeoutId);
        binding.throttleState = null;
    }
};
ThrottleBindingBehavior = __decorate([
    bindingBehavior('throttle')
], ThrottleBindingBehavior);

//Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
function findOriginalEventTarget$1(event) {
    return (event.composedPath && event.composedPath()[0]) || (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
}
function stopPropagation() {
    this.standardStopPropagation();
    this.propagationStopped = true;
}
function handleCapturedEvent(event) {
    event.propagationStopped = false;
    let target = findOriginalEventTarget$1(event);
    const orderedCallbacks = [];
    /**
     * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
     */
    while (target) {
        if (target.capturedCallbacks) {
            const callback = target.capturedCallbacks[event.type];
            if (callback) {
                if (event.stopPropagation !== stopPropagation) {
                    event.standardStopPropagation = event.stopPropagation;
                    event.stopPropagation = stopPropagation;
                }
                orderedCallbacks.push(callback);
            }
        }
        target = target.parentNode;
    }
    for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
        const orderedCallback = orderedCallbacks[i];
        if ('handleEvent' in orderedCallback) {
            orderedCallback.handleEvent(event);
        }
        else {
            orderedCallback(event);
        }
    }
}
function handleDelegatedEvent(event) {
    event.propagationStopped = false;
    let target = findOriginalEventTarget$1(event);
    while (target && !event.propagationStopped) {
        if (target.delegatedCallbacks) {
            const callback = target.delegatedCallbacks[event.type];
            if (callback) {
                if (event.stopPropagation !== stopPropagation) {
                    event.standardStopPropagation = event.stopPropagation;
                    event.stopPropagation = stopPropagation;
                }
                if ('handleEvent' in callback) {
                    callback.handleEvent(event);
                }
                else {
                    callback(event);
                }
            }
        }
        target = target.parentNode;
    }
}
class ListenerTracker {
    constructor(eventName, listener, capture) {
        this.eventName = eventName;
        this.listener = listener;
        this.capture = capture;
        this.count = 0;
    }
    increment() {
        this.count++;
        if (this.count === 1) {
            DOM.addEventListener(this.eventName, this.listener, null, this.capture);
        }
    }
    decrement() {
        this.count--;
        if (this.count === 0) {
            DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
        }
    }
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegateOrCaptureSubscription {
    constructor(entry, lookup, targetEvent, callback) {
        this.entry = entry;
        this.lookup = lookup;
        this.targetEvent = targetEvent;
        lookup[targetEvent] = callback;
    }
    dispose() {
        this.entry.decrement();
        this.lookup[this.targetEvent] = null;
    }
}
/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
class TriggerSubscription {
    constructor(target, targetEvent, callback) {
        this.target = target;
        this.targetEvent = targetEvent;
        this.callback = callback;
        DOM.addEventListener(targetEvent, callback, target);
    }
    dispose() {
        DOM.removeEventListener(this.targetEvent, this.callback, this.target);
    }
}
var DelegationStrategy;
(function (DelegationStrategy) {
    DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
    DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
    DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
})(DelegationStrategy || (DelegationStrategy = {}));
class EventSubscriber {
    constructor(events) {
        this.events = events;
        this.events = events;
        this.target = null;
        this.handler = null;
    }
    subscribe(node, callbackOrListener) {
        this.target = node;
        this.handler = callbackOrListener;
        const add = DOM.addEventListener;
        const events = this.events;
        for (let i = 0, ii = events.length; ii > i; ++i) {
            add(events[i], callbackOrListener, node);
        }
    }
    dispose() {
        const node = this.target;
        const callbackOrListener = this.handler;
        const events = this.events;
        const remove = DOM.removeEventListener;
        for (let i = 0, ii = events.length; ii > i; ++i) {
            remove(events[i], callbackOrListener, node);
        }
        this.target = this.handler = null;
    }
}
const IEventManager = DI.createInterface()
    .withDefault(x => x.singleton(EventManager));
/*@internal*/
class EventManager {
    constructor() {
        this.elementHandlerLookup = {};
        this.delegatedHandlers = {};
        this.capturedHandlers = {};
        this.registerElementConfiguration({
            tagName: 'INPUT',
            properties: {
                value: ['change', 'input'],
                checked: ['change', 'input'],
                files: ['change', 'input']
            }
        });
        this.registerElementConfiguration({
            tagName: 'TEXTAREA',
            properties: {
                value: ['change', 'input']
            }
        });
        this.registerElementConfiguration({
            tagName: 'SELECT',
            properties: {
                value: ['change']
            }
        });
        this.registerElementConfiguration({
            tagName: 'content editable',
            properties: {
                value: ['change', 'input', 'blur', 'keyup', 'paste']
            }
        });
        this.registerElementConfiguration({
            tagName: 'scrollable element',
            properties: {
                scrollTop: ['scroll'],
                scrollLeft: ['scroll']
            }
        });
    }
    registerElementConfiguration(config) {
        const properties = config.properties;
        const lookup = this.elementHandlerLookup[config.tagName] = {};
        for (const propertyName in properties) {
            if (properties.hasOwnProperty(propertyName)) {
                lookup[propertyName] = properties[propertyName];
            }
        }
    }
    getElementHandler(target, propertyName) {
        const tagName = target['tagName'];
        const lookup = this.elementHandlerLookup;
        if (tagName) {
            if (lookup[tagName] && lookup[tagName][propertyName]) {
                return new EventSubscriber(lookup[tagName][propertyName]);
            }
            if (propertyName === 'textContent' || propertyName === 'innerHTML') {
                return new EventSubscriber(lookup['content editable'].value);
            }
            if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
                return new EventSubscriber(lookup['scrollable element'][propertyName]);
            }
        }
        return null;
    }
    addEventListener(target, targetEvent, callbackOrListener, strategy) {
        let delegatedHandlers;
        let capturedHandlers;
        let handlerEntry;
        if (strategy === DelegationStrategy.bubbling) {
            delegatedHandlers = this.delegatedHandlers;
            handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleDelegatedEvent, false));
            handlerEntry.increment();
            const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
            return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
        }
        if (strategy === DelegationStrategy.capturing) {
            capturedHandlers = this.capturedHandlers;
            handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(targetEvent, handleCapturedEvent, true));
            handlerEntry.increment();
            const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
            return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
        }
        return new TriggerSubscription(target, targetEvent, callbackOrListener);
    }
}

function computed(config) {
    return function (target, key) {
        const computed = target.computed || (target.computed = {});
        computed[key] = config;
    };
}
const noProxy = !(typeof Proxy !== undefined);
const computedOverrideDefaults = { static: false, volatile: false };
/* @internal */
function createComputedObserver(observerLocator, dirtyChecker, changeSet, 
// tslint:disable-next-line:no-reserved-keywords
instance, propertyName, descriptor) {
    if (descriptor.configurable === false) {
        return dirtyChecker.createProperty(instance, propertyName);
    }
    if (descriptor.get) {
        const overrides = instance.constructor.computed
            ? instance.constructor.computed[propertyName] || computedOverrideDefaults
            : computedOverrideDefaults;
        if (descriptor.set) {
            if (overrides.volatile) {
                return noProxy
                    ? dirtyChecker.createProperty(instance, propertyName)
                    : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
            }
            return new CustomSetterObserver(instance, propertyName, descriptor, changeSet);
        }
        return noProxy
            ? dirtyChecker.createProperty(instance, propertyName)
            : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
    }
    throw Reporter.error(18, propertyName);
}
// Used when the getter is dependent solely on changes that happen within the setter.
let CustomSetterObserver = class CustomSetterObserver {
    constructor(obj, propertyKey, descriptor, changeSet) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.descriptor = descriptor;
        this.changeSet = changeSet;
        this.observing = false;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(newValue) {
        this.obj[this.propertyKey] = newValue;
    }
    flushChanges() {
        const oldValue = this.oldValue;
        const newValue = this.currentValue;
        this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
    }
    subscribe(subscriber) {
        if (!this.observing) {
            this.convertProperty();
        }
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
    }
    convertProperty() {
        const setter = this.descriptor.set;
        const that = this;
        this.observing = true;
        this.currentValue = this.obj[this.propertyKey];
        Reflect.defineProperty(this.obj, this.propertyKey, {
            set: function (newValue) {
                setter.call(that.obj, newValue);
                const oldValue = this.currentValue;
                if (oldValue !== newValue) {
                    that.oldValue = oldValue;
                    that.changeSet.add(that);
                    that.currentValue = newValue;
                }
            }
        });
    }
};
CustomSetterObserver = __decorate([
    subscriberCollection(MutationKind.instance)
], CustomSetterObserver);
CustomSetterObserver.prototype.dispose = PLATFORM.noop;
// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
/*@internal*/
let GetterObserver = class GetterObserver {
    constructor(overrides, obj, propertyKey, descriptor, observerLocator, changeSet) {
        this.overrides = overrides;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.descriptor = descriptor;
        this.observerLocator = observerLocator;
        this.changeSet = changeSet;
        this.controller = new GetterController(overrides, obj, propertyKey, descriptor, this, observerLocator, changeSet);
    }
    getValue() {
        return this.controller.value;
    }
    // tslint:disable-next-line:no-empty
    setValue(newValue) { }
    flushChanges() {
        const oldValue = this.controller.value;
        const newValue = this.controller.getValueAndCollectDependencies();
        if (oldValue !== newValue) {
            this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance);
        }
    }
    subscribe(subscriber) {
        this.addSubscriber(subscriber);
        this.controller.onSubscriberAdded();
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
        this.controller.onSubscriberRemoved();
    }
};
GetterObserver = __decorate([
    subscriberCollection(MutationKind.instance)
], GetterObserver);
GetterObserver.prototype.dispose = PLATFORM.noop;
/*@internal*/
class GetterController {
    constructor(overrides, instance, propertyName, descriptor, owner, observerLocator, changeSet) {
        this.overrides = overrides;
        this.instance = instance;
        this.propertyName = propertyName;
        this.owner = owner;
        this.changeSet = changeSet;
        this.isCollecting = false;
        this.dependencies = [];
        this.subscriberCount = 0;
        const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
        const getter = descriptor.get;
        const ctrl = this;
        Reflect.defineProperty(instance, propertyName, {
            get: function () {
                if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
                    ctrl.value = getter.apply(proxy);
                }
                return ctrl.value;
            }
        });
    }
    addDependency(subscribable) {
        if (this.dependencies.includes(subscribable)) {
            return;
        }
        this.dependencies.push(subscribable);
    }
    onSubscriberAdded() {
        this.subscriberCount++;
        if (this.subscriberCount > 1) {
            return;
        }
        this.getValueAndCollectDependencies(true);
    }
    getValueAndCollectDependencies(requireCollect = false) {
        const dynamicDependencies = !this.overrides.static || requireCollect;
        if (dynamicDependencies) {
            this.unsubscribeAllDependencies();
            this.isCollecting = true;
        }
        this.value = this.instance[this.propertyName]; // triggers observer collection
        if (dynamicDependencies) {
            this.isCollecting = false;
            this.dependencies.forEach(x => x.subscribe(this));
        }
        return this.value;
    }
    onSubscriberRemoved() {
        this.subscriberCount--;
        if (this.subscriberCount === 0) {
            this.unsubscribeAllDependencies();
        }
    }
    handleChange() {
        this.changeSet.add(this.owner);
    }
    unsubscribeAllDependencies() {
        this.dependencies.forEach(x => x.unsubscribe(this));
        this.dependencies.length = 0;
    }
}
function createGetterTraps(observerLocator, controller) {
    return {
        get: function (instance, key) {
            const value = instance[key];
            if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
                return value;
            }
            // TODO: fix this
            if (instance instanceof Array) {
                controller.addDependency(observerLocator.getArrayObserver(instance));
                if (key === 'length') {
                    controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
                }
            }
            else if (instance instanceof Map) {
                controller.addDependency(observerLocator.getMapObserver(instance));
                if (key === 'size') {
                    controller.addDependency(observerLocator.getMapObserver(instance).getLengthObserver());
                }
            }
            else if (instance instanceof Set) {
                controller.addDependency(observerLocator.getSetObserver(instance));
                if (key === 'size') {
                    return observerLocator.getSetObserver(instance).getLengthObserver();
                }
            }
            else {
                controller.addDependency(observerLocator.getObserver(instance, key));
            }
            return proxyOrValue(observerLocator, controller, value);
        }
    };
}
function proxyOrValue(observerLocator, controller, value) {
    if (!(value instanceof Object)) {
        return value;
    }
    return new Proxy(value, createGetterTraps(observerLocator, controller));
}

const IDirtyChecker = DI.createInterface()
    .withDefault(x => x.singleton(DirtyChecker));
/*@internal*/
class DirtyChecker {
    constructor() {
        this.tracked = [];
        this.checkDelay = 120;
    }
    createProperty(obj, propertyName) {
        return new DirtyCheckProperty(this, obj, propertyName);
    }
    addProperty(property) {
        const tracked = this.tracked;
        tracked.push(property);
        if (tracked.length === 1) {
            this.scheduleDirtyCheck();
        }
    }
    removeProperty(property) {
        const tracked = this.tracked;
        tracked.splice(tracked.indexOf(property), 1);
    }
    scheduleDirtyCheck() {
        setTimeout(() => this.check(), this.checkDelay);
    }
    check() {
        const tracked = this.tracked;
        let i = tracked.length;
        while (i--) {
            const current = tracked[i];
            if (current.isDirty()) {
                current.flushChanges();
            }
        }
        if (tracked.length) {
            this.scheduleDirtyCheck();
        }
    }
}
/*@internal*/
let DirtyCheckProperty = class DirtyCheckProperty {
    constructor(dirtyChecker, obj, propertyKey) {
        this.dirtyChecker = dirtyChecker;
        this.obj = obj;
        this.propertyKey = propertyKey;
    }
    isDirty() {
        return this.oldValue !== this.obj[this.propertyKey];
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(newValue) {
        this.obj[this.propertyKey] = newValue;
    }
    flushChanges() {
        const oldValue = this.oldValue;
        const newValue = this.getValue();
        this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
        this.oldValue = newValue;
    }
    subscribe(subscriber) {
        if (!this.hasSubscribers()) {
            this.oldValue = this.getValue();
            this.dirtyChecker.addProperty(this);
        }
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
            this.dirtyChecker.removeProperty(this);
        }
    }
};
DirtyCheckProperty = __decorate([
    propertyObserver()
], DirtyCheckProperty);

const inputValueDefaults = {
    ['button']: '',
    ['checkbox']: 'on',
    ['color']: '#000000',
    ['date']: '',
    ['datetime-local']: '',
    ['email']: '',
    ['file']: '',
    ['hidden']: '',
    ['image']: '',
    ['month']: '',
    ['number']: '',
    ['password']: '',
    ['radio']: 'on',
    ['range']: '50',
    ['reset']: '',
    ['search']: '',
    ['submit']: '',
    ['tel']: '',
    ['text']: '',
    ['time']: '',
    ['url']: '',
    ['week']: ''
};
const handleEventFlags = BindingFlags.fromDOMEvent | BindingFlags.updateSourceExpression;
let ValueAttributeObserver = class ValueAttributeObserver {
    constructor(changeSet, obj, propertyKey, handler) {
        // note: input.files can be assigned and this was fixed in Firefox 57:
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030
        this.changeSet = changeSet;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.handler = handler;
        // input.value (for type='file') however, can only be assigned an empty string
        if (propertyKey === 'value') {
            const nodeType = obj['type'];
            this.defaultValue = inputValueDefaults[nodeType || 'text'];
            if (nodeType === 'file') {
                this.flushChanges = this.flushFileChanges;
            }
        }
        else {
            this.defaultValue = '';
        }
        this.oldValue = this.currentValue = obj[propertyKey];
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValueCore(newValue, flags) {
        this.obj[this.propertyKey] = newValue;
        if (flags & BindingFlags.fromBind) {
            return;
        }
        this.callSubscribers(this.currentValue, this.oldValue, flags);
    }
    handleEvent() {
        const oldValue = this.oldValue = this.currentValue;
        const newValue = this.currentValue = this.getValue();
        if (oldValue !== newValue) {
            this.callSubscribers(newValue, oldValue, handleEventFlags);
            this.oldValue = newValue;
        }
    }
    subscribe(subscriber) {
        if (!this.hasSubscribers()) {
            this.oldValue = this.getValue();
            this.handler.subscribe(this.obj, this);
        }
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
            this.handler.dispose();
        }
    }
    flushFileChanges() {
        const currentValue = this.currentValue;
        if (this.oldValue !== currentValue) {
            if (currentValue === '') {
                this.setValueCore(currentValue, this.currentFlags);
                this.oldValue = this.currentValue;
            }
        }
    }
};
ValueAttributeObserver = __decorate([
    targetObserver('')
], ValueAttributeObserver);
ValueAttributeObserver.prototype.propertyKey = '';
ValueAttributeObserver.prototype.handler = null;
const defaultHandleBatchedChangeFlags = BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance;
let CheckedObserver = class CheckedObserver {
    constructor(changeSet, obj, handler, observerLocator) {
        this.changeSet = changeSet;
        this.obj = obj;
        this.handler = handler;
        this.observerLocator = observerLocator;
    }
    getValue() {
        return this.currentValue;
    }
    setValueCore(newValue, flags) {
        if (!this.valueObserver) {
            this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
            if (this.valueObserver) {
                this.valueObserver.subscribe(this);
            }
        }
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribeBatched(this);
            this.arrayObserver = null;
        }
        if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
            this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
            this.arrayObserver.subscribeBatched(this);
        }
        this.synchronizeElement();
    }
    // handleBatchedCollectionChange (todo: rename to make this explicit?)
    handleBatchedChange() {
        this.synchronizeElement();
        this.notify(defaultHandleBatchedChangeFlags);
    }
    // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
    handleChange(newValue, previousValue, flags) {
        this.synchronizeElement();
        this.notify(flags);
    }
    synchronizeElement() {
        const value = this.currentValue;
        const element = this.obj;
        const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
        const isRadio = element.type === 'radio';
        const matcher = element['matcher'] || ((a, b) => a === b);
        if (isRadio) {
            element.checked = !!matcher(value, elementValue);
        }
        else if (value === true) {
            element.checked = true;
        }
        else if (Array.isArray(value)) {
            element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
        }
        else {
            element.checked = false;
        }
    }
    notify(flags) {
        if (flags & BindingFlags.fromBind) {
            return;
        }
        const oldValue = this.oldValue;
        const newValue = this.currentValue;
        if (newValue === oldValue) {
            return;
        }
        this.callSubscribers(this.currentValue, this.oldValue, flags);
    }
    handleEvent() {
        let value = this.currentValue;
        const element = this.obj;
        const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
        let index;
        const matcher = element['matcher'] || defaultMatcher;
        if (element.type === 'checkbox') {
            if (Array.isArray(value)) {
                index = value.findIndex(item => !!matcher(item, elementValue));
                if (element.checked && index === -1) {
                    value.push(elementValue);
                }
                else if (!element.checked && index !== -1) {
                    value.splice(index, 1);
                }
                // when existing value is array, do not invoke callback as only the array element has changed
                return;
            }
            value = element.checked;
        }
        else if (element.checked) {
            value = elementValue;
        }
        else {
            return;
        }
        this.oldValue = this.currentValue;
        this.currentValue = value;
        this.notify(handleEventFlags);
    }
    subscribe(subscriber) {
        if (!this.hasSubscribers()) {
            this.handler.subscribe(this.obj, this);
        }
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
            this.handler.dispose();
        }
    }
    unbind() {
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribeBatched(this);
            this.arrayObserver = null;
        }
        if (this.valueObserver) {
            this.valueObserver.unsubscribe(this);
        }
    }
};
CheckedObserver = __decorate([
    targetObserver()
], CheckedObserver);
CheckedObserver.prototype.handler = null;
CheckedObserver.prototype.observerLocator = null;
const childObserverOptions = {
    childList: true,
    subtree: true,
    characterData: true
};
function defaultMatcher(a, b) {
    return a === b;
}
let SelectValueObserver = class SelectValueObserver {
    constructor(changeSet, obj, handler, observerLocator) {
        this.changeSet = changeSet;
        this.obj = obj;
        this.handler = handler;
        this.observerLocator = observerLocator;
    }
    getValue() {
        return this.currentValue;
    }
    setValueCore(newValue, flags) {
        const isArray = Array.isArray(newValue);
        if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
            throw new Error('Only null or Array instances can be bound to a multi-select.');
        }
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribeBatched(this);
            this.arrayObserver = null;
        }
        if (isArray) {
            this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
            this.arrayObserver.subscribeBatched(this);
        }
        this.synchronizeOptions();
        this.notify(flags);
    }
    // called when the array mutated (items sorted/added/removed, etc)
    handleBatchedChange(indexMap) {
        // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
        // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
        this.synchronizeOptions(indexMap);
    }
    // called when a different value was assigned
    handleChange(newValue, previousValue, flags) {
        this.setValue(newValue, flags);
    }
    notify(flags) {
        if (flags & BindingFlags.fromBind) {
            return;
        }
        const oldValue = this.oldValue;
        const newValue = this.currentValue;
        if (newValue === oldValue) {
            return;
        }
        this.callSubscribers(newValue, oldValue, flags);
    }
    handleEvent() {
        // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
        const shouldNotify = this.synchronizeValue();
        if (shouldNotify) {
            this.notify(handleEventFlags);
        }
    }
    synchronizeOptions(indexMap) {
        const currentValue = this.currentValue;
        const isArray = Array.isArray(currentValue);
        const obj = this.obj;
        const matcher = obj.matcher || defaultMatcher;
        const options = obj.options;
        let i = options.length;
        while (i--) {
            const option = options.item(i);
            const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
            if (isArray) {
                option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                continue;
            }
            option.selected = !!matcher(optionValue, currentValue);
        }
    }
    synchronizeValue() {
        // Spec for synchronizing value from `SelectObserver` to `<select/>`
        // When synchronizing value to observed <select/> element, do the following steps:
        // A. If `<select/>` is multiple
        //    1. Check if current value, called `currentValue` is an array
        //      a. If not an array, return true to signal value has changed
        //      b. If is an array:
        //        i. gather all current selected <option/>, in to array called `values`
        //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
        //        iii. loop through the `values` array and add items that are selected based on matcher
        //        iv. Return false to signal value hasn't changed
        // B. If the select is single
        //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
        //    2. assign `this.currentValue` to `this.oldValue`
        //    3. assign `value` to `this.currentValue`
        //    4. return `true` to signal value has changed
        const obj = this.obj;
        const options = obj.options;
        const len = options.length;
        const currentValue = this.currentValue;
        let i = 0;
        if (obj.multiple) {
            // A.
            if (!Array.isArray(currentValue)) {
                // A.1.a
                return true;
            }
            // A.1.b
            // multi select
            let option;
            const matcher = obj.matcher || defaultMatcher;
            // A.1.b.i
            const values = [];
            while (i < len) {
                option = options.item(i);
                if (option.selected) {
                    values.push(option.hasOwnProperty('model')
                        ? option.model
                        : option.value);
                }
                ++i;
            }
            // A.1.b.ii
            i = 0;
            while (i < currentValue.length) {
                const a = currentValue[i];
                // Todo: remove arrow fn
                if (values.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
            // A.1.b.iii
            i = 0;
            while (i < values.length) {
                const a = values[i];
                // Todo: remove arrow fn
                if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.push(a);
                }
                ++i;
            }
            // A.1.b.iv
            return false;
        }
        // B. single select
        // B.1
        let value = null;
        while (i < len) {
            const option = options.item(i);
            if (option.selected) {
                value = option.hasOwnProperty('model')
                    ? option.model
                    : option.value;
                break;
            }
            ++i;
        }
        // B.2
        this.oldValue = this.currentValue;
        // B.3
        this.currentValue = value;
        // B.4
        return true;
    }
    subscribe(subscriber) {
        if (!this.hasSubscribers()) {
            this.handler.subscribe(this.obj, this);
        }
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
            this.handler.dispose();
        }
    }
    bind() {
        this.nodeObserver = DOM.createNodeObserver(this.obj, this.handleNodeChange.bind(this), childObserverOptions);
    }
    unbind() {
        this.nodeObserver.disconnect();
        this.nodeObserver = null;
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribeBatched(this);
            this.arrayObserver = null;
        }
    }
    handleNodeChange() {
        this.synchronizeOptions();
        const shouldNotify = this.synchronizeValue();
        if (shouldNotify) {
            this.notify(handleEventFlags);
        }
    }
};
SelectValueObserver = __decorate([
    targetObserver()
], SelectValueObserver);
SelectValueObserver.prototype.handler = null;
SelectValueObserver.prototype.observerLocator = null;

const proto$2 = Map.prototype;
const nativeSet = proto$2.set; // TODO: probably want to make these internal again
const nativeClear$1 = proto$2.clear;
const nativeDelete$1 = proto$2.delete;
// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap
// https://tc39.github.io/ecma262/#sec-map.prototype.map
function observeSet(key, value) {
    const o = this.$observer;
    if (o === undefined) {
        return nativeSet.call(this, key, value);
    }
    const oldSize = this.size;
    nativeSet.call(this, key, value);
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
    o.callSubscribers('set', arguments, BindingFlags.isCollectionMutation);
    return this;
}
// https://tc39.github.io/ecma262/#sec-map.prototype.clear
function observeClear$1() {
    const o = this.$observer;
    if (o === undefined) {
        return nativeClear$1.call(this);
    }
    const size = this.size;
    if (size > 0) {
        const indexMap = o.indexMap;
        let i = 0;
        for (const entry of this.keys()) {
            if (indexMap[i] > -1) {
                nativePush.call(indexMap.deletedItems, entry);
            }
            i++;
        }
        nativeClear$1.call(this);
        indexMap.length = 0;
        o.callSubscribers('clear', arguments, BindingFlags.isCollectionMutation);
    }
    return undefined;
}
// https://tc39.github.io/ecma262/#sec-map.prototype.delete
function observeDelete$1(value) {
    const o = this.$observer;
    if (o === undefined) {
        return nativeDelete$1.call(this, value);
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
                nativePush.call(indexMap.deletedItems, entry);
            }
            nativeSplice.call(indexMap, i, 1);
            return nativeDelete$1.call(this, value);
        }
        i++;
    }
    o.callSubscribers('delete', arguments, BindingFlags.isCollectionMutation);
    return false;
}
for (const observe of [observeSet, observeClear$1, observeDelete$1]) {
    Object.defineProperty(observe, 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
function enableMapObservation() {
    if (proto$2.set['observing'] !== true)
        proto$2.set = observeSet;
    if (proto$2.clear['observing'] !== true)
        proto$2.clear = observeClear$1;
    if (proto$2.delete['observing'] !== true)
        proto$2.delete = observeDelete$1;
}
enableMapObservation();
function disableMapObservation() {
    if (proto$2.set['observing'] === true)
        proto$2.set = nativeSet;
    if (proto$2.clear['observing'] === true)
        proto$2.clear = nativeClear$1;
    if (proto$2.delete['observing'] === true)
        proto$2.delete = nativeDelete$1;
}
let MapObserver = class MapObserver {
    constructor(changeSet, map) {
        this.changeSet = changeSet;
        map.$observer = this;
        this.collection = map;
        this.resetIndexMap();
    }
};
MapObserver = __decorate([
    collectionObserver(6 /* map */)
], MapObserver);
function getMapObserver(changeSet, map) {
    return map.$observer || new MapObserver(changeSet, map);
}

const ISVGAnalyzer = DI.createInterface()
    .withDefault(x => x.singleton(class {
    isStandardSvgAttribute(node, attributeName) {
        return false;
    }
}));

const toStringTag$1 = Object.prototype.toString;
const IObserverLocator = DI.createInterface()
    .withDefault(x => x.singleton(ObserverLocator));
function getPropertyDescriptor(subject, name) {
    let pd = Object.getOwnPropertyDescriptor(subject, name);
    let proto = Object.getPrototypeOf(subject);
    while (pd === undefined && proto !== null) {
        pd = Object.getOwnPropertyDescriptor(proto, name);
        proto = Object.getPrototypeOf(proto);
    }
    return pd;
}
let ObserverLocator = 
/*@internal*/
class ObserverLocator {
    constructor(changeSet, eventManager, dirtyChecker, svgAnalyzer) {
        this.changeSet = changeSet;
        this.eventManager = eventManager;
        this.dirtyChecker = dirtyChecker;
        this.svgAnalyzer = svgAnalyzer;
        this.adapters = [];
    }
    getObserver(obj, propertyName) {
        if (obj.$synthetic === true) {
            return obj.getObservers().getOrCreate(obj, propertyName);
        }
        let observersLookup = obj.$observers;
        let observer;
        if (observersLookup && propertyName in observersLookup) {
            return observersLookup[propertyName];
        }
        observer = this.createPropertyObserver(obj, propertyName);
        if (!observer.doNotCache) {
            if (observersLookup === undefined) {
                observersLookup = this.getOrCreateObserversLookup(obj);
            }
            observersLookup[propertyName] = observer;
        }
        return observer;
    }
    addAdapter(adapter) {
        this.adapters.push(adapter);
    }
    getAccessor(obj, propertyName) {
        if (DOM.isNodeInstance(obj)) {
            const tagName = obj['tagName'];
            // this check comes first for hot path optimization
            if (propertyName === 'textContent') {
                return new ElementPropertyAccessor(this.changeSet, obj, propertyName);
            }
            // TODO: optimize and make pluggable
            if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css'
                || propertyName === 'value' && (tagName === 'INPUT' || tagName === 'SELECT')
                || propertyName === 'checked' && tagName === 'INPUT'
                || propertyName === 'model' && tagName === 'INPUT'
                || /^xlink:.+$/.exec(propertyName)) {
                return this.getObserver(obj, propertyName);
            }
            if (/^\w+:|^data-|^aria-/.test(propertyName)
                || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
                || tagName === 'IMG' && propertyName === 'src'
                || tagName === 'A' && propertyName === 'href') {
                return new DataAttributeAccessor(this.changeSet, obj, propertyName);
            }
            return new ElementPropertyAccessor(this.changeSet, obj, propertyName);
        }
        return new PropertyAccessor(obj, propertyName);
    }
    getArrayObserver(array) {
        return getArrayObserver(this.changeSet, array);
    }
    getMapObserver(map) {
        return getMapObserver(this.changeSet, map);
    }
    // tslint:disable-next-line:no-reserved-keywords
    getSetObserver(set) {
        return getSetObserver(this.changeSet, set);
    }
    getOrCreateObserversLookup(obj) {
        return obj.$observers || this.createObserversLookup(obj);
    }
    createObserversLookup(obj) {
        const value = {};
        if (!Reflect.defineProperty(obj, '$observers', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: value
        })) {
            Reporter.write(0, obj);
        }
        return value;
    }
    getAdapterObserver(obj, propertyName, descriptor) {
        for (let i = 0, ii = this.adapters.length; i < ii; i++) {
            const adapter = this.adapters[i];
            const observer = adapter.getObserver(obj, propertyName, descriptor);
            if (observer) {
                return observer;
            }
        }
        return null;
    }
    createPropertyObserver(obj, propertyName) {
        if (!(obj instanceof Object)) {
            return new PrimitiveObserver(obj, propertyName);
        }
        let isNode;
        if (DOM.isNodeInstance(obj)) {
            if (propertyName === 'class') {
                return new ClassAttributeAccessor(this.changeSet, obj);
            }
            if (propertyName === 'style' || propertyName === 'css') {
                return new StyleAttributeAccessor(this.changeSet, obj);
            }
            const tagName = obj['tagName'];
            const handler = this.eventManager.getElementHandler(obj, propertyName);
            if (propertyName === 'value' && tagName === 'SELECT') {
                return new SelectValueObserver(this.changeSet, obj, handler, this);
            }
            if (propertyName === 'checked' && tagName === 'INPUT') {
                return new CheckedObserver(this.changeSet, obj, handler, this);
            }
            if (handler) {
                return new ValueAttributeObserver(this.changeSet, obj, propertyName, handler);
            }
            const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
            if (xlinkResult) {
                return new XLinkAttributeAccessor(this.changeSet, obj, propertyName, xlinkResult[1]);
            }
            if (propertyName === 'role'
                || /^\w+:|^data-|^aria-/.test(propertyName)
                || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
                return new DataAttributeAccessor(this.changeSet, obj, propertyName);
            }
            isNode = true;
        }
        const tag = toStringTag$1.call(obj);
        switch (tag) {
            case '[object Array]':
                if (propertyName === 'length') {
                    return this.getArrayObserver(obj).getLengthObserver();
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            case '[object Map]':
                if (propertyName === 'size') {
                    return this.getMapObserver(obj).getLengthObserver();
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
            case '[object Set]':
                if (propertyName === 'size') {
                    return this.getSetObserver(obj).getLengthObserver();
                }
                return this.dirtyChecker.createProperty(obj, propertyName);
        }
        const descriptor = getPropertyDescriptor(obj, propertyName);
        if (descriptor) {
            if (descriptor.get || descriptor.set) {
                if (descriptor.get && descriptor.get.getObserver) {
                    return descriptor.get.getObserver(obj);
                }
                // attempt to use an adapter before resorting to dirty checking.
                const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
                if (adapterObserver) {
                    return adapterObserver;
                }
                if (isNode) {
                    // TODO: use MutationObserver
                    return this.dirtyChecker.createProperty(obj, propertyName);
                }
                return createComputedObserver(this, this.dirtyChecker, this.changeSet, obj, propertyName, descriptor);
            }
        }
        return new SetterObserver(obj, propertyName);
    }
};
ObserverLocator = __decorate([
    inject(IChangeSet, IEventManager, IDirtyChecker, ISVGAnalyzer)
    /*@internal*/
], ObserverLocator);
function getCollectionObserver(changeSet, collection) {
    switch (toStringTag$1.call(collection)) {
        case '[object Array]':
            return getArrayObserver(changeSet, collection);
        case '[object Map]':
            return getMapObserver(changeSet, collection);
        case '[object Set]':
            return getSetObserver(changeSet, collection);
    }
    return null;
}

let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    bind(flags, scope, binding, ...events) {
        if (events.length === 0) {
            throw Reporter.error(9);
        }
        if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
            throw Reporter.error(10);
        }
        // ensure the binding's target observer has been set.
        const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw Reporter.error(10);
        }
        binding.targetObserver = targetObserver;
        // stash the original element subscribe function.
        targetObserver.originalHandler = binding.targetObserver.handler;
        // replace the element subscribe function with one that uses the correct events.
        targetObserver.handler = new EventSubscriber(events);
    }
    unbind(flags, scope, binding) {
        // restore the state of the binding.
        binding.targetObserver.handler.dispose();
        binding.targetObserver.handler = binding.targetObserver.originalHandler;
        binding.targetObserver.originalHandler = null;
    }
};
UpdateTriggerBindingBehavior = __decorate([
    bindingBehavior('updateTrigger'),
    inject(IObserverLocator)
], UpdateTriggerBindingBehavior);

class Call {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.locator = locator;
        this.$isBound = false;
        this.targetObserver = observerLocator.getObserver(target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        Object.assign(overrideContext, args);
        const result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.$scope, this.locator);
        for (const prop in args) {
            delete overrideContext[prop];
        }
        return result;
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        const sourceExpression = this.sourceExpression;
        if (hasBind(sourceExpression)) {
            sourceExpression.bind(flags, scope, this);
        }
        this.targetObserver.setValue($args => this.callSource($args), flags);
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        const sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.targetObserver.setValue(null, flags);
    }
    // tslint:disable:no-empty no-any
    observeProperty(obj, propertyName) { }
    handleChange(newValue, previousValue, flags) { }
}

const IExpressionParser = DI.createInterface()
    .withDefault(x => x.singleton(ExpressionParser));
/*@internal*/
class ExpressionParser {
    constructor() {
        this.expressionLookup = Object.create(null);
        this.interpolationLookup = Object.create(null);
        this.forOfLookup = Object.create(null);
    }
    parse(expression, bindingType) {
        switch (bindingType) {
            case 2048 /* Interpolation */:
                {
                    let found = this.interpolationLookup[expression];
                    if (found === undefined) {
                        found = this.interpolationLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
            case 539 /* ForCommand */:
                {
                    let found = this.forOfLookup[expression];
                    if (found === undefined) {
                        found = this.forOfLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
            default:
                {
                    // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                    // But don't cache it, because empty strings are always invalid for any other type of binding
                    if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                        return PrimitiveLiteral.$empty;
                    }
                    let found = this.expressionLookup[expression];
                    if (found === undefined) {
                        found = this.expressionLookup[expression] = this.parseCore(expression, bindingType);
                    }
                    return found;
                }
        }
    }
    cache(expressions) {
        const { forOfLookup, expressionLookup, interpolationLookup } = this;
        for (const expression in expressions) {
            const expr = expressions[expression];
            switch (expr.$kind) {
                case 24 /* Interpolation */:
                    interpolationLookup[expression] = expr;
                    break;
                case 55 /* ForOfStatement */:
                    forOfLookup[expression] = expr;
                    break;
                default:
                    expressionLookup[expression] = expr;
            }
        }
    }
    parseCore(expression, bindingType) {
        try {
            const parts = expression.split('.');
            const firstPart = parts[0];
            let current;
            if (firstPart.endsWith('()')) {
                current = new CallScope(firstPart.replace('()', ''), PLATFORM.emptyArray);
            }
            else {
                current = new AccessScope(parts[0]);
            }
            let index = 1;
            while (index < parts.length) {
                const currentPart = parts[index];
                if (currentPart.endsWith('()')) {
                    current = new CallMember(current, currentPart.replace('()', ''), PLATFORM.emptyArray);
                }
                else {
                    current = new AccessMember(current, parts[index]);
                }
                index++;
            }
            return current;
        }
        catch (e) {
            throw Reporter.error(3, e);
        }
    }
}

class Listener {
    constructor(targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventManager, locator) {
        this.targetEvent = targetEvent;
        this.delegationStrategy = delegationStrategy;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.preventDefault = preventDefault;
        this.eventManager = eventManager;
        this.locator = locator;
        this.$isBound = false;
    }
    callSource(event) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext['$event'] = event;
        const result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.$scope, this.locator);
        delete overrideContext['$event'];
        if (result !== true && this.preventDefault) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        this.callSource(event);
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        const sourceExpression = this.sourceExpression;
        if (hasBind(sourceExpression)) {
            sourceExpression.bind(flags, scope, this);
        }
        this.handler = this.eventManager.addEventListener(this.target, this.targetEvent, this, this.delegationStrategy);
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        const sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.handler.dispose();
        this.handler = null;
    }
    // tslint:disable:no-empty no-any
    observeProperty(obj, propertyName) { }
    handleChange(newValue, previousValue, flags) { }
}

class Ref {
    constructor(sourceExpression, target, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.$isBound = false;
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        const sourceExpression = this.sourceExpression;
        if (hasBind(sourceExpression)) {
            sourceExpression.bind(flags, scope, this);
        }
        this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
            this.sourceExpression.assign(flags, this.$scope, this.locator, null);
        }
        const sourceExpression = this.sourceExpression;
        if (hasUnbind(sourceExpression)) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
    }
    // tslint:disable:no-empty no-any
    observeProperty(obj, propertyName) { }
    handleChange(newValue, previousValue, flags) { }
}

/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param configOrTarget The overrides.
 */
function bindable(configOrTarget, key, descriptor) {
    let deco = function (target, key2, descriptor2) {
        target = target.constructor;
        let bindables = target.bindables || (target.bindables = {});
        let config = configOrTarget || {};
        if (!config.attribute) {
            config.attribute = PLATFORM.kebabCase(key2);
        }
        if (!config.callback) {
            config.callback = `${key2}Changed`;
        }
        if (!config.mode) {
            config.mode = BindingMode.toView;
        }
        config.property = key2;
        bindables[key2] = config;
    };
    if (key) { //placed on a property without parens
        var target = configOrTarget;
        configOrTarget = null; //ensure that the closure captures the fact that there's actually no config
        return deco(target, key, descriptor);
    }
    return deco;
}

// tslint:disable:no-reserved-keywords
const instructionTypeValues = 'abcdefghijkl';
const ITargetedInstruction = DI.createInterface();
function isTargetedInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
}

function createElement(tagOrType, props, children) {
    if (typeof tagOrType === 'string') {
        return createElementForTag(tagOrType, props, children);
    }
    else {
        return createElementForType(tagOrType, props, children);
    }
}
class PotentialRenderable {
    constructor(node, instructions, dependencies) {
        this.node = node;
        this.instructions = instructions;
        this.dependencies = dependencies;
    }
    get definition() {
        return this.lazyDefinition || (this.lazyDefinition = {
            name: 'unnamed',
            templateOrNode: this.node,
            cache: 0,
            build: typeof this.node === 'string' ? {
                required: true,
                compiler: 'default'
            } : {
                required: false
            },
            dependencies: this.dependencies,
            instructions: this.instructions,
            bindables: {},
            containerless: false,
            hasSlots: false,
            shadowOptions: null,
            surrogates: PLATFORM.emptyArray
        });
    }
    getElementTemplate(engine, type) {
        return engine.getElementTemplate(this.definition, type);
    }
    createView(engine, parentContext) {
        return this.getViewFactory(engine, parentContext).create();
    }
    getViewFactory(engine, parentContext) {
        return engine.getViewFactory(this.definition, parentContext);
    }
    /*@internal*/
    mergeInto(parent, instructions, dependencies) {
        DOM.appendChild(parent, this.node);
        instructions.push(...this.instructions);
        dependencies.push(...this.dependencies);
    }
}
function createElementForTag(tagName, props, children) {
    const instructions = [];
    const allInstructions = [];
    const dependencies = [];
    const element = DOM.createElement(tagName);
    let hasInstructions = false;
    if (props) {
        Object.keys(props)
            .forEach(dest => {
            const value = props[dest];
            if (isTargetedInstruction(value)) {
                hasInstructions = true;
                instructions.push(value);
            }
            else {
                DOM.setAttribute(element, dest, value);
            }
        });
    }
    if (hasInstructions) {
        DOM.setAttribute(element, 'class', 'au');
        allInstructions.push(instructions);
    }
    if (children) {
        addChildren(element, children, allInstructions, dependencies);
    }
    return new PotentialRenderable(element, allInstructions, dependencies);
}
function createElementForType(Type, props, children) {
    const tagName = Type.description.name;
    const instructions = [];
    const allInstructions = [instructions];
    const dependencies = [];
    const childInstructions = [];
    const bindables = Type.description.bindables;
    const element = DOM.createElement(tagName);
    DOM.setAttribute(element, 'class', 'au');
    if (!dependencies.includes(Type)) {
        dependencies.push(Type);
    }
    instructions.push({
        type: "k" /* hydrateElement */,
        res: tagName,
        instructions: childInstructions
    });
    if (props) {
        Object.keys(props)
            .forEach(dest => {
            const value = props[dest];
            if (isTargetedInstruction(value)) {
                childInstructions.push(value);
            }
            else {
                const bindable = bindables[dest];
                if (bindable) {
                    childInstructions.push({
                        type: "i" /* setProperty */,
                        dest,
                        value
                    });
                }
                else {
                    childInstructions.push({
                        type: "j" /* setAttribute */,
                        dest,
                        value
                    });
                }
            }
        });
    }
    if (children) {
        addChildren(element, children, allInstructions, dependencies);
    }
    return new PotentialRenderable(element, allInstructions, dependencies);
}
function addChildren(parent, children, allInstructions, dependencies) {
    for (let i = 0, ii = children.length; i < ii; ++i) {
        const current = children[i];
        if (typeof current === 'string') {
            DOM.appendChild(parent, DOM.createText(current));
        }
        else if (DOM.isNodeInstance(current)) {
            DOM.appendChild(parent, current);
        }
        else {
            current.mergeInto(parent, allInstructions, dependencies);
        }
    }
}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
// tslint:disable-next-line:no-any
function customElement(nameOrSource) {
    return function (target) {
        return CustomElementResource.define(nameOrSource, target);
    };
}
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
const CustomElementResource = {
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
        Type.kind = CustomElementResource;
        Type.description = description;
        Type.register = register$2;
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
function register$2(container) {
    container.register(Registration.transient(CustomElementResource.keyFrom(this.description.name), this));
}
function hydrate(renderingEngine, host, options = PLATFORM.emptyObject) {
    const Type = this.constructor;
    const description = Type.description;
    this.$bindables = [];
    this.$attachables = [];
    this.$isAttached = false;
    this.$isBound = false;
    this.$scope = Scope.create(this, null); // TODO: get the parent from somewhere?
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
        this.binding(flags | BindingFlags.fromBind);
    }
    const scope = this.$scope;
    const bindables = this.$bindables;
    for (let i = 0, ii = bindables.length; i < ii; ++i) {
        bindables[i].$bind(flags | BindingFlags.fromBind, scope);
    }
    this.$isBound = true;
    if (behavior.hasBound) {
        this.bound(flags | BindingFlags.fromBind);
    }
}
function unbind(flags) {
    if (this.$isBound) {
        const behavior = this.$behavior;
        if (behavior.hasUnbinding) {
            this.unbinding(flags | BindingFlags.fromUnbind);
        }
        const bindables = this.$bindables;
        let i = bindables.length;
        while (i--) {
            bindables[i].$unbind(flags | BindingFlags.fromUnbind);
        }
        this.$isBound = false;
        if (behavior.hasUnbound) {
            this.unbound(flags | BindingFlags.fromUnbind);
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
        instructions: templateSource.instructions ? PLATFORM.toArray(templateSource.instructions) : PLATFORM.emptyArray,
        dependencies: templateSource.dependencies ? PLATFORM.toArray(templateSource.dependencies) : PLATFORM.emptyArray,
        surrogates: templateSource.surrogates ? PLATFORM.toArray(templateSource.surrogates) : PLATFORM.emptyArray,
        containerless: templateSource.containerless || Type.containerless || false,
        shadowOptions: templateSource.shadowOptions || Type.shadowOptions || null,
        hasSlots: templateSource.hasSlots || false
    };
}
function determineProjector($customElement, host, definition) {
    if (definition.shadowOptions || definition.hasSlots) {
        if (definition.containerless) {
            throw Reporter.error(21);
        }
        return new ShadowDOMProjector($customElement, host, definition);
    }
    if (definition.containerless) {
        return new ContainerlessProjector($customElement, host);
    }
    return new HostProjector($customElement, host);
}
const childObserverOptions$1 = { childList: true };
class ShadowDOMProjector {
    constructor($customElement, host, definition) {
        this.host = host;
        this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
        host.$customElement = $customElement;
        this.shadowRoot.$customElement = $customElement;
    }
    get children() {
        return this.host.childNodes;
    }
    subscribeToChildrenChange(callback) {
        DOM.createNodeObserver(this.host, callback, childObserverOptions$1);
    }
    provideEncapsulationSource(parentEncapsulationSource) {
        return this.shadowRoot;
    }
    project(nodes) {
        nodes.appendTo(this.host);
        this.project = PLATFORM.noop;
    }
    onElementRemoved() {
        // No special behavior is required because the host element removal
        // will result in the projected nodes being removed, since they are in
        // the ShadowDOM.
    }
}
class ContainerlessProjector {
    constructor($customElement, host) {
        this.$customElement = $customElement;
        this.requiresMount = true;
        if (host.childNodes.length) {
            this.childNodes = PLATFORM.toArray(host.childNodes);
        }
        else {
            this.childNodes = PLATFORM.emptyArray;
        }
        this.host = DOM.convertToRenderLocation(host);
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
            throw Reporter.error(22);
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
class HostProjector {
    constructor($customElement, host) {
        this.host = host;
        host.$customElement = $customElement;
    }
    get children() {
        return PLATFORM.emptyArray;
    }
    subscribeToChildrenChange(callback) {
        // Do nothing since this scenario will never have children.
    }
    provideEncapsulationSource(parentEncapsulationSource) {
        return parentEncapsulationSource || this.host;
    }
    project(nodes) {
        nodes.appendTo(this.host);
        this.project = PLATFORM.noop;
    }
    onElementRemoved() {
        // No special behavior is required because the host element removal
        // will result in the projected nodes being removed, since they are children.
    }
}
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

/**
 */
const IRenderable = DI.createInterface().noDefault();

// tslint:disable:no-any
const { toView: toView$2, oneTime: oneTime$2 } = BindingMode;
class MultiInterpolationBinding {
    constructor(observerLocator, interpolation, target, targetProperty, mode, locator) {
        this.observerLocator = observerLocator;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.$isBound = false;
        this.$scope = null;
        // Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
        // value converters and binding behaviors.
        // Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
        // in which case the renderer will create the TextBinding directly
        const expressions = interpolation.expressions;
        const parts = this.parts = Array(expressions.length);
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            parts[i] = new InterpolationBinding(expressions[i], interpolation, target, targetProperty, mode, observerLocator, locator, i === 0);
        }
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        const parts = this.parts;
        for (let i = 0, ii = parts.length; i < ii; ++i) {
            parts[i].$bind(flags, scope);
        }
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        this.$scope = null;
        const parts = this.parts;
        for (let i = 0, ii = parts.length; i < ii; ++i) {
            parts[i].$unbind(flags);
        }
    }
}
let InterpolationBinding = class InterpolationBinding {
    constructor(sourceExpression, interpolation, target, targetProperty, mode, observerLocator, locator, isFirst) {
        this.sourceExpression = sourceExpression;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.isFirst = isFirst;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
    }
    updateTarget(value, flags) {
        this.targetObserver.setValue(value, flags | BindingFlags.updateTargetInstance);
    }
    handleChange(newValue, previousValue, flags) {
        if (!this.$isBound) {
            return;
        }
        previousValue = this.targetObserver.getValue();
        newValue = this.interpolation.evaluate(flags, this.$scope, this.locator);
        if (newValue !== previousValue) {
            this.updateTarget(newValue, flags);
        }
        if ((this.mode & oneTime$2) === 0) {
            this.version++;
            this.sourceExpression.connect(flags, this.$scope, this);
            this.unobserve(false);
        }
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(flags, scope, this);
        }
        // since the interpolation already gets the whole value, we only need to let the first
        // text binding do the update if there are multiple
        if (this.isFirst) {
            this.updateTarget(this.interpolation.evaluate(flags, scope, this.locator), flags);
        }
        if ((this.mode & toView$2) > 0) {
            sourceExpression.connect(flags, scope, this);
        }
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.unobserve(true);
    }
};
InterpolationBinding = __decorate([
    connectable()
], InterpolationBinding);

let LetBinding = class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toViewModel = false) {
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.toViewModel = toViewModel;
        this.$isBound = false;
        this.$scope = null;
        this.target = null;
    }
    handleChange(newValue, previousValue, flags) {
        if (!this.$isBound) {
            return;
        }
        if (flags & BindingFlags.updateTargetInstance) {
            const { target, targetProperty } = this;
            previousValue = target[targetProperty];
            newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
            if (newValue !== previousValue) {
                target[targetProperty] = newValue;
            }
            return;
        }
        throw Reporter.error(15, flags);
    }
    $bind(flags, scope) {
        if (this.$isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.$unbind(flags);
        }
        this.$isBound = true;
        this.$scope = scope;
        this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.bind) {
            sourceExpression.bind(flags, scope, this);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty] = this.sourceExpression.evaluate(BindingFlags.fromBind, scope, this.locator);
        this.sourceExpression.connect(flags, scope, this);
    }
    $unbind(flags) {
        if (!this.$isBound) {
            return;
        }
        this.$isBound = false;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.unbind) {
            sourceExpression.unbind(flags, this.$scope, this);
        }
        this.$scope = null;
        this.unobserve(true);
    }
};
LetBinding = __decorate([
    connectable()
], LetBinding);

/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
function customAttribute(nameOrSource) {
    return function (target) {
        return CustomAttributeResource.define(nameOrSource, target);
    };
}
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
        return CustomAttributeResource.define(source, target);
    };
}
const CustomAttributeResource = {
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
        Type.kind = CustomAttributeResource;
        Type.description = description;
        Type.register = register$3;
        proto.$hydrate = hydrate$1;
        proto.$bind = bind$1;
        proto.$attach = attach$1;
        proto.$detach = detach$1;
        proto.$unbind = unbind$1;
        proto.$cache = cache$1;
        return Type;
    }
};
function register$3(container) {
    const description = this.description;
    const resourceKey = CustomAttributeResource.keyFrom(description.name);
    const aliases = description.aliases;
    container.register(Registration.transient(resourceKey, this));
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        container.register(Registration.alias(resourceKey, aliases[i]));
    }
}
function hydrate$1(renderingEngine) {
    this.$isAttached = false;
    this.$isBound = false;
    this.$scope = null;
    renderingEngine.applyRuntimeBehavior(this.constructor, this);
    if (this.$behavior.hasCreated) {
        this.created();
    }
}
function bind$1(flags, scope) {
    if (this.$isBound) {
        if (this.$scope === scope) {
            return;
        }
        this.$unbind(flags | BindingFlags.fromBind);
    }
    const behavior = this.$behavior;
    this.$scope = scope;
    if (behavior.hasBinding) {
        this.binding(flags | BindingFlags.fromBind);
    }
    this.$isBound = true;
    if (behavior.hasBound) {
        this.bound(flags | BindingFlags.fromBind, scope);
    }
}
function unbind$1(flags) {
    if (this.$isBound) {
        const behavior = this.$behavior;
        if (behavior.hasUnbinding) {
            this.unbinding(flags | BindingFlags.fromUnbind);
        }
        this.$isBound = false;
        if (this.$behavior.hasUnbound) {
            this.unbound(flags | BindingFlags.fromUnbind);
        }
    }
}
function attach$1(encapsulationSource, lifecycle) {
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
function detach$1(lifecycle) {
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
function cache$1() {
    if (this.$behavior.hasCaching) {
        this.caching();
    }
}
/*@internal*/
function createCustomAttributeDescription(attributeSource, Type) {
    return {
        name: attributeSource.name,
        aliases: attributeSource.aliases || PLATFORM.emptyArray,
        defaultBindingMode: attributeSource.defaultBindingMode || BindingMode.toView,
        isTemplateController: attributeSource.isTemplateController || false,
        bindables: Object.assign({}, Type.bindables, attributeSource.bindables)
    };
}

function renderStrategy(nameOrSource) {
    return function (target) {
        return RenderStrategyResource.define(nameOrSource, target);
    };
}
const RenderStrategyResource = {
    name: 'render-strategy',
    keyFrom(name) {
        return `${this.name}:${name}`;
    },
    isType(type) {
        return type.kind === this;
    },
    define(nameOrSource, ctor) {
        const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
        const Type = ctor;
        Type.kind = RenderStrategyResource;
        Type.description = description;
        Type.register = function (container) {
            container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
        };
        return Type;
    }
};

// tslint:disable:function-name
// tslint:disable:no-any
/* @internal */
class Renderer {
    constructor(context, observerLocator, eventManager, parser, renderingEngine) {
        this.context = context;
        this.observerLocator = observerLocator;
        this.eventManager = eventManager;
        this.parser = parser;
        this.renderingEngine = renderingEngine;
    }
    render(renderable, targets, definition, host, parts) {
        const targetInstructions = definition.instructions;
        if (targets.length !== targetInstructions.length) {
            if (targets.length > targetInstructions.length) {
                throw Reporter.error(30);
            }
            else {
                throw Reporter.error(31);
            }
        }
        for (let i = 0, ii = targets.length; i < ii; ++i) {
            const instructions = targetInstructions[i];
            const target = targets[i];
            for (let j = 0, jj = instructions.length; j < jj; ++j) {
                const current = instructions[j];
                this[current.type](renderable, target, current, parts);
            }
        }
        if (host) {
            const surrogateInstructions = definition.surrogates;
            for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                const current = surrogateInstructions[i];
                this[current.type](renderable, host, current, parts);
            }
        }
    }
    hydrateElementInstance(renderable, target, instruction, component) {
        const childInstructions = instruction.instructions;
        component.$hydrate(this.renderingEngine, target, instruction);
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            const current = childInstructions[i];
            const currentType = current.type;
            this[currentType](renderable, component, current);
        }
        renderable.$bindables.push(component);
        renderable.$attachables.push(component);
    }
    ["a" /* textBinding */](renderable, target, instruction) {
        const next = target.nextSibling;
        DOM.treatAsNonWhitespace(next);
        DOM.remove(target);
        const srcOrExpr = instruction.srcOrExpr;
        const expr = (srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 2048 /* Interpolation */));
        if (expr.isMulti) {
            renderable.$bindables.push(new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, this.context));
        }
        else {
            renderable.$bindables.push(new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, this.context, true));
        }
    }
    ["b" /* interpolation */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        const expr = (srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 2048 /* Interpolation */));
        if (expr.isMulti) {
            renderable.$bindables.push(new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.dest, BindingMode.toView, this.context));
        }
        else {
            renderable.$bindables.push(new InterpolationBinding(expr.firstExpression, expr, target, instruction.dest, BindingMode.toView, this.observerLocator, this.context, true));
        }
    }
    ["c" /* propertyBinding */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */ | instruction.mode), target, instruction.dest, instruction.mode, this.observerLocator, this.context));
    }
    ["d" /* iteratorBinding */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 539 /* ForCommand */), target, instruction.dest, BindingMode.toView, this.observerLocator, this.context));
    }
    ["e" /* listenerBinding */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        renderable.$bindables.push(new Listener(instruction.dest, instruction.strategy, srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */)), target, instruction.preventDefault, this.eventManager, this.context));
    }
    ["f" /* callBinding */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        renderable.$bindables.push(new Call(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 153 /* CallCommand */), target, instruction.dest, this.observerLocator, this.context));
    }
    ["g" /* refBinding */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        renderable.$bindables.push(new Ref(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 1280 /* IsRef */), target, this.context));
    }
    ["h" /* stylePropertyBinding */](renderable, target, instruction) {
        const srcOrExpr = instruction.srcOrExpr;
        renderable.$bindables.push(new Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */ | BindingMode.toView), target.style, instruction.dest, BindingMode.toView, this.observerLocator, this.context));
    }
    ["i" /* setProperty */](renderable, target, instruction) {
        target[instruction.dest] = instruction.value;
    }
    ["j" /* setAttribute */](renderable, target, instruction) {
        DOM.setAttribute(target, instruction.dest, instruction.value);
    }
    ["k" /* hydrateElement */](renderable, target, instruction) {
        const context = this.context;
        const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
        const component = context.get(CustomElementResource.keyFrom(instruction.res));
        this.hydrateElementInstance(renderable, target, instruction, component);
        operation.dispose();
    }
    ["l" /* hydrateAttribute */](renderable, target, instruction) {
        const childInstructions = instruction.instructions;
        const context = this.context;
        const operation = context.beginComponentOperation(renderable, target, instruction);
        const component = context.get(CustomAttributeResource.keyFrom(instruction.res));
        component.$hydrate(this.renderingEngine);
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            const current = childInstructions[i];
            this[current.type](renderable, component, current);
        }
        renderable.$bindables.push(component);
        renderable.$attachables.push(component);
        operation.dispose();
    }
    ["m" /* hydrateTemplateController */](renderable, target, instruction, parts) {
        const childInstructions = instruction.instructions;
        const factory = this.renderingEngine.getViewFactory(instruction.src, this.context);
        const context = this.context;
        const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);
        const component = context.get(CustomAttributeResource.keyFrom(instruction.res));
        component.$hydrate(this.renderingEngine);
        if (instruction.link) {
            component.link(renderable.$attachables[renderable.$attachables.length - 1]);
        }
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            const current = childInstructions[i];
            this[current.type](renderable, component, current);
        }
        renderable.$bindables.push(component);
        renderable.$attachables.push(component);
        operation.dispose();
    }
    ["z" /* renderStrategy */](renderable, target, instruction) {
        const strategyName = instruction.name;
        if (this[strategyName] === undefined) {
            const strategy = this.context.get(RenderStrategyResource.keyFrom(strategyName));
            if (strategy === null || strategy === undefined) {
                throw new Error(`Unknown renderStrategy "${strategyName}"`);
            }
            this[strategyName] = strategy.render.bind(strategy);
        }
        this[strategyName](renderable, target, instruction);
    }
    ["n" /* letElement */](renderable, target, instruction) {
        target.remove();
        const childInstructions = instruction.instructions;
        const toViewModel = instruction.toViewModel;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            const childInstruction = childInstructions[i];
            const srcOrExpr = childInstruction.srcOrExpr;
            renderable.$bindables.push(new LetBinding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */), childInstruction.dest, this.observerLocator, this.context, toViewModel));
        }
    }
}

/** @internal */
class RuntimeBehavior {
    constructor() {
        this.hasCreated = false;
        this.hasBinding = false;
        this.hasBound = false;
        this.hasAttaching = false;
        this.hasAttached = false;
        this.hasDetaching = false;
        this.hasDetached = false;
        this.hasUnbinding = false;
        this.hasUnbound = false;
        this.hasRender = false;
        this.hasCaching = false;
    }
    static create(Component, instance) {
        const behavior = new RuntimeBehavior();
        behavior.bindables = Component.description.bindables;
        behavior.hasCreated = 'created' in instance;
        behavior.hasBinding = 'binding' in instance;
        behavior.hasBound = 'bound' in instance;
        behavior.hasAttaching = 'attaching' in instance;
        behavior.hasAttached = 'attached' in instance;
        behavior.hasDetaching = 'detaching' in instance;
        behavior.hasDetached = 'detached' in instance;
        behavior.hasUnbinding = 'unbinding' in instance;
        behavior.hasUnbound = 'unbound' in instance;
        behavior.hasRender = 'render' in instance;
        behavior.hasCaching = 'caching' in instance;
        return behavior;
    }
    applyTo(instance, changeSet) {
        if ('$projector' in instance) {
            this.applyToElement(changeSet, instance);
        }
        else {
            this.applyToCore(changeSet, instance);
        }
    }
    applyToElement(changeSet, instance) {
        const observers = this.applyToCore(changeSet, instance);
        observers.$children = new ChildrenObserver(changeSet, instance);
        Reflect.defineProperty(instance, '$children', {
            enumerable: false,
            get: function () {
                return this.$observers.$children.getValue();
            }
        });
    }
    applyToCore(changeSet, instance) {
        const observers = {};
        const bindables = this.bindables;
        const observableNames = Object.getOwnPropertyNames(bindables);
        for (let i = 0, ii = observableNames.length; i < ii; ++i) {
            const name = observableNames[i];
            observers[name] = new Observer(instance, name, bindables[name].callback);
            createGetterSetter(instance, name);
        }
        Reflect.defineProperty(instance, '$observers', {
            enumerable: false,
            value: observers
        });
        instance.$behavior = this;
        return observers;
    }
}
function createGetterSetter(instance, name) {
    Reflect.defineProperty(instance, name, {
        enumerable: true,
        get: function () { return this.$observers[name].getValue(); },
        set: function (value) { this.$observers[name].setValue(value, BindingFlags.updateTargetInstance); }
    });
}
/*@internal*/
let ChildrenObserver = class ChildrenObserver {
    constructor(changeSet, customElement$$1) {
        this.changeSet = changeSet;
        this.customElement = customElement$$1;
        this.hasChanges = false;
        this.children = null;
        this.observing = false;
    }
    getValue() {
        if (!this.observing) {
            this.observing = true;
            this.customElement.$projector.subscribeToChildrenChange(() => this.onChildrenChanged());
            this.children = findElements(this.customElement.$projector.children);
        }
        return this.children;
    }
    setValue(newValue) { }
    flushChanges() {
        this.callSubscribers(this.children, undefined, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
        this.hasChanges = false;
    }
    subscribe(subscriber) {
        this.addSubscriber(subscriber);
    }
    unsubscribe(subscriber) {
        this.removeSubscriber(subscriber);
    }
    onChildrenChanged() {
        this.children = findElements(this.customElement.$projector.children);
        if ('$childrenChanged' in this.customElement) {
            this.customElement.$childrenChanged();
        }
        this.changeSet.add(this);
        this.hasChanges = true;
    }
};
ChildrenObserver = __decorate([
    subscriberCollection(MutationKind.instance)
], ChildrenObserver);
const elementBehaviorFor = CustomElementResource.behaviorFor;
/*@internal*/
function findElements(nodes) {
    const components = [];
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const current = nodes[i];
        const component = elementBehaviorFor(current);
        if (component !== null) {
            components.push(component);
        }
    }
    return components;
}

const IViewFactory = DI.createInterface().noDefault();
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
            throw Reporter.error(60); // TODO: organize error codes
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

function createRenderContext(renderingEngine, parentRenderContext, dependencies) {
    const context = parentRenderContext.createChild();
    const renderableProvider = new InstanceProvider();
    const elementProvider = new InstanceProvider();
    const instructionProvider = new InstanceProvider();
    const factoryProvider = new ViewFactoryProvider(renderingEngine);
    const renderLocationProvider = new InstanceProvider();
    const renderer = renderingEngine.createRenderer(context);
    DOM.registerElementResolver(context, elementProvider);
    context.registerResolver(IViewFactory, factoryProvider);
    context.registerResolver(IRenderable, renderableProvider);
    context.registerResolver(ITargetedInstruction, instructionProvider);
    context.registerResolver(IRenderLocation, renderLocationProvider);
    if (dependencies) {
        context.register(...dependencies);
    }
    context.render = function (renderable, targets, templateDefinition, host, parts) {
        renderer.render(renderable, targets, templateDefinition, host, parts);
    };
    context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
        renderableProvider.prepare(renderable);
        elementProvider.prepare(target);
        instructionProvider.prepare(instruction);
        if (factory) {
            factoryProvider.prepare(factory, parts);
        }
        if (location) {
            renderLocationProvider.prepare(location);
        }
        return context;
    };
    context.dispose = function () {
        factoryProvider.dispose();
        renderableProvider.dispose();
        instructionProvider.dispose();
        elementProvider.dispose();
        renderLocationProvider.dispose();
    };
    return context;
}
/*@internal*/
class InstanceProvider {
    constructor() {
        this.instance = null;
    }
    prepare(instance) {
        this.instance = instance;
    }
    resolve(handler, requestor) {
        if (this.instance === undefined) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        return this.instance;
    }
    dispose() {
        this.instance = null;
    }
}
/*@internal*/
class ViewFactoryProvider {
    constructor(renderingEngine) {
        this.renderingEngine = renderingEngine;
    }
    prepare(factory, parts) {
        this.factory = factory;
        this.replacements = parts || PLATFORM.emptyObject;
    }
    resolve(handler, requestor) {
        const factory = this.factory;
        if (factory === undefined) { // unmet precondition: call prepare
            throw Reporter.error(50); // TODO: organize error codes
        }
        if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
            throw Reporter.error(51); // TODO: organize error codes
        }
        const found = this.replacements[factory.name];
        if (found) {
            return this.renderingEngine.getViewFactory(found, requestor);
        }
        return this.factory;
    }
    dispose() {
        this.factory = null;
        this.replacements = null;
    }
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
class CompiledTemplate {
    constructor(renderingEngine, parentRenderContext, templateDefinition) {
        this.templateDefinition = templateDefinition;
        this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
        this.createNodeSequence = DOM.createFactoryFromMarkupOrNode(templateDefinition.templateOrNode);
    }
    createFor(renderable, host, replacements) {
        const nodes = this.createNodeSequence();
        this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, replacements);
        return nodes;
    }
}
// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/*@internal*/
const noViewTemplate = {
    renderContext: null,
    createFor(renderable) {
        return NodeSequence.empty;
    }
};

const ITemplateCompiler = DI.createInterface().noDefault();

var ViewCompileFlags;
(function (ViewCompileFlags) {
    ViewCompileFlags[ViewCompileFlags["none"] = 1] = "none";
    ViewCompileFlags[ViewCompileFlags["surrogate"] = 2] = "surrogate";
    ViewCompileFlags[ViewCompileFlags["shadowDOM"] = 4] = "shadowDOM";
})(ViewCompileFlags || (ViewCompileFlags = {}));

const IRenderingEngine = DI.createInterface()
    .withDefault(x => x.singleton(RenderingEngine));
const defaultCompilerName = 'default';
let RenderingEngine = 
/*@internal*/
class RenderingEngine {
    constructor(container, changeSet, observerLocator, eventManager, parser, templateCompilers) {
        this.container = container;
        this.changeSet = changeSet;
        this.observerLocator = observerLocator;
        this.eventManager = eventManager;
        this.parser = parser;
        this.templateLookup = new Map();
        this.factoryLookup = new Map();
        this.behaviorLookup = new Map();
        this.compilers = templateCompilers.reduce((acc, item) => {
            acc[item.name] = item;
            return acc;
        }, Object.create(null));
    }
    getElementTemplate(definition, componentType) {
        if (!definition) {
            return null;
        }
        let found = this.templateLookup.get(definition);
        if (!found) {
            found = this.templateFromSource(definition);
            //If the element has a view, support Recursive Components by adding self to own view template container.
            if (found.renderContext !== null && componentType) {
                componentType.register(found.renderContext);
            }
            this.templateLookup.set(definition, found);
        }
        return found;
    }
    getViewFactory(definition, parentContext) {
        if (!definition) {
            return null;
        }
        let found = this.factoryLookup.get(definition);
        if (!found) {
            const validSource = createDefinition(definition);
            found = this.factoryFromSource(validSource, parentContext);
            this.factoryLookup.set(definition, found);
        }
        return found;
    }
    applyRuntimeBehavior(type, instance) {
        let found = this.behaviorLookup.get(type);
        if (!found) {
            found = RuntimeBehavior.create(type, instance);
            this.behaviorLookup.set(type, found);
        }
        found.applyTo(instance, this.changeSet);
    }
    createRenderer(context) {
        return new Renderer(context, this.observerLocator, this.eventManager, this.parser, this);
    }
    factoryFromSource(definition, parentContext) {
        const template = this.templateFromSource(definition, parentContext);
        const factory = new ViewFactory(definition.name, template);
        factory.setCacheSize(definition.cache, true);
        return factory;
    }
    templateFromSource(definition, parentContext) {
        parentContext = parentContext || this.container;
        if (definition && definition.templateOrNode) {
            if (definition.build.required) {
                const compilerName = definition.build.compiler || defaultCompilerName;
                const compiler = this.compilers[compilerName];
                if (!compiler) {
                    throw Reporter.error(20, compilerName);
                }
                definition = compiler.compile(definition, new RuntimeCompilationResources(parentContext), ViewCompileFlags.surrogate);
            }
            return new CompiledTemplate(this, parentContext, definition);
        }
        return noViewTemplate;
    }
};
RenderingEngine = __decorate([
    inject(IContainer, IChangeSet, IObserverLocator, IEventManager, IExpressionParser, all(ITemplateCompiler))
    /*@internal*/
], RenderingEngine);
/*@internal*/
function createDefinition(definition) {
    return {
        name: definition.name || 'Unnamed Template',
        templateOrNode: definition.templateOrNode,
        cache: definition.cache || 0,
        build: definition.build || {
            required: false
        },
        bindables: definition.bindables || PLATFORM.emptyObject,
        instructions: definition.instructions ? PLATFORM.toArray(definition.instructions) : PLATFORM.emptyArray,
        dependencies: definition.dependencies ? PLATFORM.toArray(definition.dependencies) : PLATFORM.emptyArray,
        surrogates: definition.surrogates ? PLATFORM.toArray(definition.surrogates) : PLATFORM.emptyArray,
        containerless: definition.containerless || false,
        shadowOptions: definition.shadowOptions || null,
        hasSlots: definition.hasSlots || false
    };
}
/*@internal*/
class RuntimeCompilationResources {
    constructor(context) {
        this.context = context;
    }
    find(kind, name) {
        const key = kind.keyFrom(name);
        const resolver = this.context.getResolver(key, false);
        if (resolver !== null && resolver.getFactory) {
            const factory = resolver.getFactory(this.context);
            if (factory !== null) {
                return factory.type.description || null;
            }
        }
        return null;
    }
    create(kind, name) {
        const key = kind.keyFrom(name);
        if (this.context.has(key, false)) {
            return this.context.get(key) || null;
        }
        return null;
    }
}

var LifecycleFlags;
(function (LifecycleFlags) {
    LifecycleFlags[LifecycleFlags["none"] = 1] = "none";
    LifecycleFlags[LifecycleFlags["noTasks"] = 2] = "noTasks";
    LifecycleFlags[LifecycleFlags["unbindAfterDetached"] = 4] = "unbindAfterDetached";
})(LifecycleFlags || (LifecycleFlags = {}));
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
        return Lifecycle.done;
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
        return Lifecycle.done;
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
                    currentRemoveNodes.$unbind(BindingFlags.fromUnbind);
                }
                nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
                currentRemoveNodes.$nextRemoveNodes = null;
                currentRemoveNodes = nextRemoveNodes;
            }
        }
    }
}
function isNodeRemovable(requestor) {
    return '$removeNodes' in requestor;
}
function isUnbindable(requestor) {
    return '$unbind' in requestor;
}
const Lifecycle = {
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

class CompositionCoordinator {
    constructor() {
        this.onSwapComplete = PLATFORM.noop;
        this.queue = null;
        this.currentView = null;
        this.swapTask = Lifecycle.done;
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
        const swapTask = new AggregateLifecycleTask();
        swapTask.addTask(this.detachAndUnbindCurrentView(this.isAttached
            ? LifecycleFlags.none
            : LifecycleFlags.noTasks));
        this.currentView = view;
        swapTask.addTask(this.bindAndAttachCurrentView());
        if (swapTask.done) {
            this.swapTask = Lifecycle.done;
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
            this.swapTask = Lifecycle.done;
        }
    }
    detachAndUnbindCurrentView(detachFlags) {
        if (this.currentView === null) {
            return Lifecycle.done;
        }
        return Lifecycle.beginDetach(detachFlags | LifecycleFlags.unbindAfterDetached)
            .detach(this.currentView)
            .end();
    }
    bindAndAttachCurrentView() {
        if (this.currentView === null) {
            return Lifecycle.done;
        }
        if (this.isBound) {
            this.currentView.$bind(BindingFlags.fromBindableHandler, this.scope);
        }
        if (this.isAttached) {
            return Lifecycle.beginAttach(this.encapsulationSource, LifecycleFlags.none)
                .attach(this.currentView)
                .end();
        }
        return Lifecycle.done;
    }
}
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
            return Lifecycle.done;
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

const composeSource = {
    name: 'au-compose',
    containerless: true
};
const composeProps = ['subject', 'composing'];
let Compose = class Compose {
    constructor(renderable, instruction, renderingEngine) {
        this.renderable = renderable;
        this.renderingEngine = renderingEngine;
        this.subject = null;
        this.composing = false;
        this.properties = null;
        this.lastSubject = null;
        this.coordinator = new CompositionCoordinator();
        this.coordinator.onSwapComplete = () => {
            this.composing = false;
        };
        this.properties = instruction.instructions
            .filter((x) => !composeProps.includes(x.dest))
            .reduce((acc, item) => {
            if (item.dest) {
                acc[item.dest] = item;
            }
            return acc;
        }, {});
    }
    binding(flags) {
        this.startComposition(this.subject);
        this.coordinator.binding(flags, this.$scope);
    }
    attaching(encapsulationSource, lifecycle) {
        this.coordinator.attaching(encapsulationSource, lifecycle);
    }
    detaching(lifecycle) {
        this.coordinator.detaching(lifecycle);
    }
    unbinding(flags) {
        this.lastSubject = null;
        this.coordinator.unbinding(flags);
    }
    caching() {
        this.coordinator.caching();
    }
    subjectChanged(newValue) {
        this.startComposition(newValue);
    }
    startComposition(subject) {
        if (this.lastSubject === subject) {
            return;
        }
        this.lastSubject = subject;
        if (subject instanceof Promise) {
            subject = subject.then(x => this.resolveView(x));
        }
        else {
            subject = this.resolveView(subject);
        }
        this.composing = true;
        this.coordinator.compose(subject);
    }
    resolveView(subject) {
        const view = this.provideViewFor(subject);
        if (view) {
            view.mount(this.$projector.host);
            view.lockScope(this.renderable.$scope);
            return view;
        }
        return null;
    }
    provideViewFor(subject) {
        if (!subject) {
            return null;
        }
        if ('templateOrNode' in subject) { // Raw Template Definition
            return this.renderingEngine.getViewFactory(subject, this.renderable.$context).create();
        }
        if ('create' in subject) { // IViewFactory
            return subject.create();
        }
        if ('createView' in subject) { // PotentialRenderable
            return subject.createView(this.renderingEngine, this.renderable.$context);
        }
        if ('lockScope' in subject) { // IView
            return subject;
        }
        // Constructable (Custom Element Constructor)
        return createElement(subject, this.properties, this.$projector.children).createView(this.renderingEngine, this.renderable.$context);
    }
};
__decorate([
    bindable
], Compose.prototype, "subject", void 0);
__decorate([
    bindable
], Compose.prototype, "composing", void 0);
Compose = __decorate([
    customElement(composeSource),
    inject(IRenderable, ITargetedInstruction, IRenderingEngine)
], Compose);

let If = class If {
    constructor(ifFactory, location) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.value = false;
        this.elseFactory = null;
        this.ifView = null;
        this.elseView = null;
        this.coordinator = new CompositionCoordinator();
    }
    binding(flags) {
        this.updateView();
        this.coordinator.binding(flags, this.$scope);
    }
    attaching(encapsulationSource, lifecycle) {
        this.coordinator.attaching(encapsulationSource, lifecycle);
    }
    detaching(lifecycle) {
        this.coordinator.detaching(lifecycle);
    }
    unbinding(flags) {
        this.coordinator.unbinding(flags);
    }
    caching() {
        if (this.ifView !== null && this.ifView.release()) {
            this.ifView = null;
        }
        if (this.elseView !== null && this.elseView.release()) {
            this.elseView = null;
        }
        this.coordinator.caching();
    }
    valueChanged() {
        this.updateView();
    }
    updateView() {
        let view;
        if (this.value) {
            view = this.ifView = this.ensureView(this.ifView, this.ifFactory);
        }
        else if (this.elseFactory !== null) {
            view = this.elseView = this.ensureView(this.elseView, this.elseFactory);
        }
        else {
            view = null;
        }
        this.coordinator.compose(view);
    }
    ensureView(view, factory) {
        if (view === null) {
            view = factory.create();
        }
        view.mount(this.location);
        return view;
    }
};
__decorate([
    bindable
], If.prototype, "value", void 0);
If = __decorate([
    templateController('if'),
    inject(IViewFactory, IRenderLocation)
], If);
let Else = class Else {
    constructor(factory, location) {
        this.factory = factory;
        DOM.remove(location); // Only the location of the "if" is relevant.
    }
    link(ifBehavior) {
        ifBehavior.elseFactory = this.factory;
    }
};
Else = __decorate([
    templateController('else'),
    inject(IViewFactory, IRenderLocation)
], Else);

const batchedChangesFlags = BindingFlags.fromFlushChanges | BindingFlags.fromBind;
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
        this.processViews(null, flags | BindingFlags.updateTargetInstance);
    }
    // called by a CollectionObserver (async)
    handleBatchedChange(indexMap) {
        this.processViews(indexMap, BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance);
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
                const lifecycle = Lifecycle.beginDetach(LifecycleFlags.unbindAfterDetached);
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
                        view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                    }
                    else {
                        view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                    }
                });
            }
            else {
                forOf.iterate(items, (arr, i, item) => {
                    const view = views[i];
                    if (indexMap[i] === i) {
                        view.$bind(flags, Scope.fromParent($scope, view.$scope.bindingContext));
                    }
                    else {
                        view.$bind(flags, Scope.fromParent($scope, BindingContext.create(local, item)));
                    }
                });
            }
        }
        if (this.$isAttached) {
            const { location } = this;
            const lifecycle = Lifecycle.beginAttach(this.encapsulationSource, LifecycleFlags.none);
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
            const newObserver = this.observer = getCollectionObserver(this.changeSet, this.items);
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
__decorate([
    bindable
], Repeat.prototype, "items", void 0);
Repeat = __decorate([
    inject(IChangeSet, IRenderLocation, IRenderable, IViewFactory),
    templateController('repeat')
], Repeat);

let Replaceable = class Replaceable {
    constructor(factory, location) {
        this.factory = factory;
        this.currentView = this.factory.create();
        this.currentView.mount(location);
    }
    binding(flags) {
        this.currentView.$bind(flags, this.$scope);
    }
    attaching(encapsulationSource, lifecycle) {
        this.currentView.$attach(encapsulationSource, lifecycle);
    }
    detaching(lifecycle) {
        this.currentView.$detach(lifecycle);
    }
    unbinding(flags) {
        this.currentView.$unbind(flags);
    }
};
Replaceable = __decorate([
    templateController('replaceable'),
    inject(IViewFactory, IRenderLocation)
], Replaceable);

let With = class With {
    constructor(factory, location) {
        this.factory = factory;
        this.value = null;
        this.currentView = null;
        this.currentView = this.factory.create();
        this.currentView.mount(location);
    }
    valueChanged() {
        this.bindChild(BindingFlags.fromBindableHandler);
    }
    binding(flags) {
        this.bindChild(flags);
    }
    attaching(encapsulationSource, lifecycle) {
        this.currentView.$attach(encapsulationSource, lifecycle);
    }
    detaching(lifecycle) {
        this.currentView.$detach(lifecycle);
    }
    unbinding(flags) {
        this.currentView.$unbind(flags);
    }
    bindChild(flags) {
        this.currentView.$bind(flags, Scope.fromParent(this.$scope, this.value));
    }
};
__decorate([
    bindable
], With.prototype, "value", void 0);
With = __decorate([
    templateController('with'),
    inject(IViewFactory, IRenderLocation)
], With);

class Aurelia {
    constructor(container = DI.createContainer()) {
        this.container = container;
        this.components = [];
        this.startTasks = [];
        this.stopTasks = [];
        this.isStarted = false;
        this._root = null;
        Registration
            .instance(Aurelia, this)
            .register(container, Aurelia);
    }
    register(...params) {
        this.container.register(...params);
        return this;
    }
    app(config) {
        const component = config.component;
        const startTask = () => {
            if (!this.components.includes(component)) {
                this._root = component;
                this.components.push(component);
                component.$hydrate(this.container.get(IRenderingEngine), config.host);
            }
            component.$bind(BindingFlags.fromStartTask | BindingFlags.fromBind);
            Lifecycle.beginAttach(config.host, LifecycleFlags.none)
                .attach(component)
                .end();
        };
        this.startTasks.push(startTask);
        this.stopTasks.push(() => {
            const task = Lifecycle.beginDetach(LifecycleFlags.noTasks)
                .detach(component)
                .end();
            const flags = BindingFlags.fromStopTask | BindingFlags.fromUnbind;
            if (task.done) {
                component.$unbind(flags);
            }
            else {
                task.wait().then(() => component.$unbind(flags));
            }
        });
        if (this.isStarted) {
            startTask();
        }
        return this;
    }
    root() {
        return this._root;
    }
    start() {
        this.startTasks.forEach(x => x());
        this.isStarted = true;
        return this;
    }
    stop() {
        this.isStarted = false;
        this.stopTasks.forEach(x => x());
        return this;
    }
}
PLATFORM.global.Aurelia = Aurelia;

export { ArrayObserver, enableArrayObservation, disableArrayObservation, nativePush, nativePop, nativeShift, nativeUnshift, nativeSplice, nativeReverse, nativeSort, MapObserver, enableMapObservation, disableMapObservation, nativeSet, nativeDelete$1 as nativeMapDelete, nativeClear$1 as nativeMapClear, SetObserver, enableSetObservation, disableSetObservation, nativeAdd, nativeDelete as nativeSetDelete, nativeClear as nativeSetClear, AttrBindingBehavior, BindingModeBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, TwoWayBindingBehavior, debounceCallSource, debounceCall, DebounceBindingBehavior, ISanitizer, SanitizeValueConverter, findOriginalEventTarget, handleSelfEvent, SelfBindingBehavior, SignalBindingBehavior, throttle, ThrottleBindingBehavior, UpdateTriggerBindingBehavior, connects, observes, callsFunction, hasAncestor, isAssignable, isLeftHandSide, isPrimary, isResource, hasBind, hasUnbind, isLiteral, arePureLiterals, isPureLiteral, BindingBehavior, ValueConverter, Assign, Conditional, AccessThis, AccessScope, AccessMember, AccessKeyed, CallScope, CallMember, CallFunction, Binary, Unary, PrimitiveLiteral, HtmlLiteral, ArrayLiteral, ObjectLiteral, Template, TaggedTemplate, ArrayBindingPattern, ObjectBindingPattern, BindingIdentifier, ForOfStatement, Interpolation, IterateForOfStatement, CountForOfStatement, bindingBehavior, BindingBehaviorResource, InternalObserversLookup, BindingContext, Scope, OverrideContext, BindingFlags, BindingMode, Binding, Call, IChangeSet, ChangeSet, collectionObserver, CollectionLengthObserver, computed, createComputedObserver, CustomSetterObserver, GetterObserver, GetterController, IDirtyChecker, DirtyChecker, DirtyCheckProperty, ValueAttributeObserver, CheckedObserver, SelectValueObserver, ListenerTracker, DelegateOrCaptureSubscription, TriggerSubscription, DelegationStrategy, EventSubscriber, IEventManager, EventManager, IExpressionParser, ExpressionParser, Listener, MutationKind, IObserverLocator, ObserverLocator, getCollectionObserver, PrimitiveObserver, SetterObserver, Observer, Ref, ISignaler, Signaler, subscriberCollection, batchedSubscriberCollection, ISVGAnalyzer, XLinkAttributeAccessor, DataAttributeAccessor, StyleAttributeAccessor, ClassAttributeAccessor, ElementPropertyAccessor, PropertyAccessor, targetObserver, valueConverter, ValueConverterResource, Compose, If, Else, Repeat, Replaceable, With, bindable, customAttribute, templateController, CustomAttributeResource, createCustomAttributeDescription, customElement, useShadowDOM, containerless, CustomElementResource, createCustomElementDescription, ShadowDOMProjector, ContainerlessProjector, HostProjector, ITargetedInstruction, isTargetedInstruction, LifecycleFlags, AggregateLifecycleTask, AttachLifecycleController, DetachLifecycleController, Lifecycle, createRenderContext, InstanceProvider, ViewFactoryProvider, renderStrategy, RenderStrategyResource, Renderer, IRenderable, IRenderingEngine, RenderingEngine, createDefinition, RuntimeCompilationResources, RuntimeBehavior, ChildrenObserver, findElements, ITemplateCompiler, ViewCompileFlags, CompiledTemplate, noViewTemplate, IViewFactory, View, ViewFactory, Aurelia, INode, IRenderLocation, createNodeSequenceFromFragment, DOM, NodeSequence, FragmentNodeSequence };
//# sourceMappingURL=index.es6.js.map
