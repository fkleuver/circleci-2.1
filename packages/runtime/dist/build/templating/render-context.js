(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../dom", "./instructions", "./renderable", "./view"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const dom_1 = require("../dom");
    const instructions_1 = require("./instructions");
    const renderable_1 = require("./renderable");
    const view_1 = require("./view");
    function createRenderContext(renderingEngine, parentRenderContext, dependencies) {
        const context = parentRenderContext.createChild();
        const renderableProvider = new InstanceProvider();
        const elementProvider = new InstanceProvider();
        const instructionProvider = new InstanceProvider();
        const factoryProvider = new ViewFactoryProvider(renderingEngine);
        const renderLocationProvider = new InstanceProvider();
        const renderer = renderingEngine.createRenderer(context);
        dom_1.DOM.registerElementResolver(context, elementProvider);
        context.registerResolver(view_1.IViewFactory, factoryProvider);
        context.registerResolver(renderable_1.IRenderable, renderableProvider);
        context.registerResolver(instructions_1.ITargetedInstruction, instructionProvider);
        context.registerResolver(dom_1.IRenderLocation, renderLocationProvider);
        if (dependencies) {
            context.register(...dependencies);
        }
        context.render = function (renderable, targets, templateDefinition, host, parts) {
            renderer.render(renderable, targets, templateDefinition, host, parts);
        };
        context.beginComponentOperation = function (renderable, target, instruction, factory, parts, location) {
            renderableProvider.prepare(renderable);
            elementProvider.prepare(target);
            instructionProvider.prepare(instruction);
            if (factory) {
                factoryProvider.prepare(factory, parts);
            }
            if (location) {
                renderLocationProvider.prepare(location);
            }
            return context;
        };
        context.dispose = function () {
            factoryProvider.dispose();
            renderableProvider.dispose();
            instructionProvider.dispose();
            elementProvider.dispose();
            renderLocationProvider.dispose();
        };
        return context;
    }
    exports.createRenderContext = createRenderContext;
    /*@internal*/
    class InstanceProvider {
        constructor() {
            this.instance = null;
        }
        prepare(instance) {
            this.instance = instance;
        }
        resolve(handler, requestor) {
            if (this.instance === undefined) { // unmet precondition: call prepare
                throw kernel_1.Reporter.error(50); // TODO: organize error codes
            }
            return this.instance;
        }
        dispose() {
            this.instance = null;
        }
    }
    exports.InstanceProvider = InstanceProvider;
    /*@internal*/
    class ViewFactoryProvider {
        constructor(renderingEngine) {
            this.renderingEngine = renderingEngine;
        }
        prepare(factory, parts) {
            this.factory = factory;
            this.replacements = parts || kernel_1.PLATFORM.emptyObject;
        }
        resolve(handler, requestor) {
            const factory = this.factory;
            if (factory === undefined) { // unmet precondition: call prepare
                throw kernel_1.Reporter.error(50); // TODO: organize error codes
            }
            if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
                throw kernel_1.Reporter.error(51); // TODO: organize error codes
            }
            const found = this.replacements[factory.name];
            if (found) {
                return this.renderingEngine.getViewFactory(found, requestor);
            }
            return this.factory;
        }
        dispose() {
            this.factory = null;
            this.replacements = null;
        }
    }
    exports.ViewFactoryProvider = ViewFactoryProvider;
});
//# sourceMappingURL=render-context.js.map