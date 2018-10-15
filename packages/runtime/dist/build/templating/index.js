(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./resources", "./bindable", "./custom-attribute", "./custom-element", "./instructions", "./lifecycle", "./render-context", "./render-strategy", "./renderer", "./renderable", "./rendering-engine", "./runtime-behavior", "./template-compiler", "./view-compile-flags", "./template", "./view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./resources"), exports);
    tslib_1.__exportStar(require("./bindable"), exports);
    tslib_1.__exportStar(require("./custom-attribute"), exports);
    tslib_1.__exportStar(require("./custom-element"), exports);
    tslib_1.__exportStar(require("./instructions"), exports);
    tslib_1.__exportStar(require("./lifecycle"), exports);
    tslib_1.__exportStar(require("./render-context"), exports);
    tslib_1.__exportStar(require("./render-strategy"), exports);
    tslib_1.__exportStar(require("./renderer"), exports);
    tslib_1.__exportStar(require("./renderable"), exports);
    tslib_1.__exportStar(require("./rendering-engine"), exports);
    tslib_1.__exportStar(require("./runtime-behavior"), exports);
    tslib_1.__exportStar(require("./template-compiler"), exports);
    tslib_1.__exportStar(require("./view-compile-flags"), exports);
    tslib_1.__exportStar(require("./template"), exports);
    tslib_1.__exportStar(require("./view"), exports);
});
//# sourceMappingURL=index.js.map