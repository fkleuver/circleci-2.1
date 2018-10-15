(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./resources/index", "./array-observer", "./ast", "./binding-behavior", "./binding-context", "./binding-flags", "./binding-mode", "./binding", "./call", "./change-set", "./collection-observer", "./computed-observer", "./dirty-checker", "./element-observation", "./event-manager", "./expression-parser", "./listener", "./map-observer", "./observation", "./observer-locator", "./property-observation", "./ref", "./set-observer", "./signaler", "./subscriber-collection", "./svg-analyzer", "./target-accessors", "./target-observer", "./value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./resources/index"), exports);
    var array_observer_1 = require("./array-observer"); // TODO: do this differently, not let this be ugly, etc, etc
    exports.ArrayObserver = array_observer_1.ArrayObserver;
    exports.enableArrayObservation = array_observer_1.enableArrayObservation;
    exports.disableArrayObservation = array_observer_1.disableArrayObservation;
    exports.nativePush = array_observer_1.nativePush;
    exports.nativePop = array_observer_1.nativePop;
    exports.nativeShift = array_observer_1.nativeShift;
    exports.nativeUnshift = array_observer_1.nativeUnshift;
    exports.nativeSplice = array_observer_1.nativeSplice;
    exports.nativeReverse = array_observer_1.nativeReverse;
    exports.nativeSort = array_observer_1.nativeSort;
    tslib_1.__exportStar(require("./ast"), exports);
    tslib_1.__exportStar(require("./binding-behavior"), exports);
    tslib_1.__exportStar(require("./binding-context"), exports);
    tslib_1.__exportStar(require("./binding-flags"), exports);
    tslib_1.__exportStar(require("./binding-mode"), exports);
    tslib_1.__exportStar(require("./binding"), exports);
    tslib_1.__exportStar(require("./call"), exports);
    tslib_1.__exportStar(require("./change-set"), exports);
    tslib_1.__exportStar(require("./collection-observer"), exports);
    tslib_1.__exportStar(require("./computed-observer"), exports);
    tslib_1.__exportStar(require("./dirty-checker"), exports);
    tslib_1.__exportStar(require("./element-observation"), exports);
    tslib_1.__exportStar(require("./event-manager"), exports);
    tslib_1.__exportStar(require("./expression-parser"), exports);
    tslib_1.__exportStar(require("./listener"), exports);
    var map_observer_1 = require("./map-observer"); // TODO: do this differently, not let this be ugly, etc, etc
    exports.MapObserver = map_observer_1.MapObserver;
    exports.enableMapObservation = map_observer_1.enableMapObservation;
    exports.disableMapObservation = map_observer_1.disableMapObservation;
    exports.nativeSet = map_observer_1.nativeSet;
    exports.nativeMapDelete = map_observer_1.nativeDelete;
    exports.nativeMapClear = map_observer_1.nativeClear;
    tslib_1.__exportStar(require("./observation"), exports);
    tslib_1.__exportStar(require("./observer-locator"), exports);
    tslib_1.__exportStar(require("./property-observation"), exports);
    tslib_1.__exportStar(require("./ref"), exports);
    var set_observer_1 = require("./set-observer"); // TODO: do this differently, not let this be ugly, etc, etc
    exports.SetObserver = set_observer_1.SetObserver;
    exports.enableSetObservation = set_observer_1.enableSetObservation;
    exports.disableSetObservation = set_observer_1.disableSetObservation;
    exports.nativeAdd = set_observer_1.nativeAdd;
    exports.nativeSetDelete = set_observer_1.nativeDelete;
    exports.nativeSetClear = set_observer_1.nativeClear;
    tslib_1.__exportStar(require("./signaler"), exports);
    tslib_1.__exportStar(require("./subscriber-collection"), exports);
    tslib_1.__exportStar(require("./svg-analyzer"), exports);
    tslib_1.__exportStar(require("./target-accessors"), exports);
    tslib_1.__exportStar(require("./target-observer"), exports);
    tslib_1.__exportStar(require("./value-converter"), exports);
});
//# sourceMappingURL=index.js.map