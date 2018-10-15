(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../../dom", "../custom-attribute", "../view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const dom_1 = require("../../dom");
    const custom_attribute_1 = require("../custom-attribute");
    const view_1 = require("../view");
    let Replaceable = class Replaceable {
        constructor(factory, location) {
            this.factory = factory;
            this.currentView = this.factory.create();
            this.currentView.mount(location);
        }
        binding(flags) {
            this.currentView.$bind(flags, this.$scope);
        }
        attaching(encapsulationSource, lifecycle) {
            this.currentView.$attach(encapsulationSource, lifecycle);
        }
        detaching(lifecycle) {
            this.currentView.$detach(lifecycle);
        }
        unbinding(flags) {
            this.currentView.$unbind(flags);
        }
    };
    Replaceable = tslib_1.__decorate([
        custom_attribute_1.templateController('replaceable'),
        kernel_1.inject(view_1.IViewFactory, dom_1.IRenderLocation)
    ], Replaceable);
    exports.Replaceable = Replaceable;
});
//# sourceMappingURL=replaceable.js.map