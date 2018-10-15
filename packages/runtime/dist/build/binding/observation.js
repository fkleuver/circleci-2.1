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
    /**
     * Mostly just a marker enum to help with typings (specifically to reduce duplication)
     */
    var MutationKind;
    (function (MutationKind) {
        MutationKind[MutationKind["instance"] = 1] = "instance";
        MutationKind[MutationKind["collection"] = 2] = "collection";
    })(MutationKind = exports.MutationKind || (exports.MutationKind = {}));
});
//# sourceMappingURL=observation.js.map