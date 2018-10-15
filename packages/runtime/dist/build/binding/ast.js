(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel", "./binding-behavior", "./binding-context", "./binding-flags", "./signaler", "./value-converter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    const binding_behavior_1 = require("./binding-behavior");
    const binding_context_1 = require("./binding-context");
    const binding_flags_1 = require("./binding-flags");
    const signaler_1 = require("./signaler");
    const value_converter_1 = require("./value-converter");
    function connects(expr) {
        return (expr.$kind & 32 /* Connects */) === 32 /* Connects */;
    }
    exports.connects = connects;
    function observes(expr) {
        return (expr.$kind & 64 /* Observes */) === 64 /* Observes */;
    }
    exports.observes = observes;
    function callsFunction(expr) {
        return (expr.$kind & 128 /* CallsFunction */) === 128 /* CallsFunction */;
    }
    exports.callsFunction = callsFunction;
    function hasAncestor(expr) {
        return (expr.$kind & 256 /* HasAncestor */) === 256 /* HasAncestor */;
    }
    exports.hasAncestor = hasAncestor;
    function isAssignable(expr) {
        return (expr.$kind & 8192 /* IsAssignable */) === 8192 /* IsAssignable */;
    }
    exports.isAssignable = isAssignable;
    function isLeftHandSide(expr) {
        return (expr.$kind & 1024 /* IsLeftHandSide */) === 1024 /* IsLeftHandSide */;
    }
    exports.isLeftHandSide = isLeftHandSide;
    function isPrimary(expr) {
        return (expr.$kind & 512 /* IsPrimary */) === 512 /* IsPrimary */;
    }
    exports.isPrimary = isPrimary;
    function isResource(expr) {
        return (expr.$kind & 32768 /* IsResource */) === 32768 /* IsResource */;
    }
    exports.isResource = isResource;
    function hasBind(expr) {
        return (expr.$kind & 2048 /* HasBind */) === 2048 /* HasBind */;
    }
    exports.hasBind = hasBind;
    function hasUnbind(expr) {
        return (expr.$kind & 4096 /* HasUnbind */) === 4096 /* HasUnbind */;
    }
    exports.hasUnbind = hasUnbind;
    function isLiteral(expr) {
        return (expr.$kind & 16384 /* IsLiteral */) === 16384 /* IsLiteral */;
    }
    exports.isLiteral = isLiteral;
    function arePureLiterals(expressions) {
        const len = expressions && expressions.length || 0;
        if (len === 0) {
            return true;
        }
        for (let i = 0; i < len; ++i) {
            if (!isPureLiteral(expressions[i])) {
                return false;
            }
        }
        return true;
    }
    exports.arePureLiterals = arePureLiterals;
    function isPureLiteral(expr) {
        if (isLiteral(expr)) {
            switch (expr.$kind) {
                case 17955 /* ArrayLiteral */:
                    return arePureLiterals(expr.elements);
                case 17956 /* ObjectLiteral */:
                    return arePureLiterals(expr.values);
                case 17958 /* Template */:
                    return arePureLiterals(expr.expressions);
                case 17925 /* PrimitiveLiteral */:
                    return true;
            }
        }
        return false;
    }
    exports.isPureLiteral = isPureLiteral;
    class BindingBehavior {
        constructor(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.behaviorKey = binding_behavior_1.BindingBehaviorResource.keyFrom(this.name);
            this.expressionHasBind = hasBind(expression);
            this.expressionHasUnbind = hasUnbind(expression);
        }
        evaluate(flags, scope, locator) {
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        bind(flags, scope, binding) {
            if (scope === undefined) {
                throw kernel_1.Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw kernel_1.Reporter.error(251 /* NullScope */, this);
            }
            if (!binding) {
                throw kernel_1.Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw kernel_1.Reporter.error(202 /* NoLocator */, this);
            }
            if (this.expressionHasBind) {
                this.expression.bind(flags, scope, binding);
            }
            const behaviorKey = this.behaviorKey;
            const behavior = locator.get(behaviorKey);
            if (!behavior) {
                throw kernel_1.Reporter.error(203 /* NoBehaviorFound */, this);
            }
            if (binding[behaviorKey] !== undefined) {
                throw kernel_1.Reporter.error(204 /* BehaviorAlreadyApplied */, this);
            }
            binding[behaviorKey] = behavior;
            behavior.bind.apply(behavior, [flags, scope, binding].concat(evalList(flags, scope, locator, this.args)));
        }
        unbind(flags, scope, binding) {
            const behaviorKey = this.behaviorKey;
            binding[behaviorKey].unbind(flags, scope, binding);
            binding[behaviorKey] = null;
            if (this.expressionHasUnbind) {
                this.expression.unbind(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitBindingBehavior(this);
        }
    }
    exports.BindingBehavior = BindingBehavior;
    class ValueConverter {
        constructor(expression, name, args) {
            this.expression = expression;
            this.name = name;
            this.args = args;
            this.converterKey = value_converter_1.ValueConverterResource.keyFrom(this.name);
        }
        evaluate(flags, scope, locator) {
            if (!locator) {
                throw kernel_1.Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel_1.Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('toView' in converter) {
                const args = this.args;
                const len = args.length;
                const result = Array(len + 1);
                result[0] = this.expression.evaluate(flags, scope, locator);
                for (let i = 0; i < len; ++i) {
                    result[i + 1] = args[i].evaluate(flags, scope, locator);
                }
                return converter.toView.apply(converter, result);
            }
            return this.expression.evaluate(flags, scope, locator);
        }
        assign(flags, scope, locator, value) {
            if (!locator) {
                throw kernel_1.Reporter.error(202 /* NoLocator */, this);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel_1.Reporter.error(205 /* NoConverterFound */, this);
            }
            if ('fromView' in converter) {
                value = converter.fromView.apply(converter, [value].concat(evalList(flags, scope, locator, this.args)));
            }
            return this.expression.assign(flags, scope, locator, value);
        }
        connect(flags, scope, binding) {
            if (scope === undefined) {
                throw kernel_1.Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw kernel_1.Reporter.error(251 /* NullScope */, this);
            }
            if (!binding) {
                throw kernel_1.Reporter.error(206 /* NoBinding */, this);
            }
            const locator = binding.locator;
            if (!locator) {
                throw kernel_1.Reporter.error(202 /* NoLocator */, this);
            }
            this.expression.connect(flags, scope, binding);
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
            const converter = locator.get(this.converterKey);
            if (!converter) {
                throw kernel_1.Reporter.error(205 /* NoConverterFound */, this);
            }
            const signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(signaler_1.ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.addSignalListener(signals[i], binding);
            }
        }
        unbind(flags, scope, binding) {
            const locator = binding.locator;
            const converter = locator.get(this.converterKey);
            const signals = converter.signals;
            if (signals === undefined) {
                return;
            }
            const signaler = locator.get(signaler_1.ISignaler);
            for (let i = 0, ii = signals.length; i < ii; ++i) {
                signaler.removeSignalListener(signals[i], binding);
            }
        }
        accept(visitor) {
            return visitor.visitValueConverter(this);
        }
    }
    exports.ValueConverter = ValueConverter;
    class Assign {
        constructor(target, value) {
            this.target = target;
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.target.assign(flags, scope, locator, this.value.evaluate(flags, scope, locator));
        }
        connect(flags, scope, binding) { }
        assign(flags, scope, locator, value) {
            this.value.assign(flags, scope, locator, value);
            return this.target.assign(flags, scope, locator, value);
        }
        accept(visitor) {
            return visitor.visitAssign(this);
        }
    }
    exports.Assign = Assign;
    class Conditional {
        constructor(condition, yes, no) {
            this.condition = condition;
            this.yes = yes;
            this.no = no;
        }
        evaluate(flags, scope, locator) {
            return (!!this.condition.evaluate(flags, scope, locator))
                ? this.yes.evaluate(flags, scope, locator)
                : this.no.evaluate(flags, scope, locator);
        }
        connect(flags, scope, binding) {
            const condition = this.condition;
            if (condition.evaluate(flags, scope, null)) {
                this.condition.connect(flags, scope, binding);
                this.yes.connect(flags, scope, binding);
            }
            else {
                this.condition.connect(flags, scope, binding);
                this.no.connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitConditional(this);
        }
    }
    exports.Conditional = Conditional;
    class AccessThis {
        constructor(ancestor = 0) {
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            if (scope === undefined) {
                throw kernel_1.Reporter.error(250 /* UndefinedScope */, this);
            }
            if (scope === null) {
                throw kernel_1.Reporter.error(251 /* NullScope */, this);
            }
            let oc = scope.overrideContext;
            let i = this.ancestor;
            while (i-- && oc) {
                oc = oc.parentOverrideContext;
            }
            return i < 1 && oc ? oc.bindingContext : undefined;
        }
        accept(visitor) {
            return visitor.visitAccessThis(this);
        }
    }
    AccessThis.$this = new AccessThis(0);
    AccessThis.$parent = new AccessThis(1);
    exports.AccessThis = AccessThis;
    class AccessScope {
        constructor(name, ancestor = 0) {
            this.name = name;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const name = this.name;
            return binding_context_1.BindingContext.get(scope, name, this.ancestor)[name];
        }
        assign(flags, scope, locator, value) {
            const name = this.name;
            const context = binding_context_1.BindingContext.get(scope, name, this.ancestor);
            return context ? (context[name] = value) : undefined;
        }
        connect(flags, scope, binding) {
            const name = this.name;
            const context = binding_context_1.BindingContext.get(scope, name, this.ancestor);
            binding.observeProperty(context, name);
        }
        accept(visitor) {
            return visitor.visitAccessScope(this);
        }
    }
    exports.AccessScope = AccessScope;
    class AccessMember {
        constructor(object, name) {
            this.object = object;
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            return instance === null || instance === undefined ? instance : instance[this.name];
        }
        assign(flags, scope, locator, value) {
            let instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || typeof instance !== 'object') {
                instance = {};
                this.object.assign(flags, scope, locator, instance);
            }
            instance[this.name] = value;
            return value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (obj) {
                binding.observeProperty(obj, this.name);
            }
        }
        accept(visitor) {
            return visitor.visitAccessMember(this);
        }
    }
    exports.AccessMember = AccessMember;
    class AccessKeyed {
        constructor(object, key) {
            this.object = object;
            this.key = key;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            if (instance === null || instance === undefined) {
                return undefined;
            }
            const key = this.key.evaluate(flags, scope, locator);
            // note: getKeyed and setKeyed are removed because they are identical to the default spec behavior
            // and the runtime does this this faster
            // tslint:disable-next-line:no-any
            return instance[key];
        }
        assign(flags, scope, locator, value) {
            const instance = this.object.evaluate(flags, scope, locator);
            const key = this.key.evaluate(flags, scope, locator);
            // tslint:disable-next-line:no-any
            return instance[key] = value;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (typeof obj === 'object' && obj !== null) {
                this.key.connect(flags, scope, binding);
                const key = this.key.evaluate(flags, scope, null);
                // observe the property represented by the key as long as it's not an array indexer
                // (note: string indexers behave the same way as numeric indexers as long as they represent numbers)
                if (!(Array.isArray(obj) && isNumeric(key))) {
                    binding.observeProperty(obj, key);
                }
            }
        }
        accept(visitor) {
            return visitor.visitAccessKeyed(this);
        }
    }
    exports.AccessKeyed = AccessKeyed;
    class CallScope {
        constructor(name, args, ancestor = 0) {
            this.name = name;
            this.args = args;
            this.ancestor = ancestor;
        }
        evaluate(flags, scope, locator) {
            const args = evalList(flags, scope, locator, this.args);
            const context = binding_context_1.BindingContext.get(scope, this.name, this.ancestor);
            const func = getFunction(flags, context, this.name);
            if (func) {
                return func.apply(context, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const args = this.args;
            for (let i = 0, ii = args.length; i < ii; ++i) {
                args[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitCallScope(this);
        }
    }
    exports.CallScope = CallScope;
    class CallMember {
        constructor(object, name, args) {
            this.object = object;
            this.name = name;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const instance = this.object.evaluate(flags, scope, locator);
            const args = evalList(flags, scope, locator, this.args);
            const func = getFunction(flags, instance, this.name);
            if (func) {
                return func.apply(instance, args);
            }
            return undefined;
        }
        connect(flags, scope, binding) {
            const obj = this.object.evaluate(flags, scope, null);
            this.object.connect(flags, scope, binding);
            if (getFunction(flags & ~binding_flags_1.BindingFlags.mustEvaluate, obj, this.name)) {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallMember(this);
        }
    }
    exports.CallMember = CallMember;
    class CallFunction {
        constructor(func, args) {
            this.func = func;
            this.args = args;
        }
        evaluate(flags, scope, locator) {
            const func = this.func.evaluate(flags, scope, locator); // not sure why this cast is needed..
            if (typeof func === 'function') {
                return func.apply(null, evalList(flags, scope, locator, this.args));
            }
            if (!(flags & binding_flags_1.BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
                return undefined;
            }
            throw kernel_1.Reporter.error(207 /* NotAFunction */, this);
        }
        connect(flags, scope, binding) {
            const func = this.func.evaluate(flags, scope, null);
            this.func.connect(flags, scope, binding);
            if (typeof func === 'function') {
                const args = this.args;
                for (let i = 0, ii = args.length; i < ii; ++i) {
                    args[i].connect(flags, scope, binding);
                }
            }
        }
        accept(visitor) {
            return visitor.visitCallFunction(this);
        }
    }
    exports.CallFunction = CallFunction;
    class Binary {
        constructor(operation, left, right) {
            this.operation = operation;
            this.left = left;
            this.right = right;
            // what we're doing here is effectively moving the large switch statement from evaluate to the constructor
            // so that the check only needs to be done once, and evaluate (which is called many times) will have a lot less
            // work to do; we can do this because the operation can't change after it's parsed
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw kernel_1.Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            const left = this.left.evaluate(flags, scope, null);
            this.left.connect(flags, scope, binding);
            if (this.operation === '&&' && !left || this.operation === '||' && left) {
                return;
            }
            this.right.connect(flags, scope, binding);
        }
        ['&&'](f, s, l) {
            return this.left.evaluate(f, s, l) && this.right.evaluate(f, s, l);
        }
        ['||'](f, s, l) {
            return this.left.evaluate(f, s, l) || this.right.evaluate(f, s, l);
        }
        ['=='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) == this.right.evaluate(f, s, l);
        }
        ['==='](f, s, l) {
            return this.left.evaluate(f, s, l) === this.right.evaluate(f, s, l);
        }
        ['!='](f, s, l) {
            // tslint:disable-next-line:triple-equals
            return this.left.evaluate(f, s, l) != this.right.evaluate(f, s, l);
        }
        ['!=='](f, s, l) {
            return this.left.evaluate(f, s, l) !== this.right.evaluate(f, s, l);
        }
        ['instanceof'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (typeof right === 'function') {
                return this.left.evaluate(f, s, l) instanceof right;
            }
            return false;
        }
        ['in'](f, s, l) {
            const right = this.right.evaluate(f, s, l);
            if (right !== null && typeof right === 'object') {
                return this.left.evaluate(f, s, l) in right;
            }
            return false;
        }
        // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
        // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
        // this makes bugs in user code easier to track down for end users
        // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
        ['+'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) + this.right.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) - this.right.evaluate(f, s, l);
        }
        ['*'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) * this.right.evaluate(f, s, l);
        }
        ['/'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) / this.right.evaluate(f, s, l);
        }
        ['%'](f, s, l) {
            // tslint:disable-next-line:no-any
            return this.left.evaluate(f, s, l) % this.right.evaluate(f, s, l);
        }
        ['<'](f, s, l) {
            return this.left.evaluate(f, s, l) < this.right.evaluate(f, s, l);
        }
        ['>'](f, s, l) {
            return this.left.evaluate(f, s, l) > this.right.evaluate(f, s, l);
        }
        ['<='](f, s, l) {
            return this.left.evaluate(f, s, l) <= this.right.evaluate(f, s, l);
        }
        ['>='](f, s, l) {
            return this.left.evaluate(f, s, l) >= this.right.evaluate(f, s, l);
        }
        // tslint:disable-next-line:member-ordering
        accept(visitor) {
            return visitor.visitBinary(this);
        }
    }
    exports.Binary = Binary;
    class Unary {
        constructor(operation, expression) {
            this.operation = operation;
            this.expression = expression;
            // see Binary (we're doing the same thing here)
            // tslint:disable-next-line:no-any
            this.evaluate = this[operation];
        }
        evaluate(flags, scope, locator) {
            throw kernel_1.Reporter.error(208 /* UnknownOperator */, this);
        }
        connect(flags, scope, binding) {
            this.expression.connect(flags, scope, binding);
        }
        ['void'](f, s, l) {
            return void this.expression.evaluate(f, s, l);
        }
        ['typeof'](f, s, l) {
            return typeof this.expression.evaluate(f, s, l);
        }
        ['!'](f, s, l) {
            return !this.expression.evaluate(f, s, l);
        }
        ['-'](f, s, l) {
            return -this.expression.evaluate(f, s, l);
        }
        ['+'](f, s, l) {
            return +this.expression.evaluate(f, s, l);
        }
        // tslint:disable-next-line:member-ordering
        accept(visitor) {
            return visitor.visitUnary(this);
        }
    }
    exports.Unary = Unary;
    class PrimitiveLiteral {
        constructor(value) {
            this.value = value;
        }
        evaluate(flags, scope, locator) {
            return this.value;
        }
        accept(visitor) {
            return visitor.visitPrimitiveLiteral(this);
        }
    }
    PrimitiveLiteral.$undefined = new PrimitiveLiteral(undefined);
    PrimitiveLiteral.$null = new PrimitiveLiteral(null);
    PrimitiveLiteral.$true = new PrimitiveLiteral(true);
    PrimitiveLiteral.$false = new PrimitiveLiteral(false);
    PrimitiveLiteral.$empty = new PrimitiveLiteral('');
    exports.PrimitiveLiteral = PrimitiveLiteral;
    class HtmlLiteral {
        constructor(parts) {
            this.parts = parts;
        }
        evaluate(flags, scope, locator) {
            const elements = this.parts;
            let result = '';
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                const value = elements[i].evaluate(flags, scope, locator);
                if (value === undefined || value === null) {
                    continue;
                }
                result += value;
            }
            return result;
        }
        connect(flags, scope, binding) {
            for (let i = 0, ii = this.parts.length; i < ii; ++i) {
                this.parts[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitHtmlLiteral(this);
        }
    }
    exports.HtmlLiteral = HtmlLiteral;
    class ArrayLiteral {
        constructor(elements) {
            this.elements = elements;
        }
        evaluate(flags, scope, locator) {
            const elements = this.elements;
            const length = elements.length;
            const result = Array(length);
            for (let i = 0; i < length; ++i) {
                result[i] = elements[i].evaluate(flags, scope, locator);
            }
            return result;
        }
        connect(flags, scope, binding) {
            const elements = this.elements;
            for (let i = 0, ii = elements.length; i < ii; ++i) {
                elements[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitArrayLiteral(this);
        }
    }
    ArrayLiteral.$empty = new ArrayLiteral(kernel_1.PLATFORM.emptyArray);
    exports.ArrayLiteral = ArrayLiteral;
    class ObjectLiteral {
        constructor(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        evaluate(flags, scope, locator) {
            const instance = {};
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                instance[keys[i]] = values[i].evaluate(flags, scope, locator);
            }
            return instance;
        }
        connect(flags, scope, binding) {
            const keys = this.keys;
            const values = this.values;
            for (let i = 0, ii = keys.length; i < ii; ++i) {
                values[i].connect(flags, scope, binding);
            }
        }
        accept(visitor) {
            return visitor.visitObjectLiteral(this);
        }
    }
    ObjectLiteral.$empty = new ObjectLiteral(kernel_1.PLATFORM.emptyArray, kernel_1.PLATFORM.emptyArray);
    exports.ObjectLiteral = ObjectLiteral;
    class Template {
        constructor(cooked, expressions) {
            this.cooked = cooked;
            this.expressions = expressions;
            this.expressions = expressions || kernel_1.PLATFORM.emptyArray;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const cooked = this.cooked;
            let result = cooked[0];
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                result += expressions[i].evaluate(flags, scope, locator);
                result += cooked[i + 1];
            }
            return result;
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
                i++;
            }
        }
        accept(visitor) {
            return visitor.visitTemplate(this);
        }
    }
    Template.$empty = new Template(['']);
    exports.Template = Template;
    class TaggedTemplate {
        constructor(cooked, raw, func, expressions) {
            this.cooked = cooked;
            this.func = func;
            this.expressions = expressions;
            cooked.raw = raw;
            this.expressions = expressions || kernel_1.PLATFORM.emptyArray;
        }
        evaluate(flags, scope, locator) {
            const expressions = this.expressions;
            const len = expressions.length;
            const results = Array(len);
            for (let i = 0, ii = len; i < ii; ++i) {
                results[i] = expressions[i].evaluate(flags, scope, locator);
            }
            const func = this.func.evaluate(flags, scope, locator); // not sure why this cast is needed..
            if (typeof func !== 'function') {
                throw kernel_1.Reporter.error(207 /* NotAFunction */, this);
            }
            return func.apply(null, [this.cooked].concat(results));
        }
        connect(flags, scope, binding) {
            const expressions = this.expressions;
            for (let i = 0, ii = expressions.length; i < ii; ++i) {
                expressions[i].connect(flags, scope, binding);
            }
            this.func.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitTaggedTemplate(this);
        }
    }
    exports.TaggedTemplate = TaggedTemplate;
    class ArrayBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(elements) {
            this.elements = elements;
        }
        // tslint:disable-next-line:no-any
        evaluate(flags, scope, locator) {
            // TODO
        }
        // tslint:disable-next-line:no-any
        assign(flags, scope, locator, obj) {
            // TODO
        }
        connect(flags, scope, binding) { }
        accept(visitor) {
            return visitor.visitArrayBindingPattern(this);
        }
    }
    exports.ArrayBindingPattern = ArrayBindingPattern;
    class ObjectBindingPattern {
        // We'll either have elements, or keys+values, but never all 3
        constructor(keys, values) {
            this.keys = keys;
            this.values = values;
        }
        // tslint:disable-next-line:no-any
        evaluate(flags, scope, locator) {
            // TODO
        }
        // tslint:disable-next-line:no-any
        assign(flags, scope, locator, obj) {
            // TODO
        }
        connect(flags, scope, binding) { }
        accept(visitor) {
            return visitor.visitObjectBindingPattern(this);
        }
    }
    exports.ObjectBindingPattern = ObjectBindingPattern;
    class BindingIdentifier {
        constructor(name) {
            this.name = name;
        }
        evaluate(flags, scope, locator) {
            return this.name;
        }
        connect(flags, scope, binding) { }
        accept(visitor) {
            return visitor.visitBindingIdentifier(this);
        }
    }
    exports.BindingIdentifier = BindingIdentifier;
    const toStringTag = Object.prototype.toString;
    // https://tc39.github.io/ecma262/#sec-iteration-statements
    // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
    class ForOfStatement {
        constructor(declaration, iterable) {
            this.declaration = declaration;
            this.iterable = iterable;
        }
        evaluate(flags, scope, locator) {
            return this.iterable.evaluate(flags, scope, locator);
        }
        count(result) {
            return exports.CountForOfStatement[toStringTag.call(result)](result);
        }
        // tslint:disable-next-line:no-any
        iterate(result, func) {
            exports.IterateForOfStatement[toStringTag.call(result)](result, func);
        }
        connect(flags, scope, binding) {
            this.declaration.connect(flags, scope, binding);
            this.iterable.connect(flags, scope, binding);
        }
        accept(visitor) {
            return visitor.visitForOfStatement(this);
        }
    }
    exports.ForOfStatement = ForOfStatement;
    /*
    * Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
    * so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
    * but this class might be a candidate for removal if it turns out it does provide all we need
    */
    class Interpolation {
        constructor(parts, expressions) {
            this.parts = parts;
            this.expressions = expressions;
            this.isMulti = expressions.length > 1;
            this.firstExpression = expressions[0];
        }
        evaluate(flags, scope, locator) {
            if (this.isMulti) {
                const expressions = this.expressions;
                const parts = this.parts;
                let result = parts[0];
                for (let i = 0, ii = expressions.length; i < ii; ++i) {
                    result += expressions[i].evaluate(flags, scope, locator);
                    result += parts[i + 1];
                }
                return result;
            }
            else {
                const parts = this.parts;
                return parts[0] + this.firstExpression.evaluate(flags, scope, locator) + parts[1];
            }
        }
        connect(flags, scope, binding) { }
        accept(visitor) {
            return visitor.visitInterpolation(this);
        }
    }
    exports.Interpolation = Interpolation;
    /*
    * Note: for a property that is always the same, directly assigning it to the prototype is more efficient CPU wise
    * (gets assigned once, instead of per constructor call) as well as memory wise (stored once, instead of per instance)
    *
    * This gives us a cheap way to add some extra information to the AST for the runtime to do things more efficiently.
    */
    BindingBehavior.prototype.$kind = 38962 /* BindingBehavior */;
    ValueConverter.prototype.$kind = 36913 /* ValueConverter */;
    Assign.prototype.$kind = 8208 /* Assign */;
    Conditional.prototype.$kind = 63 /* Conditional */;
    AccessThis.prototype.$kind = 1793 /* AccessThis */;
    AccessScope.prototype.$kind = 10082 /* AccessScope */;
    AccessMember.prototype.$kind = 9323 /* AccessMember */;
    AccessKeyed.prototype.$kind = 9324 /* AccessKeyed */;
    CallScope.prototype.$kind = 1448 /* CallScope */;
    CallMember.prototype.$kind = 1161 /* CallMember */;
    CallFunction.prototype.$kind = 1162 /* CallFunction */;
    Binary.prototype.$kind = 46 /* Binary */;
    Unary.prototype.$kind = 39 /* Unary */;
    PrimitiveLiteral.prototype.$kind = 17925 /* PrimitiveLiteral */;
    HtmlLiteral.prototype.$kind = 51 /* HtmlLiteral */;
    ArrayLiteral.prototype.$kind = 17955 /* ArrayLiteral */;
    ObjectLiteral.prototype.$kind = 17956 /* ObjectLiteral */;
    Template.prototype.$kind = 17958 /* Template */;
    TaggedTemplate.prototype.$kind = 1197 /* TaggedTemplate */;
    ArrayBindingPattern.prototype.$kind = 65556 /* ArrayBindingPattern */;
    ObjectBindingPattern.prototype.$kind = 65557 /* ObjectBindingPattern */;
    BindingIdentifier.prototype.$kind = 65558 /* BindingIdentifier */;
    ForOfStatement.prototype.$kind = 55 /* ForOfStatement */;
    Interpolation.prototype.$kind = 24 /* Interpolation */;
    /// Evaluate the [list] in context of the [scope].
    function evalList(flags, scope, locator, list) {
        const len = list.length;
        const result = Array(len);
        for (let i = 0; i < len; ++i) {
            result[i] = list[i].evaluate(flags, scope, locator);
        }
        return result;
    }
    function getFunction(flags, obj, name) {
        const func = obj === null || obj === undefined ? null : obj[name];
        if (typeof func === 'function') {
            return func;
        }
        if (!(flags & binding_flags_1.BindingFlags.mustEvaluate) && (func === null || func === undefined)) {
            return null;
        }
        throw kernel_1.Reporter.error(207 /* NotAFunction */, obj, name, func);
    }
    function isNumeric(value) {
        // tslint:disable-next-line:no-reserved-keywords
        const type = typeof value;
        if (type === 'number')
            return true;
        if (type !== 'string')
            return false;
        const len = value.length;
        if (len === 0)
            return false;
        for (let i = 0; i < len; ++i) {
            const char = value.charCodeAt(i);
            if (char < 0x30 /*0*/ || char > 0x39 /*9*/) {
                return false;
            }
        }
        return true;
    }
    /*@internal*/
    exports.IterateForOfStatement = {
        ['[object Array]'](result, func) {
            for (let i = 0, ii = result.length; i < ii; ++i) {
                func(result, i, result[i]);
            }
        },
        ['[object Map]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const entry of result.entries()) {
                arr[++i] = entry;
            }
            exports.IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Set]'](result, func) {
            const arr = Array(result.size);
            let i = -1;
            for (const key of result.keys()) {
                arr[++i] = key;
            }
            exports.IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Number]'](result, func) {
            const arr = Array(result);
            for (let i = 0; i < result; ++i) {
                arr[i] = i;
            }
            exports.IterateForOfStatement['[object Array]'](arr, func);
        },
        ['[object Null]'](result, func) { },
        ['[object Undefined]'](result, func) { }
    };
    /*@internal*/
    exports.CountForOfStatement = {
        ['[object Array]'](result) { return result.length; },
        ['[object Map]'](result) { return result.size; },
        ['[object Set]'](result) { return result.size; },
        ['[object Number]'](result) { return result; },
        ['[object Null]'](result) { return 0; },
        ['[object Undefined]'](result) { return 0; }
    };
    // Give each AST class a noop for each interface method if and only if it's not already defined
    // This accomplishes the following:
    //   1) no runtime error due to bad AST structure (it's the parser's job to guard against that)
    //   2) no runtime error due to a bad binding such as two-way on a literal (no need, since it doesn't threaten the integrity of the app's state)
    //   3) should we decide something else, we can easily change the global behavior of 1) and 2) by simply assigning a different method here (either in the source or via AOT)
    const ast = [AccessThis, AccessScope, ArrayLiteral, ObjectLiteral, PrimitiveLiteral, Template, Unary, CallFunction, CallMember, CallScope, AccessMember, AccessKeyed, TaggedTemplate, Binary, Conditional, Assign, ForOfStatement];
    for (let i = 0, ii = ast.length; i < ii; ++i) {
        const proto = ast[i].prototype;
        // tslint:disable-next-line:no-any
        proto.assign = proto.assign || kernel_1.PLATFORM.noop;
        proto.connect = proto.connect || kernel_1.PLATFORM.noop;
    }
});
//# sourceMappingURL=ast.js.map