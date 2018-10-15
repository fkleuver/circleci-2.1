(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function processImports(toProcess, relativeTo) {
        return toProcess.map(x => {
            if (x.extension === '.html' && !x.plugin) {
                return 'component!' + relativeToFile(x.path, relativeTo) + x.extension;
            }
            let relativePath = relativeToFile(x.path, relativeTo);
            return x.plugin ? `${x.plugin}!${relativePath}` : relativePath;
        });
    }
    exports.processImports = processImports;
    const capitalMatcher = /([A-Z])/g;
    /*@internal*/
    function addHyphenAndLower(char) {
        return '-' + char.toLowerCase();
    }
    exports.addHyphenAndLower = addHyphenAndLower;
    function kebabCase(name) {
        return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
    }
    exports.kebabCase = kebabCase;
    function escape(content) {
        return content.replace(/(['\\])/g, '\\$1')
            .replace(/[\f]/g, "\\f")
            .replace(/[\b]/g, "\\b")
            .replace(/[\n]/g, "\\n")
            .replace(/[\t]/g, "\\t")
            .replace(/[\r]/g, "\\r")
            .replace(/[\u2028]/g, "\\u2028")
            .replace(/[\u2029]/g, "\\u2029");
    }
    exports.escape = escape;
    function createTemplateDescription(template) {
        const imports = [];
        const cleanedTemplate = template.replace(/^@import\s+\'([a-zA-z\/.\-_!%&\?=0-9]*)\'\s*;/gm, (match, url) => {
            imports.push(parseImport(url));
            return '';
        });
        return {
            template: cleanedTemplate.trim(),
            imports
        };
    }
    exports.createTemplateDescription = createTemplateDescription;
    function parseImport(value) {
        const result = {
            path: value
        };
        const pluginIndex = result.path.lastIndexOf('!');
        if (pluginIndex !== -1) {
            result.plugin = result.path.slice(pluginIndex + 1);
            result.path = result.path.slice(0, pluginIndex);
        }
        else {
            result.plugin = null;
        }
        const extensionIndex = result.path.lastIndexOf('.');
        if (extensionIndex !== -1) {
            result.extension = result.path.slice(extensionIndex).toLowerCase();
            result.path = result.path.slice(0, extensionIndex);
        }
        else {
            result.extension = null;
        }
        const slashIndex = result.path.lastIndexOf('/');
        if (slashIndex !== -1) {
            result.basename = result.path.slice(slashIndex + 1);
        }
        else {
            result.basename = result.path;
        }
        return result;
    }
    exports.parseImport = parseImport;
    function relativeToFile(name, file) {
        const fileParts = file && file.split('/');
        const nameParts = name.trim().split('/');
        if (nameParts[0].charAt(0) === '.' && fileParts) {
            //Convert file to array, and lop off the last part,
            //so that . matches that 'directory' and not name of the file's
            //module. For instance, file of 'one/two/three', maps to
            //'one/two/three.js', but we want the directory, 'one/two' for
            //this normalization.
            const normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
            nameParts.unshift(...normalizedBaseParts);
        }
        trimDots(nameParts);
        return nameParts.join('/');
    }
    exports.relativeToFile = relativeToFile;
    function loadFromFile(url, callback, errback) {
        const fs = require.nodeRequire('fs');
        try {
            let file = fs.readFileSync(url, 'utf8');
            //Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file[0] === '\uFEFF') {
                file = file.substring(1);
            }
            callback(file);
        }
        catch (e) {
            if (errback) {
                errback(e);
            }
        }
    }
    exports.loadFromFile = loadFromFile;
    /*@internal*/
    function trimDots(ary) {
        for (let i = 0; i < ary.length; ++i) {
            const part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            }
            else if (part === '..') {
                // If at the start, or previous value is still ..,
                // keep them so that when converted to a path it may
                // still work when converted to a path, even though
                // as an ID it is less than ideal. In larger point
                // releases, may be better to just kick out an error.
                if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
                    continue;
                }
                else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }
    exports.trimDots = trimDots;
});
//# sourceMappingURL=processing.js.map