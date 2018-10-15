(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "@au-test/runtime", "./index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel = require("@au-test/kernel");
    exports.kernel = kernel;
    const runtime = require("@au-test/runtime");
    exports.runtime = runtime;
    const jit = require("./index");
    exports.jit = jit;
});
//# sourceMappingURL=index.full.js.map