(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tslint:disable:no-reserved-keywords
    const kernel_1 = require("@au-test/kernel");
    const instructionTypeValues = 'abcdefghijkl';
    exports.ITargetedInstruction = kernel_1.DI.createInterface();
    function isTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && instructionTypeValues.indexOf(type) !== -1;
    }
    exports.isTargetedInstruction = isTargetedInstruction;
});
//# sourceMappingURL=instructions.js.map