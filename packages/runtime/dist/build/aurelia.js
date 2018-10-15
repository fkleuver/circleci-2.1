(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./binding/binding-flags", "./templating", "./templating/rendering-engine"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_flags_1 = require("./binding/binding-flags");
    const templating_1 = require("./templating");
    const rendering_engine_1 = require("./templating/rendering-engine");
    class Aurelia {
        constructor(container = kernel_1.DI.createContainer()) {
            this.container = container;
            this.components = [];
            this.startTasks = [];
            this.stopTasks = [];
            this.isStarted = false;
            this._root = null;
            kernel_1.Registration
                .instance(Aurelia, this)
                .register(container, Aurelia);
        }
        register(...params) {
            this.container.register(...params);
            return this;
        }
        app(config) {
            const component = config.component;
            const startTask = () => {
                if (!this.components.includes(component)) {
                    this._root = component;
                    this.components.push(component);
                    component.$hydrate(this.container.get(rendering_engine_1.IRenderingEngine), config.host);
                }
                component.$bind(binding_flags_1.BindingFlags.fromStartTask | binding_flags_1.BindingFlags.fromBind);
                templating_1.Lifecycle.beginAttach(config.host, templating_1.LifecycleFlags.none)
                    .attach(component)
                    .end();
            };
            this.startTasks.push(startTask);
            this.stopTasks.push(() => {
                const task = templating_1.Lifecycle.beginDetach(templating_1.LifecycleFlags.noTasks)
                    .detach(component)
                    .end();
                const flags = binding_flags_1.BindingFlags.fromStopTask | binding_flags_1.BindingFlags.fromUnbind;
                if (task.done) {
                    component.$unbind(flags);
                }
                else {
                    task.wait().then(() => component.$unbind(flags));
                }
            });
            if (this.isStarted) {
                startTask();
            }
            return this;
        }
        root() {
            return this._root;
        }
        start() {
            this.startTasks.forEach(x => x());
            this.isStarted = true;
            return this;
        }
        stop() {
            this.isStarted = false;
            this.stopTasks.forEach(x => x());
            return this;
        }
    }
    exports.Aurelia = Aurelia;
    kernel_1.PLATFORM.global.Aurelia = Aurelia;
});
//# sourceMappingURL=aurelia.js.map