(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/runtime", "./processing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@au-test/runtime");
    const processing_1 = require("./processing");
    const buildMap = {};
    function finishLoad(name, content, onLoad) {
        buildMap[name] = content;
        onLoad(content);
    }
    function load(name, req, onLoad, config) {
        if (config.isBuild) {
            processing_1.loadFromFile(req.toUrl(name), function (content) { finishLoad(name, content, onLoad); }, function (err) { if (onLoad.error) {
                onLoad.error(err);
            } });
        }
        else {
            req(['text!' + name], function (text) {
                const description = processing_1.createTemplateDescription(text);
                const depsToLoad = processing_1.processImports(description.imports, name);
                req(depsToLoad, function () {
                    const templateImport = processing_1.parseImport(name);
                    const templateSource = {
                        name: processing_1.kebabCase(templateImport.basename),
                        templateOrNode: description.template,
                        build: {
                            required: true,
                            compiler: 'default'
                        },
                        dependencies: Array.prototype.slice.call(arguments, 1)
                    };
                    onLoad({ default: runtime_1.CustomElementResource.define(templateSource, null) });
                });
            });
        }
    }
    exports.load = load;
    function write(pluginName, moduleName, write, config) {
        if (buildMap.hasOwnProperty(moduleName)) {
            const templateImport = processing_1.parseImport(moduleName);
            const text = buildMap[moduleName];
            const description = processing_1.createTemplateDescription(text);
            const depsToLoad = processing_1.processImports(description.imports, moduleName);
            depsToLoad.unshift('@au-test/runtime');
            write(`define("${pluginName}!${moduleName}", [${depsToLoad.map(x => `"${x}"`).join(',')}], function() {
      var Component = arguments[0].Component;
      var templateSource = {
        name: '${processing_1.kebabCase(templateImport.basename)}',
        templateOrNode: '${processing_1.escape(description.template)}',
        build: {
          required: true,
          compiler: 'default'
        },
        dependencies: Array.prototype.slice.call(arguments, 1)
      };

      return { default: Component.element(templateSource) };
    });\n`);
        }
    }
    exports.write = write;
});
//# sourceMappingURL=component.js.map