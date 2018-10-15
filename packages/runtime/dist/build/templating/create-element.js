(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "../dom", "./instructions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const dom_1 = require("../dom");
    const instructions_1 = require("./instructions");
    function createElement(tagOrType, props, children) {
        if (typeof tagOrType === 'string') {
            return createElementForTag(tagOrType, props, children);
        }
        else {
            return createElementForType(tagOrType, props, children);
        }
    }
    exports.createElement = createElement;
    class PotentialRenderable {
        constructor(node, instructions, dependencies) {
            this.node = node;
            this.instructions = instructions;
            this.dependencies = dependencies;
        }
        get definition() {
            return this.lazyDefinition || (this.lazyDefinition = {
                name: 'unnamed',
                templateOrNode: this.node,
                cache: 0,
                build: typeof this.node === 'string' ? {
                    required: true,
                    compiler: 'default'
                } : {
                    required: false
                },
                dependencies: this.dependencies,
                instructions: this.instructions,
                bindables: {},
                containerless: false,
                hasSlots: false,
                shadowOptions: null,
                surrogates: kernel_1.PLATFORM.emptyArray
            });
        }
        getElementTemplate(engine, type) {
            return engine.getElementTemplate(this.definition, type);
        }
        createView(engine, parentContext) {
            return this.getViewFactory(engine, parentContext).create();
        }
        getViewFactory(engine, parentContext) {
            return engine.getViewFactory(this.definition, parentContext);
        }
        /*@internal*/
        mergeInto(parent, instructions, dependencies) {
            dom_1.DOM.appendChild(parent, this.node);
            instructions.push(...this.instructions);
            dependencies.push(...this.dependencies);
        }
    }
    exports.PotentialRenderable = PotentialRenderable;
    function createElementForTag(tagName, props, children) {
        const instructions = [];
        const allInstructions = [];
        const dependencies = [];
        const element = dom_1.DOM.createElement(tagName);
        let hasInstructions = false;
        if (props) {
            Object.keys(props)
                .forEach(dest => {
                const value = props[dest];
                if (instructions_1.isTargetedInstruction(value)) {
                    hasInstructions = true;
                    instructions.push(value);
                }
                else {
                    dom_1.DOM.setAttribute(element, dest, value);
                }
            });
        }
        if (hasInstructions) {
            dom_1.DOM.setAttribute(element, 'class', 'au');
            allInstructions.push(instructions);
        }
        if (children) {
            addChildren(element, children, allInstructions, dependencies);
        }
        return new PotentialRenderable(element, allInstructions, dependencies);
    }
    function createElementForType(Type, props, children) {
        const tagName = Type.description.name;
        const instructions = [];
        const allInstructions = [instructions];
        const dependencies = [];
        const childInstructions = [];
        const bindables = Type.description.bindables;
        const element = dom_1.DOM.createElement(tagName);
        dom_1.DOM.setAttribute(element, 'class', 'au');
        if (!dependencies.includes(Type)) {
            dependencies.push(Type);
        }
        instructions.push({
            type: "k" /* hydrateElement */,
            res: tagName,
            instructions: childInstructions
        });
        if (props) {
            Object.keys(props)
                .forEach(dest => {
                const value = props[dest];
                if (instructions_1.isTargetedInstruction(value)) {
                    childInstructions.push(value);
                }
                else {
                    const bindable = bindables[dest];
                    if (bindable) {
                        childInstructions.push({
                            type: "i" /* setProperty */,
                            dest,
                            value
                        });
                    }
                    else {
                        childInstructions.push({
                            type: "j" /* setAttribute */,
                            dest,
                            value
                        });
                    }
                }
            });
        }
        if (children) {
            addChildren(element, children, allInstructions, dependencies);
        }
        return new PotentialRenderable(element, allInstructions, dependencies);
    }
    function addChildren(parent, children, allInstructions, dependencies) {
        for (let i = 0, ii = children.length; i < ii; ++i) {
            const current = children[i];
            if (typeof current === 'string') {
                dom_1.DOM.appendChild(parent, dom_1.DOM.createText(current));
            }
            else if (dom_1.DOM.isNodeInstance(current)) {
                dom_1.DOM.appendChild(parent, current);
            }
            else {
                current.mergeInto(parent, allInstructions, dependencies);
            }
        }
    }
});
//# sourceMappingURL=create-element.js.map