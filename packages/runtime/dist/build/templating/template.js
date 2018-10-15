(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../dom", "./render-context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const dom_1 = require("../dom");
    const render_context_1 = require("./render-context");
    // This is the main implementation of ITemplate.
    // It is used to create instances of IView based on a compiled TemplateDefinition.
    // TemplateDefinitions are hand-coded today, but will ultimately be the output of the
    // TemplateCompiler either through a JIT or AOT process.
    // Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
    // and create instances of it on demand.
    /*@internal*/
    class CompiledTemplate {
        constructor(renderingEngine, parentRenderContext, templateDefinition) {
            this.templateDefinition = templateDefinition;
            this.renderContext = render_context_1.createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
            this.createNodeSequence = dom_1.DOM.createFactoryFromMarkupOrNode(templateDefinition.templateOrNode);
        }
        createFor(renderable, host, replacements) {
            const nodes = this.createNodeSequence();
            this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, replacements);
            return nodes;
        }
    }
    exports.CompiledTemplate = CompiledTemplate;
    // This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
    /*@internal*/
    exports.noViewTemplate = {
        renderContext: null,
        createFor(renderable) {
            return dom_1.NodeSequence.empty;
        }
    };
});
//# sourceMappingURL=template.js.map