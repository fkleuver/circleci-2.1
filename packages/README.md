# Packages

Each package gets its own folder and we use Lerna 3.0 to manage, build, test, and publish across all packages.

### Core Packages

| Package | Version | Dependencies |
|--------|-------|------------|
| [`@au-test/kernel`](/packages/kernel) | [![npm](https://img.shields.io/npm/v/@au-test/kernel.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/kernel) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/kernel)](https://david-dm.org/aurelia/aurelia?path=packages/kernel) |
| [`@au-test/runtime`](/packages/runtime) | [![npm](https://img.shields.io/npm/v/@au-test/runtime.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/runtime) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/runtime)](https://david-dm.org/aurelia/aurelia?path=packages/runtime) |
| [`@au-test/jit`](/packages/jit) | [![npm](https://img.shields.io/npm/v/@au-test/jit.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/jit) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/jit)](https://david-dm.org/aurelia/aurelia?path=packages/jit) |
| [`@au-test/aot`](/packages/aot) | [![npm](https://img.shields.io/npm/v/@au-test/aot.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/aot) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/aot)](https://david-dm.org/aurelia/aurelia?path=packages/aot) |

The Aurelia core framework can be broken down into 4 parts:

- [`@au-test/kernel`](/packages/kernel) is the lowest level part of Aurelia and contains core interfaces and types, the basic platform abstractions, and the dependency injection system.
- [`@au-test/runtime`](/packages/runtime) builds directly on top of the Kernel and provides the bare-metal runtime needed to execute an Aurelia application. This includes the binding engine, templating engine, component model, and application lifecycle management.
- [`@au-test/jit`](/packages/jit) is capable of parsing binding expressions and compiling view templates. You only need to deploy it if you don't use the AOT module.
- [`@au-test/aot`](/packages/aot) leverages the parsers and compilers inside the JIT module to pre-build all templates and bindings, doing work as part of your build process rather than at runtime in the browser.



### Other
| Package | Version | Dependencies |
|--------|-------|------------|
| [`@au-test/debug`](/packages/debug) | [![npm](https://img.shields.io/npm/v/@au-test/debug.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/debug) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/debug)](https://david-dm.org/aurelia/aurelia?path=packages/debug) |
| [`@au-test/router`](/packages/router) | [![npm](https://img.shields.io/npm/v/@au-test/router.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/router) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/router)](https://david-dm.org/aurelia/aurelia?path=packages/router) |

[`@au-test/debug`](/packages/debug) enables detailed error messages, richer stack trace information, and other debug-time instrumentation and tooling.

### Plugins

| Package | Version | Dependencies |
|--------|-------|------------|
| [`@au-test/plugin-requirejs`](/packages/plugin-requirejs) | [![npm](https://img.shields.io/npm/v/@au-test/plugin-requirejs.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/plugin-requirejs) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/plugin-requirejs)](https://david-dm.org/aurelia/aurelia?path=packages/plugin-requirejs) |
| [`@au-test/plugin-svg`](/packages/plugin-svg) | [![npm](https://img.shields.io/npm/v/@au-test/plugin-svg.svg?maxAge=3600)](https://www.npmjs.com/package/@au-test/plugin-svg) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/plugin-svg)](https://david-dm.org/aurelia/aurelia?path=packages/plugin-svg) |

