(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const dom_1 = require("../dom");
    //Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
    function findOriginalEventTarget(event) {
        return (event.composedPath && event.composedPath()[0]) || (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
    }
    function stopPropagation() {
        this.standardStopPropagation();
        this.propagationStopped = true;
    }
    function handleCapturedEvent(event) {
        event.propagationStopped = false;
        let target = findOriginalEventTarget(event);
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
        let target = findOriginalEventTarget(event);
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
                dom_1.DOM.addEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
        decrement() {
            this.count--;
            if (this.count === 0) {
                dom_1.DOM.removeEventListener(this.eventName, this.listener, null, this.capture);
            }
        }
    }
    exports.ListenerTracker = ListenerTracker;
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
    exports.DelegateOrCaptureSubscription = DelegateOrCaptureSubscription;
    /**
     * Enable dispose() pattern for addEventListener for `trigger`
     */
    class TriggerSubscription {
        constructor(target, targetEvent, callback) {
            this.target = target;
            this.targetEvent = targetEvent;
            this.callback = callback;
            dom_1.DOM.addEventListener(targetEvent, callback, target);
        }
        dispose() {
            dom_1.DOM.removeEventListener(this.targetEvent, this.callback, this.target);
        }
    }
    exports.TriggerSubscription = TriggerSubscription;
    var DelegationStrategy;
    (function (DelegationStrategy) {
        DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
        DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
        DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
    })(DelegationStrategy = exports.DelegationStrategy || (exports.DelegationStrategy = {}));
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
            const add = dom_1.DOM.addEventListener;
            const events = this.events;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                add(events[i], callbackOrListener, node);
            }
        }
        dispose() {
            const node = this.target;
            const callbackOrListener = this.handler;
            const events = this.events;
            const remove = dom_1.DOM.removeEventListener;
            for (let i = 0, ii = events.length; ii > i; ++i) {
                remove(events[i], callbackOrListener, node);
            }
            this.target = this.handler = null;
        }
    }
    exports.EventSubscriber = EventSubscriber;
    exports.IEventManager = kernel_1.DI.createInterface()
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
    exports.EventManager = EventManager;
});
//# sourceMappingURL=event-manager.js.map