(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./attribute-parser", "./binding-command", "./common", "./configuration", "./element-parser", "./expression-parser", "./instructions", "./semantic-model", "./template-compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    tslib_1.__exportStar(require("./attribute-parser"), exports);
    tslib_1.__exportStar(require("./binding-command"), exports);
    tslib_1.__exportStar(require("./common"), exports);
    tslib_1.__exportStar(require("./configuration"), exports);
    tslib_1.__exportStar(require("./element-parser"), exports);
    tslib_1.__exportStar(require("./expression-parser"), exports);
    tslib_1.__exportStar(require("./instructions"), exports);
    tslib_1.__exportStar(require("./semantic-model"), exports);
    tslib_1.__exportStar(require("./template-compiler"), exports);
});
//# sourceMappingURL=index.js.map