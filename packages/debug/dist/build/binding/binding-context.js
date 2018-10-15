(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@au-test/runtime");
    exports.BindingContext = Object.assign({}, runtime_1.BindingContext, { createScopeForTest(bindingContext, parentBindingContext) {
            if (parentBindingContext) {
                return {
                    bindingContext,
                    overrideContext: this.createOverride(bindingContext, this.createOverride(parentBindingContext))
                };
            }
            return {
                bindingContext,
                overrideContext: this.createOverride(bindingContext)
            };
        } });
});
//# sourceMappingURL=binding-context.js.map