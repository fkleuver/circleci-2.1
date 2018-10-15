(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@au-test/kernel", "@au-test/runtime", "./instructions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@au-test/kernel");
    const runtime_1 = require("@au-test/runtime");
    const instructions_1 = require("./instructions");
    function bindingCommand(nameOrSource) {
        return function (target) {
            return exports.BindingCommandResource.define(nameOrSource, target);
        };
    }
    exports.bindingCommand = bindingCommand;
    exports.BindingCommandResource = {
        name: 'binding-command',
        keyFrom(name) {
            return `${this.name}:${name}`;
        },
        isType(type) {
            return type.kind === this;
        },
        define(nameOrSource, ctor) {
            const description = typeof nameOrSource === 'string' ? { name: nameOrSource, target: null } : nameOrSource;
            const Type = ctor;
            Type.kind = exports.BindingCommandResource;
            Type.description = description;
            Type.register = function (container) {
                container.register(kernel_1.Registration.singleton(Type.kind.keyFrom(description.name), Type));
            };
            const proto = Type.prototype;
            proto.handles = proto.handles || defaultHandles;
            return Type;
        }
    };
    function defaultHandles($symbol) {
        return !$symbol.isTemplateController;
    }
    let OneTimeBindingCommand = class OneTimeBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.OneTimeBindingInstruction(this.parser.parse($symbol.rawValue, 49 /* OneTimeCommand */), $symbol.dest);
        }
    };
    OneTimeBindingCommand.inject = [runtime_1.IExpressionParser];
    OneTimeBindingCommand = tslib_1.__decorate([
        bindingCommand('one-time')
    ], OneTimeBindingCommand);
    exports.OneTimeBindingCommand = OneTimeBindingCommand;
    let ToViewBindingCommand = class ToViewBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.ToViewBindingInstruction(this.parser.parse($symbol.rawValue, 50 /* ToViewCommand */), $symbol.dest);
        }
    };
    ToViewBindingCommand.inject = [runtime_1.IExpressionParser];
    ToViewBindingCommand = tslib_1.__decorate([
        bindingCommand('to-view')
    ], ToViewBindingCommand);
    exports.ToViewBindingCommand = ToViewBindingCommand;
    let FromViewBindingCommand = class FromViewBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.FromViewBindingInstruction(this.parser.parse($symbol.rawValue, 51 /* FromViewCommand */), $symbol.dest);
        }
    };
    FromViewBindingCommand.inject = [runtime_1.IExpressionParser];
    FromViewBindingCommand = tslib_1.__decorate([
        bindingCommand('from-view')
    ], FromViewBindingCommand);
    exports.FromViewBindingCommand = FromViewBindingCommand;
    let TwoWayBindingCommand = class TwoWayBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.TwoWayBindingInstruction(this.parser.parse($symbol.rawValue, 52 /* TwoWayCommand */), $symbol.dest);
        }
    };
    TwoWayBindingCommand.inject = [runtime_1.IExpressionParser];
    TwoWayBindingCommand = tslib_1.__decorate([
        bindingCommand('two-way')
    ], TwoWayBindingCommand);
    exports.TwoWayBindingCommand = TwoWayBindingCommand;
    // Not bothering to throw on non-existing modes, should never happen anyway.
    // Keeping all array elements of the same type for better optimizeability.
    const compileMode = ['', '$1', '$2', '', '$4', '', '$6'];
    let DefaultBindingCommand = class DefaultBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return this[compileMode[$symbol.mode]]($symbol);
        }
    };
    DefaultBindingCommand.inject = [runtime_1.IExpressionParser];
    DefaultBindingCommand = tslib_1.__decorate([
        bindingCommand('bind')
    ], DefaultBindingCommand);
    exports.DefaultBindingCommand = DefaultBindingCommand;
    DefaultBindingCommand.prototype.$1 = OneTimeBindingCommand.prototype.compile;
    DefaultBindingCommand.prototype.$2 = ToViewBindingCommand.prototype.compile;
    DefaultBindingCommand.prototype.$4 = FromViewBindingCommand.prototype.compile;
    DefaultBindingCommand.prototype.$6 = TwoWayBindingCommand.prototype.compile;
    let TriggerBindingCommand = class TriggerBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.TriggerBindingInstruction(this.parser.parse($symbol.rawValue, 86 /* TriggerCommand */), $symbol.dest);
        }
    };
    TriggerBindingCommand.inject = [runtime_1.IExpressionParser];
    TriggerBindingCommand = tslib_1.__decorate([
        bindingCommand('trigger')
    ], TriggerBindingCommand);
    exports.TriggerBindingCommand = TriggerBindingCommand;
    let DelegateBindingCommand = class DelegateBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.DelegateBindingInstruction(this.parser.parse($symbol.rawValue, 88 /* DelegateCommand */), $symbol.dest);
        }
    };
    DelegateBindingCommand.inject = [runtime_1.IExpressionParser];
    DelegateBindingCommand = tslib_1.__decorate([
        bindingCommand('delegate')
    ], DelegateBindingCommand);
    exports.DelegateBindingCommand = DelegateBindingCommand;
    let CaptureBindingCommand = class CaptureBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.CaptureBindingInstruction(this.parser.parse($symbol.rawValue, 87 /* CaptureCommand */), $symbol.dest);
        }
    };
    CaptureBindingCommand.inject = [runtime_1.IExpressionParser];
    CaptureBindingCommand = tslib_1.__decorate([
        bindingCommand('capture')
    ], CaptureBindingCommand);
    exports.CaptureBindingCommand = CaptureBindingCommand;
    let CallBindingCommand = class CallBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            return new instructions_1.CallBindingInstruction(this.parser.parse($symbol.rawValue, 153 /* CallCommand */), $symbol.dest);
        }
    };
    CallBindingCommand.inject = [runtime_1.IExpressionParser];
    CallBindingCommand = tslib_1.__decorate([
        bindingCommand('call')
    ], CallBindingCommand);
    exports.CallBindingCommand = CallBindingCommand;
    let ForBindingCommand = class ForBindingCommand {
        constructor(parser) {
            this.parser = parser;
        }
        compile($symbol) {
            const src = {
                name: 'repeat',
                templateOrNode: $symbol.$element.node,
                instructions: []
            };
            return new instructions_1.HydrateTemplateController(src, 'repeat', [
                new instructions_1.IteratorBindingInstruction(this.parser.parse($symbol.rawValue, 539 /* ForCommand */), 'items'),
                new instructions_1.SetPropertyInstruction('item', 'local')
                // tslint:disable-next-line:align
            ], false);
        }
        handles($symbol) {
            return $symbol.target === 'repeat';
        }
    };
    ForBindingCommand.inject = [runtime_1.IExpressionParser];
    ForBindingCommand = tslib_1.__decorate([
        bindingCommand('for')
    ], ForBindingCommand);
    exports.ForBindingCommand = ForBindingCommand;
});
//# sourceMappingURL=binding-command.js.map