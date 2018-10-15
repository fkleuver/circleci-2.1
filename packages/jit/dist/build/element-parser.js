(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "@au-test/runtime", "./attribute-parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const runtime_1 = require("@au-test/runtime");
    const attribute_parser_1 = require("./attribute-parser");
    const domParser = runtime_1.DOM.createElement('div');
    const marker = runtime_1.DOM.createElement('au-marker');
    marker.classList.add('au');
    const createMarker = marker.cloneNode.bind(marker, false);
    class ElementSyntax {
        constructor(node, name, $content, $children, $attributes) {
            this.node = node;
            this.name = name;
            this.$content = $content;
            this.$children = $children;
            this.$attributes = $attributes;
        }
        static createMarker() {
            return new ElementSyntax(createMarker(), 'au-marker', null, kernel_1.PLATFORM.emptyArray, kernel_1.PLATFORM.emptyArray);
        }
    }
    exports.ElementSyntax = ElementSyntax;
    exports.IElementParser = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(ElementParser));
    /*@internal*/
    let ElementParser = class ElementParser {
        constructor(attrParser) {
            this.attrParser = attrParser;
        }
        parse(markupOrNode) {
            let node;
            if (typeof markupOrNode === 'string') {
                domParser.innerHTML = markupOrNode;
                node = domParser.firstElementChild;
                domParser.removeChild(node);
            }
            else {
                node = markupOrNode;
            }
            let children;
            let content;
            if (node.nodeName === 'TEMPLATE') {
                content = this.parse(node.content);
                children = kernel_1.PLATFORM.emptyArray;
            }
            else {
                content = null;
                const nodeChildNodes = node.childNodes;
                const nodeLen = nodeChildNodes.length;
                if (nodeLen > 0) {
                    children = Array(nodeLen);
                    for (let i = 0, ii = nodeLen; i < ii; ++i) {
                        children[i] = this.parse(nodeChildNodes[i]);
                    }
                }
                else {
                    children = kernel_1.PLATFORM.emptyArray;
                }
            }
            let attributes;
            const nodeAttributes = node.attributes;
            const attrLen = nodeAttributes && nodeAttributes.length || 0;
            if (attrLen > 0) {
                attributes = Array(attrLen);
                for (let i = 0, ii = attrLen; i < ii; ++i) {
                    const attr = nodeAttributes[i];
                    attributes[i] = this.attrParser.parse(attr.name, attr.value);
                }
            }
            else {
                attributes = kernel_1.PLATFORM.emptyArray;
            }
            return new ElementSyntax(node, node.nodeName, content, children, attributes);
        }
    };
    ElementParser = tslib_1.__decorate([
        kernel_1.inject(attribute_parser_1.IAttributeParser)
    ], ElementParser);
    exports.ElementParser = ElementParser;
});
//# sourceMappingURL=element-parser.js.map