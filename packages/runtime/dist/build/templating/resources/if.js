(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../../dom", "../bindable", "../custom-attribute", "../view", "./composition-coordinator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const dom_1 = require("../../dom");
    const bindable_1 = require("../bindable");
    const custom_attribute_1 = require("../custom-attribute");
    const view_1 = require("../view");
    const composition_coordinator_1 = require("./composition-coordinator");
    let If = class If {
        constructor(ifFactory, location) {
            this.ifFactory = ifFactory;
            this.location = location;
            this.value = false;
            this.elseFactory = null;
            this.ifView = null;
            this.elseView = null;
            this.coordinator = new composition_coordinator_1.CompositionCoordinator();
        }
        binding(flags) {
            this.updateView();
            this.coordinator.binding(flags, this.$scope);
        }
        attaching(encapsulationSource, lifecycle) {
            this.coordinator.attaching(encapsulationSource, lifecycle);
        }
        detaching(lifecycle) {
            this.coordinator.detaching(lifecycle);
        }
        unbinding(flags) {
            this.coordinator.unbinding(flags);
        }
        caching() {
            if (this.ifView !== null && this.ifView.release()) {
                this.ifView = null;
            }
            if (this.elseView !== null && this.elseView.release()) {
                this.elseView = null;
            }
            this.coordinator.caching();
        }
        valueChanged() {
            this.updateView();
        }
        updateView() {
            let view;
            if (this.value) {
                view = this.ifView = this.ensureView(this.ifView, this.ifFactory);
            }
            else if (this.elseFactory !== null) {
                view = this.elseView = this.ensureView(this.elseView, this.elseFactory);
            }
            else {
                view = null;
            }
            this.coordinator.compose(view);
        }
        ensureView(view, factory) {
            if (view === null) {
                view = factory.create();
            }
            view.mount(this.location);
            return view;
        }
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], If.prototype, "value", void 0);
    If = tslib_1.__decorate([
        custom_attribute_1.templateController('if'),
        kernel_1.inject(view_1.IViewFactory, dom_1.IRenderLocation)
    ], If);
    exports.If = If;
    let Else = class Else {
        constructor(factory, location) {
            this.factory = factory;
            dom_1.DOM.remove(location); // Only the location of the "if" is relevant.
        }
        link(ifBehavior) {
            ifBehavior.elseFactory = this.factory;
        }
    };
    Else = tslib_1.__decorate([
        custom_attribute_1.templateController('else'),
        kernel_1.inject(view_1.IViewFactory, dom_1.IRenderLocation)
    ], Else);
    exports.Else = Else;
});
//# sourceMappingURL=if.js.map