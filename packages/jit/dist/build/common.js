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
    /*@internal*/
    function unescapeCode(code) {
        switch (code) {
            case 98 /* LowerB */: return 8 /* Backspace */;
            case 116 /* LowerT */: return 9 /* Tab */;
            case 110 /* LowerN */: return 10 /* LineFeed */;
            case 118 /* LowerV */: return 11 /* VerticalTab */;
            case 102 /* LowerF */: return 12 /* FormFeed */;
            case 114 /* LowerR */: return 13 /* CarriageReturn */;
            case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
            case 39 /* SingleQuote */: return 39 /* SingleQuote */;
            case 92 /* Backslash */: return 92 /* Backslash */;
            default: return code;
        }
    }
    exports.unescapeCode = unescapeCode;
});
//# sourceMappingURL=common.js.map