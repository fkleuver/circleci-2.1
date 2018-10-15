(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../binding/binding", "../binding/binding-mode", "../binding/call", "../binding/interpolation-binding", "../binding/let-binding", "../binding/listener", "../binding/ref", "../dom", "./custom-attribute", "./custom-element", "./render-strategy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_1 = require("../binding/binding");
    const binding_mode_1 = require("../binding/binding-mode");
    const call_1 = require("../binding/call");
    const interpolation_binding_1 = require("../binding/interpolation-binding");
    const let_binding_1 = require("../binding/let-binding");
    const listener_1 = require("../binding/listener");
    const ref_1 = require("../binding/ref");
    const dom_1 = require("../dom");
    const custom_attribute_1 = require("./custom-attribute");
    const custom_element_1 = require("./custom-element");
    const render_strategy_1 = require("./render-strategy");
    // tslint:disable:function-name
    // tslint:disable:no-any
    /* @internal */
    class Renderer {
        constructor(context, observerLocator, eventManager, parser, renderingEngine) {
            this.context = context;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.renderingEngine = renderingEngine;
        }
        render(renderable, targets, definition, host, parts) {
            const targetInstructions = definition.instructions;
            if (targets.length !== targetInstructions.length) {
                if (targets.length > targetInstructions.length) {
                    throw kernel_1.Reporter.error(30);
                }
                else {
                    throw kernel_1.Reporter.error(31);
                }
            }
            for (let i = 0, ii = targets.length; i < ii; ++i) {
                const instructions = targetInstructions[i];
                const target = targets[i];
                for (let j = 0, jj = instructions.length; j < jj; ++j) {
                    const current = instructions[j];
                    this[current.type](renderable, target, current, parts);
                }
            }
            if (host) {
                const surrogateInstructions = definition.surrogates;
                for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
                    const current = surrogateInstructions[i];
                    this[current.type](renderable, host, current, parts);
                }
            }
        }
        hydrateElementInstance(renderable, target, instruction, component) {
            const childInstructions = instruction.instructions;
            component.$hydrate(this.renderingEngine, target, instruction);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                const currentType = current.type;
                this[currentType](renderable, component, current);
            }
            renderable.$bindables.push(component);
            renderable.$attachables.push(component);
        }
        ["a" /* textBinding */](renderable, target, instruction) {
            const next = target.nextSibling;
            dom_1.DOM.treatAsNonWhitespace(next);
            dom_1.DOM.remove(target);
            const srcOrExpr = instruction.srcOrExpr;
            const expr = (srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 2048 /* Interpolation */));
            if (expr.isMulti) {
                renderable.$bindables.push(new interpolation_binding_1.MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', binding_mode_1.BindingMode.toView, this.context));
            }
            else {
                renderable.$bindables.push(new interpolation_binding_1.InterpolationBinding(expr.firstExpression, expr, next, 'textContent', binding_mode_1.BindingMode.toView, this.observerLocator, this.context, true));
            }
        }
        ["b" /* interpolation */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            const expr = (srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 2048 /* Interpolation */));
            if (expr.isMulti) {
                renderable.$bindables.push(new interpolation_binding_1.MultiInterpolationBinding(this.observerLocator, expr, target, instruction.dest, binding_mode_1.BindingMode.toView, this.context));
            }
            else {
                renderable.$bindables.push(new interpolation_binding_1.InterpolationBinding(expr.firstExpression, expr, target, instruction.dest, binding_mode_1.BindingMode.toView, this.observerLocator, this.context, true));
            }
        }
        ["c" /* propertyBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new binding_1.Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */ | instruction.mode), target, instruction.dest, instruction.mode, this.observerLocator, this.context));
        }
        ["d" /* iteratorBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new binding_1.Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 539 /* ForCommand */), target, instruction.dest, binding_mode_1.BindingMode.toView, this.observerLocator, this.context));
        }
        ["e" /* listenerBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new listener_1.Listener(instruction.dest, instruction.strategy, srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */)), target, instruction.preventDefault, this.eventManager, this.context));
        }
        ["f" /* callBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new call_1.Call(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 153 /* CallCommand */), target, instruction.dest, this.observerLocator, this.context));
        }
        ["g" /* refBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new ref_1.Ref(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 1280 /* IsRef */), target, this.context));
        }
        ["h" /* stylePropertyBinding */](renderable, target, instruction) {
            const srcOrExpr = instruction.srcOrExpr;
            renderable.$bindables.push(new binding_1.Binding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */ | binding_mode_1.BindingMode.toView), target.style, instruction.dest, binding_mode_1.BindingMode.toView, this.observerLocator, this.context));
        }
        ["i" /* setProperty */](renderable, target, instruction) {
            target[instruction.dest] = instruction.value;
        }
        ["j" /* setAttribute */](renderable, target, instruction) {
            dom_1.DOM.setAttribute(target, instruction.dest, instruction.value);
        }
        ["k" /* hydrateElement */](renderable, target, instruction) {
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
            const component = context.get(custom_element_1.CustomElementResource.keyFrom(instruction.res));
            this.hydrateElementInstance(renderable, target, instruction, component);
            operation.dispose();
        }
        ["l" /* hydrateAttribute */](renderable, target, instruction) {
            const childInstructions = instruction.instructions;
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction);
            const component = context.get(custom_attribute_1.CustomAttributeResource.keyFrom(instruction.res));
            component.$hydrate(this.renderingEngine);
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                this[current.type](renderable, component, current);
            }
            renderable.$bindables.push(component);
            renderable.$attachables.push(component);
            operation.dispose();
        }
        ["m" /* hydrateTemplateController */](renderable, target, instruction, parts) {
            const childInstructions = instruction.instructions;
            const factory = this.renderingEngine.getViewFactory(instruction.src, this.context);
            const context = this.context;
            const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom_1.DOM.convertToRenderLocation(target), false);
            const component = context.get(custom_attribute_1.CustomAttributeResource.keyFrom(instruction.res));
            component.$hydrate(this.renderingEngine);
            if (instruction.link) {
                component.link(renderable.$attachables[renderable.$attachables.length - 1]);
            }
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const current = childInstructions[i];
                this[current.type](renderable, component, current);
            }
            renderable.$bindables.push(component);
            renderable.$attachables.push(component);
            operation.dispose();
        }
        ["z" /* renderStrategy */](renderable, target, instruction) {
            const strategyName = instruction.name;
            if (this[strategyName] === undefined) {
                const strategy = this.context.get(render_strategy_1.RenderStrategyResource.keyFrom(strategyName));
                if (strategy === null || strategy === undefined) {
                    throw new Error(`Unknown renderStrategy "${strategyName}"`);
                }
                this[strategyName] = strategy.render.bind(strategy);
            }
            this[strategyName](renderable, target, instruction);
        }
        ["n" /* letElement */](renderable, target, instruction) {
            target.remove();
            const childInstructions = instruction.instructions;
            const toViewModel = instruction.toViewModel;
            for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
                const childInstruction = childInstructions[i];
                const srcOrExpr = childInstruction.srcOrExpr;
                renderable.$bindables.push(new let_binding_1.LetBinding(srcOrExpr.$kind ? srcOrExpr : this.parser.parse(srcOrExpr, 48 /* IsPropertyCommand */), childInstruction.dest, this.observerLocator, this.context, toViewModel));
            }
        }
    }
    exports.Renderer = Renderer;
});
//# sourceMappingURL=renderer.js.map