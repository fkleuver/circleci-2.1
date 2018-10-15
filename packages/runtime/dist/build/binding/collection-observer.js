(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./observation", "./subscriber-collection", "./target-observer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const observation_1 = require("./observation");
    const subscriber_collection_1 = require("./subscriber-collection");
    const target_observer_1 = require("./target-observer");
    function flushChanges() {
        this.callBatchedSubscribers(this.indexMap);
        this.resetIndexMap();
    }
    function dispose() {
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
            subscriber_collection_1.subscriberCollection(observation_1.MutationKind.collection)(target);
            subscriber_collection_1.batchedSubscriberCollection()(target);
            const proto = target.prototype;
            proto.collection = null;
            proto.indexMap = null;
            proto.hasChanges = false;
            proto.lengthPropertyName = kind & 8 /* indexed */ ? 'length' : 'size';
            proto.collectionKind = kind;
            proto.resetIndexMap = kind & 8 /* indexed */ ? resetIndexMapIndexed : resetIndexMapKeyed;
            proto.flushChanges = flushChanges;
            proto.dispose = dispose;
            proto.getLengthObserver = getLengthObserver;
            proto.subscribe = proto.subscribe || proto.addSubscriber;
            proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;
            proto.subscribeBatched = proto.subscribeBatched || proto.addBatchedSubscriber;
            proto.unsubscribeBatched = proto.unsubscribeBatched || proto.removeBatchedSubscriber;
        };
    }
    exports.collectionObserver = collectionObserver;
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
    CollectionLengthObserver = tslib_1.__decorate([
        target_observer_1.targetObserver()
    ], CollectionLengthObserver);
    exports.CollectionLengthObserver = CollectionLengthObserver;
});
//# sourceMappingURL=collection-observer.js.map