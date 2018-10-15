(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./compose", "./if", "./repeat", "./replaceable", "./with"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./compose"), exports);
    tslib_1.__exportStar(require("./if"), exports);
    tslib_1.__exportStar(require("./repeat"), exports);
    tslib_1.__exportStar(require("./replaceable"), exports);
    tslib_1.__exportStar(require("./with"), exports);
});
//# sourceMappingURL=index.js.map