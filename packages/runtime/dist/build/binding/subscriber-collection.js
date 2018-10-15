(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./observation"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const observation_1 = require("./observation");
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
            proto.callSubscribers = (mutationKind === observation_1.MutationKind.instance ? callPropertySubscribers : callCollectionSubscribers);
        };
    }
    exports.subscriberCollection = subscriberCollection;
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
    exports.batchedSubscriberCollection = batchedSubscriberCollection;
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
});
//# sourceMappingURL=subscriber-collection.js.map