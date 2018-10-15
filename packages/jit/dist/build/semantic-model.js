(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "@au-test/runtime", "./attribute-parser", "./binding-command", "./element-parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const runtime_1 = require("@au-test/runtime");
    const attribute_parser_1 = require("./attribute-parser");
    const binding_command_1 = require("./binding-command");
    const element_parser_1 = require("./element-parser");
    class SemanticModel {
        constructor(definition, resources, attrParser, elParser, exprParser) {
            this.resources = resources;
            this.attrParser = attrParser;
            this.elParser = elParser;
            this.exprParser = exprParser;
            this.isSemanticModel = true;
            this.attrDefCache = {};
            this.elDefCache = {};
            this.commandCache = {};
            const syntax = this.elParser.parse(definition.templateOrNode);
            definition.templateOrNode = syntax.node;
            this.root = new ElementSymbol(
            /*   semanticModel*/ this, 
            /*isDefinitionRoot*/ true, 
            /* $definitionRoot*/ null, 
            /*         $parent*/ null, 
            /*          syntax*/ syntax, 
            /*      definition*/ definition);
        }
        static create(definition, resources, attrParser, elParser, exprParser) {
            if ('get' in attrParser) {
                const locator = attrParser;
                attrParser = locator.get(attribute_parser_1.IAttributeParser);
                elParser = locator.get(element_parser_1.IElementParser);
                exprParser = locator.get(runtime_1.IExpressionParser);
            }
            return new SemanticModel(definition, resources, attrParser, elParser, exprParser);
        }
        getAttributeDefinition(name) {
            const existing = this.attrDefCache[name];
            if (existing !== undefined) {
                return existing;
            }
            const definition = this.resources.find(runtime_1.CustomAttributeResource, name) || null;
            return this.attrDefCache[name] = definition;
        }
        getElementDefinition(name) {
            const existing = this.elDefCache[name];
            if (existing !== undefined) {
                return existing;
            }
            const definition = this.resources.find(runtime_1.CustomElementResource, name) || null;
            return this.elDefCache[name] = definition;
        }
        getBindingCommand(name) {
            const existing = this.commandCache[name];
            if (existing !== undefined) {
                return existing;
            }
            const instance = this.resources.create(binding_command_1.BindingCommandResource, name) || null;
            return this.commandCache[name] = instance;
        }
        getAttributeSymbol(syntax, element) {
            const definition = this.getAttributeDefinition(kernel_1.PLATFORM.camelCase(syntax.target));
            const command = this.getBindingCommand(syntax.command);
            return new AttributeSymbol(this, element, syntax, definition, command);
        }
        getMultiAttrBindingSymbol(syntax, parent) {
            const command = this.getBindingCommand(syntax.command);
            return new MultiAttributeBindingSymbol(this, parent, syntax, command);
        }
        getElementSymbol(syntax, parent) {
            const node = syntax.node;
            let definition;
            if (node.nodeType === 1 /* Element */) {
                const resourceKey = (node.getAttribute('as-element') || node.nodeName).toLowerCase();
                definition = this.getElementDefinition(resourceKey);
            }
            return new ElementSymbol(
            /*   semanticModel*/ this, 
            /*isDefinitionRoot*/ false, 
            /* $definitionRoot*/ parent.$root, 
            /*         $parent*/ parent, 
            /*          syntax*/ syntax, 
            /*      definition*/ definition);
        }
        getTemplateElementSymbol(syntax, parent, definition, definitionRoot) {
            return new ElementSymbol(
            /*   semanticModel*/ this, 
            /*isDefinitionRoot*/ true, 
            /* $definitionRoot*/ definitionRoot, 
            /*         $parent*/ parent, 
            /*          syntax*/ syntax, 
            /*      definition*/ definition);
        }
    }
    exports.SemanticModel = SemanticModel;
    class MultiAttributeBindingSymbol {
        constructor(semanticModel, $parent, syntax, command) {
            this.semanticModel = semanticModel;
            this.$parent = $parent;
            this.syntax = syntax;
            this.command = command;
            this.isMultiAttrBinding = true;
            this.res = null;
            this.bindable = null;
            this.isTemplateController = false;
            this.isCustomAttribute = true;
            this.isAttributeBindable = false;
            this.isDefaultAttributeBindable = false;
            this.onCustomElement = false;
            this.isElementBindable = false;
            this.$element = null;
            this.target = syntax.target;
            this.rawName = syntax.rawName;
            this.rawValue = syntax.rawValue;
            this.rawCommand = syntax.command;
            this.hasBindingCommand = !!command;
            this.isHandledByBindingCommand = this.hasBindingCommand && command.handles(this);
            const bindables = $parent.definition.bindables;
            for (const prop in bindables) {
                const b = bindables[prop];
                if (b.property === syntax.target) {
                    this.dest = b.property;
                    this.mode = (b.mode && b.mode !== runtime_1.BindingMode.default) ? b.mode : runtime_1.BindingMode.toView;
                    this.bindable = b;
                    this.isAttributeBindable = true;
                    break;
                }
            }
            if (!this.isAttributeBindable) {
                this.dest = syntax.target;
                this.mode = $parent.definition.defaultBindingMode || runtime_1.BindingMode.toView;
            }
        }
    }
    exports.MultiAttributeBindingSymbol = MultiAttributeBindingSymbol;
    class AttributeSymbol {
        constructor(semanticModel, $element, syntax, definition, command) {
            this.semanticModel = semanticModel;
            this.$element = $element;
            this.syntax = syntax;
            this.definition = definition;
            this.command = command;
            this.isMultiAttrBinding = false;
            this.res = null;
            this.bindable = null;
            this.isAttributeBindable = false;
            this.isDefaultAttributeBindable = false;
            this.isElementBindable = false;
            this.isBindable = false;
            this.isTemplateController = false;
            this.target = syntax.target;
            this.rawName = syntax.rawName;
            this.rawValue = syntax.rawValue;
            this.rawCommand = syntax.command;
            this.isCustomAttribute = !!definition;
            this.hasBindingCommand = !!command;
            this.isHandledByBindingCommand = this.hasBindingCommand && command.handles(this);
            this.onCustomElement = $element.isCustomElement;
            this._isProcessed = this.rawName === 'as-element'; // as-element is processed by the semantic model and shouldn't be processed by the template compiler
            if (this.isCustomAttribute) {
                this.isTemplateController = !!definition.isTemplateController;
                this.res = definition.name;
                const value = syntax.rawValue;
                let lastIndex = 0;
                let multiAttrBindings;
                for (let i = 0, ii = value.length; i < ii; ++i) {
                    if (value.charCodeAt(i) === 59 /* Semicolon */) {
                        if (!this.isMultiAttrBinding) {
                            multiAttrBindings = [];
                            this.isMultiAttrBinding = true;
                        }
                        const innerAttr = value.slice(lastIndex, i).trim();
                        lastIndex = i + 1;
                        if (innerAttr.length === 0) {
                            continue;
                        }
                        for (let j = 0, jj = innerAttr.length; j < jj; ++j) {
                            if (innerAttr.charCodeAt(j) === 58 /* Colon */) {
                                const innerAttrName = innerAttr.slice(0, j).trim();
                                const innerAttrValue = innerAttr.slice(j + 1).trim();
                                const innerAttrSyntax = this.semanticModel.attrParser.parse(innerAttrName, innerAttrValue);
                                multiAttrBindings.push(this.semanticModel.getMultiAttrBindingSymbol(innerAttrSyntax, this));
                            }
                        }
                    }
                }
                this.$multiAttrBindings = this.isMultiAttrBinding ? multiAttrBindings : kernel_1.PLATFORM.emptyArray;
                const bindables = definition.bindables;
                if (!this.isMultiAttrBinding) {
                    for (const prop in bindables) {
                        const b = bindables[prop];
                        this.dest = b.property;
                        this.mode = (b.mode && b.mode !== runtime_1.BindingMode.default) ? b.mode : (definition.defaultBindingMode || runtime_1.BindingMode.toView);
                        this.bindable = b;
                        this.isBindable = this.isAttributeBindable = true;
                        break;
                    }
                    if (!this.isAttributeBindable) {
                        this.dest = 'value';
                        this.mode = definition.defaultBindingMode || runtime_1.BindingMode.toView;
                        this.isBindable = this.isAttributeBindable = this.isDefaultAttributeBindable = true;
                    }
                }
            }
            else if ($element.isCustomElement) {
                const bindables = $element.definition.bindables;
                for (const prop in bindables) {
                    const b = bindables[prop];
                    if (b.attribute === syntax.target) {
                        this.dest = b.property;
                        this.mode = (b.mode && b.mode !== runtime_1.BindingMode.default) ? b.mode : runtime_1.BindingMode.toView;
                        this.bindable = b;
                        this.isBindable = this.isElementBindable = true;
                        break;
                    }
                }
                if (!this.isElementBindable) {
                    this.dest = syntax.target;
                    this.mode = runtime_1.BindingMode.toView;
                }
            }
            else {
                this.dest = syntax.target;
                this.mode = runtime_1.BindingMode.toView;
            }
        }
        get isProcessed() {
            return this._isProcessed;
        }
        markAsProcessed() {
            this._isProcessed = true;
            if (this.isTemplateController) {
                this.$element.node.removeAttribute(this.rawName);
            }
        }
    }
    exports.AttributeSymbol = AttributeSymbol;
    class ElementSymbol {
        constructor(semanticModel, isRoot, $root, $parent, syntax, definition) {
            this.semanticModel = semanticModel;
            this.isRoot = isRoot;
            this.$root = $root;
            this.$parent = $parent;
            this.definition = definition;
            this._$content = null;
            this._isMarker = false;
            this._isTemplate = false;
            this._isSlot = false;
            this._isLet = false;
            this._isLifted = false;
            this.$root = isRoot ? this : $root;
            this._node = syntax.node;
            this._syntax = syntax;
            this._name = this.node.nodeName;
            switch (this.name) {
                case 'TEMPLATE':
                    this._isTemplate = true;
                    this._$content = this.semanticModel.getElementSymbol(syntax.$content, this);
                    break;
                case 'SLOT':
                    this._isSlot = true;
                    break;
                case 'LET':
                    this._isLet = true;
            }
            this._isCustomElement = !isRoot && !!definition;
            const attributes = syntax.$attributes;
            const attrLen = attributes.length;
            if (attrLen > 0) {
                const attrSymbols = Array(attrLen);
                for (let i = 0, ii = attrLen; i < ii; ++i) {
                    attrSymbols[i] = this.semanticModel.getAttributeSymbol(attributes[i], this);
                }
                this.$attributes = attrSymbols;
            }
            else {
                this.$attributes = kernel_1.PLATFORM.emptyArray;
            }
            const children = syntax.$children;
            const childLen = children.length;
            if (childLen > 0) {
                const childSymbols = Array(childLen);
                for (let i = 0, ii = childLen; i < ii; ++i) {
                    childSymbols[i] = this.semanticModel.getElementSymbol(children[i], this);
                }
                this.$children = childSymbols;
            }
            else {
                this.$children = kernel_1.PLATFORM.emptyArray;
            }
        }
        get $content() {
            return this._$content;
        }
        get isMarker() {
            return this._isMarker;
        }
        get isTemplate() {
            return this._isTemplate;
        }
        get isSlot() {
            return this._isSlot;
        }
        get isLet() {
            return this._isLet;
        }
        get node() {
            return this._node;
        }
        get syntax() {
            return this._syntax;
        }
        get name() {
            return this._name;
        }
        get isCustomElement() {
            return this._isCustomElement;
        }
        get nextSibling() {
            if (!this.$parent) {
                return null;
            }
            const siblings = this.$parent.$children;
            for (let i = 0, ii = siblings.length; i < ii; ++i) {
                if (siblings[i] === this) {
                    return siblings[i + 1] || null;
                }
            }
            return null;
        }
        get firstChild() {
            return this.$children[0] || null;
        }
        get componentRoot() {
            return this.semanticModel.root;
        }
        get isLifted() {
            return this._isLifted;
        }
        makeTarget() {
            this.node.classList.add('au');
        }
        replaceTextNodeWithMarker() {
            const marker = element_parser_1.ElementSyntax.createMarker();
            const node = this.node;
            node.parentNode.insertBefore(marker.node, node);
            node.textContent = ' ';
            while (node.nextSibling && node.nextSibling.nodeType === 3 /* Text */) {
                node.parentNode.removeChild(node.nextSibling);
            }
            this.setToMarker(marker);
        }
        replaceNodeWithMarker() {
            const marker = element_parser_1.ElementSyntax.createMarker();
            const node = this.node;
            if (node.parentNode) {
                node.parentNode.replaceChild(marker.node, node);
            }
            else if (this.isTemplate) {
                node.content.appendChild(marker.node);
            }
            this.setToMarker(marker);
        }
        lift(instruction) {
            const template = instruction.src.templateOrNode = runtime_1.DOM.createTemplate();
            const node = this.node;
            if (this.isTemplate) {
                // copy remaining attributes over to the newly created template
                const attributes = node.attributes;
                while (attributes.length) {
                    const attr = attributes[0];
                    template.setAttribute(attr.name, attr.value);
                    node.removeAttribute(attr.name);
                }
                template.content.appendChild(node.content);
                this.replaceNodeWithMarker();
            }
            else {
                this.replaceNodeWithMarker();
                template.content.appendChild(node);
            }
            this.addInstructions([instruction]);
            this._isLifted = true;
            return this.semanticModel.getTemplateElementSymbol(this.semanticModel.elParser.parse(template), this, instruction.src, null);
        }
        addInstructions(instructions) {
            this.$root.definition.instructions.push(instructions);
        }
        setToMarker(marker) {
            this._$content = null;
            this._isCustomElement = this._isLet = this._isSlot = this._isTemplate = false;
            this._isMarker = true;
            this._name = 'AU-MARKER';
            this._node = marker.node;
            this._syntax = marker;
        }
    }
    exports.ElementSymbol = ElementSymbol;
});
//# sourceMappingURL=semantic-model.js.map