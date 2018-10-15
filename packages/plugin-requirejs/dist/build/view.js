(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./processing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const processing_1 = require("./processing");
    const buildMap = {};
    /*@internal*/
    function finishLoad(name, content, onLoad) {
        buildMap[name] = content;
        onLoad(content);
    }
    exports.finishLoad = finishLoad;
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
                const templateImport = processing_1.parseImport(name);
                req(depsToLoad, function () {
                    const templateSource = {
                        name: processing_1.kebabCase(templateImport.basename),
                        templateOrNode: description.template,
                        build: {
                            required: true,
                            compiler: 'default'
                        },
                        dependencies: Array.prototype.slice.call(arguments)
                    };
                    onLoad({ default: templateSource });
                });
            });
        }
    }
    exports.load = load;
    function write(pluginName, moduleName, write, config) {
        if (buildMap.hasOwnProperty(moduleName)) {
            const text = buildMap[moduleName];
            const description = processing_1.createTemplateDescription(text);
            const depsToLoad = processing_1.processImports(description.imports, moduleName);
            const templateImport = processing_1.parseImport(moduleName);
            write(`define("${pluginName}!${moduleName}", [${depsToLoad.map(x => `"${x}"`).join(',')}], function() { 
      var templateSource = {
        name: '${processing_1.kebabCase(templateImport.basename)}',
        templateOrNode: '${processing_1.escape(description.template)}',
        build: {
          required: true,
          compiler: 'default'
        },
        dependencies: Array.prototype.slice.call(arguments)
      };

      return { default: templateSource };
    });\n`);
        }
    }
    exports.write = write;
});
//# sourceMappingURL=view.js.map