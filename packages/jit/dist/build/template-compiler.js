(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "@au-test/runtime", "./attribute-parser", "./element-parser", "./instructions", "./semantic-model"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const runtime_1 = require("@au-test/runtime");
    const attribute_parser_1 = require("./attribute-parser");
    const element_parser_1 = require("./element-parser");
    const instructions_1 = require("./instructions");
    const semantic_model_1 = require("./semantic-model");
    let TemplateCompiler = class TemplateCompiler {
        constructor(exprParser, elParser, attrParser) {
            this.exprParser = exprParser;
            this.elParser = elParser;
            this.attrParser = attrParser;
        }
        get name() {
            return 'default';
        }
        compile(definition, resources, flags) {
            const model = semantic_model_1.SemanticModel.create(definition, resources, this.attrParser, this.elParser, this.exprParser);
            const root = model.root;
            let $el = root.isTemplate ? root.$content : root;
            while ($el = this.compileNode($el))
                ;
            // the flag should be passed correctly from rendering engine
            if (root.isTemplate && (flags & runtime_1.ViewCompileFlags.surrogate)) {
                this.compileSurrogate(root);
            }
            return definition;
        }
        compileNode($el) {
            const node = $el.node;
            const nextSibling = $el.nextSibling;
            switch (node.nodeType) {
                case 1 /* Element */:
                    if ($el.isSlot) {
                        $el.$root.definition.hasSlots = true;
                    }
                    else if ($el.isLet) {
                        this.compileLetElement($el);
                    }
                    else if ($el.isCustomElement) {
                        this.compileCustomElement($el);
                    }
                    else {
                        this.compileElementNode($el);
                    }
                    if (!$el.isLifted) {
                        let $child = $el.firstChild || $el.$content;
                        while ($child) {
                            $child = this.compileNode($child);
                        }
                    }
                    return nextSibling;
                case 3 /* Text */:
                    const expression = this.exprParser.parse($el.node.wholeText, 2048 /* Interpolation */);
                    if (expression === null) {
                        while (($el = $el.nextSibling) && $el.node.nodeType === 3 /* Text */)
                            ;
                        return $el;
                    }
                    $el.replaceTextNodeWithMarker();
                    $el.addInstructions([new instructions_1.TextBindingInstruction(expression)]);
                    return nextSibling;
                case 8 /* Comment */:
                    return nextSibling;
                case 9 /* Document */:
                    return $el.firstChild;
                case 10 /* DocumentType */:
                    return nextSibling;
                case 11 /* DocumentFragment */:
                    return $el.firstChild;
            }
        }
        compileSurrogate($el) {
            const attributes = $el.$attributes;
            for (let i = 0, ii = attributes.length; i < ii; ++i) {
                const $attr = attributes[i];
                if ($attr.isTemplateController) {
                    throw new Error('Cannot have template controller on surrogate element.');
                }
                const instruction = this.compileAttribute($attr);
                if (instruction !== null) {
                    $el.definition.surrogates.push(instruction);
                }
                else {
                    let attrInst;
                    // Doesn't make sense for these properties as they need to be unique
                    const name = $attr.target;
                    if (name !== 'id' && name !== 'part' && name !== 'replace-part') {
                        switch (name) {
                            // TODO: handle simple surrogate style attribute
                            case 'style':
                                attrInst = new instructions_1.SetAttributeInstruction($attr.rawValue, name);
                                break;
                            default:
                                attrInst = new instructions_1.SetAttributeInstruction($attr.rawValue, name);
                        }
                        $el.definition.surrogates.push(attrInst);
                    }
                    else {
                        throw new Error(`Invalid surrogate attribute: ${name}`);
                    }
                }
            }
        }
        compileElementNode($el) {
            if ($el.$attributes.length === 0) {
                return;
            }
            const attributes = $el.$attributes;
            const attributeInstructions = [];
            for (let i = 0, ii = attributes.length; i < ii; ++i) {
                const $attr = attributes[i];
                if ($attr.isProcessed)
                    continue;
                $attr.markAsProcessed();
                if ($attr.isTemplateController) {
                    let instruction = this.compileAttribute($attr);
                    // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
                    if (instruction.type !== "m" /* hydrateTemplateController */) {
                        const name = $attr.res;
                        instruction = new instructions_1.HydrateTemplateController({ name, instructions: [] }, name, [instruction], name === 'else');
                    }
                    // all attribute instructions preceding the template controller become children of the hydrate instruction
                    instruction.instructions.push(...attributeInstructions);
                    this.compileNode($el.lift(instruction));
                    return;
                }
                else if ($attr.isCustomAttribute) {
                    attributeInstructions.push(this.compileCustomAttribute($attr));
                }
                else {
                    const instruction = this.compileAttribute($attr);
                    if (instruction !== null) {
                        attributeInstructions.push(instruction);
                    }
                }
            }
            if (attributeInstructions.length) {
                $el.addInstructions(attributeInstructions);
                $el.makeTarget();
            }
        }
        compileCustomElement($el) {
            if ($el.$attributes.length === 0) {
                $el.addInstructions([new instructions_1.HydrateElementInstruction($el.definition.name, kernel_1.PLATFORM.emptyArray)]);
                $el.makeTarget();
                return;
            }
            const attributeInstructions = [];
            // if there is a custom element, then only the attributes that map to bindables become children of the hydrate instruction,
            // otherwise they become sibling instructions; if there is no custom element, then sibling instructions are never appended to
            const siblingInstructions = [];
            const attributes = $el.$attributes;
            for (let i = 0, ii = attributes.length; i < ii; ++i) {
                const $attr = attributes[i];
                if ($attr.isProcessed)
                    continue;
                $attr.markAsProcessed();
                if ($attr.isTemplateController) {
                    let instruction = this.compileAttribute($attr);
                    // compileAttribute will return a HydrateTemplateController if there is a binding command registered that produces one (in our case only "for")
                    if (instruction.type !== "m" /* hydrateTemplateController */) {
                        const name = $attr.res;
                        instruction = new instructions_1.HydrateTemplateController({ name, instructions: [] }, name, [instruction], name === 'else');
                    }
                    // all attribute instructions preceding the template controller become children of the hydrate instruction
                    instruction.instructions.push(...attributeInstructions);
                    this.compileNode($el.lift(instruction));
                    return;
                }
                else if ($attr.isCustomAttribute) {
                    if ($attr.isAttributeBindable) {
                        siblingInstructions.push(this.compileCustomAttribute($attr));
                    }
                    else {
                        attributeInstructions.push(this.compileCustomAttribute($attr));
                    }
                }
                else {
                    const instruction = this.compileAttribute($attr);
                    if (instruction !== null) {
                        if (!$attr.isElementBindable) {
                            siblingInstructions.push(instruction);
                        }
                        else {
                            attributeInstructions.push(instruction);
                        }
                    }
                }
            }
            $el.addInstructions([new instructions_1.HydrateElementInstruction($el.definition.name, attributeInstructions), ...siblingInstructions]);
            $el.makeTarget();
        }
        compileCustomAttribute($attr) {
            const childInstructions = [];
            if ($attr.isMultiAttrBinding) {
                const mBindings = $attr.$multiAttrBindings;
                for (let j = 0, jj = mBindings.length; j < jj; ++j) {
                    childInstructions.push(this.compileAttribute(mBindings[j]));
                }
            }
            else {
                childInstructions.push(this.compileAttribute($attr));
            }
            return new instructions_1.HydrateAttributeInstruction($attr.res, childInstructions);
        }
        compileLetElement($el) {
            const letInstructions = [];
            const attributes = $el.$attributes;
            let toViewModel = false;
            for (let i = 0, ii = attributes.length; ii > i; ++i) {
                const $attr = attributes[i];
                const dest = kernel_1.PLATFORM.camelCase($attr.dest);
                if ($attr.hasBindingCommand) {
                    const expr = this.exprParser.parse($attr.rawValue, 53 /* BindCommand */);
                    letInstructions.push(new instructions_1.LetBindingInstruction(expr, dest));
                }
                else if ($attr.rawName === 'to-view-model') {
                    toViewModel = true;
                    $el.node.removeAttribute('to-view-model');
                }
                else {
                    const expr = this.exprParser.parse($attr.rawValue, 2048 /* Interpolation */);
                    if (expr === null) {
                        // Should just be a warning, but throw for now
                        throw new Error(`Invalid let binding. String liternal given for attribute: ${$attr.dest}`);
                    }
                    letInstructions.push(new instructions_1.LetBindingInstruction(expr, dest));
                }
            }
            $el.addInstructions([new instructions_1.LetElementInstruction(letInstructions, toViewModel)]);
            // theoretically there's no need to replace, but to keep it consistent
            $el.replaceNodeWithMarker();
        }
        compileAttribute($attr) {
            // binding commands get priority over all; they may override default behaviors
            // it is the responsibility of the implementor to ensure they filter out stuff they shouldn't override
            if ($attr.isHandledByBindingCommand) {
                return $attr.command.compile($attr);
            }
            // simple path for ref binding
            const parser = this.exprParser;
            if ($attr.target === 'ref') {
                return new instructions_1.RefBindingInstruction(parser.parse($attr.rawValue, 1280 /* IsRef */));
            }
            // simple path for style bindings (TODO: this doesnt work, but we need to use StylePropertyBindingInstruction right?)
            // if (target === 'style' || target === 'css') {
            //   const expression = parser.parse(value, BindingType.Interpolation);
            //   if (expression === null) {
            //     return null;
            //   }
            //   return new StylePropertyBindingInstruction(expression, target);
            // }
            // plain custom attribute on any kind of element
            if ($attr.isCustomAttribute) {
                if (!$attr.hasBindingCommand) {
                    const expression = parser.parse($attr.rawValue, 2048 /* Interpolation */);
                    if (expression !== null) {
                        return new instructions_1.InterpolationInstruction(expression, $attr.dest);
                    }
                    if ($attr.isMultiAttrBinding) {
                        return new instructions_1.SetPropertyInstruction($attr.rawValue, $attr.dest);
                    }
                }
                // intentional nested block without a statement to ensure the expression variable isn't shadowed
                // (we're not declaring it at the outer block for better typing without explicit casting)
                {
                    const expression = parser.parse($attr.rawValue, 50 /* ToViewCommand */);
                    switch ($attr.mode) {
                        case runtime_1.BindingMode.oneTime:
                            return new instructions_1.OneTimeBindingInstruction(expression, $attr.dest);
                        case runtime_1.BindingMode.fromView:
                            return new instructions_1.FromViewBindingInstruction(expression, $attr.dest);
                        case runtime_1.BindingMode.twoWay:
                            return new instructions_1.TwoWayBindingInstruction(expression, $attr.dest);
                        case runtime_1.BindingMode.toView:
                        default:
                            return new instructions_1.ToViewBindingInstruction(expression, $attr.dest);
                    }
                }
            }
            // plain attribute on a custom element
            if ($attr.onCustomElement) {
                // bindable attribute
                if ($attr.isElementBindable) {
                    const expression = parser.parse($attr.rawValue, 2048 /* Interpolation */);
                    if (expression === null) {
                        // no interpolation -> make it a setProperty on the component
                        return new instructions_1.SetPropertyInstruction($attr.rawValue, $attr.dest);
                    }
                    // interpolation -> behave like toView (e.g. foo="${someProp}")
                    return new instructions_1.InterpolationInstruction(expression, $attr.dest);
                }
            }
            {
                // plain attribute on a normal element
                const expression = parser.parse($attr.rawValue, 2048 /* Interpolation */);
                if (expression === null) {
                    // no interpolation -> do not return an instruction
                    return null;
                }
                // interpolation -> behave like toView (e.g. id="${someId}")
                return new instructions_1.InterpolationInstruction(expression, $attr.dest);
            }
        }
    };
    TemplateCompiler = tslib_1.__decorate([
        kernel_1.inject(runtime_1.IExpressionParser, element_parser_1.IElementParser, attribute_parser_1.IAttributeParser)
    ], TemplateCompiler);
    exports.TemplateCompiler = TemplateCompiler;
});
//# sourceMappingURL=template-compiler.js.map