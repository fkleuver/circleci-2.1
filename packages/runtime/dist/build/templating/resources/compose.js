(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../bindable", "../create-element", "../custom-element", "../instructions", "../renderable", "../rendering-engine", "./composition-coordinator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const bindable_1 = require("../bindable");
    const create_element_1 = require("../create-element");
    const custom_element_1 = require("../custom-element");
    const instructions_1 = require("../instructions");
    const renderable_1 = require("../renderable");
    const rendering_engine_1 = require("../rendering-engine");
    const composition_coordinator_1 = require("./composition-coordinator");
    const composeSource = {
        name: 'au-compose',
        containerless: true
    };
    const composeProps = ['subject', 'composing'];
    let Compose = class Compose {
        constructor(renderable, instruction, renderingEngine) {
            this.renderable = renderable;
            this.renderingEngine = renderingEngine;
            this.subject = null;
            this.composing = false;
            this.properties = null;
            this.lastSubject = null;
            this.coordinator = new composition_coordinator_1.CompositionCoordinator();
            this.coordinator.onSwapComplete = () => {
                this.composing = false;
            };
            this.properties = instruction.instructions
                .filter((x) => !composeProps.includes(x.dest))
                .reduce((acc, item) => {
                if (item.dest) {
                    acc[item.dest] = item;
                }
                return acc;
            }, {});
        }
        binding(flags) {
            this.startComposition(this.subject);
            this.coordinator.binding(flags, this.$scope);
        }
        attaching(encapsulationSource, lifecycle) {
            this.coordinator.attaching(encapsulationSource, lifecycle);
        }
        detaching(lifecycle) {
            this.coordinator.detaching(lifecycle);
        }
        unbinding(flags) {
            this.lastSubject = null;
            this.coordinator.unbinding(flags);
        }
        caching() {
            this.coordinator.caching();
        }
        subjectChanged(newValue) {
            this.startComposition(newValue);
        }
        startComposition(subject) {
            if (this.lastSubject === subject) {
                return;
            }
            this.lastSubject = subject;
            if (subject instanceof Promise) {
                subject = subject.then(x => this.resolveView(x));
            }
            else {
                subject = this.resolveView(subject);
            }
            this.composing = true;
            this.coordinator.compose(subject);
        }
        resolveView(subject) {
            const view = this.provideViewFor(subject);
            if (view) {
                view.mount(this.$projector.host);
                view.lockScope(this.renderable.$scope);
                return view;
            }
            return null;
        }
        provideViewFor(subject) {
            if (!subject) {
                return null;
            }
            if ('templateOrNode' in subject) { // Raw Template Definition
                return this.renderingEngine.getViewFactory(subject, this.renderable.$context).create();
            }
            if ('create' in subject) { // IViewFactory
                return subject.create();
            }
            if ('createView' in subject) { // PotentialRenderable
                return subject.createView(this.renderingEngine, this.renderable.$context);
            }
            if ('lockScope' in subject) { // IView
                return subject;
            }
            // Constructable (Custom Element Constructor)
            return create_element_1.createElement(subject, this.properties, this.$projector.children).createView(this.renderingEngine, this.renderable.$context);
        }
    };
    tslib_1.__decorate([
        bindable_1.bindable
    ], Compose.prototype, "subject", void 0);
    tslib_1.__decorate([
        bindable_1.bindable
    ], Compose.prototype, "composing", void 0);
    Compose = tslib_1.__decorate([
        custom_element_1.customElement(composeSource),
        kernel_1.inject(renderable_1.IRenderable, instructions_1.ITargetedInstruction, rendering_engine_1.IRenderingEngine)
    ], Compose);
    exports.Compose = Compose;
});
//# sourceMappingURL=compose.js.map