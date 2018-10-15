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
    // tslint:disable:no-reserved-keywords
    // tslint:disable:no-any
    class TextBindingInstruction {
        constructor(srcOrExpr) {
            this.srcOrExpr = srcOrExpr;
            this.type = "a" /* textBinding */;
        }
    }
    exports.TextBindingInstruction = TextBindingInstruction;
    class InterpolationInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "b" /* interpolation */;
        }
    }
    exports.InterpolationInstruction = InterpolationInstruction;
    class OneTimeBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "c" /* propertyBinding */;
            this.oneTime = true;
            this.mode = runtime_1.BindingMode.oneTime;
        }
    }
    exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
    class ToViewBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "c" /* propertyBinding */;
            this.oneTime = false;
            this.mode = runtime_1.BindingMode.toView;
        }
    }
    exports.ToViewBindingInstruction = ToViewBindingInstruction;
    class FromViewBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "c" /* propertyBinding */;
            this.oneTime = false;
            this.mode = runtime_1.BindingMode.fromView;
        }
    }
    exports.FromViewBindingInstruction = FromViewBindingInstruction;
    class TwoWayBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "c" /* propertyBinding */;
            this.oneTime = false;
            this.mode = runtime_1.BindingMode.twoWay;
        }
    }
    exports.TwoWayBindingInstruction = TwoWayBindingInstruction;
    class IteratorBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "d" /* iteratorBinding */;
        }
    }
    exports.IteratorBindingInstruction = IteratorBindingInstruction;
    class TriggerBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "e" /* listenerBinding */;
            this.strategy = runtime_1.DelegationStrategy.none;
            this.preventDefault = true;
        }
    }
    exports.TriggerBindingInstruction = TriggerBindingInstruction;
    class DelegateBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "e" /* listenerBinding */;
            this.strategy = runtime_1.DelegationStrategy.bubbling;
            this.preventDefault = false;
        }
    }
    exports.DelegateBindingInstruction = DelegateBindingInstruction;
    class CaptureBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "e" /* listenerBinding */;
            this.strategy = runtime_1.DelegationStrategy.capturing;
            this.preventDefault = false;
        }
    }
    exports.CaptureBindingInstruction = CaptureBindingInstruction;
    class CallBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "f" /* callBinding */;
        }
    }
    exports.CallBindingInstruction = CallBindingInstruction;
    class RefBindingInstruction {
        constructor(srcOrExpr) {
            this.srcOrExpr = srcOrExpr;
            this.type = "g" /* refBinding */;
        }
    }
    exports.RefBindingInstruction = RefBindingInstruction;
    class StylePropertyBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "h" /* stylePropertyBinding */;
        }
    }
    exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
    class SetPropertyInstruction {
        constructor(value, dest) {
            this.value = value;
            this.dest = dest;
            this.type = "i" /* setProperty */;
        }
    }
    exports.SetPropertyInstruction = SetPropertyInstruction;
    class SetAttributeInstruction {
        constructor(value, dest) {
            this.value = value;
            this.dest = dest;
            this.type = "j" /* setAttribute */;
        }
    }
    exports.SetAttributeInstruction = SetAttributeInstruction;
    class HydrateElementInstruction {
        constructor(res, instructions, parts, contentOverride) {
            this.res = res;
            this.instructions = instructions;
            this.parts = parts;
            this.contentOverride = contentOverride;
            this.type = "k" /* hydrateElement */;
        }
    }
    exports.HydrateElementInstruction = HydrateElementInstruction;
    class HydrateAttributeInstruction {
        constructor(res, instructions) {
            this.res = res;
            this.instructions = instructions;
            this.type = "l" /* hydrateAttribute */;
        }
    }
    exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
    class HydrateTemplateController {
        constructor(src, res, instructions, link) {
            this.src = src;
            this.res = res;
            this.instructions = instructions;
            this.link = link;
            this.type = "m" /* hydrateTemplateController */;
        }
    }
    exports.HydrateTemplateController = HydrateTemplateController;
    class LetElementInstruction {
        constructor(instructions, toViewModel) {
            this.instructions = instructions;
            this.toViewModel = toViewModel;
            this.type = "n" /* letElement */;
        }
    }
    exports.LetElementInstruction = LetElementInstruction;
    class LetBindingInstruction {
        constructor(srcOrExpr, dest) {
            this.srcOrExpr = srcOrExpr;
            this.dest = dest;
            this.type = "o" /* letBinding */;
        }
    }
    exports.LetBindingInstruction = LetBindingInstruction;
});
//# sourceMappingURL=instructions.js.map