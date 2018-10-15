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
    exports.Reporter = {
        /* tslint:disable-next-line:no-empty */
        write(code, ...params) { },
        error(code, ...params) { return new Error(`Code ${code}`); }
    };
});
//# sourceMappingURL=reporter.js.map