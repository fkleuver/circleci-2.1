this.au = this.au || {};
this.au.debug = (function (exports,AST,kernel) {
  'use strict';

  const BindingContext = Object.assign({}, AST.BindingContext, { createScopeForTest(bindingContext, parentBindingContext) {
          if (parentBindingContext) {
              return {
                  bindingContext,
                  overrideContext: this.createOverride(bindingContext, this.createOverride(parentBindingContext))
              };
          }
          return {
              bindingContext,
              overrideContext: this.createOverride(bindingContext)
          };
      } });

  const astTypeMap = [
      { type: AST.AccessKeyed, name: 'AccessKeyed' },
      { type: AST.AccessMember, name: 'AccessMember' },
      { type: AST.AccessScope, name: 'AccessScope' },
      { type: AST.AccessThis, name: 'AccessThis' },
      { type: AST.ArrayBindingPattern, name: 'ArrayBindingPattern' },
      { type: AST.ArrayLiteral, name: 'ArrayLiteral' },
      { type: AST.Assign, name: 'Assign' },
      { type: AST.Binary, name: 'Binary' },
      { type: AST.BindingBehavior, name: 'BindingBehavior' },
      { type: AST.BindingIdentifier, name: 'BindingIdentifier' },
      { type: AST.CallFunction, name: 'CallFunction' },
      { type: AST.CallMember, name: 'CallMember' },
      { type: AST.CallScope, name: 'CallScope' },
      { type: AST.Conditional, name: 'Conditional' },
      { type: AST.ForOfStatement, name: 'ForOfStatement' },
      { type: AST.HtmlLiteral, name: 'HtmlLiteral' },
      { type: AST.Interpolation, name: 'Interpolation' },
      { type: AST.ObjectBindingPattern, name: 'ObjectBindingPattern' },
      { type: AST.ObjectLiteral, name: 'ObjectLiteral' },
      { type: AST.PrimitiveLiteral, name: 'PrimitiveLiteral' },
      { type: AST.TaggedTemplate, name: 'TaggedTemplate' },
      { type: AST.Template, name: 'Template' },
      { type: AST.Unary, name: 'Unary' },
      { type: AST.ValueConverter, name: 'ValueConverter' }
  ];
  function enableImprovedExpressionDebugging() {
      astTypeMap.forEach(x => adoptDebugMethods(x.type, x.name));
  }
  /*@internal*/
  function adoptDebugMethods($type, name) {
      $type.prototype.toString = function () { return Unparser.unparse(this); };
  }
  /*@internal*/
  class Unparser {
      constructor() {
          this.text = '';
      }
      static unparse(expr) {
          const visitor = new Unparser();
          expr.accept(visitor);
          return visitor.text;
      }
      visitAccessMember(expr) {
          expr.object.accept(this);
          this.text += `.${expr.name}`;
      }
      visitAccessKeyed(expr) {
          expr.object.accept(this);
          this.text += '[';
          expr.key.accept(this);
          this.text += ']';
      }
      visitAccessThis(expr) {
          if (expr.ancestor === 0) {
              this.text += '$this';
              return;
          }
          this.text += '$parent';
          let i = expr.ancestor - 1;
          while (i--) {
              this.text += '.$parent';
          }
      }
      visitAccessScope(expr) {
          let i = expr.ancestor;
          while (i--) {
              this.text += '$parent.';
          }
          this.text += expr.name;
      }
      visitArrayLiteral(expr) {
          const elements = expr.elements;
          this.text += '[';
          for (let i = 0, length = elements.length; i < length; ++i) {
              if (i !== 0) {
                  this.text += ',';
              }
              elements[i].accept(this);
          }
          this.text += ']';
      }
      visitObjectLiteral(expr) {
          const keys = expr.keys;
          const values = expr.values;
          this.text += '{';
          for (let i = 0, length = keys.length; i < length; ++i) {
              if (i !== 0) {
                  this.text += ',';
              }
              this.text += `'${keys[i]}':`;
              values[i].accept(this);
          }
          this.text += '}';
      }
      visitPrimitiveLiteral(expr) {
          this.text += '(';
          if (typeof expr.value === 'string') {
              const escaped = expr.value.replace(/'/g, '\'');
              this.text += `'${escaped}'`;
          }
          else {
              this.text += `${expr.value}`;
          }
          this.text += ')';
      }
      visitCallFunction(expr) {
          this.text += '(';
          expr.func.accept(this);
          this.writeArgs(expr.args);
          this.text += ')';
      }
      visitCallMember(expr) {
          this.text += '(';
          expr.object.accept(this);
          this.text += `.${expr.name}`;
          this.writeArgs(expr.args);
          this.text += ')';
      }
      visitCallScope(expr) {
          this.text += '(';
          let i = expr.ancestor;
          while (i--) {
              this.text += '$parent.';
          }
          this.text += expr.name;
          this.writeArgs(expr.args);
          this.text += ')';
      }
      visitTemplate(expr) {
          const { cooked, expressions } = expr;
          const length = expressions.length;
          this.text += '`';
          this.text += cooked[0];
          for (let i = 0; i < length; i++) {
              expressions[i].accept(this);
              this.text += cooked[i + 1];
          }
          this.text += '`';
      }
      visitTaggedTemplate(expr) {
          const { cooked, expressions } = expr;
          const length = expressions.length;
          expr.func.accept(this);
          this.text += '`';
          this.text += cooked[0];
          for (let i = 0; i < length; i++) {
              expressions[i].accept(this);
              this.text += cooked[i + 1];
          }
          this.text += '`';
      }
      visitUnary(expr) {
          this.text += `(${expr.operation}`;
          if (expr.operation.charCodeAt(0) >= /*a*/ 97) {
              this.text += ' ';
          }
          expr.expression.accept(this);
          this.text += ')';
      }
      visitBinary(expr) {
          this.text += '(';
          expr.left.accept(this);
          if (expr.operation.charCodeAt(0) === /*i*/ 105) {
              this.text += ` ${expr.operation} `;
          }
          else {
              this.text += expr.operation;
          }
          expr.right.accept(this);
          this.text += ')';
      }
      visitConditional(expr) {
          this.text += '(';
          expr.condition.accept(this);
          this.text += '?';
          expr.yes.accept(this);
          this.text += ':';
          expr.no.accept(this);
          this.text += ')';
      }
      visitAssign(expr) {
          this.text += '(';
          expr.target.accept(this);
          this.text += '=';
          expr.value.accept(this);
          this.text += ')';
      }
      visitValueConverter(expr) {
          const args = expr.args;
          expr.expression.accept(this);
          this.text += `|${expr.name}`;
          for (let i = 0, length = args.length; i < length; ++i) {
              this.text += ':';
              args[i].accept(this);
          }
      }
      visitBindingBehavior(expr) {
          const args = expr.args;
          expr.expression.accept(this);
          this.text += `&${expr.name}`;
          for (let i = 0, length = args.length; i < length; ++i) {
              this.text += ':';
              args[i].accept(this);
          }
      }
      visitArrayBindingPattern(expr) {
          const elements = expr.elements;
          this.text += '[';
          for (let i = 0, length = elements.length; i < length; ++i) {
              if (i !== 0) {
                  this.text += ',';
              }
              elements[i].accept(this);
          }
          this.text += ']';
      }
      visitObjectBindingPattern(expr) {
          const keys = expr.keys;
          const values = expr.values;
          this.text += '{';
          for (let i = 0, length = keys.length; i < length; ++i) {
              if (i !== 0) {
                  this.text += ',';
              }
              this.text += `'${keys[i]}':`;
              values[i].accept(this);
          }
          this.text += '}';
      }
      visitBindingIdentifier(expr) {
          this.text += expr.name;
      }
      visitHtmlLiteral(expr) { throw new Error('visitHtmlLiteral'); }
      visitForOfStatement(expr) {
          expr.declaration.accept(this);
          this.text += ' of ';
          expr.iterable.accept(this);
      }
      visitInterpolation(expr) {
          const { parts, expressions } = expr;
          const length = expressions.length;
          this.text += '${';
          this.text += parts[0];
          for (let i = 0; i < length; i++) {
              expressions[i].accept(this);
              this.text += parts[i + 1];
          }
          this.text += '}';
      }
      writeArgs(args) {
          this.text += '(';
          for (let i = 0, length = args.length; i < length; ++i) {
              if (i !== 0) {
                  this.text += ',';
              }
              args[i].accept(this);
          }
          this.text += ')';
      }
  }
  /*@internal*/
  class Serializer {
      static serialize(expr) {
          const visitor = new Serializer();
          if (expr === null || expr === undefined || typeof expr.accept !== 'function') {
              return `${expr}`;
          }
          return expr.accept(visitor);
      }
      visitAccessMember(expr) {
          return `{"type":"AccessMember","name":${expr.name},"object":${expr.object.accept(this)}}`;
      }
      visitAccessKeyed(expr) {
          return `{"type":"AccessKeyed","object":${expr.object.accept(this)},"key":${expr.key.accept(this)}}`;
      }
      visitAccessThis(expr) {
          return `{"type":"AccessThis","ancestor":${expr.ancestor}}`;
      }
      visitAccessScope(expr) {
          return `{"type":"AccessScope","name":"${expr.name}","ancestor":${expr.ancestor}}`;
      }
      visitArrayLiteral(expr) {
          return `{"type":"ArrayLiteral","elements":${this.serializeExpressions(expr.elements)}}`;
      }
      visitObjectLiteral(expr) {
          return `{"type":"ObjectLiteral","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
      }
      visitPrimitiveLiteral(expr) {
          return `{"type":"PrimitiveLiteral","value":${serializePrimitive(expr.value)}}`;
      }
      visitCallFunction(expr) {
          return `{"type":"CallFunction","func":${expr.func.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
      }
      visitCallMember(expr) {
          return `{"type":"CallMember","name":"${expr.name}","object":${expr.object.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
      }
      visitCallScope(expr) {
          return `{"type":"CallScope","name":"${expr.name}","ancestor":${expr.ancestor},"args":${this.serializeExpressions(expr.args)}}`;
      }
      visitTemplate(expr) {
          return `{"type":"Template","cooked":${serializePrimitives(expr.cooked)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
      }
      visitTaggedTemplate(expr) {
          return `{"type":"TaggedTemplate","cooked":${serializePrimitives(expr.cooked)},"raw":${serializePrimitives(expr.cooked.raw)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
      }
      visitUnary(expr) {
          return `{"type":"Unary","operation":"${expr.operation}","expression":${expr.expression.accept(this)}}`;
      }
      visitBinary(expr) {
          return `{"type":"Binary","operation":"${expr.operation}","left":${expr.left.accept(this)},"right":${expr.right.accept(this)}}`;
      }
      visitConditional(expr) {
          return `{"type":"Conditional","condition":${expr.condition.accept(this)},"yes":${expr.yes.accept(this)},"no":${expr.no.accept(this)}}`;
      }
      visitAssign(expr) {
          return `{"type":"Assign","target":${expr.target.accept(this)},"value":${expr.value.accept(this)}}`;
      }
      visitValueConverter(expr) {
          return `{"type":"ValueConverter","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
      }
      visitBindingBehavior(expr) {
          return `{"type":"BindingBehavior","name":"${expr.name}","expression":${expr.expression.accept(this)},"args":${this.serializeExpressions(expr.args)}}`;
      }
      visitArrayBindingPattern(expr) {
          return `{"type":"ArrayBindingPattern","elements":${this.serializeExpressions(expr.elements)}}`;
      }
      visitObjectBindingPattern(expr) {
          return `{"type":"ObjectBindingPattern","keys":${serializePrimitives(expr.keys)},"values":${this.serializeExpressions(expr.values)}}`;
      }
      visitBindingIdentifier(expr) {
          return `{"type":"BindingIdentifier","name":"${expr.name}"}`;
      }
      visitHtmlLiteral(expr) { throw new Error('visitHtmlLiteral'); }
      visitForOfStatement(expr) {
          return `{"type":"ForOfStatement","declaration":${expr.declaration.accept(this)},"iterable":${expr.iterable.accept(this)}}`;
      }
      visitInterpolation(expr) {
          return `{"type":"Interpolation","cooked":${serializePrimitives(expr.parts)},"expressions":${this.serializeExpressions(expr.expressions)}}`;
      }
      // tslint:disable-next-line:no-any
      serializeExpressions(args) {
          let text = '[';
          for (let i = 0, ii = args.length; i < ii; ++i) {
              if (i !== 0) {
                  text += ',';
              }
              text += args[i].accept(this);
          }
          text += ']';
          return text;
      }
  }
  // tslint:disable-next-line:no-any
  function serializePrimitives(values) {
      let text = '[';
      for (let i = 0, ii = values.length; i < ii; ++i) {
          if (i !== 0) {
              text += ',';
          }
          text += serializePrimitive(values[i]);
      }
      text += ']';
      return text;
  }
  // tslint:disable-next-line:no-any
  function serializePrimitive(value) {
      if (typeof value === 'string') {
          return `"\\"${escapeString(value)}\\""`;
      }
      else if (value === null || value === undefined) {
          return `"${value}"`;
      }
      else {
          return `${value}`;
      }
  }
  function escapeString(str) {
      let ret = '';
      for (let i = 0, ii = str.length; i < ii; ++i) {
          ret += escape(str.charAt(i));
      }
      return ret;
  }
  function escape(ch) {
      switch (ch) {
          case '\b': return '\\b';
          case '\t': return '\\t';
          case '\n': return '\\n';
          case '\v': return '\\v';
          case '\f': return '\\f';
          case '\r': return '\\r';
          case '\"': return '\\"';
          case '\'': return '\\\'';
          case '\\': return '\\\\';
          default: return ch;
      }
  }

  const Reporter = Object.assign({}, kernel.Reporter, { write(code, ...params) {
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

  const DebugConfiguration = {
      register(container) {
          Reporter.write(2);
          Object.assign(kernel.Reporter, Reporter);
          enableImprovedExpressionDebugging();
      }
  };

  exports.BindingContext = BindingContext;
  exports.enableImprovedExpressionDebugging = enableImprovedExpressionDebugging;
  exports.adoptDebugMethods = adoptDebugMethods;
  exports.Unparser = Unparser;
  exports.Serializer = Serializer;
  exports.DebugConfiguration = DebugConfiguration;
  exports.Reporter = Reporter;

  return exports;

}({},au.runtime,au.kernel));
