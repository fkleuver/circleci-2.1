(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./binding/unparser", "./reporter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const unparser_1 = require("./binding/unparser");
    const reporter_1 = require("./reporter");
    exports.DebugConfiguration = {
        register(container) {
            reporter_1.Reporter.write(2);
            Object.assign(kernel_1.Reporter, reporter_1.Reporter);
            unparser_1.enableImprovedExpressionDebugging();
        }
    };
});
//# sourceMappingURL=configuration.js.map