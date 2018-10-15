(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../../binding/binding-context", "../../binding/binding-flags", "../../dom", "../bindable", "../custom-attribute", "../view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const binding_context_1 = require("../../binding/binding-context");
    const binding_flags_1 = require("../../binding/binding-flags");
    const dom_1 = require("../../dom");
    const bindable_1 = require("../bindable");
    const custom_attribute_1 = require("../custom-attribute");
    const view_1 = require("../view");
    let With = class With {
        constructor(factory, location) {
            this.factory = factory;
            this.value = null;
            this.currentView = null;
            this.currentView = this.factory.create();
            this.currentView.mount(location);
        }
        valueChanged() {
            this.bindChild(binding_flags_1.BindingFlags.fromBindableHandler);
        }
        binding(flags) {
            this.bindChild(flags);
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
        bindChild(flags) {
            this.currentView.$bind(flags, binding_context_1.Scope.fromParent(this.$scope, this.value));
        }
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], With.prototype, "value", void 0);
    With = tslib_1.__decorate([
        custom_attribute_1.templateController('with'),
        kernel_1.inject(view_1.IViewFactory, dom_1.IRenderLocation)
    ], With);
    exports.With = With;
});
//# sourceMappingURL=with.js.map