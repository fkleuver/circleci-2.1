(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "@au-test/runtime", "./binding-command", "./expression-parser", "./template-compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const runtime_1 = require("@au-test/runtime");
    const binding_command_1 = require("./binding-command");
    const expression_parser_1 = require("./expression-parser");
    const template_compiler_1 = require("./template-compiler");
    const globalResources = [
        runtime_1.Compose,
        runtime_1.If,
        runtime_1.Else,
        runtime_1.Repeat,
        runtime_1.Replaceable,
        runtime_1.With,
        runtime_1.SanitizeValueConverter,
        runtime_1.AttrBindingBehavior,
        runtime_1.DebounceBindingBehavior,
        runtime_1.OneTimeBindingBehavior,
        runtime_1.ToViewBindingBehavior,
        runtime_1.FromViewBindingBehavior,
        runtime_1.SelfBindingBehavior,
        runtime_1.SignalBindingBehavior,
        runtime_1.ThrottleBindingBehavior,
        runtime_1.TwoWayBindingBehavior,
        runtime_1.UpdateTriggerBindingBehavior
    ];
    const defaultBindingLanguage = [
        binding_command_1.DefaultBindingCommand,
        binding_command_1.OneTimeBindingCommand,
        binding_command_1.ToViewBindingCommand,
        binding_command_1.FromViewBindingCommand,
        binding_command_1.TwoWayBindingCommand,
        binding_command_1.TriggerBindingCommand,
        binding_command_1.DelegateBindingCommand,
        binding_command_1.CaptureBindingCommand,
        binding_command_1.CallBindingCommand,
        binding_command_1.ForBindingCommand
    ];
    exports.BasicConfiguration = {
        register(container) {
            container.register(expression_parser_1.ParserRegistration, kernel_1.Registration.singleton(runtime_1.ITemplateCompiler, template_compiler_1.TemplateCompiler), ...globalResources, ...defaultBindingLanguage);
        }
    };
});
//# sourceMappingURL=configuration.js.map