(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "../binding/change-set", "../binding/event-manager", "../binding/expression-parser", "../binding/observer-locator", "./renderer", "./runtime-behavior", "./template", "./template-compiler", "./view", "./view-compile-flags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const change_set_1 = require("../binding/change-set");
    const event_manager_1 = require("../binding/event-manager");
    const expression_parser_1 = require("../binding/expression-parser");
    const observer_locator_1 = require("../binding/observer-locator");
    const renderer_1 = require("./renderer");
    const runtime_behavior_1 = require("./runtime-behavior");
    const template_1 = require("./template");
    const template_compiler_1 = require("./template-compiler");
    const view_1 = require("./view");
    const view_compile_flags_1 = require("./view-compile-flags");
    exports.IRenderingEngine = kernel_1.DI.createInterface()
        .withDefault(x => x.singleton(RenderingEngine));
    const defaultCompilerName = 'default';
    let RenderingEngine = 
    /*@internal*/
    class RenderingEngine {
        constructor(container, changeSet, observerLocator, eventManager, parser, templateCompilers) {
            this.container = container;
            this.changeSet = changeSet;
            this.observerLocator = observerLocator;
            this.eventManager = eventManager;
            this.parser = parser;
            this.templateLookup = new Map();
            this.factoryLookup = new Map();
            this.behaviorLookup = new Map();
            this.compilers = templateCompilers.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, Object.create(null));
        }
        getElementTemplate(definition, componentType) {
            if (!definition) {
                return null;
            }
            let found = this.templateLookup.get(definition);
            if (!found) {
                found = this.templateFromSource(definition);
                //If the element has a view, support Recursive Components by adding self to own view template container.
                if (found.renderContext !== null && componentType) {
                    componentType.register(found.renderContext);
                }
                this.templateLookup.set(definition, found);
            }
            return found;
        }
        getViewFactory(definition, parentContext) {
            if (!definition) {
                return null;
            }
            let found = this.factoryLookup.get(definition);
            if (!found) {
                const validSource = createDefinition(definition);
                found = this.factoryFromSource(validSource, parentContext);
                this.factoryLookup.set(definition, found);
            }
            return found;
        }
        applyRuntimeBehavior(type, instance) {
            let found = this.behaviorLookup.get(type);
            if (!found) {
                found = runtime_behavior_1.RuntimeBehavior.create(type, instance);
                this.behaviorLookup.set(type, found);
            }
            found.applyTo(instance, this.changeSet);
        }
        createRenderer(context) {
            return new renderer_1.Renderer(context, this.observerLocator, this.eventManager, this.parser, this);
        }
        factoryFromSource(definition, parentContext) {
            const template = this.templateFromSource(definition, parentContext);
            const factory = new view_1.ViewFactory(definition.name, template);
            factory.setCacheSize(definition.cache, true);
            return factory;
        }
        templateFromSource(definition, parentContext) {
            parentContext = parentContext || this.container;
            if (definition && definition.templateOrNode) {
                if (definition.build.required) {
                    const compilerName = definition.build.compiler || defaultCompilerName;
                    const compiler = this.compilers[compilerName];
                    if (!compiler) {
                        throw kernel_1.Reporter.error(20, compilerName);
                    }
                    definition = compiler.compile(definition, new RuntimeCompilationResources(parentContext), view_compile_flags_1.ViewCompileFlags.surrogate);
                }
                return new template_1.CompiledTemplate(this, parentContext, definition);
            }
            return template_1.noViewTemplate;
        }
    };
    RenderingEngine = tslib_1.__decorate([
        kernel_1.inject(kernel_1.IContainer, change_set_1.IChangeSet, observer_locator_1.IObserverLocator, event_manager_1.IEventManager, expression_parser_1.IExpressionParser, kernel_1.all(template_compiler_1.ITemplateCompiler))
        /*@internal*/
    ], RenderingEngine);
    exports.RenderingEngine = RenderingEngine;
    /*@internal*/
    function createDefinition(definition) {
        return {
            name: definition.name || 'Unnamed Template',
            templateOrNode: definition.templateOrNode,
            cache: definition.cache || 0,
            build: definition.build || {
                required: false
            },
            bindables: definition.bindables || kernel_1.PLATFORM.emptyObject,
            instructions: definition.instructions ? kernel_1.PLATFORM.toArray(definition.instructions) : kernel_1.PLATFORM.emptyArray,
            dependencies: definition.dependencies ? kernel_1.PLATFORM.toArray(definition.dependencies) : kernel_1.PLATFORM.emptyArray,
            surrogates: definition.surrogates ? kernel_1.PLATFORM.toArray(definition.surrogates) : kernel_1.PLATFORM.emptyArray,
            containerless: definition.containerless || false,
            shadowOptions: definition.shadowOptions || null,
            hasSlots: definition.hasSlots || false
        };
    }
    exports.createDefinition = createDefinition;
    /*@internal*/
    class RuntimeCompilationResources {
        constructor(context) {
            this.context = context;
        }
        find(kind, name) {
            const key = kind.keyFrom(name);
            const resolver = this.context.getResolver(key, false);
            if (resolver !== null && resolver.getFactory) {
                const factory = resolver.getFactory(this.context);
                if (factory !== null) {
                    return factory.type.description || null;
                }
            }
            return null;
        }
        create(kind, name) {
            const key = kind.keyFrom(name);
            if (this.context.has(key, false)) {
                return this.context.get(key) || null;
            }
            return null;
        }
    }
    exports.RuntimeCompilationResources = RuntimeCompilationResources;
});
//# sourceMappingURL=rendering-engine.js.map