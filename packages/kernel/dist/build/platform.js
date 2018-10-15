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
    const camelCaseLookup = {};
    const kebabCaseLookup = {};
    exports.PLATFORM = {
        // tslint:disable-next-line:no-any
        global: (function () {
            // Workers don’t have `window`, only `self`
            // tslint:disable-next-line:no-typeof-undefined
            if (typeof self !== 'undefined') {
                return self;
            }
            // tslint:disable-next-line:no-typeof-undefined
            if (typeof global !== 'undefined') {
                return global;
            }
            // Not all environments allow eval and Function
            // Use only as a last resort:
            // tslint:disable-next-line:no-function-constructor-with-string-args
            return new Function('return this')();
        })(),
        emptyArray: Object.freeze([]),
        emptyObject: Object.freeze({}),
        /* tslint:disable-next-line:no-empty */
        noop() { },
        now() {
            return performance.now();
        },
        camelCase(input) {
            // benchmark: http://jsben.ch/qIz4Z
            let value = camelCaseLookup[input];
            if (value !== undefined)
                return value;
            value = '';
            let first = true;
            let sep = false;
            let char;
            for (let i = 0, ii = input.length; i < ii; ++i) {
                char = input.charAt(i);
                if (char === '-' || char === '.' || char === '_') {
                    sep = true; // skip separators
                }
                else {
                    value = value + (first ? char.toLowerCase() : (sep ? char.toUpperCase() : char));
                    sep = false;
                }
                first = false;
            }
            return camelCaseLookup[input] = value;
        },
        kebabCase(input) {
            // benchmark: http://jsben.ch/v7K9T
            let value = kebabCaseLookup[input];
            if (value !== undefined)
                return value;
            value = '';
            let first = true;
            let char, lower;
            for (let i = 0, ii = input.length; i < ii; ++i) {
                char = input.charAt(i);
                lower = char.toLowerCase();
                value = value + (first ? lower : (char !== lower ? `-${lower}` : lower));
                first = false;
            }
            return kebabCaseLookup[input] = value;
        },
        // tslint:disable-next-line:no-any
        toArray(input) {
            // benchmark: http://jsben.ch/xjsyF
            const len = input.length;
            const arr = Array(len);
            for (let i = 0; i < len; ++i) {
                arr[i] = input[i];
            }
            return arr;
        },
        requestAnimationFrame(callback) {
            return requestAnimationFrame(callback);
        }
    };
});
//# sourceMappingURL=platform.js.map