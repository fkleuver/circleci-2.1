(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    })(BindingFlags = exports.BindingFlags || (exports.BindingFlags = {}));
});
//# sourceMappingURL=binding-flags.js.map