(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./binding/index", "./templating/index", "./aurelia", "./dom"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./binding/index"), exports);
    tslib_1.__exportStar(require("./templating/index"), exports);
    tslib_1.__exportStar(require("./aurelia"), exports);
    tslib_1.__exportStar(require("./dom"), exports);
});
//# sourceMappingURL=index.js.map