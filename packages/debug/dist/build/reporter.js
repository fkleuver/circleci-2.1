(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    exports.Reporter = Object.assign({}, kernel_1.Reporter, { write(code, ...params) {
            const info = getMessageInfoForCode(code);
            switch (info.type) {
                case 3 /* debug */:
                    console.debug(info.message, ...params);
                    break;
                case 2 /* info */:
                    console.info(info.message, ...params);
                    break;
                case 1 /* warn */:
                    console.warn(info.message, ...params);
                    break;
                case 0 /* error */:
                    throw this.error(code, ...params);
            }
        },
        error(code, ...params) {
            const info = getMessageInfoForCode(code);
            const error = new Error(info.message);
            error.data = params;
            return error;
        } });
    function getMessageInfoForCode(code) {
        return codeLookup[code] || createInvalidCodeMessageInfo(code);
    }
    function createInvalidCodeMessageInfo(code) {
        return {
            type: 0 /* error */,
            message: `Attempted to report with unknown code ${code}.`
        };
    }
    const codeLookup = {
        0: {
            type: 1 /* warn */,
            message: 'Cannot add observers to object.'
        },
        1: {
            type: 1 /* warn */,
            message: 'Cannot observe property of object.'
        },
        2: {
            type: 2 /* info */,
            message: 'Starting application in debug mode.'
        },
        3: {
            type: 0 /* error */,
            message: 'Runtime expression compilation is only available when including JIT support.'
        },
        4: {
            type: 0 /* error */,
            message: 'Invalid animation direction.'
        },
        5: {
            type: 0 /* error */,
            message: 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
        },
        6: {
            type: 0 /* error */,
            message: 'Invalid resolver strategy specified.'
        },
        7: {
            type: 0 /* error */,
            message: 'Constructor Parameter with index cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?'
        },
        8: {
            type: 0 /* error */,
            message: 'Self binding behavior only supports events.'
        },
        9: {
            type: 0 /* error */,
            message: 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">'
        },
        10: {
            type: 0 /* error */,
            message: 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.'
        },
        11: {
            type: 0 /* error */,
            message: 'Only property bindings and string interpolation bindings can be signaled. Trigger, delegate and call bindings cannot be signaled.'
        },
        12: {
            type: 0 /* error */,
            message: 'Signal name is required.'
        },
        14: {
            type: 0 /* error */,
            message: 'Property cannot be assigned.'
        },
        15: {
            type: 0 /* error */,
            message: 'Unexpected call context.'
        },
        16: {
            type: 0 /* error */,
            message: 'Only one child observer per content view is supported for the life of the content view.'
        },
        17: {
            type: 0 /* error */,
            message: 'You can only define one default implementation for an interface.'
        },
        18: {
            type: 0 /* error */,
            message: 'You cannot observe a setter only property.'
        },
        19: {
            type: 0 /* error */,
            message: 'Value for expression is non-repeatable.'
        },
        20: {
            type: 0 /* error */,
            message: 'No template compiler found with the specified name. JIT support or a custom compiler is required.'
        },
        21: {
            type: 0 /* error */,
            message: 'You cannot combine the containerless custom element option with Shadow DOM.'
        },
        22: {
            type: 0 /* error */,
            message: 'A containerless custom element cannot be the root component of an application.'
        },
        30: {
            type: 0 /* error */,
            message: 'There are more targets than there are target instructions.'
        },
        31: {
            type: 0 /* error */,
            message: 'There are more target instructions than there are targets.'
        },
        100: {
            type: 0 /* error */,
            message: 'Invalid start of expression.'
        },
        101: {
            type: 0 /* error */,
            message: 'Unconsumed token.'
        },
        102: {
            type: 0 /* error */,
            message: 'Double dot and spread operators are not supported.'
        },
        103: {
            type: 0 /* error */,
            message: 'Invalid member expression.'
        },
        104: {
            type: 0 /* error */,
            message: 'Unexpected end of expression.'
        },
        105: {
            type: 0 /* error */,
            message: 'Expected identifier.'
        },
        106: {
            type: 0 /* error */,
            message: 'Invalid BindingIdentifier at left hand side of "of".'
        },
        107: {
            type: 0 /* error */,
            message: 'Invalid or unsupported property definition in object literal.'
        },
        108: {
            type: 0 /* error */,
            message: 'Unterminated quote in string literal.'
        },
        109: {
            type: 0 /* error */,
            message: 'Unterminated template string.'
        },
        110: {
            type: 0 /* error */,
            message: 'Missing expected token.'
        },
        111: {
            type: 0 /* error */,
            message: 'Unexpected character.'
        },
        150: {
            type: 0 /* error */,
            message: 'Left hand side of expression is not assignable.'
        },
        151: {
            type: 0 /* error */,
            message: 'Unexpected keyword "of"'
        }
    };
});
//# sourceMappingURL=reporter.js.map