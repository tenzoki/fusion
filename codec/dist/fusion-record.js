#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ajv/dist/compile/codegen/code.js
var require_code = __commonJS({
  "node_modules/ajv/dist/compile/codegen/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
    var _CodeOrName = class {
    };
    exports._CodeOrName = _CodeOrName;
    exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    var Name = class extends _CodeOrName {
      constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return { [this.str]: 1 };
      }
    };
    exports.Name = Name;
    var _Code = class extends _CodeOrName {
      constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return false;
        const item = this._items[0];
        return item === "" || item === '""';
      }
      get str() {
        var _a;
        return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
      }
      get names() {
        var _a;
        return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names, c) => {
          if (c instanceof Name)
            names[c.str] = (names[c.str] || 0) + 1;
          return names;
        }, {});
      }
    };
    exports._Code = _Code;
    exports.nil = new _Code("");
    function _(strs, ...args) {
      const code = [strs[0]];
      let i = 0;
      while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
      }
      return new _Code(code);
    }
    exports._ = _;
    var plus = new _Code("+");
    function str(strs, ...args) {
      const expr = [safeStringify(strs[0])];
      let i = 0;
      while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
      }
      optimize(expr);
      return new _Code(expr);
    }
    exports.str = str;
    function addCodeArg(code, arg) {
      if (arg instanceof _Code)
        code.push(...arg._items);
      else if (arg instanceof Name)
        code.push(arg);
      else
        code.push(interpolate(arg));
    }
    exports.addCodeArg = addCodeArg;
    function optimize(expr) {
      let i = 1;
      while (i < expr.length - 1) {
        if (expr[i] === plus) {
          const res = mergeExprItems(expr[i - 1], expr[i + 1]);
          if (res !== void 0) {
            expr.splice(i - 1, 3, res);
            continue;
          }
          expr[i++] = "+";
        }
        i++;
      }
    }
    function mergeExprItems(a, b) {
      if (b === '""')
        return a;
      if (a === '""')
        return b;
      if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
          return;
        if (typeof b != "string")
          return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
          return a.slice(0, -1) + b.slice(1);
        return;
      }
      if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
      return;
    }
    function strConcat(c1, c2) {
      return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
    }
    exports.strConcat = strConcat;
    function interpolate(x) {
      return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
    }
    function stringify(x) {
      return new _Code(safeStringify(x));
    }
    exports.stringify = stringify;
    function safeStringify(x) {
      return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    exports.safeStringify = safeStringify;
    function getProperty(key) {
      return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
    }
    exports.getProperty = getProperty;
    function getEsmExportName(key) {
      if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
      }
      throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
    }
    exports.getEsmExportName = getEsmExportName;
    function regexpCode(rx) {
      return new _Code(rx.toString());
    }
    exports.regexpCode = regexpCode;
  }
});

// node_modules/ajv/dist/compile/codegen/scope.js
var require_scope = __commonJS({
  "node_modules/ajv/dist/compile/codegen/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
    var code_1 = require_code();
    var ValueError = class extends Error {
      constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
      }
    };
    var UsedValueState;
    (function(UsedValueState2) {
      UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
      UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
    })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
    exports.varKinds = {
      const: new code_1.Name("const"),
      let: new code_1.Name("let"),
      var: new code_1.Name("var")
    };
    var Scope = class {
      constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
      }
      toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
      }
      name(prefix2) {
        return new code_1.Name(this._newName(prefix2));
      }
      _newName(prefix2) {
        const ng = this._names[prefix2] || this._nameGroup(prefix2);
        return `${prefix2}${ng.index++}`;
      }
      _nameGroup(prefix2) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix2)) || this._prefixes && !this._prefixes.has(prefix2)) {
          throw new Error(`CodeGen: prefix "${prefix2}" is not allowed in this scope`);
        }
        return this._names[prefix2] = { prefix: prefix2, index: 0 };
      }
    };
    exports.Scope = Scope;
    var ValueScopeName = class extends code_1.Name {
      constructor(prefix2, nameStr) {
        super(nameStr);
        this.prefix = prefix2;
      }
      setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._)`.${new code_1.Name(property)}[${itemIndex}]`;
      }
    };
    exports.ValueScopeName = ValueScopeName;
    var line = (0, code_1._)`\n`;
    var ValueScope = class extends Scope {
      constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
      }
      get() {
        return this._scope;
      }
      name(prefix2) {
        return new ValueScopeName(prefix2, this._newName(prefix2));
      }
      value(nameOrPrefix, value) {
        var _a;
        if (value.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix: prefix2 } = name;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix2];
        if (vs) {
          const _name = vs.get(valueKey);
          if (_name)
            return _name;
        } else {
          vs = this._values[prefix2] = /* @__PURE__ */ new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix2] || (this._scope[prefix2] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix2, itemIndex });
        return name;
      }
      getValue(prefix2, keyOrRef) {
        const vs = this._values[prefix2];
        if (!vs)
          return;
        return vs.get(keyOrRef);
      }
      scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
          if (name.scopePath === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return (0, code_1._)`${scopeName}${name.scopePath}`;
        });
      }
      scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
          if (name.value === void 0)
            throw new Error(`CodeGen: name "${name}" has no value`);
          return name.value.code;
        }, usedValues, getCode);
      }
      _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix2 in values) {
          const vs = values[prefix2];
          if (!vs)
            continue;
          const nameSet = usedValues[prefix2] = usedValues[prefix2] || /* @__PURE__ */ new Map();
          vs.forEach((name) => {
            if (nameSet.has(name))
              return;
            nameSet.set(name, UsedValueState.Started);
            let c = valueCode(name);
            if (c) {
              const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
              code = (0, code_1._)`${code}${def} ${name} = ${c};${this.opts._n}`;
            } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
              code = (0, code_1._)`${code}${c}${this.opts._n}`;
            } else {
              throw new ValueError(name);
            }
            nameSet.set(name, UsedValueState.Completed);
          });
        }
        return code;
      }
    };
    exports.ValueScope = ValueScope;
  }
});

// node_modules/ajv/dist/compile/codegen/index.js
var require_codegen = __commonJS({
  "node_modules/ajv/dist/compile/codegen/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
    var code_1 = require_code();
    var scope_1 = require_scope();
    var code_2 = require_code();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return code_2._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return code_2.str;
    } });
    Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
      return code_2.strConcat;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return code_2.nil;
    } });
    Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
      return code_2.getProperty;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return code_2.stringify;
    } });
    Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
      return code_2.regexpCode;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return code_2.Name;
    } });
    var scope_2 = require_scope();
    Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
      return scope_2.Scope;
    } });
    Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
      return scope_2.ValueScope;
    } });
    Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
      return scope_2.ValueScopeName;
    } });
    Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
      return scope_2.varKinds;
    } });
    exports.operators = {
      GT: new code_1._Code(">"),
      GTE: new code_1._Code(">="),
      LT: new code_1._Code("<"),
      LTE: new code_1._Code("<="),
      EQ: new code_1._Code("==="),
      NEQ: new code_1._Code("!=="),
      NOT: new code_1._Code("!"),
      OR: new code_1._Code("||"),
      AND: new code_1._Code("&&"),
      ADD: new code_1._Code("+")
    };
    var Node = class {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_names, _constants) {
        return this;
      }
    };
    var Def = class extends Node {
      constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
      }
      render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (!names[this.name.str])
          return;
        if (this.rhs)
          this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
      }
    };
    var Assign = class extends Node {
      constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
      }
      render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
      }
      optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
          return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
      }
      get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
      }
    };
    var AssignOp = class extends Assign {
      constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
      }
      render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
      }
    };
    var Label = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        return `${this.label}:` + _n;
      }
    };
    var Break = class extends Node {
      constructor(label) {
        super();
        this.label = label;
        this.names = {};
      }
      render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
      }
    };
    var Throw = class extends Node {
      constructor(error) {
        super();
        this.error = error;
      }
      render({ _n }) {
        return `throw ${this.error};` + _n;
      }
      get names() {
        return this.error.names;
      }
    };
    var AnyCode = class extends Node {
      constructor(code) {
        super();
        this.code = code;
      }
      render({ _n }) {
        return `${this.code};` + _n;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
      }
      get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
      }
    };
    var ParentNode = class extends Node {
      constructor(nodes = []) {
        super();
        this.nodes = nodes;
      }
      render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
      }
      optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i].optimizeNodes();
          if (Array.isArray(n))
            nodes.splice(i, 1, ...n);
          else if (n)
            nodes[i] = n;
          else
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
          const n = nodes[i];
          if (n.optimizeNames(names, constants))
            continue;
          subtractNames(names, n.names);
          nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
      }
    };
    var BlockNode = class extends ParentNode {
      render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
      }
    };
    var Root = class extends ParentNode {
    };
    var Else = class extends BlockNode {
    };
    Else.kind = "else";
    var If = class _If extends BlockNode {
      constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
      }
      render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
          code += "else " + this.else.render(opts);
        return code;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
          return this.nodes;
        let e = this.else;
        if (e) {
          const ns = e.optimizeNodes();
          e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
          if (cond === false)
            return e instanceof _If ? e : e.nodes;
          if (this.nodes.length)
            return this;
          return new _If(not(cond), e instanceof _If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
          return void 0;
        return this;
      }
      optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
          return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
          addNames(names, this.else.names);
        return names;
      }
    };
    If.kind = "if";
    var For = class extends BlockNode {
    };
    For.kind = "for";
    var ForLoop = class extends For {
      constructor(iteration) {
        super();
        this.iteration = iteration;
      }
      render(opts) {
        return `for(${this.iteration})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iteration.names);
      }
    };
    var ForRange = class extends For {
      constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
      }
      render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
      }
      get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
      }
    };
    var ForIter = class extends For {
      constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
      }
      render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
      }
      optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
          return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
      }
      get names() {
        return addNames(super.names, this.iterable.names);
      }
    };
    var Func = class extends BlockNode {
      constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
      }
      render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
      }
    };
    Func.kind = "func";
    var Return = class extends ParentNode {
      render(opts) {
        return "return " + super.render(opts);
      }
    };
    Return.kind = "return";
    var Try = class extends BlockNode {
      render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
          code += this.catch.render(opts);
        if (this.finally)
          code += this.finally.render(opts);
        return code;
      }
      optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
      }
      optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
      }
      get names() {
        const names = super.names;
        if (this.catch)
          addNames(names, this.catch.names);
        if (this.finally)
          addNames(names, this.finally.names);
        return names;
      }
    };
    var Catch = class extends BlockNode {
      constructor(error) {
        super();
        this.error = error;
      }
      render(opts) {
        return `catch(${this.error})` + super.render(opts);
      }
    };
    Catch.kind = "catch";
    var Finally = class extends BlockNode {
      render(opts) {
        return "finally" + super.render(opts);
      }
    };
    Finally.kind = "finally";
    var CodeGen = class {
      constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(prefix2) {
        return this._scope.name(prefix2);
      }
      // reserves unique name in the external scope
      scopeName(prefix2) {
        return this._extScope.name(prefix2);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
        vs.add(name);
        return name;
      }
      getScopeValue(prefix2, keyOrRef) {
        return this._extScope.getValue(prefix2, keyOrRef);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== void 0 && constant)
          this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
      }
      // `const` declaration (`var` in es5 mode)
      const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
      }
      // `var` declaration with optional assignment
      var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
      }
      // assignment code
      assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
      }
      // `+=` code
      add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
      }
      // appends passed SafeExpr to code or executes Block
      code(c) {
        if (typeof c == "function")
          c();
        else if (c !== code_1.nil)
          this._leafNode(new AnyCode(c));
        return this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
          if (code.length > 1)
            code.push(",");
          code.push(key);
          if (key !== value || this.opts.es5) {
            code.push(":");
            (0, code_1.addCodeArg)(code, value);
          }
        }
        code.push("}");
        return new code_1._Code(code);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
          this.code(thenBody).else().code(elseBody).endIf();
        } else if (thenBody) {
          this.code(thenBody).endIf();
        } else if (elseBody) {
          throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(condition) {
        return this._elseNode(new If(condition));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new Else());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(If, Else);
      }
      _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
          this.code(forBody).endFor();
        return this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
      }
      // `for` statement for a range of values
      forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
          const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
          return this.forRange("_i", 0, (0, code_1._)`${arr}.length`, (i) => {
            this.var(name, (0, code_1._)`${arr}[${i}]`);
            forBody(name);
          });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(nameOrPrefix, (0, code_1._)`Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(For);
      }
      // `label` statement
      label(label) {
        return this._leafNode(new Label(label));
      }
      // `break` statement
      break(label) {
        return this._leafNode(new Break(label));
      }
      // `return` statement
      return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
      }
      // `try` statement
      try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
          const error = this.name("e");
          this._currNode = node.catch = new Catch(error);
          catchCode(error);
        }
        if (finallyCode) {
          this._currNode = node.finally = new Finally();
          this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
      }
      // `throw` statement
      throw(error) {
        return this._leafNode(new Throw(error));
      }
      // start self-balancing block
      block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
          this.code(body).endBlock(nodeCount);
        return this;
      }
      // end the current self-balancing block
      endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
          throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
          this.code(funcBody).endFunc();
        return this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(Func);
      }
      optimize(n = 1) {
        while (n-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
      }
      _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
      }
      _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || N2 && n instanceof N2) {
          this._nodes.pop();
          return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
      }
      _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
          throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
      }
      set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
      }
    };
    exports.CodeGen = CodeGen;
    function addNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
      return names;
    }
    function addExprNames(names, from) {
      return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
    }
    function optimizeExpr(expr, names, constants) {
      if (expr instanceof code_1.Name)
        return replaceName(expr);
      if (!canOptimize(expr))
        return expr;
      return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
          c = replaceName(c);
        if (c instanceof code_1._Code)
          items.push(...c._items);
        else
          items.push(c);
        return items;
      }, []));
      function replaceName(n) {
        const c = constants[n.str];
        if (c === void 0 || names[n.str] !== 1)
          return n;
        delete names[n.str];
        return c;
      }
      function canOptimize(e) {
        return e instanceof code_1._Code && e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== void 0);
      }
    }
    function subtractNames(names, from) {
      for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
    }
    function not(x) {
      return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._)`!${par(x)}`;
    }
    exports.not = not;
    var andCode = mappend(exports.operators.AND);
    function and(...args) {
      return args.reduce(andCode);
    }
    exports.and = and;
    var orCode = mappend(exports.operators.OR);
    function or(...args) {
      return args.reduce(orCode);
    }
    exports.or = or;
    function mappend(op) {
      return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._)`${par(x)} ${op} ${par(y)}`;
    }
    function par(x) {
      return x instanceof code_1.Name ? x : (0, code_1._)`(${x})`;
    }
  }
});

// node_modules/ajv/dist/compile/util.js
var require_util = __commonJS({
  "node_modules/ajv/dist/compile/util.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
    var codegen_1 = require_codegen();
    var code_1 = require_code();
    function toHash(arr) {
      const hash = {};
      for (const item of arr)
        hash[item] = true;
      return hash;
    }
    exports.toHash = toHash;
    function alwaysValidSchema(it, schema) {
      if (typeof schema == "boolean")
        return schema;
      if (Object.keys(schema).length === 0)
        return true;
      checkUnknownRules(it, schema);
      return !schemaHasRules(schema, it.self.RULES.all);
    }
    exports.alwaysValidSchema = alwaysValidSchema;
    function checkUnknownRules(it, schema = it.schema) {
      const { opts, self } = it;
      if (!opts.strictSchema)
        return;
      if (typeof schema === "boolean")
        return;
      const rules = self.RULES.keywords;
      for (const key in schema) {
        if (!rules[key])
          checkStrictMode(it, `unknown keyword: "${key}"`);
      }
    }
    exports.checkUnknownRules = checkUnknownRules;
    function schemaHasRules(schema, rules) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (rules[key])
          return true;
      return false;
    }
    exports.schemaHasRules = schemaHasRules;
    function schemaHasRulesButRef(schema, RULES) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
          return true;
      return false;
    }
    exports.schemaHasRulesButRef = schemaHasRulesButRef;
    function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
      if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
          return schema;
        if (typeof schema == "string")
          return (0, codegen_1._)`${schema}`;
      }
      return (0, codegen_1._)`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
    }
    exports.schemaRefOrVal = schemaRefOrVal;
    function unescapeFragment(str) {
      return unescapeJsonPointer(decodeURIComponent(str));
    }
    exports.unescapeFragment = unescapeFragment;
    function escapeFragment(str) {
      return encodeURIComponent(escapeJsonPointer(str));
    }
    exports.escapeFragment = escapeFragment;
    function escapeJsonPointer(str) {
      if (typeof str == "number")
        return `${str}`;
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    exports.escapeJsonPointer = escapeJsonPointer;
    function unescapeJsonPointer(str) {
      return str.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    exports.unescapeJsonPointer = unescapeJsonPointer;
    function eachItem(xs, f) {
      if (Array.isArray(xs)) {
        for (const x of xs)
          f(x);
      } else {
        f(xs);
      }
    }
    exports.eachItem = eachItem;
    function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
      return (gen, from, to, toName) => {
        const res = to === void 0 ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
      };
    }
    exports.mergeEvaluated = {
      props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => {
          gen.if((0, codegen_1._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._)`${to} || {}`).code((0, codegen_1._)`Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => {
          if (from === true) {
            gen.assign(to, true);
          } else {
            gen.assign(to, (0, codegen_1._)`${to} || {}`);
            setEvaluated(gen, to, from);
          }
        }),
        mergeValues: (from, to) => from === true ? true : { ...from, ...to },
        resultToName: evaluatedPropsToName
      }),
      items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._)`${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => from === true ? true : Math.max(from, to),
        resultToName: (gen, items) => gen.var("items", items)
      })
    };
    function evaluatedPropsToName(gen, ps) {
      if (ps === true)
        return gen.var("props", true);
      const props = gen.var("props", (0, codegen_1._)`{}`);
      if (ps !== void 0)
        setEvaluated(gen, props, ps);
      return props;
    }
    exports.evaluatedPropsToName = evaluatedPropsToName;
    function setEvaluated(gen, props, ps) {
      Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._)`${props}${(0, codegen_1.getProperty)(p)}`, true));
    }
    exports.setEvaluated = setEvaluated;
    var snippets = {};
    function useFunc(gen, f) {
      return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
      });
    }
    exports.useFunc = useFunc;
    var Type;
    (function(Type2) {
      Type2[Type2["Num"] = 0] = "Num";
      Type2[Type2["Str"] = 1] = "Str";
    })(Type || (exports.Type = Type = {}));
    function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
      if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax ? isNumber ? (0, codegen_1._)`"[" + ${dataProp} + "]"` : (0, codegen_1._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1._)`"/" + ${dataProp}` : (0, codegen_1._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
    }
    exports.getErrorPath = getErrorPath;
    function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
      if (!mode)
        return;
      msg = `strict mode: ${msg}`;
      if (mode === true)
        throw new Error(msg);
      it.self.logger.warn(msg);
    }
    exports.checkStrictMode = checkStrictMode;
  }
});

// node_modules/ajv/dist/compile/names.js
var require_names = __commonJS({
  "node_modules/ajv/dist/compile/names.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var names = {
      // validation function arguments
      data: new codegen_1.Name("data"),
      // data passed to validation function
      // args passed from referencing schema
      valCxt: new codegen_1.Name("valCxt"),
      // validation/data context - should not be used directly, it is destructured to the names below
      instancePath: new codegen_1.Name("instancePath"),
      parentData: new codegen_1.Name("parentData"),
      parentDataProperty: new codegen_1.Name("parentDataProperty"),
      rootData: new codegen_1.Name("rootData"),
      // root data - same as the data passed to the first/top validation function
      dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
      // used to support recursiveRef and dynamicRef
      // function scoped variables
      vErrors: new codegen_1.Name("vErrors"),
      // null or array of validation errors
      errors: new codegen_1.Name("errors"),
      // counter of validation errors
      this: new codegen_1.Name("this"),
      // "globals"
      self: new codegen_1.Name("self"),
      scope: new codegen_1.Name("scope"),
      // JTD serialize/parse name for JSON string and position
      json: new codegen_1.Name("json"),
      jsonPos: new codegen_1.Name("jsonPos"),
      jsonLen: new codegen_1.Name("jsonLen"),
      jsonPart: new codegen_1.Name("jsonPart")
    };
    exports.default = names;
  }
});

// node_modules/ajv/dist/compile/errors.js
var require_errors = __commonJS({
  "node_modules/ajv/dist/compile/errors.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    exports.keywordError = {
      message: ({ keyword }) => (0, codegen_1.str)`must pass "${keyword}" keyword validation`
    };
    exports.keyword$DataError = {
      message: ({ keyword, schemaType }) => schemaType ? (0, codegen_1.str)`"${keyword}" keyword must be ${schemaType} ($data)` : (0, codegen_1.str)`"${keyword}" keyword is invalid ($data)`
    };
    function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
        addError(gen, errObj);
      } else {
        returnErrors(it, (0, codegen_1._)`[${errObj}]`);
      }
    }
    exports.reportError = reportError;
    function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
      const { it } = cxt;
      const { gen, compositeRule, allErrors } = it;
      const errObj = errorObjectCode(cxt, error, errorPaths);
      addError(gen, errObj);
      if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
      }
    }
    exports.reportExtraError = reportExtraError;
    function resetErrorsCount(gen, errsCount) {
      gen.assign(names_1.default.errors, errsCount);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._)`${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
    }
    exports.resetErrorsCount = resetErrorsCount;
    function extendErrors({ gen, keyword, schemaValue, data, errsCount, it }) {
      if (errsCount === void 0)
        throw new Error("ajv implementation error");
      const err3 = gen.name("err");
      gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err3, (0, codegen_1._)`${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._)`${err3}.instancePath === undefined`, () => gen.assign((0, codegen_1._)`${err3}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._)`${err3}.schemaPath`, (0, codegen_1.str)`${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
          gen.assign((0, codegen_1._)`${err3}.schema`, schemaValue);
          gen.assign((0, codegen_1._)`${err3}.data`, data);
        }
      });
    }
    exports.extendErrors = extendErrors;
    function addError(gen, errObj) {
      const err3 = gen.const("err", errObj);
      gen.if((0, codegen_1._)`${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._)`[${err3}]`), (0, codegen_1._)`${names_1.default.vErrors}.push(${err3})`);
      gen.code((0, codegen_1._)`${names_1.default.errors}++`);
    }
    function returnErrors(it, errs) {
      const { gen, validateName, schemaEnv } = it;
      if (schemaEnv.$async) {
        gen.throw((0, codegen_1._)`new ${it.ValidationError}(${errs})`);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, errs);
        gen.return(false);
      }
    }
    var E = {
      keyword: new codegen_1.Name("keyword"),
      schemaPath: new codegen_1.Name("schemaPath"),
      // also used in JTD errors
      params: new codegen_1.Name("params"),
      propertyName: new codegen_1.Name("propertyName"),
      message: new codegen_1.Name("message"),
      schema: new codegen_1.Name("schema"),
      parentSchema: new codegen_1.Name("parentSchema")
    };
    function errorObjectCode(cxt, error, errorPaths) {
      const { createErrors } = cxt.it;
      if (createErrors === false)
        return (0, codegen_1._)`{}`;
      return errorObject(cxt, error, errorPaths);
    }
    function errorObject(cxt, error, errorPaths = {}) {
      const { gen, it } = cxt;
      const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths)
      ];
      extraErrorProps(cxt, error, keyValues);
      return gen.object(...keyValues);
    }
    function errorInstancePath({ errorPath }, { instancePath }) {
      const instPath = instancePath ? (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
      return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
    }
    function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
      let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str)`${errSchemaPath}/${keyword}`;
      if (schemaPath) {
        schPath = (0, codegen_1.str)`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
      }
      return [E.schemaPath, schPath];
    }
    function extraErrorProps(cxt, { params, message }, keyValues) {
      const { keyword, data, schemaValue, it } = cxt;
      const { opts, propertyName, topSchemaRef, schemaPath } = it;
      keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._)`{}`]);
      if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
      }
      if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._)`${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
      }
      if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
    }
  }
});

// node_modules/ajv/dist/compile/validate/boolSchema.js
var require_boolSchema = __commonJS({
  "node_modules/ajv/dist/compile/validate/boolSchema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var boolError = {
      message: "boolean schema is false"
    };
    function topBoolOrEmptySchema(it) {
      const { gen, schema, validateName } = it;
      if (schema === false) {
        falseSchemaError(it, false);
      } else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, null);
        gen.return(true);
      }
    }
    exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
    function boolOrEmptySchema(it, valid) {
      const { gen, schema } = it;
      if (schema === false) {
        gen.var(valid, false);
        falseSchemaError(it);
      } else {
        gen.var(valid, true);
      }
    }
    exports.boolOrEmptySchema = boolOrEmptySchema;
    function falseSchemaError(it, overrideAllErrors) {
      const { gen, data } = it;
      const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it
      };
      (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
    }
  }
});

// node_modules/ajv/dist/compile/rules.js
var require_rules = __commonJS({
  "node_modules/ajv/dist/compile/rules.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRules = exports.isJSONType = void 0;
    var _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
    var jsonTypes = new Set(_jsonTypes);
    function isJSONType(x) {
      return typeof x == "string" && jsonTypes.has(x);
    }
    exports.isJSONType = isJSONType;
    function getRules() {
      const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] }
      };
      return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {}
      };
    }
    exports.getRules = getRules;
  }
});

// node_modules/ajv/dist/compile/validate/applicability.js
var require_applicability = __commonJS({
  "node_modules/ajv/dist/compile/validate/applicability.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
    function schemaHasRulesForType({ schema, self }, type) {
      const group = self.RULES.types[type];
      return group && group !== true && shouldUseGroup(schema, group);
    }
    exports.schemaHasRulesForType = schemaHasRulesForType;
    function shouldUseGroup(schema, group) {
      return group.rules.some((rule) => shouldUseRule(schema, rule));
    }
    exports.shouldUseGroup = shouldUseGroup;
    function shouldUseRule(schema, rule) {
      var _a;
      return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
    }
    exports.shouldUseRule = shouldUseRule;
  }
});

// node_modules/ajv/dist/compile/validate/dataType.js
var require_dataType = __commonJS({
  "node_modules/ajv/dist/compile/validate/dataType.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
    var rules_1 = require_rules();
    var applicability_1 = require_applicability();
    var errors_1 = require_errors();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var DataType;
    (function(DataType2) {
      DataType2[DataType2["Correct"] = 0] = "Correct";
      DataType2[DataType2["Wrong"] = 1] = "Wrong";
    })(DataType || (exports.DataType = DataType = {}));
    function getSchemaTypes(schema) {
      const types = getJSONTypes(schema.type);
      const hasNull = types.includes("null");
      if (hasNull) {
        if (schema.nullable === false)
          throw new Error("type: null contradicts nullable: false");
      } else {
        if (!types.length && schema.nullable !== void 0) {
          throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
          types.push("null");
      }
      return types;
    }
    exports.getSchemaTypes = getSchemaTypes;
    function getJSONTypes(ts) {
      const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
      if (types.every(rules_1.isJSONType))
        return types;
      throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
    }
    exports.getJSONTypes = getJSONTypes;
    function coerceAndCheckDataType(it, types) {
      const { gen, data, opts } = it;
      const coerceTo = coerceToTypes(types, opts.coerceTypes);
      const checkTypes = types.length > 0 && !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
      if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
          if (coerceTo.length)
            coerceData(it, types, coerceTo);
          else
            reportTypeError(it);
        });
      }
      return checkTypes;
    }
    exports.coerceAndCheckDataType = coerceAndCheckDataType;
    var COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
    function coerceToTypes(types, coerceTypes) {
      return coerceTypes ? types.filter((t) => COERCIBLE.has(t) || coerceTypes === "array" && t === "array") : [];
    }
    function coerceData(it, types, coerceTo) {
      const { gen, data, opts } = it;
      const dataType = gen.let("dataType", (0, codegen_1._)`typeof ${data}`);
      const coerced = gen.let("coerced", (0, codegen_1._)`undefined`);
      if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._)`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1._)`${data}[0]`).assign(dataType, (0, codegen_1._)`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
      }
      gen.if((0, codegen_1._)`${coerced} !== undefined`);
      for (const t of coerceTo) {
        if (COERCIBLE.has(t) || t === "array" && opts.coerceTypes === "array") {
          coerceSpecificType(t);
        }
      }
      gen.else();
      reportTypeError(it);
      gen.endIf();
      gen.if((0, codegen_1._)`${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
      });
      function coerceSpecificType(t) {
        switch (t) {
          case "string":
            gen.elseIf((0, codegen_1._)`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, (0, codegen_1._)`"" + ${data}`).elseIf((0, codegen_1._)`${data} === null`).assign(coerced, (0, codegen_1._)`""`);
            return;
          case "number":
            gen.elseIf((0, codegen_1._)`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "integer":
            gen.elseIf((0, codegen_1._)`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1._)`+${data}`);
            return;
          case "boolean":
            gen.elseIf((0, codegen_1._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
            return;
          case "null":
            gen.elseIf((0, codegen_1._)`${data} === "" || ${data} === 0 || ${data} === false`);
            gen.assign(coerced, null);
            return;
          case "array":
            gen.elseIf((0, codegen_1._)`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1._)`[${data}]`);
        }
      }
    }
    function assignParentData({ gen, parentData, parentDataProperty }, expr) {
      gen.if((0, codegen_1._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1._)`${parentData}[${parentDataProperty}]`, expr));
    }
    function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
      const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
      let cond;
      switch (dataType) {
        case "null":
          return (0, codegen_1._)`${data} ${EQ} null`;
        case "array":
          cond = (0, codegen_1._)`Array.isArray(${data})`;
          break;
        case "object":
          cond = (0, codegen_1._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
          break;
        case "integer":
          cond = numCond((0, codegen_1._)`!(${data} % 1) && !isNaN(${data})`);
          break;
        case "number":
          cond = numCond();
          break;
        default:
          return (0, codegen_1._)`typeof ${data} ${EQ} ${dataType}`;
      }
      return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
      function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._)`isFinite(${data})` : codegen_1.nil);
      }
    }
    exports.checkDataType = checkDataType;
    function checkDataTypes(dataTypes, data, strictNums, correct) {
      if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
      }
      let cond;
      const types = (0, util_1.toHash)(dataTypes);
      if (types.array && types.object) {
        const notObj = (0, codegen_1._)`typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._)`!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
      } else {
        cond = codegen_1.nil;
      }
      if (types.number)
        delete types.integer;
      for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
      return cond;
    }
    exports.checkDataTypes = checkDataTypes;
    var typeError = {
      message: ({ schema }) => `must be ${schema}`,
      params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._)`{type: ${schema}}` : (0, codegen_1._)`{type: ${schemaValue}}`
    };
    function reportTypeError(it) {
      const cxt = getTypeErrorContext(it);
      (0, errors_1.reportError)(cxt, typeError);
    }
    exports.reportTypeError = reportTypeError;
    function getTypeErrorContext(it) {
      const { gen, data, schema } = it;
      const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
      return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it
      };
    }
  }
});

// node_modules/ajv/dist/compile/validate/defaults.js
var require_defaults = __commonJS({
  "node_modules/ajv/dist/compile/validate/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assignDefaults = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function assignDefaults(it, ty) {
      const { properties, items } = it.schema;
      if (ty === "object" && properties) {
        for (const key in properties) {
          assignDefault(it, key, properties[key].default);
        }
      } else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
      }
    }
    exports.assignDefaults = assignDefaults;
    function assignDefault(it, prop, defaultValue) {
      const { gen, compositeRule, data, opts } = it;
      if (defaultValue === void 0)
        return;
      const childData = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(prop)}`;
      if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
      }
      let condition = (0, codegen_1._)`${childData} === undefined`;
      if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._)`${condition} || ${childData} === null || ${childData} === ""`;
      }
      gen.if(condition, (0, codegen_1._)`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
    }
  }
});

// node_modules/ajv/dist/vocabularies/code.js
var require_code2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/code.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var util_2 = require_util();
    function checkReportMissingProp(cxt, prop) {
      const { gen, data, it } = cxt;
      gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._)`${prop}` }, true);
        cxt.error();
      });
    }
    exports.checkReportMissingProp = checkReportMissingProp;
    function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
      return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._)`${missing} = ${prop}`)));
    }
    exports.checkMissingProp = checkMissingProp;
    function reportMissingProp(cxt, missing) {
      cxt.setParams({ missingProperty: missing }, true);
      cxt.error();
    }
    exports.reportMissingProp = reportMissingProp;
    function hasPropFunc(gen) {
      return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._)`Object.prototype.hasOwnProperty`
      });
    }
    exports.hasPropFunc = hasPropFunc;
    function isOwnProperty(gen, data, property) {
      return (0, codegen_1._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
    }
    exports.isOwnProperty = isOwnProperty;
    function propertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
      return ownProperties ? (0, codegen_1._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
    }
    exports.propertyInData = propertyInData;
    function noPropertyInData(gen, data, property, ownProperties) {
      const cond = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
      return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
    }
    exports.noPropertyInData = noPropertyInData;
    function allSchemaProperties(schemaMap) {
      return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
    }
    exports.allSchemaProperties = allSchemaProperties;
    function schemaProperties(it, schemaMap) {
      return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
    }
    exports.schemaProperties = schemaProperties;
    function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
      const dataAndSchema = passSchema ? (0, codegen_1._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
      const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData]
      ];
      if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
      const args = (0, codegen_1._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
      return context !== codegen_1.nil ? (0, codegen_1._)`${func}.call(${context}, ${args})` : (0, codegen_1._)`${func}(${args})`;
    }
    exports.callValidateCode = callValidateCode;
    var newRegExp = (0, codegen_1._)`new RegExp`;
    function usePattern({ gen, it: { opts } }, pattern) {
      const u = opts.unicodeRegExp ? "u" : "";
      const { regExp } = opts.code;
      const rx = regExp(pattern, u);
      return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
      });
    }
    exports.usePattern = usePattern;
    function validateArray(cxt) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
      }
      gen.var(valid, true);
      validateItems(() => gen.break());
      return valid;
      function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        gen.forRange("i", 0, len, (i) => {
          cxt.subschema({
            keyword,
            dataProp: i,
            dataPropType: util_1.Type.Num
          }, valid);
          gen.if((0, codegen_1.not)(valid), notValid);
        });
      }
    }
    exports.validateArray = validateArray;
    function validateUnion(cxt) {
      const { gen, schema, keyword, it } = cxt;
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
      if (alwaysValid && !it.opts.unevaluated)
        return;
      const valid = gen.let("valid", false);
      const schValid = gen.name("_valid");
      gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
          keyword,
          schemaProp: i,
          compositeRule: true
        }, schValid);
        gen.assign(valid, (0, codegen_1._)`${valid} || ${schValid}`);
        const merged2 = cxt.mergeValidEvaluated(schCxt, schValid);
        if (!merged2)
          gen.if((0, codegen_1.not)(valid));
      }));
      cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
    }
    exports.validateUnion = validateUnion;
  }
});

// node_modules/ajv/dist/compile/validate/keyword.js
var require_keyword = __commonJS({
  "node_modules/ajv/dist/compile/validate/keyword.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var code_1 = require_code2();
    var errors_1 = require_errors();
    function macroKeywordCode(cxt, def) {
      const { gen, keyword, schema, parentSchema, it } = cxt;
      const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
      const schemaRef = useKeyword(gen, keyword, macroSchema);
      if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
      const valid = gen.name("valid");
      cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true
      }, valid);
      cxt.pass(valid, () => cxt.error(true));
    }
    exports.macroKeywordCode = macroKeywordCode;
    function funcKeywordCode(cxt, def) {
      var _a;
      const { gen, keyword, schema, parentSchema, $data, it } = cxt;
      checkAsyncKeyword(it, def);
      const validate2 = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
      const validateRef = useKeyword(gen, keyword, validate2);
      const valid = gen.let("valid");
      cxt.block$data(valid, validateKeyword);
      cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
      function validateKeyword() {
        if (def.errors === false) {
          assignValid();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => cxt.error());
        } else {
          const ruleErrs = def.async ? validateAsync() : validateSync();
          if (def.modifying)
            modifyData(cxt);
          reportErrs(() => addErrs(cxt, ruleErrs));
        }
      }
      function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._)`await `), (e) => gen.assign(valid, false).if((0, codegen_1._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._)`${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
      }
      function validateSync() {
        const validateErrs = (0, codegen_1._)`${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
      }
      function assignValid(_await = def.async ? (0, codegen_1._)`await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !("compile" in def && !$data || def.schema === false);
        gen.assign(valid, (0, codegen_1._)`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
      }
      function reportErrs(errors) {
        var _a2;
        gen.if((0, codegen_1.not)((_a2 = def.valid) !== null && _a2 !== void 0 ? _a2 : valid), errors);
      }
    }
    exports.funcKeywordCode = funcKeywordCode;
    function modifyData(cxt) {
      const { gen, data, it } = cxt;
      gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._)`${it.parentData}[${it.parentDataProperty}]`));
    }
    function addErrs(cxt, errs) {
      const { gen } = cxt;
      gen.if((0, codegen_1._)`Array.isArray(${errs})`, () => {
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
      }, () => cxt.error());
    }
    function checkAsyncKeyword({ schemaEnv }, def) {
      if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
    }
    function useKeyword(gen, keyword, result) {
      if (result === void 0)
        throw new Error(`keyword "${keyword}" failed to compile`);
      return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
    }
    function validSchemaType(schema, schemaType, allowUndefined = false) {
      return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
    }
    exports.validSchemaType = validSchemaType;
    function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
      if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
      }
      const deps = def.dependencies;
      if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
      }
      if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
          const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
          if (opts.validateSchema === "log")
            self.logger.error(msg);
          else
            throw new Error(msg);
        }
      }
    }
    exports.validateKeywordUsage = validateKeywordUsage;
  }
});

// node_modules/ajv/dist/compile/validate/subschema.js
var require_subschema = __commonJS({
  "node_modules/ajv/dist/compile/validate/subschema.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
      if (keyword !== void 0 && schema !== void 0) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
      }
      if (keyword !== void 0) {
        const sch = it.schema[keyword];
        return schemaProp === void 0 ? {
          schema: sch,
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}`
        } : {
          schema: sch[schemaProp],
          schemaPath: (0, codegen_1._)`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
          errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
        };
      }
      if (schema !== void 0) {
        if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
          throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
          schema,
          schemaPath,
          topSchemaRef,
          errSchemaPath
        };
      }
      throw new Error('either "keyword" or "schema" must be passed');
    }
    exports.getSubschema = getSubschema;
    function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
      if (data !== void 0 && dataProp !== void 0) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
      }
      const { gen } = it;
      if (dataProp !== void 0) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._)`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str)`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._)`${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
      }
      if (data !== void 0) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true);
        dataContextProps(nextData);
        if (propertyName !== void 0)
          subschema.propertyName = propertyName;
      }
      if (dataTypes)
        subschema.dataTypes = dataTypes;
      function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = /* @__PURE__ */ new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
      }
    }
    exports.extendSubschemaData = extendSubschemaData;
    function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
      if (compositeRule !== void 0)
        subschema.compositeRule = compositeRule;
      if (createErrors !== void 0)
        subschema.createErrors = createErrors;
      if (allErrors !== void 0)
        subschema.allErrors = allErrors;
      subschema.jtdDiscriminator = jtdDiscriminator;
      subschema.jtdMetadata = jtdMetadata;
    }
    exports.extendSubschemaMode = extendSubschemaMode;
  }
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// node_modules/json-schema-traverse/index.js
var require_json_schema_traverse = __commonJS({
  "node_modules/json-schema-traverse/index.js"(exports, module) {
    "use strict";
    var traverse = module.exports = function(schema, opts, cb) {
      if (typeof opts == "function") {
        cb = opts;
        opts = {};
      }
      cb = opts.cb || cb;
      var pre = typeof cb == "function" ? cb : cb.pre || function() {
      };
      var post = cb.post || function() {
      };
      _traverse(opts, pre, post, schema, "", schema);
    };
    traverse.keywords = {
      additionalItems: true,
      items: true,
      contains: true,
      additionalProperties: true,
      propertyNames: true,
      not: true,
      if: true,
      then: true,
      else: true
    };
    traverse.arrayKeywords = {
      items: true,
      allOf: true,
      anyOf: true,
      oneOf: true
    };
    traverse.propsKeywords = {
      $defs: true,
      definitions: true,
      properties: true,
      patternProperties: true,
      dependencies: true
    };
    traverse.skipKeywords = {
      default: true,
      enum: true,
      const: true,
      required: true,
      maximum: true,
      minimum: true,
      exclusiveMaximum: true,
      exclusiveMinimum: true,
      multipleOf: true,
      maxLength: true,
      minLength: true,
      pattern: true,
      format: true,
      maxItems: true,
      minItems: true,
      uniqueItems: true,
      maxProperties: true,
      minProperties: true
    };
    function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (schema && typeof schema == "object" && !Array.isArray(schema)) {
        pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
        for (var key in schema) {
          var sch = schema[key];
          if (Array.isArray(sch)) {
            if (key in traverse.arrayKeywords) {
              for (var i = 0; i < sch.length; i++)
                _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
            }
          } else if (key in traverse.propsKeywords) {
            if (sch && typeof sch == "object") {
              for (var prop in sch)
                _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
            }
          } else if (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) {
            _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
          }
        }
        post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      }
    }
    function escapeJsonPtr(str) {
      return str.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  }
});

// node_modules/ajv/dist/compile/resolve.js
var require_resolve = __commonJS({
  "node_modules/ajv/dist/compile/resolve.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
    var util_1 = require_util();
    var equal = require_fast_deep_equal();
    var traverse = require_json_schema_traverse();
    var SIMPLE_INLINED = /* @__PURE__ */ new Set([
      "type",
      "format",
      "pattern",
      "maxLength",
      "minLength",
      "maxProperties",
      "minProperties",
      "maxItems",
      "minItems",
      "maximum",
      "minimum",
      "uniqueItems",
      "multipleOf",
      "required",
      "enum",
      "const"
    ]);
    function inlineRef(schema, limit = true) {
      if (typeof schema == "boolean")
        return true;
      if (limit === true)
        return !hasRef(schema);
      if (!limit)
        return false;
      return countKeys(schema) <= limit;
    }
    exports.inlineRef = inlineRef;
    var REF_KEYWORDS = /* @__PURE__ */ new Set([
      "$ref",
      "$recursiveRef",
      "$recursiveAnchor",
      "$dynamicRef",
      "$dynamicAnchor"
    ]);
    function hasRef(schema) {
      for (const key in schema) {
        if (REF_KEYWORDS.has(key))
          return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
          return true;
        if (typeof sch == "object" && hasRef(sch))
          return true;
      }
      return false;
    }
    function countKeys(schema) {
      let count = 0;
      for (const key in schema) {
        if (key === "$ref")
          return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
          continue;
        if (typeof schema[key] == "object") {
          (0, util_1.eachItem)(schema[key], (sch) => count += countKeys(sch));
        }
        if (count === Infinity)
          return Infinity;
      }
      return count;
    }
    function getFullPath(resolver, id = "", normalize) {
      if (normalize !== false)
        id = normalizeId(id);
      const p = resolver.parse(id);
      return _getFullPath(resolver, p);
    }
    exports.getFullPath = getFullPath;
    function _getFullPath(resolver, p) {
      const serialized = resolver.serialize(p);
      return serialized.split("#")[0] + "#";
    }
    exports._getFullPath = _getFullPath;
    var TRAILING_SLASH_HASH = /#\/?$/;
    function normalizeId(id) {
      return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
    }
    exports.normalizeId = normalizeId;
    function resolveUrl(resolver, baseId, id) {
      id = normalizeId(id);
      return resolver.resolve(baseId, id);
    }
    exports.resolveUrl = resolveUrl;
    var ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
    function getSchemaRefs(schema, baseId) {
      if (typeof schema == "boolean")
        return {};
      const { schemaId, uriResolver } = this.opts;
      const schId = normalizeId(schema[schemaId] || baseId);
      const baseIds = { "": schId };
      const pathPrefix = getFullPath(uriResolver, schId, false);
      const localRefs = {};
      const schemaRefs = /* @__PURE__ */ new Set();
      traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === void 0)
          return;
        const fullPath = pathPrefix + jsonPtr;
        let innerBaseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
          innerBaseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = innerBaseId;
        function addRef(ref) {
          const _resolve = this.opts.uriResolver.resolve;
          ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
          if (schemaRefs.has(ref))
            throw ambiguos(ref);
          schemaRefs.add(ref);
          let schOrRef = this.refs[ref];
          if (typeof schOrRef == "string")
            schOrRef = this.refs[schOrRef];
          if (typeof schOrRef == "object") {
            checkAmbiguosRef(sch, schOrRef.schema, ref);
          } else if (ref !== normalizeId(fullPath)) {
            if (ref[0] === "#") {
              checkAmbiguosRef(sch, localRefs[ref], ref);
              localRefs[ref] = sch;
            } else {
              this.refs[ref] = fullPath;
            }
          }
          return ref;
        }
        function addAnchor(anchor) {
          if (typeof anchor == "string") {
            if (!ANCHOR.test(anchor))
              throw new Error(`invalid anchor "${anchor}"`);
            addRef.call(this, `#${anchor}`);
          }
        }
      });
      return localRefs;
      function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== void 0 && !equal(sch1, sch2))
          throw ambiguos(ref);
      }
      function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
      }
    }
    exports.getSchemaRefs = getSchemaRefs;
  }
});

// node_modules/ajv/dist/compile/validate/index.js
var require_validate = __commonJS({
  "node_modules/ajv/dist/compile/validate/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
    var boolSchema_1 = require_boolSchema();
    var dataType_1 = require_dataType();
    var applicability_1 = require_applicability();
    var dataType_2 = require_dataType();
    var defaults_1 = require_defaults();
    var keyword_1 = require_keyword();
    var subschema_1 = require_subschema();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var errors_1 = require_errors();
    function validateFunctionCode(it) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          topSchemaObjCode(it);
          return;
        }
      }
      validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
    }
    exports.validateFunctionCode = validateFunctionCode;
    function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
      if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
          gen.code((0, codegen_1._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
          destructureValCxtES5(gen, opts);
          gen.code(body);
        });
      } else {
        gen.func(validateName, (0, codegen_1._)`${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
      }
    }
    function destructureValCxt(opts) {
      return (0, codegen_1._)`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._)`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
    }
    function destructureValCxtES5(gen, opts) {
      gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
      }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._)`""`);
        gen.var(names_1.default.parentData, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._)`undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
          gen.var(names_1.default.dynamicAnchors, (0, codegen_1._)`{}`);
      });
    }
    function topSchemaObjCode(it) {
      const { schema, opts, gen } = it;
      validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
          commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
          resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
      });
      return;
    }
    function resetEvaluated(it) {
      const { gen, validateName } = it;
      it.evaluated = gen.const("evaluated", (0, codegen_1._)`${validateName}.evaluated`);
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._)`${it.evaluated}.props`, (0, codegen_1._)`undefined`));
      gen.if((0, codegen_1._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._)`${it.evaluated}.items`, (0, codegen_1._)`undefined`));
    }
    function funcSourceUrl(schema, opts) {
      const schId = typeof schema == "object" && schema[opts.schemaId];
      return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._)`/*# sourceURL=${schId} */` : codegen_1.nil;
    }
    function subschemaCode(it, valid) {
      if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
          subSchemaObjCode(it, valid);
          return;
        }
      }
      (0, boolSchema_1.boolOrEmptySchema)(it, valid);
    }
    function schemaCxtHasRules({ schema, self }) {
      if (typeof schema == "boolean")
        return !schema;
      for (const key in schema)
        if (self.RULES.all[key])
          return true;
      return false;
    }
    function isSchemaObj(it) {
      return typeof it.schema != "boolean";
    }
    function subSchemaObjCode(it, valid) {
      const { schema, gen, opts } = it;
      if (opts.$comment && schema.$comment)
        commentKeyword(it);
      updateContext(it);
      checkAsyncSchema(it);
      const errsCount = gen.const("_errs", names_1.default.errors);
      typeAndKeywords(it, errsCount);
      gen.var(valid, (0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
    }
    function checkKeywords(it) {
      (0, util_1.checkUnknownRules)(it);
      checkRefsAndKeywords(it);
    }
    function typeAndKeywords(it, errsCount) {
      if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
      const types = (0, dataType_1.getSchemaTypes)(it.schema);
      const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
      schemaKeywords(it, types, !checkedTypes, errsCount);
    }
    function checkRefsAndKeywords(it) {
      const { schema, errSchemaPath, opts, self } = it;
      if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
      }
    }
    function checkNoDefault(it) {
      const { schema, opts } = it;
      if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
      }
    }
    function updateContext(it) {
      const schId = it.schema[it.opts.schemaId];
      if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
    }
    function checkAsyncSchema(it) {
      if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
    }
    function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
      const msg = schema.$comment;
      if (opts.$comment === true) {
        gen.code((0, codegen_1._)`${names_1.default.self}.logger.log(${msg})`);
      } else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str)`${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._)`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
      }
    }
    function returnResults(it) {
      const { gen, schemaEnv, validateName, ValidationError, opts } = it;
      if (schemaEnv.$async) {
        gen.if((0, codegen_1._)`${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._)`new ${ValidationError}(${names_1.default.vErrors})`));
      } else {
        gen.assign((0, codegen_1._)`${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
          assignEvaluated(it);
        gen.return((0, codegen_1._)`${names_1.default.errors} === 0`);
      }
    }
    function assignEvaluated({ gen, evaluated, props, items }) {
      if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.props`, props);
      if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._)`${evaluated}.items`, items);
    }
    function schemaKeywords(it, types, typeErrors, errsCount) {
      const { gen, schema, data, allErrors, opts, self } = it;
      const { RULES } = self;
      if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
        return;
      }
      if (!opts.jtd)
        checkStrictTypes(it, types);
      gen.block(() => {
        for (const group of RULES.rules)
          groupKeywords(group);
        groupKeywords(RULES.post);
      });
      function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
          return;
        if (group.type) {
          gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
          iterateKeywords(it, group);
          if (types.length === 1 && types[0] === group.type && typeErrors) {
            gen.else();
            (0, dataType_2.reportTypeError)(it);
          }
          gen.endIf();
        } else {
          iterateKeywords(it, group);
        }
        if (!allErrors)
          gen.if((0, codegen_1._)`${names_1.default.errors} === ${errsCount || 0}`);
      }
    }
    function iterateKeywords(it, group) {
      const { gen, schema, opts: { useDefaults } } = it;
      if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
      gen.block(() => {
        for (const rule of group.rules) {
          if ((0, applicability_1.shouldUseRule)(schema, rule)) {
            keywordCode(it, rule.keyword, rule.definition, group.type);
          }
        }
      });
    }
    function checkStrictTypes(it, types) {
      if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
      checkContextTypes(it, types);
      if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
      checkKeywordTypes(it, it.dataTypes);
    }
    function checkContextTypes(it, types) {
      if (!types.length)
        return;
      if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
      }
      types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
          strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
      });
      narrowSchemaTypes(it, types);
    }
    function checkMultipleTypes(it, ts) {
      if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
      }
    }
    function checkKeywordTypes(it, ts) {
      const rules = it.self.RULES.all;
      for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
          const { type } = rule.definition;
          if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
            strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
          }
        }
      }
    }
    function hasApplicableType(schTs, kwdT) {
      return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
    }
    function includesType(ts, t) {
      return ts.includes(t) || t === "integer" && ts.includes("number");
    }
    function narrowSchemaTypes(it, withTypes) {
      const ts = [];
      for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
          ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
          ts.push("integer");
      }
      it.dataTypes = ts;
    }
    function strictTypesError(it, msg) {
      const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
      msg += ` at "${schemaPath}" (strictTypes)`;
      (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
    }
    var KeywordCxt = class {
      constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
          this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        } else {
          this.schemaCode = this.schemaValue;
          if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
            throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
          }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
          this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
      }
      result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
      }
      failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
          failAction();
        else
          this.error();
        if (successAction) {
          this.gen.else();
          successAction();
          if (this.allErrors)
            this.gen.endIf();
        } else {
          if (this.allErrors)
            this.gen.endIf();
          else
            this.gen.else();
        }
      }
      pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), void 0, failAction);
      }
      fail(condition) {
        if (condition === void 0) {
          this.error();
          if (!this.allErrors)
            this.gen.if(false);
          return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
      fail$data(condition) {
        if (!this.$data)
          return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._)`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
      }
      error(append, errorParams, errorPaths) {
        if (errorParams) {
          this.setParams(errorParams);
          this._error(append, errorPaths);
          this.setParams({});
          return;
        }
        this._error(append, errorPaths);
      }
      _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
      }
      $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0)
          throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(cond) {
        if (!this.allErrors)
          this.gen.if(cond);
      }
      setParams(obj, assign) {
        if (assign)
          Object.assign(this.params, obj);
        else
          this.params = obj;
      }
      block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
          this.check$data(valid, $dataValid);
          codeBlock();
        });
      }
      check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
          return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._)`${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
          gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
          gen.elseIf(this.invalid$data());
          this.$dataError();
          if (valid !== codegen_1.nil)
            gen.assign(valid, false);
        }
        gen.else();
      }
      invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
          if (schemaType.length) {
            if (!(schemaCode instanceof codegen_1.Name))
              throw new Error("ajv implementation error");
            const st = Array.isArray(schemaType) ? schemaType : [schemaType];
            return (0, codegen_1._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
          }
          return codegen_1.nil;
        }
        function invalid$DataSchema() {
          if (def.validateSchema) {
            const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema });
            return (0, codegen_1._)`!${validateSchemaRef}(${schemaCode})`;
          }
          return codegen_1.nil;
        }
      }
      subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: void 0, props: void 0 };
        subschemaCode(nextContext, valid);
        return nextContext;
      }
      mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
          return;
        if (it.props !== true && schemaCxt.props !== void 0) {
          it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== void 0) {
          it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
      }
      mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
          gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
          return true;
        }
      }
    };
    exports.KeywordCxt = KeywordCxt;
    function keywordCode(it, keyword, def, ruleType) {
      const cxt = new KeywordCxt(it, def, keyword);
      if ("code" in def) {
        def.code(cxt, ruleType);
      } else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      } else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
      } else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
      }
    }
    var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
    var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function getData($data, { dataLevel, dataNames, dataPathArr }) {
      let jsonPointer;
      let data;
      if ($data === "")
        return names_1.default.rootData;
      if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
      } else {
        const matches2 = RELATIVE_JSON_POINTER.exec($data);
        if (!matches2)
          throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches2[1];
        jsonPointer = matches2[2];
        if (jsonPointer === "#") {
          if (up >= dataLevel)
            throw new Error(errorMsg("property/index", up));
          return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
          throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
          return data;
      }
      let expr = data;
      const segments = jsonPointer.split("/");
      for (const segment of segments) {
        if (segment) {
          data = (0, codegen_1._)`${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
          expr = (0, codegen_1._)`${expr} && ${data}`;
        }
      }
      return expr;
      function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
      }
    }
    exports.getData = getData;
  }
});

// node_modules/ajv/dist/runtime/validation_error.js
var require_validation_error = __commonJS({
  "node_modules/ajv/dist/runtime/validation_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ValidationError = class extends Error {
      constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
      }
    };
    exports.default = ValidationError;
  }
});

// node_modules/ajv/dist/compile/ref_error.js
var require_ref_error = __commonJS({
  "node_modules/ajv/dist/compile/ref_error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var resolve_1 = require_resolve();
    var MissingRefError = class extends Error {
      constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
      }
    };
    exports.default = MissingRefError;
  }
});

// node_modules/ajv/dist/compile/index.js
var require_compile = __commonJS({
  "node_modules/ajv/dist/compile/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
    var codegen_1 = require_codegen();
    var validation_error_1 = require_validation_error();
    var names_1 = require_names();
    var resolve_1 = require_resolve();
    var util_1 = require_util();
    var validate_1 = require_validate();
    var SchemaEnv = class {
      constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
          schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
      }
    };
    exports.SchemaEnv = SchemaEnv;
    function compileSchema(sch) {
      const _sch = getCompilingSchema.call(this, sch);
      if (_sch)
        return _sch;
      const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
      const { es5, lines } = this.opts.code;
      const { ownProperties } = this.opts;
      const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
      let _ValidationError;
      if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
          ref: validation_error_1.default,
          code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`
        });
      }
      const validateName = gen.scopeName("validate");
      sch.validateName = validateName;
      const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        // TODO can its length be used as dataLevel if nil is removed?
        dataLevel: 0,
        dataTypes: [],
        definedProperties: /* @__PURE__ */ new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) } : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._)`""`,
        opts: this.opts,
        self: this
      };
      let sourceCode;
      try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        if (this.opts.code.process)
          sourceCode = this.opts.code.process(sourceCode, sch);
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate2 = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate2 });
        validate2.errors = null;
        validate2.schema = sch.schema;
        validate2.schemaEnv = sch;
        if (sch.$async)
          validate2.$async = true;
        if (this.opts.code.source === true) {
          validate2.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
          const { props, items } = schemaCxt;
          validate2.evaluated = {
            props: props instanceof codegen_1.Name ? void 0 : props,
            items: items instanceof codegen_1.Name ? void 0 : items,
            dynamicProps: props instanceof codegen_1.Name,
            dynamicItems: items instanceof codegen_1.Name
          };
          if (validate2.source)
            validate2.source.evaluated = (0, codegen_1.stringify)(validate2.evaluated);
        }
        sch.validate = validate2;
        return sch;
      } catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
          this.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
      } finally {
        this._compilations.delete(sch);
      }
    }
    exports.compileSchema = compileSchema;
    function resolveRef(root, baseId, ref) {
      var _a;
      ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
      const schOrFunc = root.refs[ref];
      if (schOrFunc)
        return schOrFunc;
      let _sch = resolve2.call(this, root, ref);
      if (_sch === void 0) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref];
        const { schemaId } = this.opts;
        if (schema)
          _sch = new SchemaEnv({ schema, schemaId, root, baseId });
      }
      if (_sch === void 0)
        return;
      return root.refs[ref] = inlineOrCompile.call(this, _sch);
    }
    exports.resolveRef = resolveRef;
    function inlineOrCompile(sch) {
      if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
      return sch.validate ? sch : compileSchema.call(this, sch);
    }
    function getCompilingSchema(schEnv) {
      for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
          return sch;
      }
    }
    exports.getCompilingSchema = getCompilingSchema;
    function sameSchemaEnv(s1, s2) {
      return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
    }
    function resolve2(root, ref) {
      let sch;
      while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
      return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
    }
    function resolveSchema(root, ref) {
      const p = this.opts.uriResolver.parse(ref);
      const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
      let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
      if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
      }
      const id = (0, resolve_1.normalizeId)(refPath);
      const schOrRef = this.refs[id] || this.schemas[id];
      if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
          return;
        return getJsonPointer.call(this, p, sch);
      }
      if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
      if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
      if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
      }
      return getJsonPointer.call(this, p, schOrRef);
    }
    exports.resolveSchema = resolveSchema;
    var PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
      "properties",
      "patternProperties",
      "enum",
      "dependencies",
      "definitions"
    ]);
    function getJsonPointer(parsedRef, { baseId, schema, root }) {
      var _a;
      if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
      for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
          return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === void 0)
          return;
        schema = partSchema;
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
          baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
      }
      let env;
      if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
      }
      const { schemaId } = this.opts;
      env = env || new SchemaEnv({ schema, schemaId, root, baseId });
      if (env.schema !== env.root.schema)
        return env;
      return void 0;
    }
  }
});

// node_modules/ajv/dist/refs/data.json
var require_data = __commonJS({
  "node_modules/ajv/dist/refs/data.json"(exports, module) {
    module.exports = {
      $id: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
      description: "Meta-schema for $data reference (JSON AnySchema extension proposal)",
      type: "object",
      required: ["$data"],
      properties: {
        $data: {
          type: "string",
          anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }]
        }
      },
      additionalProperties: false
    };
  }
});

// node_modules/fast-uri/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fast-uri/lib/utils.js"(exports, module) {
    "use strict";
    var isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
    var isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
    var isPort = RegExp.prototype.test.bind(/^\d*$/u);
    var isHexPair = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
    var isUnreserved = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
    var isPathCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u);
    var isQueryFragmentCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u);
    var isUserinfoCharacter = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u);
    var BYTE_HEX = new Array(256);
    {
      const HEX_DIGITS = "0123456789ABCDEF";
      for (let i = 0; i < 256; i++) {
        BYTE_HEX[i] = "%" + HEX_DIGITS[i >> 4] + HEX_DIGITS[i & 15];
      }
    }
    function percentEncodeNonAscii(cp) {
      if (cp < 2048) {
        return BYTE_HEX[192 | cp >> 6] + BYTE_HEX[128 | cp & 63];
      }
      if (cp < 65536) {
        return BYTE_HEX[224 | cp >> 12] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
      }
      return BYTE_HEX[240 | cp >> 18] + BYTE_HEX[128 | cp >> 12 & 63] + BYTE_HEX[128 | cp >> 6 & 63] + BYTE_HEX[128 | cp & 63];
    }
    function stringArrayToHexStripped(input) {
      let acc = "";
      let code = 0;
      let i = 0;
      for (i = 0; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (code === 48) {
          continue;
        }
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
        break;
      }
      for (i += 1; i < input.length; i++) {
        code = input[i].charCodeAt(0);
        if (!(code >= 48 && code <= 57 || code >= 65 && code <= 70 || code >= 97 && code <= 102)) {
          return "";
        }
        acc += input[i];
      }
      return acc;
    }
    var isHextet = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/);
    var isIPvFuture = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/);
    var isZoneCharacter = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/);
    var nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
    function isZoneIdentifier(zone) {
      if (zone.length === 0) return false;
      for (let i = 0; i < zone.length; i++) {
        if (isZoneCharacter(zone[i])) continue;
        if (zone[i] === "%" && i + 2 < zone.length && isHexPair(zone.slice(i + 1, i + 3))) {
          i += 2;
          continue;
        }
        return false;
      }
      return true;
    }
    function compressIPv6ZeroRun(hextets) {
      let bestStart = -1;
      let bestLength = 0;
      let runStart = -1;
      let runLength = 0;
      for (let i = 0; i < hextets.length; i++) {
        if (hextets[i] === "0") {
          if (runStart === -1) runStart = i;
          runLength++;
          if (runLength > bestLength) {
            bestLength = runLength;
            bestStart = runStart;
          }
        } else {
          runStart = -1;
          runLength = 0;
        }
      }
      if (bestLength < 2) return hextets.join(":");
      const head = hextets.slice(0, bestStart).join(":");
      const tail = hextets.slice(bestStart + bestLength).join(":");
      return head + "::" + tail;
    }
    function normalizeIPv6Address(input) {
      const compression = input.indexOf("::");
      if (compression !== -1 && input.indexOf("::", compression + 1) !== -1) return void 0;
      const left = compression === -1 ? input.split(":") : input.slice(0, compression).split(":");
      const right = compression === -1 ? [] : input.slice(compression + 2).split(":");
      if (compression !== -1) {
        if (left.length === 1 && left[0] === "") left.length = 0;
        if (right.length === 1 && right[0] === "") right.length = 0;
      }
      const parts = left.concat(right);
      let hextetCount = 0;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === "") return void 0;
        if (part.indexOf(".") !== -1) {
          if (i !== parts.length - 1 || compression !== -1 && right.length === 0 || !isIPv4(part)) return void 0;
          hextetCount += 2;
          continue;
        }
        if (!isHextet(part)) return void 0;
        parts[i] = parseInt(part, 16).toString(16);
        hextetCount++;
      }
      if (compression === -1) {
        if (hextetCount !== 8) return void 0;
        return compressIPv6ZeroRun(parts);
      }
      if (hextetCount >= 8) return void 0;
      const expanded = parts.slice(0, left.length);
      for (let i = hextetCount; i < 8; i++) expanded.push("0");
      for (let i = left.length; i < parts.length; i++) expanded.push(parts[i]);
      return compressIPv6ZeroRun(expanded);
    }
    function normalizeIPv6(host) {
      const bracketed = host[0] === "[" && host[host.length - 1] === "]";
      const hasBracket = host[0] === "[" || host[host.length - 1] === "]";
      if (hasBracket && !bracketed) return { host, isIPV6: false, error: true };
      let input = bracketed ? host.slice(1, -1) : host;
      if (bracketed && isIPvFuture(input)) {
        input = input.toLowerCase();
        return { host: `[${input}]`, escapedHost: input, isIPV6: false, isIPVFuture: true };
      }
      if (findToken(input, ":") < 2) {
        return { host, isIPV6: false, error: bracketed };
      }
      let zoneIdentifier = "";
      const zoneSeparator = input.indexOf("%");
      if (zoneSeparator !== -1) {
        const separatorLength = input.slice(zoneSeparator, zoneSeparator + 3).toLowerCase() === "%25" ? 3 : 1;
        zoneIdentifier = input.slice(zoneSeparator + separatorLength);
        if (!isZoneIdentifier(zoneIdentifier)) return { host, isIPV6: false, error: true };
        input = input.slice(0, zoneSeparator);
      }
      const address = normalizeIPv6Address(input);
      if (address === void 0) return { host, isIPV6: false, error: true };
      return {
        host: address + (zoneIdentifier ? "%" + zoneIdentifier : ""),
        escapedHost: address + (zoneIdentifier ? "%25" + zoneIdentifier : ""),
        isIPV6: true
      };
    }
    function findToken(str, token) {
      let ind = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === token) ind++;
      }
      return ind;
    }
    function removeDotSegments(path) {
      let input = path;
      const output = [];
      let nextSlash = -1;
      let len = 0;
      while (len = input.length) {
        if (len === 1) {
          if (input === ".") {
            break;
          } else if (input === "/") {
            output.push("/");
            break;
          } else {
            output.push(input);
            break;
          }
        } else if (len === 2) {
          if (input[0] === ".") {
            if (input[1] === ".") {
              break;
            } else if (input[1] === "/") {
              input = input.slice(2);
              continue;
            }
          } else if (input[0] === "/") {
            if (input[1] === "." || input[1] === "/") {
              output.push("/");
              break;
            }
          }
        } else if (len === 3) {
          if (input === "/..") {
            if (output.length !== 0) {
              output.pop();
            }
            output.push("/");
            break;
          }
        }
        if (input[0] === ".") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(3);
              continue;
            }
          } else if (input[1] === "/") {
            input = input.slice(2);
            continue;
          }
        } else if (input[0] === "/") {
          if (input[1] === ".") {
            if (input[2] === "/") {
              input = input.slice(2);
              continue;
            } else if (input[2] === ".") {
              if (input[3] === "/") {
                input = input.slice(3);
                if (output.length !== 0) {
                  output.pop();
                }
                continue;
              }
            }
          }
        }
        if ((nextSlash = input.indexOf("/", 1)) === -1) {
          output.push(input);
          break;
        } else {
          output.push(input.slice(0, nextSlash));
          input = input.slice(nextSlash);
        }
      }
      return output.join("");
    }
    var HOST_DELIMS = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" };
    var HOST_DELIM_RE = /[@/?#:]/g;
    var HOST_DELIM_NO_COLON_RE = /[@/?#]/g;
    function reescapeHostDelimiters(host, isIP) {
      const re = isIP ? HOST_DELIM_NO_COLON_RE : HOST_DELIM_RE;
      re.lastIndex = 0;
      return host.replace(re, (ch) => HOST_DELIMS[ch]);
    }
    function normalizePercentEncoding(input, decodeUnreserved = false) {
      if (input.indexOf("%") === -1) {
        return input;
      }
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decodeUnreserved && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        output += input[i];
      }
      return output;
    }
    function normalizePathEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (decoded !== "." && isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isPathCharacter(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += isEscapeSafe(code) ? ch : BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function serializePathEncoding(input, pathNoScheme = false) {
      let output = "";
      let firstSegment2 = pathNoScheme && input[0] !== "/";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (ch === "/") {
          firstSegment2 = false;
        }
        if (isPathCharacter(ch) && (ch !== ":" || !firstSegment2)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeComponent(input, isAllowed) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        if (isAllowed(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function encodeUserinfo(input) {
      return encodeComponent(input, isUserinfoCharacter);
    }
    function encodeQuery(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function encodeFragment(input) {
      return encodeComponent(input, isQueryFragmentCharacter);
    }
    function isEscapeSafe(cp) {
      return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 42 || cp === 43 || cp === 45 || cp === 46 || cp === 47 || cp === 64 || cp === 95;
    }
    function normalizeQueryFragmentEncoding(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            const normalizedHex = hex.toUpperCase();
            const decoded = String.fromCharCode(parseInt(normalizedHex, 16));
            if (isUnreserved(decoded)) {
              output += decoded;
            } else {
              output += "%" + normalizedHex;
            }
            i += 2;
            continue;
          }
        }
        if (isQueryFragmentCharacter(ch)) {
          output += ch;
        } else {
          const code = input.charCodeAt(i);
          if (code < 128) {
            output += isEscapeSafe(code) ? ch : BYTE_HEX[code];
          } else if (code < 55296 || code > 57343) {
            output += percentEncodeNonAscii(code);
          } else if (code <= 56319 && i + 1 < input.length) {
            const low = input.charCodeAt(i + 1);
            if (low >= 56320 && low <= 57343) {
              output += percentEncodeNonAscii(65536 + (code - 55296 << 10) + (low - 56320));
              i++;
            } else {
              output += percentEncodeNonAscii(65533);
            }
          } else {
            output += percentEncodeNonAscii(65533);
          }
        }
      }
      return output;
    }
    function escapePreservingEscapes(input) {
      let output = "";
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "%" && i + 2 < input.length) {
          const hex = input.slice(i + 1, i + 3);
          if (isHexPair(hex)) {
            output += "%" + hex.toUpperCase();
            i += 2;
            continue;
          }
        }
        output += escape(input[i]);
      }
      return output;
    }
    function recomposeAuthority(component) {
      const uriTokens = [];
      if (component.userinfo !== void 0) {
        uriTokens.push(encodeUserinfo(component.userinfo));
        uriTokens.push("@");
      }
      if (component.host !== void 0) {
        let host = component.host;
        if (!isIPv4(host)) {
          let ipV6res = normalizeIPv6(host);
          if (ipV6res.isIPV6 !== true && ipV6res.isIPVFuture !== true) {
            host = normalizePercentEncoding(host, true);
            ipV6res = normalizeIPv6(host);
          }
          if (ipV6res.isIPV6 === true || ipV6res.isIPVFuture === true) {
            host = `[${ipV6res.escapedHost}]`;
          } else {
            host = reescapeHostDelimiters(host, false);
          }
        }
        uriTokens.push(host);
      }
      if (typeof component.port === "number" || typeof component.port === "string") {
        const port = String(component.port);
        if (!isPort(port)) {
          throw new TypeError("URI port is malformed.");
        }
        uriTokens.push(":");
        uriTokens.push(port);
      }
      return uriTokens.length ? uriTokens.join("") : void 0;
    }
    module.exports = {
      nonSimpleDomain,
      recomposeAuthority,
      reescapeHostDelimiters,
      normalizePercentEncoding,
      normalizePathEncoding,
      serializePathEncoding,
      normalizeQueryFragmentEncoding,
      encodeUserinfo,
      encodeQuery,
      encodeFragment,
      escapePreservingEscapes,
      removeDotSegments,
      isIPv4,
      isUUID,
      normalizeIPv6,
      stringArrayToHexStripped
    };
  }
});

// node_modules/fast-uri/lib/schemes.js
var require_schemes = __commonJS({
  "node_modules/fast-uri/lib/schemes.js"(exports, module) {
    "use strict";
    var { isUUID } = require_utils();
    var URN_REG = /^([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-./:;=@]|%[\da-f]{2})+)$/iu;
    var supportedSchemeNames = (
      /** @type {const} */
      [
        "http",
        "https",
        "ws",
        "wss",
        "urn",
        "urn:uuid"
      ]
    );
    function isValidSchemeName(name) {
      return supportedSchemeNames.indexOf(
        /** @type {*} */
        name
      ) !== -1;
    }
    function wsIsSecure(wsComponent) {
      if (wsComponent.secure === true) {
        return true;
      } else if (wsComponent.secure === false) {
        return false;
      } else if (wsComponent.scheme) {
        return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
      } else {
        return false;
      }
    }
    function httpParse(component) {
      if (!component.host) {
        component.error = component.error || "HTTP URIs must have a host.";
      }
      return component;
    }
    function httpSerialize(component) {
      const secure = String(component.scheme).toLowerCase() === "https";
      if (component.port === (secure ? 443 : 80) || component.port === "") {
        component.port = void 0;
      }
      if (!component.path) {
        component.path = "/";
      }
      return component;
    }
    function wsParse(wsComponent) {
      wsComponent.secure = wsIsSecure(wsComponent);
      wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
      wsComponent.path = void 0;
      wsComponent.query = void 0;
      return wsComponent;
    }
    function wsSerialize(wsComponent) {
      if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
        wsComponent.port = void 0;
      }
      if (typeof wsComponent.secure === "boolean") {
        wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
        wsComponent.secure = void 0;
      }
      if (wsComponent.resourceName) {
        const queryIndex = wsComponent.resourceName.indexOf("?");
        const path = queryIndex === -1 ? wsComponent.resourceName : wsComponent.resourceName.slice(0, queryIndex);
        wsComponent.path = path && path !== "/" ? path : void 0;
        wsComponent.query = queryIndex === -1 ? void 0 : wsComponent.resourceName.slice(queryIndex + 1);
        wsComponent.resourceName = void 0;
      }
      wsComponent.fragment = void 0;
      return wsComponent;
    }
    function urnParse(urnComponent, options) {
      if (!urnComponent.path) {
        urnComponent.error = "URN can not be parsed";
        return urnComponent;
      }
      const matches2 = urnComponent.path.match(URN_REG);
      if (matches2 && matches2[0] === urnComponent.path) {
        const scheme = options.scheme || urnComponent.scheme || "urn";
        urnComponent.nid = matches2[1].toLowerCase();
        urnComponent.nss = matches2[2];
        const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
        const schemeHandler = getSchemeHandler(urnScheme);
        urnComponent.path = void 0;
        if (schemeHandler) {
          urnComponent = schemeHandler.parse(urnComponent, options);
        }
      } else {
        urnComponent.error = urnComponent.error || "URN can not be parsed.";
      }
      return urnComponent;
    }
    function urnSerialize(urnComponent, options) {
      if (urnComponent.nid === void 0) {
        throw new Error("URN without nid cannot be serialized");
      }
      const scheme = options.scheme || urnComponent.scheme || "urn";
      const nid = urnComponent.nid.toLowerCase();
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = getSchemeHandler(urnScheme);
      if (schemeHandler) {
        urnComponent = schemeHandler.serialize(urnComponent, options);
      }
      const uriComponent = urnComponent;
      const nss = urnComponent.nss;
      uriComponent.path = `${nid || options.nid}:${nss}`;
      options.skipEscape = true;
      return uriComponent;
    }
    function urnuuidParse(urnComponent, options) {
      const uuidComponent = urnComponent;
      uuidComponent.uuid = uuidComponent.nss;
      uuidComponent.nss = void 0;
      if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
        uuidComponent.error = uuidComponent.error || "UUID is not valid.";
      }
      return uuidComponent;
    }
    function urnuuidSerialize(uuidComponent) {
      const urnComponent = uuidComponent;
      urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
      return urnComponent;
    }
    var http = (
      /** @type {SchemeHandler} */
      {
        scheme: "http",
        domainHost: true,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var https = (
      /** @type {SchemeHandler} */
      {
        scheme: "https",
        domainHost: http.domainHost,
        parse: httpParse,
        serialize: httpSerialize
      }
    );
    var ws = (
      /** @type {SchemeHandler} */
      {
        scheme: "ws",
        domainHost: true,
        parse: wsParse,
        serialize: wsSerialize
      }
    );
    var wss = (
      /** @type {SchemeHandler} */
      {
        scheme: "wss",
        domainHost: ws.domainHost,
        parse: ws.parse,
        serialize: ws.serialize
      }
    );
    var urn = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn",
        parse: urnParse,
        serialize: urnSerialize,
        skipNormalize: true
      }
    );
    var urnuuid = (
      /** @type {SchemeHandler} */
      {
        scheme: "urn:uuid",
        parse: urnuuidParse,
        serialize: urnuuidSerialize,
        skipNormalize: true
      }
    );
    var SCHEMES = (
      /** @type {Record<SchemeName, SchemeHandler>} */
      {
        http,
        https,
        ws,
        wss,
        urn,
        "urn:uuid": urnuuid
      }
    );
    Object.setPrototypeOf(SCHEMES, null);
    function getSchemeHandler(scheme) {
      return scheme && (SCHEMES[
        /** @type {SchemeName} */
        scheme
      ] || SCHEMES[
        /** @type {SchemeName} */
        scheme.toLowerCase()
      ]) || void 0;
    }
    module.exports = {
      wsIsSecure,
      SCHEMES,
      isValidSchemeName,
      getSchemeHandler
    };
  }
});

// node_modules/fast-uri/index.js
var require_fast_uri = __commonJS({
  "node_modules/fast-uri/index.js"(exports, module) {
    "use strict";
    var { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizePercentEncoding, normalizePathEncoding, serializePathEncoding, normalizeQueryFragmentEncoding, encodeQuery, encodeFragment, reescapeHostDelimiters, isIPv4, nonSimpleDomain } = require_utils();
    var { SCHEMES, getSchemeHandler } = require_schemes();
    var VALID_SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*$/u;
    var MALFORMED_SCHEME_ERROR = "URI scheme is malformed.";
    function decodeValidScheme(scheme) {
      const decodedScheme = unescape(String(scheme));
      if (!VALID_SCHEME.test(decodedScheme)) {
        throw new TypeError(MALFORMED_SCHEME_ERROR);
      }
      return decodedScheme;
    }
    function normalize(uri, options) {
      if (typeof uri === "string") {
        uri = /** @type {T} */
        normalizeString(uri, options);
      } else if (typeof uri === "object") {
        uri = /** @type {T} */
        parse(serialize(uri, options), options);
      }
      return uri;
    }
    function resolve2(baseURI, relativeURI, options) {
      const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
      const {
        parsed: baseParsed,
        malformedAuthorityOrPort: baseMalformed,
        malformedPercentEncoding: baseMalformedPercentEncoding,
        malformedSchemeSpecific: baseMalformedSchemeSpecific,
        malformedHost: baseMalformedHost,
        malformedScheme: baseMalformedScheme
      } = parseWithStatus(baseURI, schemelessOptions);
      const {
        parsed: relativeParsed,
        malformedAuthorityOrPort: relativeMalformed,
        malformedPercentEncoding: relativeMalformedPercentEncoding,
        malformedSchemeSpecific: relativeMalformedSchemeSpecific,
        malformedHost: relativeMalformedHost,
        malformedScheme: relativeMalformedScheme
      } = parseWithStatus(relativeURI, schemelessOptions);
      if (baseMalformed || relativeMalformed || baseMalformedPercentEncoding || relativeMalformedPercentEncoding || baseMalformedSchemeSpecific || relativeMalformedSchemeSpecific || baseMalformedHost || relativeMalformedHost || baseMalformedScheme || relativeMalformedScheme) {
        throw new Error(baseParsed.error || relativeParsed.error || "URI is malformed.");
      }
      const resolved = resolveComponent(baseParsed, relativeParsed, schemelessOptions, true);
      const resolvedSchemeHandler = getSchemeHandler(options && options.scheme || resolved.scheme);
      const resolvedHost = resolved.host;
      const resolvedHostIsIP = resolvedHost !== void 0 && resolvedHost !== "" && (isIPv4(resolvedHost) || normalizeIPv6(resolvedHost).isIPV6);
      canonicalizeHost(resolved, options || {}, resolvedSchemeHandler, resolvedHostIsIP);
      const encodedASCIIHost = resolvedHost && resolvedHost.indexOf("%") !== -1 && !new RegExp("\\P{ASCII}", "u").test(resolvedHost);
      if (resolved.error && !encodedASCIIHost) {
        throw new Error(resolved.error);
      }
      schemelessOptions.skipEscape = true;
      return serialize(resolved, schemelessOptions);
    }
    function resolveComponent(base, relative4, options, skipNormalization) {
      const target = {};
      if (!skipNormalization) {
        base = parse(serialize(base, options), options);
        relative4 = parse(serialize(relative4, options), options);
      }
      options = options || {};
      if (!options.tolerant && relative4.scheme) {
        target.scheme = relative4.scheme;
        target.userinfo = relative4.userinfo;
        target.host = relative4.host;
        target.port = relative4.port;
        target.path = removeDotSegments(relative4.path || "");
        target.query = relative4.query;
      } else {
        if (relative4.userinfo !== void 0 || relative4.host !== void 0 || relative4.port !== void 0) {
          target.userinfo = relative4.userinfo;
          target.host = relative4.host;
          target.port = relative4.port;
          target.path = removeDotSegments(relative4.path || "");
          target.query = relative4.query;
        } else {
          if (!relative4.path) {
            target.path = base.path;
            if (relative4.query !== void 0) {
              target.query = relative4.query;
            } else {
              target.query = base.query;
            }
          } else {
            if (relative4.path[0] === "/") {
              target.path = removeDotSegments(relative4.path);
            } else {
              if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
                target.path = "/" + relative4.path;
              } else if (!base.path) {
                target.path = relative4.path;
              } else {
                target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative4.path;
              }
              target.path = removeDotSegments(target.path);
            }
            target.query = relative4.query;
          }
          target.userinfo = base.userinfo;
          target.host = base.host;
          target.port = base.port;
        }
        target.scheme = base.scheme;
      }
      target.fragment = relative4.fragment;
      return target;
    }
    function equal(uriA, uriB, options) {
      const normalizedA = normalizeComparableURI(uriA, options);
      const normalizedB = normalizeComparableURI(uriB, options);
      return normalizedA !== void 0 && normalizedB !== void 0 && normalizedA === normalizedB;
    }
    function serialize(cmpts, opts) {
      const component = {
        host: cmpts.host,
        scheme: cmpts.scheme,
        userinfo: cmpts.userinfo,
        port: cmpts.port,
        path: cmpts.path,
        query: cmpts.query,
        nid: cmpts.nid,
        nss: cmpts.nss,
        uuid: cmpts.uuid,
        fragment: cmpts.fragment,
        reference: cmpts.reference,
        resourceName: cmpts.resourceName,
        secure: cmpts.secure,
        error: ""
      };
      const options = Object.assign({}, opts);
      const uriTokens = [];
      if (component.scheme) {
        component.scheme = decodeValidScheme(component.scheme);
      }
      const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
      if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
      const hasAuthority = component.userinfo !== void 0 || component.host !== void 0 || component.port !== void 0;
      const pathNoScheme = !options.skipEscape && component.scheme === void 0 && !hasAuthority;
      if (component.path !== void 0) {
        if (!options.skipEscape) {
          component.path = serializePathEncoding(component.path, pathNoScheme);
        } else {
          component.path = normalizePercentEncoding(component.path);
        }
      }
      if (options.reference !== "suffix" && component.scheme) {
        component.scheme = decodeValidScheme(component.scheme);
        uriTokens.push(component.scheme, ":");
      }
      const authority = recomposeAuthority(component);
      if (authority !== void 0) {
        if (options.reference !== "suffix") {
          uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (component.path && component.path[0] !== "/") {
          uriTokens.push("/");
        }
      }
      if (component.path !== void 0) {
        let s = component.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
          s = removeDotSegments(s);
        }
        if (pathNoScheme) {
          s = serializePathEncoding(s, true);
        }
        if (authority === void 0 && s[0] === "/" && s[1] === "/") {
          s = "/%2F" + s.slice(2);
        }
        uriTokens.push(s);
      }
      if (component.query !== void 0) {
        uriTokens.push("?", encodeQuery(component.query));
      }
      if (component.fragment !== void 0) {
        uriTokens.push("#", encodeFragment(component.fragment));
      }
      return uriTokens.join("");
    }
    var URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
    var AUTHORITY_PREFIX = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
    var AUTHORITY_INTRODUCER_REGION = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
    function getParseError(parsed, matches2) {
      if (matches2[2] !== void 0 && parsed.path && parsed.path[0] !== "/") {
        return 'URI path must start with "/" when authority is present.';
      }
      if (typeof parsed.port === "number" && (parsed.port < 0 || parsed.port > 65535)) {
        return "URI port is malformed.";
      }
      return void 0;
    }
    function hasMalformedPercentEncoding(component) {
      if (component === void 0) return false;
      let percent = component.indexOf("%");
      while (percent !== -1) {
        if (percent + 2 >= component.length || !/^[\da-f]{2}$/iu.test(component.slice(percent + 1, percent + 3))) {
          return true;
        }
        percent = component.indexOf("%", percent + 3);
      }
      return false;
    }
    function isIPLiteral(host) {
      return host[0] === "[" && host[host.length - 1] === "]";
    }
    function hasMalformedComponentPercentEncoding(matches2) {
      const host = matches2[4];
      return hasMalformedPercentEncoding(matches2[3]) || host !== void 0 && !isIPLiteral(host) && hasMalformedPercentEncoding(host) || hasMalformedPercentEncoding(matches2[6]) || hasMalformedPercentEncoding(matches2[7]) || hasMalformedPercentEncoding(matches2[8]);
    }
    function canonicalizeHost(parsed, options, schemeHandler, isIP) {
      if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport) && parsed.host && !isIPLiteral(parsed.host) && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
        try {
          parsed.host = new URL("http://" + parsed.host).hostname;
        } catch (e) {
          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
          return true;
        }
      }
      return false;
    }
    function parseWithStatus(uri, opts) {
      const options = Object.assign({}, opts);
      const parsed = {
        scheme: void 0,
        userinfo: void 0,
        host: "",
        port: void 0,
        path: "",
        query: void 0,
        fragment: void 0
      };
      let malformedAuthorityOrPort = false;
      let malformedPercentEncoding = false;
      let malformedSchemeSpecific = false;
      let malformedHost = false;
      let malformedIPLiteral = false;
      let malformedScheme = false;
      let isIP = false;
      if (options.reference === "suffix") {
        if (options.scheme) {
          uri = options.scheme + ":" + uri;
        } else {
          uri = "//" + uri;
        }
      }
      const authorityMatch = uri.match(AUTHORITY_PREFIX);
      if (authorityMatch !== null && authorityMatch[1].indexOf("\\") !== -1) {
        parsed.error = "URI authority must not contain a literal backslash.";
        malformedAuthorityOrPort = true;
      }
      const introducerMatch = uri.match(AUTHORITY_INTRODUCER_REGION);
      if (introducerMatch !== null) {
        const region = introducerMatch[1];
        const normalizedRegion = region.replace(/[\t\n\r]/g, "");
        if (normalizedRegion.length >= 2) {
          if (normalizedRegion.slice(0, 2) !== "//") {
            parsed.error = parsed.error || "URI authority must not contain a literal backslash.";
            malformedAuthorityOrPort = true;
          } else if (region.length !== normalizedRegion.length) {
            parsed.error = parsed.error || "URI authority introducer must not contain whitespace.";
            malformedAuthorityOrPort = true;
          }
        }
      }
      const matches2 = uri.match(URI_PARSE);
      if (matches2) {
        parsed.scheme = matches2[1];
        parsed.userinfo = matches2[3];
        parsed.host = matches2[4];
        parsed.port = parseInt(matches2[5], 10);
        parsed.path = matches2[6] || "";
        parsed.query = matches2[7];
        parsed.fragment = matches2[8];
        if (parsed.scheme !== void 0) {
          const decodedScheme = unescape(parsed.scheme);
          if (VALID_SCHEME.test(decodedScheme)) {
            parsed.scheme = decodedScheme.toLowerCase();
          } else {
            parsed.error = parsed.error || MALFORMED_SCHEME_ERROR;
            malformedScheme = true;
          }
        }
        malformedPercentEncoding = hasMalformedComponentPercentEncoding(matches2);
        if (malformedPercentEncoding) {
          parsed.error = parsed.error || "URI contains malformed percent-encoding.";
        }
        if (isNaN(parsed.port)) {
          parsed.port = matches2[5];
        }
        const parseError = getParseError(parsed, matches2);
        if (parseError !== void 0) {
          parsed.error = parsed.error || parseError;
          malformedAuthorityOrPort = true;
        }
        if (parsed.host) {
          const ipv4result = isIPv4(parsed.host);
          if (ipv4result === false) {
            const bracketedIPLiteral = isIPLiteral(parsed.host);
            const hasIPLiteralBracket = parsed.host.indexOf("[") !== -1 || parsed.host.indexOf("]") !== -1;
            const ipv6result = normalizeIPv6(parsed.host);
            isIP = ipv6result.isIPV6 || ipv6result.isIPVFuture === true;
            malformedIPLiteral = hasIPLiteralBracket && (!bracketedIPLiteral || ipv6result.error === true);
            parsed.host = isIP ? ipv6result.host : ipv6result.host.toLowerCase();
            if (malformedIPLiteral) {
              parsed.error = parsed.error || "URI host is malformed.";
              malformedAuthorityOrPort = true;
            }
          } else {
            isIP = true;
          }
        }
        if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
          parsed.reference = "same-document";
        } else if (parsed.scheme === void 0) {
          parsed.reference = "relative";
        } else if (parsed.fragment === void 0) {
          parsed.reference = "absolute";
        } else {
          parsed.reference = "uri";
        }
        if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
          parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
        }
        const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
        if (!malformedIPLiteral) {
          malformedHost = canonicalizeHost(parsed, options, schemeHandler, isIP);
        }
        if (uri.indexOf("%") !== -1 && parsed.host !== void 0 && !malformedIPLiteral) {
          let host = isIP ? parsed.host : normalizePercentEncoding(parsed.host, true);
          if (!isIP) {
            host = normalizePercentEncoding(host.toLowerCase());
          }
          parsed.host = reescapeHostDelimiters(host, isIP);
        }
        if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
          if (parsed.path) {
            parsed.path = normalizePathEncoding(parsed.path);
          }
          if (parsed.query) {
            parsed.query = normalizeQueryFragmentEncoding(parsed.query);
          }
          if (parsed.fragment) {
            parsed.fragment = normalizeQueryFragmentEncoding(parsed.fragment);
          }
        }
        if (schemeHandler && schemeHandler.parse) {
          schemeHandler.parse(parsed, options);
          if (schemeHandler === SCHEMES.urn && parsed.nid === void 0) {
            malformedSchemeSpecific = true;
          }
        }
      } else {
        parsed.error = parsed.error || "URI can not be parsed.";
      }
      return { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme };
    }
    function parse(uri, opts) {
      return parseWithStatus(uri, opts).parsed;
    }
    function normalizeString(uri, opts) {
      return normalizeStringWithStatus(uri, opts).normalized;
    }
    function normalizeStringWithStatus(uri, opts) {
      const { parsed, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = parseWithStatus(uri, opts);
      return {
        normalized: malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? uri : serialize(parsed, opts),
        malformedAuthorityOrPort,
        malformedPercentEncoding,
        malformedSchemeSpecific,
        malformedHost,
        malformedScheme
      };
    }
    function normalizeComparableURI(uri, opts) {
      if (typeof uri !== "string" && typeof uri !== "object") {
        return void 0;
      }
      let value;
      try {
        value = typeof uri === "string" ? uri : serialize(uri, opts);
      } catch {
        return void 0;
      }
      const { normalized, malformedAuthorityOrPort, malformedPercentEncoding, malformedSchemeSpecific, malformedHost, malformedScheme } = normalizeStringWithStatus(value, opts);
      return malformedAuthorityOrPort || malformedPercentEncoding || malformedSchemeSpecific || malformedHost || malformedScheme ? void 0 : normalized;
    }
    var fastUri = {
      SCHEMES,
      normalize,
      resolve: resolve2,
      resolveComponent,
      equal,
      serialize,
      parse
    };
    module.exports = fastUri;
    module.exports.default = fastUri;
    module.exports.fastUri = fastUri;
  }
});

// node_modules/ajv/dist/runtime/uri.js
var require_uri = __commonJS({
  "node_modules/ajv/dist/runtime/uri.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var uri = require_fast_uri();
    uri.code = 'require("ajv/dist/runtime/uri").default';
    exports.default = uri;
  }
});

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = /* @__PURE__ */ Object.create(null);
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error(`schema ${schemaId} must be string`);
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey = schemaKeyRef;
            this._cache.delete(cacheKey);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas2, regex) {
        for (const keyRef in schemas2) {
          const sch = schemas2[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas2[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas2[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error(`schema with key or id "${id}" already exists`);
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv.ValidationError = validation_error_1.default;
    Ajv.MissingRefError = ref_error_1.default;
    exports.default = Ajv;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
          throw new Error(`Keyword ${kwd} has invalid name`);
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/vocabularies/core/id.js
var require_id = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/id.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var def = {
      keyword: "id",
      code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/ref.js
var require_ref = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/ref.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.callRef = exports.getValidate = void 0;
    var ref_error_1 = require_ref_error();
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var util_1 = require_util();
    var def = {
      keyword: "$ref",
      schemaType: "string",
      code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
          return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === void 0)
          throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
          return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
          if (env === root)
            return callRef(cxt, validateName, env, env.$async);
          const rootName = gen.scopeValue("root", { ref: root });
          return callRef(cxt, (0, codegen_1._)`${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
          const v = getValidate(cxt, sch);
          callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
          const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
          const valid = gen.name("valid");
          const schCxt = cxt.subschema({
            schema: sch,
            dataTypes: [],
            schemaPath: codegen_1.nil,
            topSchemaRef: schName,
            errSchemaPath: $ref
          }, valid);
          cxt.mergeEvaluated(schCxt);
          cxt.ok(valid);
        }
      }
    };
    function getValidate(cxt, sch) {
      const { gen } = cxt;
      return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
    }
    exports.getValidate = getValidate;
    function callRef(cxt, v, sch, $async) {
      const { gen, it } = cxt;
      const { allErrors, schemaEnv: env, opts } = it;
      const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
      if ($async)
        callAsyncRef();
      else
        callSyncRef();
      function callAsyncRef() {
        if (!env.$async)
          throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
          gen.code((0, codegen_1._)`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
          addEvaluatedFrom(v);
          if (!allErrors)
            gen.assign(valid, true);
        }, (e) => {
          gen.if((0, codegen_1._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
          addErrorsFrom(e);
          if (!allErrors)
            gen.assign(valid, false);
        });
        cxt.ok(valid);
      }
      function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
      }
      function addErrorsFrom(source) {
        const errs = (0, codegen_1._)`${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._)`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`);
        gen.assign(names_1.default.errors, (0, codegen_1._)`${names_1.default.vErrors}.length`);
      }
      function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
          return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        if (it.props !== true) {
          if (schEvaluated && !schEvaluated.dynamicProps) {
            if (schEvaluated.props !== void 0) {
              it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
            }
          } else {
            const props = gen.var("props", (0, codegen_1._)`${source}.evaluated.props`);
            it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
          }
        }
        if (it.items !== true) {
          if (schEvaluated && !schEvaluated.dynamicItems) {
            if (schEvaluated.items !== void 0) {
              it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
            }
          } else {
            const items = gen.var("items", (0, codegen_1._)`${source}.evaluated.items`);
            it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
          }
        }
      }
    }
    exports.callRef = callRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/core/index.js
var require_core2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/core/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var id_1 = require_id();
    var ref_1 = require_ref();
    var core = [
      "$schema",
      "$id",
      "$defs",
      "$vocabulary",
      { keyword: "$comment" },
      "definitions",
      id_1.default,
      ref_1.default
    ];
    exports.default = core;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitNumber.js
var require_limitNumber = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitNumber.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`must be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    var def = {
      keyword: Object.keys(KWDs),
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._)`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/multipleOf.js
var require_multipleOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/multipleOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must be multiple of ${schemaCode}`,
      params: ({ schemaCode }) => (0, codegen_1._)`{multipleOf: ${schemaCode}}`
    };
    var def = {
      keyword: "multipleOf",
      type: "number",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid2 = prec ? (0, codegen_1._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1._)`${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid2}))`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitLength.js
var require_limitLength = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitLength.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var ucs2length_1 = require_ucs2length();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} characters`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxLength", "minLength"],
      type: "string",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._)`${data}.length` : (0, codegen_1._)`${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._)`${len} ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/pattern.js
var require_pattern = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/pattern.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var util_1 = require_util();
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match pattern "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{pattern: ${schemaCode}}`
    };
    var def = {
      keyword: "pattern",
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const u = it.opts.unicodeRegExp ? "u" : "";
        if ($data) {
          const { regExp } = it.opts.code;
          const regExpCode = regExp.code === "new RegExp" ? (0, codegen_1._)`new RegExp` : (0, util_1.useFunc)(gen, regExp);
          const valid = gen.let("valid");
          gen.try(() => gen.assign(valid, (0, codegen_1._)`${regExpCode}(${schemaCode}, ${u}).test(${data})`), () => gen.assign(valid, false));
          cxt.fail$data((0, codegen_1._)`!${valid}`);
        } else {
          const regExp = (0, code_1.usePattern)(cxt, schema);
          cxt.fail$data((0, codegen_1._)`!${regExp}.test(${data})`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitProperties.js
var require_limitProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} properties`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxProperties", "minProperties"],
      type: "object",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`Object.keys(${data}).length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/required.js
var require_required = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/required.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { missingProperty } }) => (0, codegen_1.str)`must have required property '${missingProperty}'`,
      params: ({ params: { missingProperty } }) => (0, codegen_1._)`{missingProperty: ${missingProperty}}`
    };
    var def = {
      keyword: "required",
      type: "object",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
          return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
          allErrorsMode();
        else
          exitOnErrorMode();
        if (opts.strictRequired) {
          const props = cxt.parentSchema.properties;
          const { definedProperties } = cxt.it;
          for (const requiredKey of schema) {
            if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
              const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
              const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
              (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
            }
          }
        }
        function allErrorsMode() {
          if (useLoop || $data) {
            cxt.block$data(codegen_1.nil, loopAllRequired);
          } else {
            for (const prop of schema) {
              (0, code_1.checkReportMissingProp)(cxt, prop);
            }
          }
        }
        function exitOnErrorMode() {
          const missing = gen.let("missing");
          if (useLoop || $data) {
            const valid = gen.let("valid", true);
            cxt.block$data(valid, () => loopUntilMissing(missing, valid));
            cxt.ok(valid);
          } else {
            gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
          }
        }
        function loopAllRequired() {
          gen.forOf("prop", schemaCode, (prop) => {
            cxt.setParams({ missingProperty: prop });
            gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
          });
        }
        function loopUntilMissing(missing, valid) {
          cxt.setParams({ missingProperty: missing });
          gen.forOf(missing, schemaCode, () => {
            gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
            gen.if((0, codegen_1.not)(valid), () => {
              cxt.error();
              gen.break();
            });
          }, codegen_1.nil);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitItems.js
var require_limitItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str)`must NOT have ${comp} than ${schemaCode} items`;
      },
      params: ({ schemaCode }) => (0, codegen_1._)`{limit: ${schemaCode}}`
    };
    var def = {
      keyword: ["maxItems", "minItems"],
      type: "array",
      schemaType: "number",
      $data: true,
      error,
      code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._)`${data}.length ${op} ${schemaCode}`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// node_modules/ajv/dist/vocabularies/validation/uniqueItems.js
var require_uniqueItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/uniqueItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dataType_1 = require_dataType();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: ({ params: { i, j } }) => (0, codegen_1.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      params: ({ params: { i, j } }) => (0, codegen_1._)`{i: ${i}, j: ${j}}`
    };
    var def = {
      keyword: "uniqueItems",
      type: "array",
      schemaType: "boolean",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
          return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._)`${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
          const i = gen.let("i", (0, codegen_1._)`${data}.length`);
          const j = gen.let("j");
          cxt.setParams({ i, j });
          gen.assign(valid, true);
          gen.if((0, codegen_1._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
          return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
          const item = gen.name("item");
          const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
          const indices = gen.const("indices", (0, codegen_1._)`{}`);
          gen.for((0, codegen_1._)`;${i}--;`, () => {
            gen.let(item, (0, codegen_1._)`${data}[${i}]`);
            gen.if(wrongType, (0, codegen_1._)`continue`);
            if (itemTypes.length > 1)
              gen.if((0, codegen_1._)`typeof ${item} == "string"`, (0, codegen_1._)`${item} += "_"`);
            gen.if((0, codegen_1._)`typeof ${indices}[${item}] == "number"`, () => {
              gen.assign(j, (0, codegen_1._)`${indices}[${item}]`);
              cxt.error();
              gen.assign(valid, false).break();
            }).code((0, codegen_1._)`${indices}[${item}] = ${i}`);
          });
        }
        function loopN2(i, j) {
          const eql = (0, util_1.useFunc)(gen, equal_1.default);
          const outer = gen.name("outer");
          gen.label(outer).for((0, codegen_1._)`;${i}--;`, () => gen.for((0, codegen_1._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
            cxt.error();
            gen.assign(valid, false).break(outer);
          })));
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/const.js
var require_const = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/const.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to constant",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValue: ${schemaCode}}`
    };
    var def = {
      keyword: "const",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || schema && typeof schema == "object") {
          cxt.fail$data((0, codegen_1._)`!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        } else {
          cxt.fail((0, codegen_1._)`${schema} !== ${data}`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/enum.js
var require_enum = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/enum.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var equal_1 = require_equal();
    var error = {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode }) => (0, codegen_1._)`{allowedValues: ${schemaCode}}`
    };
    var def = {
      keyword: "enum",
      schemaType: "array",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
          throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
        let valid;
        if (useLoop || $data) {
          valid = gen.let("valid");
          cxt.block$data(valid, loopEnum);
        } else {
          if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
          const vSchema = gen.const("vSchema", schemaCode);
          valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
          gen.assign(valid, false);
          gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
          const sch = schema[i];
          return typeof sch === "object" && sch !== null ? (0, codegen_1._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1._)`${data} === ${sch}`;
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/index.js
var require_validation = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var limitNumber_1 = require_limitNumber();
    var multipleOf_1 = require_multipleOf();
    var limitLength_1 = require_limitLength();
    var pattern_1 = require_pattern();
    var limitProperties_1 = require_limitProperties();
    var required_1 = require_required();
    var limitItems_1 = require_limitItems();
    var uniqueItems_1 = require_uniqueItems();
    var const_1 = require_const();
    var enum_1 = require_enum();
    var validation = [
      // number
      limitNumber_1.default,
      multipleOf_1.default,
      // string
      limitLength_1.default,
      pattern_1.default,
      // object
      limitProperties_1.default,
      required_1.default,
      // array
      limitItems_1.default,
      uniqueItems_1.default,
      // any
      { keyword: "type", schemaType: ["string", "array"] },
      { keyword: "nullable", schemaType: "boolean" },
      const_1.default,
      enum_1.default
    ];
    exports.default = validation;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalItems.js
var require_additionalItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateAdditionalItems = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "additionalItems",
      type: "array",
      schemaType: ["boolean", "object"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
          (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
          return;
        }
        validateAdditionalItems(cxt, items);
      }
    };
    function validateAdditionalItems(cxt, items) {
      const { gen, schema, data, keyword, it } = cxt;
      it.items = true;
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._)`${len} <= ${items.length}`);
      } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items.length}`);
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
      }
      function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
          cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
          if (!it.allErrors)
            gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
      }
    }
    exports.validateAdditionalItems = validateAdditionalItems;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items.js
var require_items = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateTuple = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "array", "boolean"],
      before: "uniqueItems",
      code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
          return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    function validateTuple(cxt, extraItems, schArr = cxt.schema) {
      const { gen, parentSchema, data, keyword, it } = cxt;
      checkStrictTuple(parentSchema);
      if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
      }
      const valid = gen.name("valid");
      const len = gen.const("len", (0, codegen_1._)`${data}.length`);
      schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
          return;
        gen.if((0, codegen_1._)`${len} > ${i}`, () => cxt.subschema({
          keyword,
          schemaProp: i,
          dataProp: i
        }, valid));
        cxt.ok(valid);
      });
      function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
          const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
          (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
      }
    }
    exports.validateTuple = validateTuple;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/prefixItems.js
var require_prefixItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/prefixItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var items_1 = require_items();
    var def = {
      keyword: "prefixItems",
      type: "array",
      schemaType: ["array"],
      before: "uniqueItems",
      code: (cxt) => (0, items_1.validateTuple)(cxt, "items")
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/items2020.js
var require_items2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/items2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    var additionalItems_1 = require_additionalItems();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "items",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      error,
      code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        if (prefixItems)
          (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
          cxt.ok((0, code_1.validateArray)(cxt));
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/contains.js
var require_contains = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/contains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1.str)`must contain at least ${min} valid item(s)` : (0, codegen_1.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
      params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1._)`{minContains: ${min}}` : (0, codegen_1._)`{minContains: ${min}, maxContains: ${max}}`
    };
    var def = {
      keyword: "contains",
      type: "array",
      schemaType: ["object", "boolean"],
      before: "uniqueItems",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
          min = minContains === void 0 ? 1 : minContains;
          max = maxContains;
        } else {
          min = 1;
        }
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        cxt.setParams({ min, max });
        if (max === void 0 && min === 0) {
          (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
          return;
        }
        if (max !== void 0 && min > max) {
          (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
          cxt.fail();
          return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          let cond = (0, codegen_1._)`${len} >= ${min}`;
          if (max !== void 0)
            cond = (0, codegen_1._)`${cond} && ${len} <= ${max}`;
          cxt.pass(cond);
          return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === void 0 && min === 1) {
          validateItems(valid, () => gen.if(valid, () => gen.break()));
        } else if (min === 0) {
          gen.let(valid, true);
          if (max !== void 0)
            gen.if((0, codegen_1._)`${data}.length > 0`, validateItemsWithCount);
        } else {
          gen.let(valid, false);
          validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
          const schValid = gen.name("_valid");
          const count = gen.let("count", 0);
          validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
          gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
              keyword: "contains",
              dataProp: i,
              dataPropType: util_1.Type.Num,
              compositeRule: true
            }, _valid);
            block();
          });
        }
        function checkLimits(count) {
          gen.code((0, codegen_1._)`${count}++`);
          if (max === void 0) {
            gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true).break());
          } else {
            gen.if((0, codegen_1._)`${count} > ${max}`, () => gen.assign(valid, false).break());
            if (min === 1)
              gen.assign(valid, true);
            else
              gen.if((0, codegen_1._)`${count} >= ${min}`, () => gen.assign(valid, true));
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependencies.js
var require_dependencies = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependencies.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var code_1 = require_code2();
    exports.error = {
      message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str)`must have ${property_ies} ${deps} when property ${property} is present`;
      },
      params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
      // TODO change to reference
    };
    var def = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: exports.error,
      code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
      }
    };
    function splitDependencies({ schema }) {
      const propertyDeps = {};
      const schemaDeps = {};
      for (const key in schema) {
        if (key === "__proto__")
          continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
      }
      return [propertyDeps, schemaDeps];
    }
    function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
      const { gen, data, it } = cxt;
      if (Object.keys(propertyDeps).length === 0)
        return;
      const missing = gen.let("missing");
      for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
          continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
          property: prop,
          depsCount: deps.length,
          deps: deps.join(", ")
        });
        if (it.allErrors) {
          gen.if(hasProperty, () => {
            for (const depProp of deps) {
              (0, code_1.checkReportMissingProp)(cxt, depProp);
            }
          });
        } else {
          gen.if((0, codegen_1._)`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
          (0, code_1.reportMissingProp)(cxt, missing);
          gen.else();
        }
      }
    }
    exports.validatePropertyDeps = validatePropertyDeps;
    function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
      const { gen, data, keyword, it } = cxt;
      const valid = gen.name("valid");
      for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
          continue;
        gen.if(
          (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties),
          () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
          },
          () => gen.var(valid, true)
          // TODO var
        );
        cxt.ok(valid);
      }
    }
    exports.validateSchemaDeps = validateSchemaDeps;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/propertyNames.js
var require_propertyNames = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/propertyNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "property name must be valid",
      params: ({ params }) => (0, codegen_1._)`{propertyName: ${params.propertyName}}`
    };
    var def = {
      keyword: "propertyNames",
      type: "object",
      schemaType: ["object", "boolean"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
          return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
          cxt.setParams({ propertyName: key });
          cxt.subschema({
            keyword: "propertyNames",
            data: key,
            dataTypes: ["string"],
            propertyName: key,
            compositeRule: true
          }, valid);
          gen.if((0, codegen_1.not)(valid), () => {
            cxt.error(true);
            if (!it.allErrors)
              gen.break();
          });
        });
        cxt.ok(valid);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js
var require_additionalProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var util_1 = require_util();
    var error = {
      message: "must NOT have additional properties",
      params: ({ params }) => (0, codegen_1._)`{additionalProperty: ${params.additionalProperty}}`
    };
    var def = {
      keyword: "additionalProperties",
      type: ["object"],
      schemaType: ["boolean", "object"],
      allowUndefined: true,
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
          return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
          gen.forIn("key", data, (key) => {
            if (!props.length && !patProps.length)
              additionalPropertyCode(key);
            else
              gen.if(isAdditional(key), () => additionalPropertyCode(key));
          });
        }
        function isAdditional(key) {
          let definedProp;
          if (props.length > 8) {
            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
          } else if (props.length) {
            definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._)`${key} === ${p}`));
          } else {
            definedProp = codegen_1.nil;
          }
          if (patProps.length) {
            definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._)`${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
          }
          return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
          gen.code((0, codegen_1._)`delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
          if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
            deleteAdditional(key);
            return;
          }
          if (schema === false) {
            cxt.setParams({ additionalProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            if (opts.removeAdditional === "failing") {
              applyAdditionalSchema(key, valid, false);
              gen.if((0, codegen_1.not)(valid), () => {
                cxt.reset();
                deleteAdditional(key);
              });
            } else {
              applyAdditionalSchema(key, valid);
              if (!allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
            }
          }
        }
        function applyAdditionalSchema(key, valid, errors) {
          const subschema = {
            keyword: "additionalProperties",
            dataProp: key,
            dataPropType: util_1.Type.Str
          };
          if (errors === false) {
            Object.assign(subschema, {
              compositeRule: true,
              createErrors: false,
              allErrors: false
            });
          }
          cxt.subschema(subschema, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/properties.js
var require_properties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/properties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var validate_1 = require_validate();
    var code_1 = require_code2();
    var util_1 = require_util();
    var additionalProperties_1 = require_additionalProperties();
    var def = {
      keyword: "properties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
          additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
          it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
          it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
          return;
        const valid = gen.name("valid");
        for (const prop of properties) {
          if (hasDefault(prop)) {
            applyPropertySchema(prop);
          } else {
            gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
            applyPropertySchema(prop);
            if (!it.allErrors)
              gen.else().var(valid, true);
            gen.endIf();
          }
          cxt.it.definedProperties.add(prop);
          cxt.ok(valid);
        }
        function hasDefault(prop) {
          return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
        }
        function applyPropertySchema(prop) {
          cxt.subschema({
            keyword: "properties",
            schemaProp: prop,
            dataProp: prop
          }, valid);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/patternProperties.js
var require_patternProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/patternProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var util_2 = require_util();
    var def = {
      keyword: "patternProperties",
      type: "object",
      schemaType: "object",
      code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
          return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
          it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
          for (const pat of patterns) {
            if (checkProperties)
              checkMatchingProperties(pat);
            if (it.allErrors) {
              validateProperties(pat);
            } else {
              gen.var(valid, true);
              validateProperties(pat);
              gen.if(valid);
            }
          }
        }
        function checkMatchingProperties(pat) {
          for (const prop in checkProperties) {
            if (new RegExp(pat).test(prop)) {
              (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
            }
          }
        }
        function validateProperties(pat) {
          gen.forIn("key", data, (key) => {
            gen.if((0, codegen_1._)`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
              const alwaysValid = alwaysValidPatterns.includes(pat);
              if (!alwaysValid) {
                cxt.subschema({
                  keyword: "patternProperties",
                  schemaProp: pat,
                  dataProp: key,
                  dataPropType: util_2.Type.Str
                }, valid);
              }
              if (it.opts.unevaluated && props !== true) {
                gen.assign((0, codegen_1._)`${props}[${key}]`, true);
              } else if (!alwaysValid && !it.allErrors) {
                gen.if((0, codegen_1.not)(valid), () => gen.break());
              }
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/not.js
var require_not = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/not.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "not",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
          cxt.fail();
          return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
          keyword: "not",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
      },
      error: { message: "must NOT be valid" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/anyOf.js
var require_anyOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/anyOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code_1 = require_code2();
    var def = {
      keyword: "anyOf",
      schemaType: "array",
      trackErrors: true,
      code: code_1.validateUnion,
      error: { message: "must match a schema in anyOf" }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/oneOf.js
var require_oneOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/oneOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: "must match exactly one schema in oneOf",
      params: ({ params }) => (0, codegen_1._)`{passingSchemas: ${params.passing}}`
    };
    var def = {
      keyword: "oneOf",
      schemaType: "array",
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
          return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
          schArr.forEach((sch, i) => {
            let schCxt;
            if ((0, util_1.alwaysValidSchema)(it, sch)) {
              gen.var(schValid, true);
            } else {
              schCxt = cxt.subschema({
                keyword: "oneOf",
                schemaProp: i,
                compositeRule: true
              }, schValid);
            }
            if (i > 0) {
              gen.if((0, codegen_1._)`${schValid} && ${valid}`).assign(valid, false).assign(passing, (0, codegen_1._)`[${passing}, ${i}]`).else();
            }
            gen.if(schValid, () => {
              gen.assign(valid, true);
              gen.assign(passing, i);
              if (schCxt)
                cxt.mergeEvaluated(schCxt, codegen_1.Name);
            });
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/allOf.js
var require_allOf = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/allOf.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: "allOf",
      schemaType: "array",
      code(cxt) {
        const { gen, schema, it } = cxt;
        if (!Array.isArray(schema))
          throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
          if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
          const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
          cxt.ok(valid);
          cxt.mergeEvaluated(schCxt);
        });
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/if.js
var require_if = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/if.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params }) => (0, codegen_1.str)`must match "${params.ifClause}" schema`,
      params: ({ params }) => (0, codegen_1._)`{failingKeyword: ${params.ifClause}}`
    };
    var def = {
      keyword: "if",
      schemaType: ["object", "boolean"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === void 0 && parentSchema.else === void 0) {
          (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
          return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
          const ifClause = gen.let("ifClause");
          cxt.setParams({ ifClause });
          gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        } else if (hasThen) {
          gen.if(schValid, validateClause("then"));
        } else {
          gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
          const schCxt = cxt.subschema({
            keyword: "if",
            compositeRule: true,
            createErrors: false,
            allErrors: false
          }, schValid);
          cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
          return () => {
            const schCxt = cxt.subschema({ keyword }, schValid);
            gen.assign(valid, schValid);
            cxt.mergeValidEvaluated(schCxt, valid);
            if (ifClause)
              gen.assign(ifClause, (0, codegen_1._)`${keyword}`);
            else
              cxt.setParams({ ifClause: keyword });
          };
        }
      }
    };
    function hasSchema(it, keyword) {
      const schema = it.schema[keyword];
      return schema !== void 0 && !(0, util_1.alwaysValidSchema)(it, schema);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/thenElse.js
var require_thenElse = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/thenElse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["then", "else"],
      schemaType: ["object", "boolean"],
      code({ keyword, parentSchema, it }) {
        if (parentSchema.if === void 0)
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/index.js
var require_applicator = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalItems_1 = require_additionalItems();
    var prefixItems_1 = require_prefixItems();
    var items_1 = require_items();
    var items2020_1 = require_items2020();
    var contains_1 = require_contains();
    var dependencies_1 = require_dependencies();
    var propertyNames_1 = require_propertyNames();
    var additionalProperties_1 = require_additionalProperties();
    var properties_1 = require_properties();
    var patternProperties_1 = require_patternProperties();
    var not_1 = require_not();
    var anyOf_1 = require_anyOf();
    var oneOf_1 = require_oneOf();
    var allOf_1 = require_allOf();
    var if_1 = require_if();
    var thenElse_1 = require_thenElse();
    function getApplicator(draft2020 = false) {
      const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default
      ];
      if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
      else
        applicator.push(additionalItems_1.default, items_1.default);
      applicator.push(contains_1.default);
      return applicator;
    }
    exports.default = getApplicator;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js
var require_dynamicAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicAnchor = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var compile_1 = require_compile();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicAnchor",
      schemaType: "string",
      code: (cxt) => dynamicAnchor(cxt, cxt.schema)
    };
    function dynamicAnchor(cxt, anchor) {
      const { gen, it } = cxt;
      it.schemaEnv.root.dynamicAnchors[anchor] = true;
      const v = (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`;
      const validate2 = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
      gen.if((0, codegen_1._)`!${v}`, () => gen.assign(v, validate2));
    }
    exports.dynamicAnchor = dynamicAnchor;
    function _getValidate(cxt) {
      const { schemaEnv, schema, self } = cxt.it;
      const { root, baseId, localRefs, meta } = schemaEnv.root;
      const { schemaId } = self.opts;
      const sch = new compile_1.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
      compile_1.compileSchema.call(self, sch);
      return (0, ref_1.getValidate)(cxt, sch);
    }
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js
var require_dynamicRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/dynamicRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dynamicRef = void 0;
    var codegen_1 = require_codegen();
    var names_1 = require_names();
    var ref_1 = require_ref();
    var def = {
      keyword: "$dynamicRef",
      schemaType: "string",
      code: (cxt) => dynamicRef(cxt, cxt.schema)
    };
    function dynamicRef(cxt, ref) {
      const { gen, keyword, it } = cxt;
      if (ref[0] !== "#")
        throw new Error(`"${keyword}" only supports hash fragment reference`);
      const anchor = ref.slice(1);
      if (it.allErrors) {
        _dynamicRef();
      } else {
        const valid = gen.let("valid", false);
        _dynamicRef(valid);
        cxt.ok(valid);
      }
      function _dynamicRef(valid) {
        if (it.schemaEnv.root.dynamicAnchors[anchor]) {
          const v = gen.let("_v", (0, codegen_1._)`${names_1.default.dynamicAnchors}${(0, codegen_1.getProperty)(anchor)}`);
          gen.if(v, _callRef(v, valid), _callRef(it.validateName, valid));
        } else {
          _callRef(it.validateName, valid)();
        }
      }
      function _callRef(validate2, valid) {
        return valid ? () => gen.block(() => {
          (0, ref_1.callRef)(cxt, validate2);
          gen.let(valid, true);
        }) : () => (0, ref_1.callRef)(cxt, validate2);
      }
    }
    exports.dynamicRef = dynamicRef;
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js
var require_recursiveAnchor = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveAnchor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var util_1 = require_util();
    var def = {
      keyword: "$recursiveAnchor",
      schemaType: "boolean",
      code(cxt) {
        if (cxt.schema)
          (0, dynamicAnchor_1.dynamicAnchor)(cxt, "");
        else
          (0, util_1.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js
var require_recursiveRef = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/recursiveRef.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicRef_1 = require_dynamicRef();
    var def = {
      keyword: "$recursiveRef",
      schemaType: "string",
      code: (cxt) => (0, dynamicRef_1.dynamicRef)(cxt, cxt.schema)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/dynamic/index.js
var require_dynamic = __commonJS({
  "node_modules/ajv/dist/vocabularies/dynamic/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dynamicAnchor_1 = require_dynamicAnchor();
    var dynamicRef_1 = require_dynamicRef();
    var recursiveAnchor_1 = require_recursiveAnchor();
    var recursiveRef_1 = require_recursiveRef();
    var dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
    exports.default = dynamic;
  }
});

// node_modules/ajv/dist/vocabularies/validation/dependentRequired.js
var require_dependentRequired = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/dependentRequired.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentRequired",
      type: "object",
      schemaType: "object",
      error: dependencies_1.error,
      code: (cxt) => (0, dependencies_1.validatePropertyDeps)(cxt)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js
var require_dependentSchemas = __commonJS({
  "node_modules/ajv/dist/vocabularies/applicator/dependentSchemas.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependencies_1 = require_dependencies();
    var def = {
      keyword: "dependentSchemas",
      type: "object",
      schemaType: "object",
      code: (cxt) => (0, dependencies_1.validateSchemaDeps)(cxt)
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/validation/limitContains.js
var require_limitContains = __commonJS({
  "node_modules/ajv/dist/vocabularies/validation/limitContains.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require_util();
    var def = {
      keyword: ["maxContains", "minContains"],
      type: "array",
      schemaType: "number",
      code({ keyword, parentSchema, it }) {
        if (parentSchema.contains === void 0) {
          (0, util_1.checkStrictMode)(it, `"${keyword}" without "contains" is ignored`);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/next.js
var require_next = __commonJS({
  "node_modules/ajv/dist/vocabularies/next.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dependentRequired_1 = require_dependentRequired();
    var dependentSchemas_1 = require_dependentSchemas();
    var limitContains_1 = require_limitContains();
    var next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
    exports.default = next;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js
var require_unevaluatedProperties = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var names_1 = require_names();
    var error = {
      message: "must NOT have unevaluated properties",
      params: ({ params }) => (0, codegen_1._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`
    };
    var def = {
      keyword: "unevaluatedProperties",
      type: "object",
      schemaType: ["boolean", "object"],
      trackErrors: true,
      error,
      code(cxt) {
        const { gen, schema, data, errsCount, it } = cxt;
        if (!errsCount)
          throw new Error("ajv implementation error");
        const { allErrors, props } = it;
        if (props instanceof codegen_1.Name) {
          gen.if((0, codegen_1._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
        } else if (props !== true) {
          gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
        }
        it.props = true;
        cxt.ok((0, codegen_1._)`${errsCount} === ${names_1.default.errors}`);
        function unevaluatedPropCode(key) {
          if (schema === false) {
            cxt.setParams({ unevaluatedProperty: key });
            cxt.error();
            if (!allErrors)
              gen.break();
            return;
          }
          if (!(0, util_1.alwaysValidSchema)(it, schema)) {
            const valid = gen.name("valid");
            cxt.subschema({
              keyword: "unevaluatedProperties",
              dataProp: key,
              dataPropType: util_1.Type.Str
            }, valid);
            if (!allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          }
        }
        function unevaluatedDynamic(evaluatedProps, key) {
          return (0, codegen_1._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
        }
        function unevaluatedStatic(evaluatedProps, key) {
          const ps = [];
          for (const p in evaluatedProps) {
            if (evaluatedProps[p] === true)
              ps.push((0, codegen_1._)`${key} !== ${p}`);
          }
          return (0, codegen_1.and)(...ps);
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js
var require_unevaluatedItems = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/unevaluatedItems.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var util_1 = require_util();
    var error = {
      message: ({ params: { len } }) => (0, codegen_1.str)`must NOT have more than ${len} items`,
      params: ({ params: { len } }) => (0, codegen_1._)`{limit: ${len}}`
    };
    var def = {
      keyword: "unevaluatedItems",
      type: "array",
      schemaType: ["boolean", "object"],
      error,
      code(cxt) {
        const { gen, schema, data, it } = cxt;
        const items = it.items || 0;
        if (items === true)
          return;
        const len = gen.const("len", (0, codegen_1._)`${data}.length`);
        if (schema === false) {
          cxt.setParams({ len: items });
          cxt.fail((0, codegen_1._)`${len} > ${items}`);
        } else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
          const valid = gen.var("valid", (0, codegen_1._)`${len} <= ${items}`);
          gen.if((0, codegen_1.not)(valid), () => validateItems(valid, items));
          cxt.ok(valid);
        }
        it.items = true;
        function validateItems(valid, from) {
          gen.forRange("i", from, len, (i) => {
            cxt.subschema({ keyword: "unevaluatedItems", dataProp: i, dataPropType: util_1.Type.Num }, valid);
            if (!it.allErrors)
              gen.if((0, codegen_1.not)(valid), () => gen.break());
          });
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/unevaluated/index.js
var require_unevaluated = __commonJS({
  "node_modules/ajv/dist/vocabularies/unevaluated/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var unevaluatedProperties_1 = require_unevaluatedProperties();
    var unevaluatedItems_1 = require_unevaluatedItems();
    var unevaluated = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
    exports.default = unevaluated;
  }
});

// node_modules/ajv/dist/vocabularies/format/format.js
var require_format = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/format.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var error = {
      message: ({ schemaCode }) => (0, codegen_1.str)`must match format "${schemaCode}"`,
      params: ({ schemaCode }) => (0, codegen_1._)`{format: ${schemaCode}}`
    };
    var def = {
      keyword: "format",
      type: ["number", "string"],
      schemaType: "string",
      $data: true,
      error,
      code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
          return;
        if ($data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fDef = gen.const("fDef", (0, codegen_1._)`${fmts}[${schemaCode}]`);
          const fType = gen.let("fType");
          const format = gen.let("format");
          gen.if((0, codegen_1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._)`${fDef}.type || "string"`).assign(format, (0, codegen_1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._)`"string"`).assign(format, fDef));
          cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
          function unknownFmt() {
            if (opts.strictSchema === false)
              return codegen_1.nil;
            return (0, codegen_1._)`${schemaCode} && !${format}`;
          }
          function invalidFmt() {
            const callFormat = schemaEnv.$async ? (0, codegen_1._)`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : (0, codegen_1._)`${format}(${data})`;
            const validData = (0, codegen_1._)`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
            return (0, codegen_1._)`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
          }
        }
        function validateFormat() {
          const formatDef = self.formats[schema];
          if (!formatDef) {
            unknownFormat();
            return;
          }
          if (formatDef === true)
            return;
          const [fmtType, format, fmtRef] = getFormat(formatDef);
          if (fmtType === ruleType)
            cxt.pass(validCondition());
          function unknownFormat() {
            if (opts.strictSchema === false) {
              self.logger.warn(unknownMsg());
              return;
            }
            throw new Error(unknownMsg());
            function unknownMsg() {
              return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
            }
          }
          function getFormat(fmtDef) {
            const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(schema)}` : void 0;
            const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
            if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
              return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._)`${fmt}.validate`];
            }
            return ["string", fmtDef, fmt];
          }
          function validCondition() {
            if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
              if (!schemaEnv.$async)
                throw new Error("async format in sync schema");
              return (0, codegen_1._)`await ${fmtRef}(${data})`;
            }
            return typeof format == "function" ? (0, codegen_1._)`${fmtRef}(${data})` : (0, codegen_1._)`${fmtRef}.test(${data})`;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/vocabularies/format/index.js
var require_format2 = __commonJS({
  "node_modules/ajv/dist/vocabularies/format/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var format_1 = require_format();
    var format = [format_1.default];
    exports.default = format;
  }
});

// node_modules/ajv/dist/vocabularies/metadata.js
var require_metadata = __commonJS({
  "node_modules/ajv/dist/vocabularies/metadata.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contentVocabulary = exports.metadataVocabulary = void 0;
    exports.metadataVocabulary = [
      "title",
      "description",
      "default",
      "deprecated",
      "readOnly",
      "writeOnly",
      "examples"
    ];
    exports.contentVocabulary = [
      "contentMediaType",
      "contentEncoding",
      "contentSchema"
    ];
  }
});

// node_modules/ajv/dist/vocabularies/draft2020.js
var require_draft2020 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft2020.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var dynamic_1 = require_dynamic();
    var next_1 = require_next();
    var unevaluated_1 = require_unevaluated();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft2020Vocabularies = [
      dynamic_1.default,
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(true),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary,
      next_1.default,
      unevaluated_1.default
    ];
    exports.default = draft2020Vocabularies;
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/types.js
var require_types = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiscrError = void 0;
    var DiscrError;
    (function(DiscrError2) {
      DiscrError2["Tag"] = "tag";
      DiscrError2["Mapping"] = "mapping";
    })(DiscrError || (exports.DiscrError = DiscrError = {}));
  }
});

// node_modules/ajv/dist/vocabularies/discriminator/index.js
var require_discriminator = __commonJS({
  "node_modules/ajv/dist/vocabularies/discriminator/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var codegen_1 = require_codegen();
    var types_1 = require_types();
    var compile_1 = require_compile();
    var ref_error_1 = require_ref_error();
    var util_1 = require_util();
    var error = {
      message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
      params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
    };
    var def = {
      keyword: "discriminator",
      type: "object",
      schemaType: "object",
      error,
      code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
          throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
          throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
          throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
          throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
          const mapping = getMapping();
          gen.if(false);
          for (const tagValue in mapping) {
            gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
            gen.assign(valid, applyTagSchema(mapping[tagValue]));
          }
          gen.else();
          cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
          gen.endIf();
        }
        function applyTagSchema(schemaProp) {
          const _valid = gen.name("valid");
          const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
          cxt.mergeEvaluated(schCxt, codegen_1.Name);
          return _valid;
        }
        function getMapping() {
          var _a;
          const oneOfMapping = {};
          const topRequired = hasRequired(parentSchema);
          let tagRequired = true;
          for (let i = 0; i < oneOf.length; i++) {
            let sch = oneOf[i];
            if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
              const ref = sch.$ref;
              sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
              if (sch instanceof compile_1.SchemaEnv)
                sch = sch.schema;
              if (sch === void 0)
                throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
            }
            const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
            if (typeof propSch != "object") {
              throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
            }
            tagRequired = tagRequired && (topRequired || hasRequired(sch));
            addMappings(propSch, i);
          }
          if (!tagRequired)
            throw new Error(`discriminator: "${tagName}" must be required`);
          return oneOfMapping;
          function hasRequired({ required }) {
            return Array.isArray(required) && required.includes(tagName);
          }
          function addMappings(sch, i) {
            if (sch.const) {
              addMapping(sch.const, i);
            } else if (sch.enum) {
              for (const tagValue of sch.enum) {
                addMapping(tagValue, i);
              }
            } else {
              throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
            }
          }
          function addMapping(tagValue, i) {
            if (typeof tagValue != "string" || tagValue in oneOfMapping) {
              throw new Error(`discriminator: "${tagName}" values must be unique strings`);
            }
            oneOfMapping[tagValue] = i;
          }
        }
      }
    };
    exports.default = def;
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/schema.json
var require_schema = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/schema.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/schema",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true,
        "https://json-schema.org/draft/2020-12/vocab/applicator": true,
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
        "https://json-schema.org/draft/2020-12/vocab/validation": true,
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Core and Validation specifications meta-schema",
      allOf: [
        { $ref: "meta/core" },
        { $ref: "meta/applicator" },
        { $ref: "meta/unevaluated" },
        { $ref: "meta/validation" },
        { $ref: "meta/meta-data" },
        { $ref: "meta/format-annotation" },
        { $ref: "meta/content" }
      ],
      type: ["object", "boolean"],
      $comment: "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.",
      properties: {
        definitions: {
          $comment: '"definitions" has been replaced by "$defs".',
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          deprecated: true,
          default: {}
        },
        dependencies: {
          $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
          type: "object",
          additionalProperties: {
            anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }]
          },
          deprecated: true,
          default: {}
        },
        $recursiveAnchor: {
          $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
          $ref: "meta/core#/$defs/anchorString",
          deprecated: true
        },
        $recursiveRef: {
          $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
          $ref: "meta/core#/$defs/uriReferenceString",
          deprecated: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json
var require_applicator2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/applicator.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/applicator",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/applicator": true
      },
      $dynamicAnchor: "meta",
      title: "Applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        prefixItems: { $ref: "#/$defs/schemaArray" },
        items: { $dynamicRef: "#meta" },
        contains: { $dynamicRef: "#meta" },
        additionalProperties: { $dynamicRef: "#meta" },
        properties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependentSchemas: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" },
          default: {}
        },
        propertyNames: { $dynamicRef: "#meta" },
        if: { $dynamicRef: "#meta" },
        then: { $dynamicRef: "#meta" },
        else: { $dynamicRef: "#meta" },
        allOf: { $ref: "#/$defs/schemaArray" },
        anyOf: { $ref: "#/$defs/schemaArray" },
        oneOf: { $ref: "#/$defs/schemaArray" },
        not: { $dynamicRef: "#meta" }
      },
      $defs: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $dynamicRef: "#meta" }
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json
var require_unevaluated2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/unevaluated.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/unevaluated",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/unevaluated": true
      },
      $dynamicAnchor: "meta",
      title: "Unevaluated applicator vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        unevaluatedItems: { $dynamicRef: "#meta" },
        unevaluatedProperties: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json
var require_content = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/content.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/content",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/content": true
      },
      $dynamicAnchor: "meta",
      title: "Content vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        contentEncoding: { type: "string" },
        contentMediaType: { type: "string" },
        contentSchema: { $dynamicRef: "#meta" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json
var require_core3 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/core.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/core",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/core": true
      },
      $dynamicAnchor: "meta",
      title: "Core vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        $id: {
          $ref: "#/$defs/uriReferenceString",
          $comment: "Non-empty fragments not allowed.",
          pattern: "^[^#]*#?$"
        },
        $schema: { $ref: "#/$defs/uriString" },
        $ref: { $ref: "#/$defs/uriReferenceString" },
        $anchor: { $ref: "#/$defs/anchorString" },
        $dynamicRef: { $ref: "#/$defs/uriReferenceString" },
        $dynamicAnchor: { $ref: "#/$defs/anchorString" },
        $vocabulary: {
          type: "object",
          propertyNames: { $ref: "#/$defs/uriString" },
          additionalProperties: {
            type: "boolean"
          }
        },
        $comment: {
          type: "string"
        },
        $defs: {
          type: "object",
          additionalProperties: { $dynamicRef: "#meta" }
        }
      },
      $defs: {
        anchorString: {
          type: "string",
          pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
        },
        uriString: {
          type: "string",
          format: "uri"
        },
        uriReferenceString: {
          type: "string",
          format: "uri-reference"
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json
var require_format_annotation = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/format-annotation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/format-annotation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/format-annotation": true
      },
      $dynamicAnchor: "meta",
      title: "Format vocabulary meta-schema for annotation results",
      type: ["object", "boolean"],
      properties: {
        format: { type: "string" }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json
var require_meta_data = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/meta-data.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/meta-data",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/meta-data": true
      },
      $dynamicAnchor: "meta",
      title: "Meta-data vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        deprecated: {
          type: "boolean",
          default: false
        },
        readOnly: {
          type: "boolean",
          default: false
        },
        writeOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json
var require_validation2 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/meta/validation.json"(exports, module) {
    module.exports = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: "https://json-schema.org/draft/2020-12/meta/validation",
      $vocabulary: {
        "https://json-schema.org/draft/2020-12/vocab/validation": true
      },
      $dynamicAnchor: "meta",
      title: "Validation vocabulary meta-schema",
      type: ["object", "boolean"],
      properties: {
        type: {
          anyOf: [
            { $ref: "#/$defs/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/$defs/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        const: true,
        enum: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/$defs/nonNegativeInteger" },
        minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        maxItems: { $ref: "#/$defs/nonNegativeInteger" },
        minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        maxContains: { $ref: "#/$defs/nonNegativeInteger" },
        minContains: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 1
        },
        maxProperties: { $ref: "#/$defs/nonNegativeInteger" },
        minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" },
        required: { $ref: "#/$defs/stringArray" },
        dependentRequired: {
          type: "object",
          additionalProperties: {
            $ref: "#/$defs/stringArray"
          }
        }
      },
      $defs: {
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          $ref: "#/$defs/nonNegativeInteger",
          default: 0
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      }
    };
  }
});

// node_modules/ajv/dist/refs/json-schema-2020-12/index.js
var require_json_schema_2020_12 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-2020-12/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var metaSchema = require_schema();
    var applicator = require_applicator2();
    var unevaluated = require_unevaluated2();
    var content = require_content();
    var core = require_core3();
    var format = require_format_annotation();
    var metadata = require_meta_data();
    var validation = require_validation2();
    var META_SUPPORT_DATA = ["/properties"];
    function addMetaSchema2020($data) {
      ;
      [
        metaSchema,
        applicator,
        unevaluated,
        content,
        core,
        with$data(this, format),
        metadata,
        with$data(this, validation)
      ].forEach((sch) => this.addMetaSchema(sch, void 0, false));
      return this;
      function with$data(ajv, sch) {
        return $data ? ajv.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
      }
    }
    exports.default = addMetaSchema2020;
  }
});

// node_modules/ajv/dist/2020.js
var require__ = __commonJS({
  "node_modules/ajv/dist/2020.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
    var core_1 = require_core();
    var draft2020_1 = require_draft2020();
    var discriminator_1 = require_discriminator();
    var json_schema_2020_12_1 = require_json_schema_2020_12();
    var META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
    var Ajv20202 = class extends core_1.default {
      constructor(opts = {}) {
        super({
          ...opts,
          dynamicRef: true,
          next: true,
          unevaluated: true
        });
      }
      _addVocabularies() {
        super._addVocabularies();
        draft2020_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (!meta)
          return;
        json_schema_2020_12_1.default.call(this, $data);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv2020 = Ajv20202;
    module.exports = exports = Ajv20202;
    module.exports.Ajv2020 = Ajv20202;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv20202;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/ajv-formats/dist/formats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
    function fmtDef(validate2, compare) {
      return { validate: validate2, compare };
    }
    exports.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: fmtDef(date, compareDate),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: fmtDef(getTime(true), compareTime),
      "date-time": fmtDef(getDateTime(true), compareDateTime),
      "iso-time": fmtDef(getTime(), compareIsoTime),
      "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte,
      // signed 32 bit integer
      int32: { type: "number", validate: validateInt32 },
      // signed 64 bit integer
      int64: { type: "number", validate: validateInt64 },
      // C-type float
      float: { type: "number", validate: validateNumber },
      // C-type double
      double: { type: "number", validate: validateNumber },
      // hint to the UI to hide input strings
      password: true,
      // unchecked string payload
      binary: true
    };
    exports.fastFormats = {
      ...exports.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
      "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports.formatNames = Object.keys(exports.fullFormats);
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(str) {
      const matches2 = DATE.exec(str);
      if (!matches2)
        return false;
      const year = +matches2[1];
      const month = +matches2[2];
      const day = +matches2[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
    }
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function getTime(strictTimeZone) {
      return function time(str) {
        const matches2 = TIME.exec(str);
        if (!matches2)
          return false;
        const hr = +matches2[1];
        const min = +matches2[2];
        const sec = +matches2[3];
        const tz = matches2[4];
        const tzSign = matches2[5] === "-" ? -1 : 1;
        const tzH = +(matches2[6] || 0);
        const tzM = +(matches2[7] || 0);
        if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
          return false;
        if (hr <= 23 && min <= 59 && sec < 60)
          return true;
        const utcMin = min - tzM * tzSign;
        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
      };
    }
    function compareTime(s1, s2) {
      if (!(s1 && s2))
        return void 0;
      const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
      const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
      if (!(t1 && t2))
        return void 0;
      return t1 - t2;
    }
    function compareIsoTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3];
      t2 = a2[1] + a2[2] + a2[3];
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function getDateTime(strictTimeZone) {
      const time = getTime(strictTimeZone);
      return function date_time(str) {
        const dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
      };
    }
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const d1 = new Date(dt1).valueOf();
      const d2 = new Date(dt2).valueOf();
      if (!(d1 && d2))
        return void 0;
      return d1 - d2;
    }
    function compareIsoDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT32 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
    }
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    function validateNumber() {
      return true;
    }
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
});

// node_modules/ajv/dist/vocabularies/draft7.js
var require_draft7 = __commonJS({
  "node_modules/ajv/dist/vocabularies/draft7.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var core_1 = require_core2();
    var validation_1 = require_validation();
    var applicator_1 = require_applicator();
    var format_1 = require_format2();
    var metadata_1 = require_metadata();
    var draft7Vocabularies = [
      core_1.default,
      validation_1.default,
      (0, applicator_1.default)(),
      format_1.default,
      metadata_1.metadataVocabulary,
      metadata_1.contentVocabulary
    ];
    exports.default = draft7Vocabularies;
  }
});

// node_modules/ajv/dist/refs/json-schema-draft-07.json
var require_json_schema_draft_07 = __commonJS({
  "node_modules/ajv/dist/refs/json-schema-draft-07.json"(exports, module) {
    module.exports = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "http://json-schema.org/draft-07/schema#",
      title: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        nonNegativeInteger: {
          type: "integer",
          minimum: 0
        },
        nonNegativeIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
          default: []
        }
      },
      type: ["object", "boolean"],
      properties: {
        $id: {
          type: "string",
          format: "uri-reference"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        $ref: {
          type: "string",
          format: "uri-reference"
        },
        $comment: {
          type: "string"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: true,
        readOnly: {
          type: "boolean",
          default: false
        },
        examples: {
          type: "array",
          items: true
        },
        multipleOf: {
          type: "number",
          exclusiveMinimum: 0
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "number"
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "number"
        },
        maxLength: { $ref: "#/definitions/nonNegativeInteger" },
        minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: { $ref: "#" },
        items: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
          default: true
        },
        maxItems: { $ref: "#/definitions/nonNegativeInteger" },
        minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        contains: { $ref: "#" },
        maxProperties: { $ref: "#/definitions/nonNegativeInteger" },
        minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: { $ref: "#" },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          propertyNames: { format: "regex" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }]
          }
        },
        propertyNames: { $ref: "#" },
        const: true,
        enum: {
          type: "array",
          items: true,
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        contentMediaType: { type: "string" },
        contentEncoding: { type: "string" },
        if: { $ref: "#" },
        then: { $ref: "#" },
        else: { $ref: "#" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      default: true
    };
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv = class extends core_1.default {
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv = Ajv;
    module.exports = exports = Ajv;
    module.exports.Ajv = Ajv;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({
  "node_modules/ajv-formats/dist/limit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatLimitDefinition = void 0;
    var ajv_1 = require_ajv();
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)`should be ${KWDs[keyword].okStr} ${schemaCode}`,
      params: ({ keyword, schemaCode }) => (0, codegen_1._)`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
    };
    exports.formatLimitDefinition = {
      keyword: Object.keys(KWDs),
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, keyword, it } = cxt;
        const { opts, self } = it;
        if (!opts.validateFormats)
          return;
        const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
        if (fCxt.$data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fmt = gen.const("fmt", (0, codegen_1._)`${fmts}[${fCxt.schemaCode}]`);
          cxt.fail$data((0, codegen_1.or)((0, codegen_1._)`typeof ${fmt} != "object"`, (0, codegen_1._)`${fmt} instanceof RegExp`, (0, codegen_1._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
        }
        function validateFormat() {
          const format = fCxt.schema;
          const fmtDef = self.formats[format];
          if (!fmtDef || fmtDef === true)
            return;
          if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
            throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
          }
          const fmt = gen.scopeValue("formats", {
            key: format,
            ref: fmtDef,
            code: opts.code.formats ? (0, codegen_1._)`${opts.code.formats}${(0, codegen_1.getProperty)(format)}` : void 0
          });
          cxt.fail$data(compareCode(fmt));
        }
        function compareCode(fmt) {
          return (0, codegen_1._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    var formatLimitPlugin = (ajv) => {
      ajv.addKeyword(exports.formatLimitDefinition);
      return ajv;
    };
    exports.default = formatLimitPlugin;
  }
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS({
  "node_modules/ajv-formats/dist/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var formats_1 = require_formats();
    var limit_1 = require_limit();
    var codegen_1 = require_codegen();
    var fullName = new codegen_1.Name("fullFormats");
    var fastName = new codegen_1.Name("fastFormats");
    var formatsPlugin = (ajv, opts = { keywords: true }) => {
      if (Array.isArray(opts)) {
        addFormats2(ajv, opts, formats_1.fullFormats, fullName);
        return ajv;
      }
      const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
      const list2 = opts.formats || formats_1.formatNames;
      addFormats2(ajv, list2, formats, exportName);
      if (opts.keywords)
        (0, limit_1.default)(ajv);
      return ajv;
    };
    formatsPlugin.get = (name, mode = "full") => {
      const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
      const f = formats[name];
      if (!f)
        throw new Error(`Unknown format "${name}"`);
      return f;
    };
    function addFormats2(ajv, list2, fs, exportName) {
      var _a;
      var _b;
      (_a = (_b = ajv.opts.code).formats) !== null && _a !== void 0 ? _a : _b.formats = (0, codegen_1._)`require("ajv-formats/dist/formats").${exportName}`;
      for (const f of list2)
        ajv.addFormat(f, fs[f]);
    }
    module.exports = exports = formatsPlugin;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = formatsPlugin;
  }
});

// src/cli/main.ts
import { readFileSync as readFileSync8 } from "node:fs";
import { fileURLToPath as fileURLToPath3 } from "node:url";

// src/cli/ops.ts
import { existsSync as existsSync4, lstatSync as lstatSync4, readdirSync as readdirSync6, readFileSync as readFileSync7, statSync as statSync3 } from "node:fs";
import { join as join5, relative as relative3 } from "node:path";

// src/journal.ts
import { randomBytes as randomBytes2 } from "node:crypto";
import { existsSync as existsSync2, lstatSync as lstatSync2, mkdirSync as mkdirSync2, readdirSync as readdirSync3, readFileSync as readFileSync3, renameSync as renameSync2, rmSync as rmSync2, statSync as statSync2, unlinkSync as unlinkSync2 } from "node:fs";
import { dirname as dirname2, join as join3, relative as relative2 } from "node:path";

// src/store.ts
import { createHash, randomBytes } from "node:crypto";
import {
  closeSync,
  existsSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync as readdirSync2,
  readFileSync as readFileSync2,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeSync
} from "node:fs";
import { hostname } from "node:os";
import { basename, dirname, isAbsolute, join as join2, relative, resolve } from "node:path";

// src/strict-json.ts
var MAX_RECORD_BYTES = 1048576;
var refuse = (reason, detail) => ({
  ok: false,
  class: "schema-invalid",
  reason,
  detail
});
function strictParse(bytes, cap = MAX_RECORD_BYTES) {
  if (bytes.byteLength > cap) {
    return refuse("too-large", `${bytes.byteLength} bytes; the cap is ${cap} bytes (${cap / MAX_RECORD_BYTES} MiB)`);
  }
  if (bytes.byteLength >= 3 && bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) {
    return refuse("bom", "UTF-8 byte order mark (EF BB BF) at offset 0");
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return refuse("invalid-utf8", "the bytes are not well-formed UTF-8");
  }
  const found = scan(text);
  if (found !== null) return found;
  let value;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return refuse("syntax", e instanceof Error ? e.message : String(e));
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return refuse("not-an-object", `the top-level value is ${describe(value)}, not an object`);
  }
  return { ok: true, value };
}
function describe(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  return `a ${typeof value}`;
}
var isWhitespace = (c) => c === 32 || c === 9 || c === 10 || c === 13;
var isBare = (c) => c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 43 || c === 45 || c === 46;
var NON_FINITE = /^[+-]?(NaN|Infinity)$/;
function pathOf(frames) {
  let p = "$";
  for (const f of frames) p += f.kind === "object" ? `.${f.key}` : `[${f.index}]`;
  return p;
}
function scan(text) {
  const stack = [];
  let topDone = false;
  const n = text.length;
  let i = 0;
  const valueDone = () => {
    const f = stack[stack.length - 1];
    if (f === void 0) topDone = true;
    else f.expect = "comma";
  };
  while (i < n) {
    const c = text.charCodeAt(i);
    if (isWhitespace(c)) {
      i++;
      continue;
    }
    const f = stack[stack.length - 1];
    const expectsValue = f === void 0 ? !topDone : f.kind === "object" ? f.expect === "value" : f.expect === "first-value" || f.expect === "value";
    if (topDone) {
      if (c === 123 || c === 91 || c === 34 || isBare(c)) {
        return refuse("multiple-values", `a second top-level value begins at character offset ${i}`);
      }
      return null;
    }
    switch (c) {
      case 34: {
        const end = stringEnd(text, i);
        if (end < 0) return null;
        if (f !== void 0 && f.kind === "object" && (f.expect === "first-key" || f.expect === "key")) {
          const key = decodeKey(text.slice(i, end + 1));
          if (key === void 0) return null;
          if (f.keys.has(key)) {
            return refuse("duplicate-key", `key "${key}" appears twice in ${pathOf(stack.slice(0, -1))}`);
          }
          f.keys.add(key);
          f.key = key;
          f.expect = "colon";
        } else if (expectsValue) {
          valueDone();
        } else {
          return null;
        }
        i = end + 1;
        continue;
      }
      case 123:
        if (!expectsValue) return null;
        stack.push({ kind: "object", keys: /* @__PURE__ */ new Set(), expect: "first-key", key: "" });
        break;
      case 91:
        if (!expectsValue) return null;
        stack.push({ kind: "array", expect: "first-value", index: 0 });
        break;
      case 125:
        if (f === void 0 || f.kind !== "object" || f.expect !== "first-key" && f.expect !== "comma") return null;
        stack.pop();
        valueDone();
        break;
      case 93:
        if (f === void 0 || f.kind !== "array" || f.expect !== "first-value" && f.expect !== "comma") return null;
        stack.pop();
        valueDone();
        break;
      case 58:
        if (f === void 0 || f.kind !== "object" || f.expect !== "colon") return null;
        f.expect = "value";
        break;
      case 44:
        if (f === void 0 || f.expect !== "comma") return null;
        if (f.kind === "object") f.expect = "key";
        else {
          f.index++;
          f.expect = "value";
        }
        break;
      default: {
        if (!isBare(c)) return null;
        let j = i + 1;
        while (j < n && isBare(text.charCodeAt(j))) j++;
        const word = text.slice(i, j);
        if (NON_FINITE.test(word)) {
          return refuse("non-finite", `${word} at character offset ${i} (${pathOf(stack)}) is not a JSON number`);
        }
        if (!expectsValue) return null;
        valueDone();
        i = j;
        continue;
      }
    }
    i++;
  }
  return null;
}
function stringEnd(text, start) {
  let j = start + 1;
  while (j < text.length) {
    const c = text.charCodeAt(j);
    if (c === 92) j += 2;
    else if (c === 34) return j;
    else j++;
  }
  return -1;
}
function decodeKey(raw) {
  if (!raw.includes("\\")) return raw.slice(1, -1);
  try {
    const v = JSON.parse(raw);
    return typeof v === "string" ? v : void 0;
  } catch {
    return void 0;
  }
}

// src/validate.ts
var import__ = __toESM(require__(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
var SCHEMA_DIR = fileURLToPath(new URL("../schemas/", import.meta.url));
var SCHEMA_FILE_SUFFIX = ".schema.json";
function loadSchemas(dir = SCHEMA_DIR) {
  const documents = [];
  for (const file of listSchemaFiles(dir)) {
    const abs = join(dir, file);
    const parsed = strictParse(readFileSync(abs));
    if (!parsed.ok) throw new Error(`${abs}: ${parsed.reason}: ${parsed.detail}`);
    documents.push({ source: abs, value: parsed.value });
  }
  return compileSchemas(documents);
}
function compileSchemas(documents) {
  const ajv = new import__.default({ strict: true, strictRequired: false, allErrors: true });
  (0, import_ajv_formats.default)(ajv);
  const owner = /* @__PURE__ */ new Map();
  const raw = /* @__PURE__ */ new Map();
  for (const { source, value } of documents) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${source}: schema is not an object`);
    const id = value.$id;
    if (typeof id !== "string" || id.length === 0) throw new Error(`${source}: schema has no string $id`);
    const other = owner.get(id);
    if (other !== void 0) throw new Error(`${source}: $id "${id}" is already declared by ${other}`);
    owner.set(id, source);
    raw.set(id, value);
    try {
      ajv.addSchema(value);
    } catch (e) {
      throw new Error(`${source}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const compiled = /* @__PURE__ */ new Map();
  for (const [id, source] of owner) {
    let fn;
    try {
      fn = ajv.getSchema(id);
    } catch (e) {
      throw new Error(`${source}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (fn === void 0) throw new Error(`${source}: Ajv did not return a validator for $id "${id}"`);
    compiled.set(id, fn);
  }
  const ids = [...compiled.keys()].sort();
  return {
    ids: () => [...ids],
    validate(schemaId, value) {
      const fn = compiled.get(schemaId);
      if (fn === void 0) return { ok: false, class: "unsupported-format", schemaId, known: [...ids] };
      if (fn(value)) return { ok: true };
      return { ok: false, class: "schema-invalid", errors: (fn.errors ?? []).map(toValidationError) };
    },
    document: (schemaId) => raw.get(schemaId)
  };
}
function listSchemaFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
  return entries.filter((d) => d.isFile() && d.name.endsWith(SCHEMA_FILE_SUFFIX)).map((d) => d.name).sort();
}
var toValidationError = (e) => ({
  instancePath: e.instancePath,
  keyword: e.keyword,
  message: e.message ?? ""
});
var defaultSet;
var current = () => defaultSet ??= loadSchemas();
function useSchemas(set) {
  defaultSet = set;
}
function schemas() {
  return current();
}
function validate(schemaId, value) {
  return current().validate(schemaId, value);
}

// src/store.ts
var WORKBENCH_MANIFEST = "workbench.json";
var WORKBENCH_SCHEMA_ID = "urn:fusion:schema:fusion.workbench/v1";
var PACKAGE_SCHEMA_ID = "urn:fusion:schema:fusion.package/v1";
var RECORD_SCHEMA_ID = "urn:fusion:schema:fusion.record/v1";
var SCHEMA_ID_PREFIX = "urn:fusion:schema:";
var SUPPORTED_FEATURES = ["json-control-v1"];
var STATE_DIR = ".json-state";
var LOCK_STALE_MS = 6e4;
var err = (cls, reason, detail, errors) => ({
  ok: false,
  error: { class: cls, reason, detail, ...errors !== void 0 ? { errors } : {} }
});
var isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var revisionOf = (bytes) => "sha256:" + createHash("sha256").update(bytes).digest("hex");
function openWorkbench(root, set = schemas()) {
  const abs = resolve(root);
  let isDir = false;
  try {
    isDir = statSync(abs).isDirectory();
  } catch {
    isDir = false;
  }
  if (!isDir) return err("unknown-scope", "workbench-missing", `${abs} is not a directory`);
  const manifestPath = join2(abs, WORKBENCH_MANIFEST);
  if (!entryExists(manifestPath)) return { ok: true, value: { root: abs, state: "legacy", id: null, manifest: null, diagnosis: null } };
  const unsupported = (diagnosis, manifest2) => ({
    ok: true,
    value: { root: abs, state: "unsupported", id: null, manifest: manifest2, diagnosis }
  });
  const regular = isRegularFile(manifestPath);
  if (!regular.ok) {
    return unsupported({ class: "schema-invalid", reason: "manifest-unreadable", detail: `${WORKBENCH_MANIFEST} in ${abs} cannot be examined (${regular.code})` }, null);
  }
  if (!regular.value) {
    return unsupported({ class: "schema-invalid", reason: "manifest-not-a-file", detail: `${WORKBENCH_MANIFEST} in ${abs} is not a regular file` }, null);
  }
  const parsed = strictParse(readFileSync2(manifestPath));
  if (!parsed.ok) return unsupported({ class: "schema-invalid", reason: parsed.reason, detail: `${WORKBENCH_MANIFEST}: ${parsed.detail}` }, null);
  const manifest = parsed.value;
  const schema = manifest.schema;
  if (schema !== WORKBENCH_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length)) {
    return unsupported(
      { class: "unsupported-format", reason: "unknown-schema", detail: `${WORKBENCH_MANIFEST} declares schema ${JSON.stringify(schema)}; this codec reads fusion.workbench/v1` },
      manifest
    );
  }
  const v = set.validate(WORKBENCH_SCHEMA_ID, manifest);
  if (!v.ok) {
    if (v.class === "unsupported-format") return unsupported({ class: "unsupported-format", reason: "unknown-schema", detail: `no schema ${v.schemaId} loaded` }, manifest);
    return unsupported({ class: "schema-invalid", reason: "manifest-invalid", detail: describeErrors(v.errors), errors: v.errors }, manifest);
  }
  const features = manifest.required_features;
  const unknown = features.filter((f) => !SUPPORTED_FEATURES.includes(f));
  if (unknown.length > 0) {
    return unsupported(
      { class: "unsupported-format", reason: "unknown-feature", detail: `${WORKBENCH_MANIFEST} requires ${unknown.join(", ")}; this codec supports ${SUPPORTED_FEATURES.join(", ")}` },
      manifest
    );
  }
  return { ok: true, value: { root: abs, state: "json-control", id: manifest.id, manifest, diagnosis: null } };
}
function entryExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch (e) {
    if (e.code === "ENOENT") return false;
    throw e;
  }
}
function isRegularFile(path) {
  try {
    return { ok: true, value: statSync(path).isFile() };
  } catch (e) {
    const code = e.code;
    if (code === "ENOENT") return { ok: true, value: false };
    return { ok: false, code: code ?? "an error without a code" };
  }
}
var describeErrors = (errors) => errors.map((e) => `${e.instancePath || "/"} ${e.keyword}: ${e.message}`).join("; ");
function resolveInside(wb, path) {
  if (path.length === 0 || isAbsolute(path) || path.includes("\\")) return err("unknown-scope", "path-not-relative", `${JSON.stringify(path)} is not a workbench-relative path`);
  const abs = resolve(wb.root, path);
  const rel = relative(wb.root, abs);
  if (rel.length === 0 || rel.startsWith("..") || isAbsolute(rel)) return err("unknown-scope", "path-outside-workbench", `${path} leaves ${wb.root}`);
  return { ok: true, value: abs };
}
var ARCHIVE_DIR = "archive";
var within = (parent, child) => {
  const rel = relative(parent, child);
  return rel.length === 0 || !rel.startsWith("..") && !isAbsolute(rel);
};
function realAncestor(abs) {
  for (let probe = abs; ; probe = dirname(probe)) {
    try {
      return realpathSync(probe);
    } catch {
      if (dirname(probe) === probe) return probe;
    }
  }
}
function archived(wb, path) {
  const abs = resolve(wb.root, path);
  const rel = relative(wb.root, abs).split("\\").join("/");
  if (rel === ARCHIVE_DIR || rel.startsWith(`${ARCHIVE_DIR}/`)) return true;
  const archive = join2(wb.root, ARCHIVE_DIR);
  const realArchive = existsSync(archive) ? realAncestor(archive) : join2(realAncestor(wb.root), ARCHIVE_DIR);
  return within(realArchive, realAncestor(abs));
}
function resolveCurrent(wb, path, role) {
  const abs = resolveInside(wb, path);
  if (!abs.ok || !archived(wb, path)) return abs;
  const where = `${path} lies in ${ARCHIVE_DIR}/ of ${wb.root}, outside the current record store`;
  if (role === "record") return err("unresolved-reference", "record-not-found", `${where}; an archived record is not a current record`);
  return err("unknown-scope", "archived-path", `${where}; ${ARCHIVE_DIR}/ is historical storage and no current scope`);
}
var KINDS = ["package", "issue", "plan", "discussion", "decision", "evidence"];
var RECORD_KINDS = ["issue", "plan", "discussion", "decision"];
var EVIDENCE_SCHEMA_ID = "urn:fusion:schema:fusion.evidence/v1";
function readPair(wb, path, set = schemas()) {
  const abs = resolveCurrent(wb, path, "record");
  if (!abs.ok) return abs;
  let bytes;
  try {
    bytes = readFileSync2(abs.value);
  } catch (e) {
    if (e.code === "ENOENT") return err("unresolved-reference", "record-not-found", `${path} does not exist in ${wb.root}`);
    throw e;
  }
  const parsed = strictParse(bytes);
  if (!parsed.ok) return err("schema-invalid", parsed.reason, `${path}: ${parsed.detail}`);
  const control = parsed.value;
  const schemaField2 = control.schema;
  if (typeof schemaField2 !== "string") return err("schema-invalid", "schema-field-missing", `${path}: no string "schema" field`);
  const schemaId = SCHEMA_ID_PREFIX + schemaField2;
  if (set.document(schemaId) === void 0) return err("unsupported-format", "unknown-schema", `${path} declares ${schemaField2}; loaded: ${set.ids().join(", ")}`);
  const kind = kindOf(schemaId, control);
  if (kind === null) return err("unsupported-format", "not-a-pair-kind", `${path} declares ${schemaField2}${schemaId === RECORD_SCHEMA_ID ? ` with kind ${JSON.stringify(control.kind)}` : ""}; a control file is a package, an issue, plan, discussion or decision record, or an evidence record`);
  const evidence = kind === "evidence";
  return {
    ok: true,
    value: { path, kind, schemaId, control, bytes, revision: revisionOf(bytes), narrative: evidence ? null : narrativeOf(wb, control), report: evidence ? reportOf(wb, control) : null }
  };
}
function kindOf(schemaId, control) {
  if (schemaId === PACKAGE_SCHEMA_ID) return "package";
  if (schemaId === EVIDENCE_SCHEMA_ID) return "evidence";
  if (schemaId === RECORD_SCHEMA_ID && typeof control.kind === "string" && RECORD_KINDS.includes(control.kind)) return control.kind;
  return null;
}
function storedHash(wb, path) {
  const abs = resolveInside(wb, path);
  if (!abs.ok || !existsSync(abs.value) || !statSync(abs.value).isFile()) return null;
  return revisionOf(readFileSync2(abs.value));
}
function narrativeOf(wb, control) {
  const n = control.narrative;
  if (!isObject(n) || typeof n.path !== "string") return null;
  const abs = resolveInside(wb, n.path);
  if (!abs.ok || !existsSync(abs.value)) return { path: n.path, sha256: null };
  return { path: n.path, sha256: revisionOf(readFileSync2(abs.value)) };
}
function reportOf(wb, control) {
  const r = control.report;
  if (!isObject(r) || typeof r.path !== "string") return null;
  return { path: r.path, sha256: typeof r.sha256 === "string" ? r.sha256 : null, stored: storedHash(wb, r.path) };
}
var EVIDENCE_SUFFIX = ".evidence.json";
var EVIDENCE_NAME = /^(.*?)(?:\.([2-9]|[1-9][0-9]+))?\.evidence\.json$/;
function evidenceName(path) {
  const slash = path.lastIndexOf("/");
  const dir = slash < 0 ? "" : path.slice(0, slash + 1);
  const m = EVIDENCE_NAME.exec(path.slice(slash + 1));
  if (m === null) return null;
  const basename2 = m[1];
  return { basename: basename2, correction: m[2] === void 0 ? null : Number(m[2]), report: `${dir}${basename2}.md` };
}
function evidenceNaming(pair) {
  const name = evidenceName(pair.path);
  const named = pair.report?.path ?? null;
  if (name !== null && named === name.report) return null;
  const form = name === null ? `${pair.path} is not named <basename>${EVIDENCE_SUFFIX}` : `${pair.path} pairs with ${name.report}`;
  return { class: "unknown-scope", reason: "report-not-neighbour", detail: `${form}; its report.path names ${named === null ? "no path" : named}` };
}
function reportProblem(pair) {
  const report = pair.report;
  if (report === null) return { class: "unresolved-reference", reason: "report-missing", detail: `${pair.path} names no report path` };
  if (report.stored === null) return { class: "unresolved-reference", reason: "report-missing", detail: `the report ${report.path} does not exist` };
  if (report.stored !== report.sha256) return { class: "missing-evidence", reason: "report-changed", detail: `the report ${report.path} is ${report.stored}; the evidence record names ${String(report.sha256)}` };
  return null;
}
var isControlFile = (name) => name === "package.json" || name.endsWith(".record.json") || name.endsWith(EVIDENCE_SUFFIX);
function controlFiles(wb, dir) {
  const out = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync2(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const abs = join2(d, e.name);
      const rel = relative(wb.root, abs).split("\\").join("/");
      if (e.isDirectory()) {
        if (!archived(wb, rel)) walk(abs);
      } else if (e.isFile() && isControlFile(e.name)) out.push(rel);
    }
  };
  walk(dir);
  return out.sort();
}
function serialise(value, set = schemas()) {
  if (!isObject(value) || typeof value.schema !== "string") throw new Error("a control record is an object with a string schema field");
  const schemaId = SCHEMA_ID_PREFIX + value.schema;
  const doc = set.document(schemaId);
  if (doc === void 0) throw new Error(`no schema ${schemaId} loaded`);
  const ordered = order(value, { node: doc, base: schemaId }, set);
  return JSON.stringify(ordered, null, 2) + "\n";
}
function order(value, at, set) {
  if (Array.isArray(value)) {
    const items = merged(at, value, set).items;
    return value.map((v) => items === void 0 ? v : order(v, items, set));
  }
  if (!isObject(value)) return value;
  const { properties } = merged(at, value, set);
  const out = {};
  for (const [key, node] of properties) {
    if (key in value) out[key] = order(value[key], node, set);
  }
  for (const key of Object.keys(value)) {
    if (!(key in out)) out[key] = value[key];
  }
  return out;
}
function merged(at, value, set) {
  const result = { properties: /* @__PURE__ */ new Map(), items: void 0 };
  const visit = (loc) => {
    const resolved = deref(loc, set);
    const node = resolved.node;
    if (!isObject(node)) return;
    if (isObject(node.properties)) {
      for (const key of Object.keys(node.properties)) {
        if (!result.properties.has(key)) result.properties.set(key, { node: node.properties[key], base: resolved.base });
      }
    }
    if (node.items !== void 0 && result.items === void 0) result.items = { node: node.items, base: resolved.base };
    if (Array.isArray(node.allOf)) for (const member of node.allOf) visit({ node: member, base: resolved.base });
    for (const key of ["oneOf", "anyOf"]) {
      const branches = node[key];
      if (!Array.isArray(branches)) continue;
      const match = branches.find((b) => matches(deref({ node: b, base: resolved.base }, set), value, set));
      if (match !== void 0) visit({ node: match, base: resolved.base });
    }
  };
  visit(at);
  return result;
}
function matches(loc, value, set) {
  const node = loc.node;
  if (!isObject(node)) return false;
  const types = Array.isArray(node.type) ? node.type : typeof node.type === "string" ? [node.type] : null;
  const actual = jsonType(value);
  if (types !== null && !types.some((t) => t === actual || t === "number" && actual === "integer")) return false;
  if (types === null && (node.$ref !== void 0 || Array.isArray(node.allOf))) {
    const inner = merged(loc, value, set);
    if (inner.properties.size > 0 && actual !== "object") return false;
  }
  if (isObject(value)) {
    const required = Array.isArray(node.required) ? node.required : [];
    if (!required.every((k) => typeof k === "string" && k in value)) return false;
    if (isObject(node.properties)) {
      for (const [k, p] of Object.entries(node.properties)) {
        if (isObject(p) && "const" in p && k in value && value[k] !== p.const) return false;
      }
    }
    if (Array.isArray(node.allOf)) {
      for (const member of node.allOf) if (!matches(deref({ node: member, base: loc.base }, set), value, set)) return false;
    }
  }
  if (typeof value === "string" && typeof node.pattern === "string" && !new RegExp(node.pattern).test(value)) return false;
  return true;
}
function jsonType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
  return typeof value;
}
function deref(loc, set) {
  let current2 = loc;
  for (let hops = 0; hops < 32; hops++) {
    const node = current2.node;
    if (!isObject(node) || typeof node.$ref !== "string") return current2;
    const [docPart, pointer = ""] = node.$ref.split("#", 2);
    const base = docPart.length > 0 ? docPart : current2.base;
    const doc = set.document(base);
    if (doc === void 0) throw new Error(`$ref ${node.$ref} names a schema that is not loaded`);
    let target = doc;
    for (const seg of pointer.split("/").filter((s) => s.length > 0)) {
      const key = seg.replace(/~1/g, "/").replace(/~0/g, "~");
      target = isObject(target) ? target[key] : void 0;
    }
    if (target === void 0) throw new Error(`$ref ${node.$ref} does not resolve`);
    current2 = { node: target, base };
  }
  throw new Error("$ref chain longer than 32 hops");
}
var tempBeside = (target) => join2(dirname(target), `.${basename(target)}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`);
var TEMP_NAME = /^\.(.+)\.[0-9]+\.[0-9a-f]{8}\.tmp$/;
function writeAll(fd, bytes) {
  let offset = 0;
  while (offset < bytes.byteLength) offset += writeSync(fd, bytes, offset, bytes.byteLength - offset);
}
function writeDurably(path, bytes) {
  const fd = openSync(path, "wx", 420);
  try {
    writeAll(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
function fsyncDirectory(dir) {
  try {
    const dfd = openSync(dir, "r");
    try {
      fsyncSync(dfd);
    } finally {
      closeSync(dfd);
    }
  } catch {
  }
}
function replaceAtomically(target, bytes) {
  const temp = tempBeside(target);
  writeDurably(temp, bytes);
  try {
    renameSync(temp, target);
  } catch (e) {
    unlinkQuietly(temp);
    throw e;
  }
  fsyncDirectory(dirname(target));
}
function linkComplete(target, bytes) {
  for (; ; ) {
    const temp = tempBeside(target);
    writeDurably(temp, bytes);
    try {
      linkSync(temp, target);
      fsyncDirectory(dirname(target));
      return true;
    } catch (e) {
      const code = e.code;
      if (code === "EEXIST") return false;
      if (code !== "ENOENT") throw e;
    } finally {
      unlinkQuietly(temp);
    }
  }
}
function unlinkQuietly(path) {
  try {
    unlinkSync(path);
  } catch {
  }
}
function unlinkIfHolds(path, bytes) {
  try {
    if (readFileSync2(path).equals(bytes)) unlinkSync(path);
  } catch {
  }
}
var SELF_IGNORE = "*\n";
var SELF_IGNORE_FILE = ".gitignore";
function ensureSelfIgnore(wb) {
  const dir = join2(wb.root, STATE_DIR);
  mkdirSync(dir, { recursive: true });
  const file = join2(dir, SELF_IGNORE_FILE);
  let current2;
  try {
    current2 = readFileSync2(file);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    current2 = null;
  }
  const wanted = Buffer.from(SELF_IGNORE, "utf-8");
  if (current2 === null) linkComplete(file, wanted);
  else if (!current2.equals(wanted)) replaceAtomically(file, wanted);
}
var LOCK_FILE = "write.lock";
var TAKEOVER_INFIX = ".takeover.";
var held = /* @__PURE__ */ new Map();
var exitHookInstalled = false;
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var hexOf = (bytes) => createHash("sha256").update(bytes).digest("hex");
var lockPathFor = (wb) => join2(wb.root, STATE_DIR, LOCK_FILE);
function lockContent(now) {
  return Buffer.from(`pid: ${process.pid}
host: ${hostname()}
nonce: ${randomBytes(8).toString("hex")}
acquired_at: ${new Date(now()).toISOString()}
`, "utf-8");
}
function judge(path, nowMs) {
  let bytes;
  let mtimeMs;
  try {
    const fd = openSync(path, "r");
    try {
      mtimeMs = fstatSync(fd).mtimeMs;
      bytes = readFileSync2(fd);
    } finally {
      closeSync(fd);
    }
  } catch (e) {
    if (e.code === "ENOENT") return { state: "gone" };
    throw e;
  }
  const text = bytes.toString("utf-8");
  const host = /^host: (.*)$/m.exec(text)?.[1];
  if (host !== void 0 && host !== hostname()) return { state: "live", bytes };
  const pidMatch = /^pid: ([0-9]+)$/m.exec(text);
  const pid = pidMatch === null ? null : Number(pidMatch[1]);
  if (pid !== null && Number.isSafeInteger(pid) && pid > 0) return { state: alive(pid) ? "live" : "stale", bytes };
  return { state: nowMs - mtimeMs >= LOCK_STALE_MS ? "stale" : "live", bytes };
}
function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code !== "ESRCH";
  }
}
function takeOver(path, stale, own, now, depth = 0) {
  if (depth > 4) return false;
  const claim = `${path}${TAKEOVER_INFIX}${hexOf(stale)}`;
  const claimBytes = lockContent(now);
  if (!linkComplete(claim, claimBytes)) {
    const j = judge(claim, now());
    if (j.state !== "stale") return false;
    if (!takeOver(claim, j.bytes, claimBytes, now, depth + 1)) return false;
  }
  try {
    let current2;
    try {
      current2 = readFileSync2(path);
    } catch {
      return false;
    }
    if (!current2.equals(stale)) return false;
    const temp = tempBeside(path);
    writeDurably(temp, own);
    try {
      renameSync(temp, path);
    } catch (e) {
      unlinkQuietly(temp);
      throw e;
    }
    fsyncDirectory(dirname(path));
    return true;
  } finally {
    unlinkIfHolds(claim, claimBytes);
  }
}
async function acquireLock(wb, options = {}) {
  ensureSelfIgnore(wb);
  const lock = lockPathFor(wb);
  const now = options.now ?? Date.now;
  const waitMs = options.waitMs ?? LOCK_STALE_MS + 5e3;
  const pollMs = options.pollMs ?? 50;
  const started = now();
  for (; ; ) {
    const own = lockContent(now);
    if (linkComplete(lock, own)) return hold(lock, own, now());
    const j = judge(lock, now());
    if (j.state === "gone") continue;
    if (j.state === "stale") {
      await options.lockHooks?.afterJudge?.({ path: lock, bytes: j.bytes });
      const mine = lockContent(now);
      if (takeOver(lock, j.bytes, mine, now)) return hold(lock, mine, now());
    }
    if (now() - started >= waitMs) {
      return err("conflict", "lock-timeout", `the workbench write lock ${STATE_DIR}/${LOCK_FILE} is held by another writer (${describeHolder(lock)}) and was not released within ${waitMs} ms`);
    }
    await sleep(pollMs);
  }
}
function hold(lock, bytes, nowMs) {
  held.set(lock, bytes);
  installExitHook();
  const dir = dirname(lock);
  const ownClaim = `${LOCK_FILE}${TAKEOVER_INFIX}${hexOf(bytes)}`;
  for (const name of readdirSync2(dir)) {
    const abs = join2(dir, name);
    if (name.startsWith(`${LOCK_FILE}${TAKEOVER_INFIX}`) && !name.startsWith(ownClaim)) {
      unlinkQuietly(abs);
    } else if (name.startsWith(".") && name.endsWith(".tmp")) {
      try {
        const st = statSync(abs);
        if (st.isFile() && nowMs - st.mtimeMs >= LOCK_STALE_MS) unlinkQuietly(abs);
      } catch {
      }
    }
  }
  return { ok: true, value: { path: lock, bytes } };
}
function releaseLock(lock) {
  held.delete(lock.path);
  unlinkIfHolds(lock.path, lock.bytes);
}
function installExitHook() {
  if (exitHookInstalled) return;
  exitHookInstalled = true;
  process.on("exit", () => {
    for (const [lock, bytes] of held) unlinkIfHolds(lock, bytes);
  });
}
function lockProtocolOwns(stateDir, name) {
  const owned = (n) => n === LOCK_FILE || n.startsWith(`${LOCK_FILE}${TAKEOVER_INFIX}`);
  if (owned(name)) return true;
  const temp = TEMP_NAME.exec(name)?.[1];
  if (temp !== void 0) return owned(temp) || temp === SELF_IGNORE_FILE;
  if (name !== SELF_IGNORE_FILE) return false;
  try {
    return readFileSync2(join2(stateDir, name)).equals(Buffer.from(SELF_IGNORE, "utf-8"));
  } catch {
    return false;
  }
}
var MAINTENANCE_FILE = "maintenance.json";
var fencePathFor = (wb) => join2(wb.root, STATE_DIR, MAINTENANCE_FILE);
function readFence(wb) {
  const rel = `${STATE_DIR}/${MAINTENANCE_FILE}`;
  const unreadable = (why) => err("operation-unknown", "maintenance-unreadable", `${rel} stands and cannot be read as a fence (${why}); it fences every fresh mutation; remove it only once a trustworthy move inventory is recovered, or a known complete state verified, under the fence, else leave it and normal work blocked`);
  const path = fencePathFor(wb);
  try {
    lstatSync(path);
  } catch (e) {
    const code = e.code;
    if (code === "ENOENT") return { ok: true, value: null };
    return unreadable(code ?? "an error without a code");
  }
  const regular = isRegularFile(path);
  if (!regular.ok) return unreadable(regular.code);
  if (!regular.value) return unreadable("not a regular file, or a link to none");
  let bytes;
  try {
    bytes = readFileSync2(path);
  } catch (e) {
    return unreadable(e.code ?? "an error without a code");
  }
  const parsed = strictParse(bytes);
  if (!parsed.ok) return unreadable(`${parsed.reason}: ${parsed.detail}`);
  const v = parsed.value;
  if (!isObject(v) || Object.keys(v).sort().join(",") !== "operation_id,since" || typeof v.operation_id !== "string" || typeof v.since !== "string") {
    return unreadable("not exactly {operation_id, since}, two strings");
  }
  return { ok: true, value: { operation_id: v.operation_id, since: v.since } };
}
function writeFence(wb, fence) {
  replaceAtomically(fencePathFor(wb), Buffer.from(JSON.stringify({ operation_id: fence.operation_id, since: fence.since }, null, 2) + "\n", "utf-8"));
}
function removeFence(wb) {
  unlinkSync(fencePathFor(wb));
  fsyncDirectory(join2(wb.root, STATE_DIR));
}
function describeHolder(lock) {
  try {
    const text = readFileSync2(lock, "utf-8").trim();
    const fields = text.length === 0 ? "records nothing" : text.split("\n").join(", ");
    return /^host: /m.test(text) ? fields : `${fields}, no host recorded: read as ${hostname()}`;
  } catch {
    return "holder unknown";
  }
}

// src/journal.ts
var JOURNAL_DIR = "journal";
var OPS_DIR = "ops";
var INTENT_FILE = "intent.json";
var REMOVAL_OP = "migration";
var REMOVAL_PHASE = "rollback";
var err2 = (cls, reason, detail) => ({ ok: false, error: { class: cls, reason, detail } });
var isObject2 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var SHA256 = /^sha256:[0-9a-f]{64}$/;
var OPERATION_ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
var journalDir = (wb) => join3(wb.root, STATE_DIR, JOURNAL_DIR);
var opsDir = (wb) => join3(wb.root, STATE_DIR, OPS_DIR);
var answerPath = (wb, id) => join3(opsDir(wb), `${id}.json`);
var intentDir = (wb, id) => join3(journalDir(wb), id);
var stagedName = (hash) => hash.slice("sha256:".length);
var nonce = () => `${process.pid}.${randomBytes2(4).toString("hex")}`;
function checkId(id) {
  if (!OPERATION_ID.test(id)) throw new Error(`operation id ${JSON.stringify(id)} cannot name a journal entry`);
}
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
var requestDigest = (req) => revisionOf(Buffer.from(canonical(req), "utf-8"));
function commitIntent(wb, intent, contents) {
  checkId(intent.operation_id);
  const malformed = removalProblem(intent);
  if (malformed !== null) throw new Error(`the intent of ${intent.operation_id} is malformed: ${malformed}`);
  const staged = /* @__PURE__ */ new Map();
  for (const w of intent.writes) {
    const inside = resolveInside(wb, w.path);
    if (!inside.ok) return inside;
    if (w.after === null) continue;
    const bytes = contents.get(w.path);
    if (bytes === void 0 || revisionOf(bytes) !== w.after) throw new Error(`the post-bytes given for ${w.path} do not hash to ${w.after}`);
    if (bytes.byteLength > MAX_RECORD_BYTES) {
      return err2("schema-invalid", "too-large", `${w.path}: ${bytes.byteLength} bytes after the operation; the strict reader's cap is ${MAX_RECORD_BYTES} bytes (1 MiB), so it could not be read back`);
    }
    staged.set(stagedName(w.after), bytes);
  }
  const intentBytes = Buffer.from(JSON.stringify(intent, null, 2) + "\n", "utf-8");
  if (intentBytes.byteLength > MAX_RECORD_BYTES) {
    return err2("schema-invalid", "too-large", `the intent of ${intent.operation_id} is ${intentBytes.byteLength} bytes; the strict reader's cap is ${MAX_RECORD_BYTES} bytes (1 MiB)`);
  }
  const dir = journalDir(wb);
  mkdirSync2(dir, { recursive: true });
  const target = intentDir(wb, intent.operation_id);
  if (existsSync2(target)) return err2("conflict", "intent-exists", `${STATE_DIR}/${JOURNAL_DIR}/${intent.operation_id} is already a pending intent; it is never replaced`);
  const temp = join3(dir, `.${intent.operation_id}.${nonce()}.tmp`);
  mkdirSync2(temp);
  try {
    writeDurably(join3(temp, INTENT_FILE), intentBytes);
    for (const [name, bytes] of staged) writeDurably(join3(temp, name), bytes);
    fsyncDirectory(temp);
    renameSync2(temp, target);
  } catch (e) {
    rmSync2(temp, { recursive: true, force: true });
    throw e;
  }
  fsyncDirectory(dir);
  return { ok: true, value: void 0 };
}
function removeIntent(wb, id) {
  checkId(id);
  const dir = journalDir(wb);
  const gone = join3(dir, `.${id}.${nonce()}.done`);
  renameSync2(intentDir(wb, id), gone);
  fsyncDirectory(dir);
  rmSync2(gone, { recursive: true, force: true });
}
function sweep(wb) {
  const removed = [];
  for (const dir of [journalDir(wb), opsDir(wb)]) {
    let names;
    try {
      names = readdirSync3(dir);
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
    for (const name of names.filter((n) => n.startsWith(".")).sort()) {
      rmSync2(join3(dir, name), { recursive: true, force: true });
      removed.push(relative2(wb.root, join3(dir, name)).split("\\").join("/"));
    }
  }
  return removed;
}
function pendingIds(wb) {
  try {
    return readdirSync3(journalDir(wb)).filter((n) => !n.startsWith(".")).sort();
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
function isEntry(v) {
  return isObject2(v) && typeof v.path === "string" && (v.before === null || typeof v.before === "string" && SHA256.test(v.before)) && (v.after === null || typeof v.after === "string" && SHA256.test(v.after));
}
function removalProblem(intent) {
  for (const w of intent.writes) {
    if (w.after !== null) continue;
    if (w.before === null) return `${w.path} is written from null to null`;
    if (intent.op !== REMOVAL_OP || intent.phase !== REMOVAL_PHASE) return `${w.path} is removed by an intent of ${intent.op}${intent.phase === void 0 ? "" : ` ${intent.phase}`}; only ${REMOVAL_OP} ${REMOVAL_PHASE} removes a file`;
  }
  return null;
}
function isIntent(v) {
  return isObject2(v) && typeof v.operation_id === "string" && typeof v.op === "string" && (v.phase === void 0 || typeof v.phase === "string") && typeof v.request_digest === "string" && SHA256.test(v.request_digest) && Array.isArray(v.writes) && v.writes.every(isEntry) && isObject2(v.response) && typeof v.created_at === "string";
}
function readIntents(wb) {
  const out = [];
  for (const name of pendingIds(wb)) {
    const one = readIntent(wb, name);
    if (!one.ok) return one;
    if (one.value !== null) out.push(one.value);
  }
  return { ok: true, value: out };
}
function readIntent(wb, name) {
  const rel = `${STATE_DIR}/${JOURNAL_DIR}/${name}`;
  const unreadable = (why) => err2("conflict", "journal-unreadable", `${rel}: ${why}`);
  const abs = join3(journalDir(wb), name);
  try {
    if (!statSync2(abs).isDirectory()) return unreadable("not an intent directory");
  } catch (e) {
    if (e.code === "ENOENT") return { ok: true, value: null };
    throw e;
  }
  let intentBytes;
  try {
    intentBytes = readFileSync3(join3(abs, INTENT_FILE));
  } catch (e) {
    if (e.code === "ENOENT") return unreadable(`${INTENT_FILE} is missing`);
    throw e;
  }
  const parsed = strictParse(intentBytes);
  if (!parsed.ok) return unreadable(`${INTENT_FILE}: ${parsed.reason}: ${parsed.detail}`);
  const intent = parsed.value;
  if (!isIntent(intent)) return unreadable(`${INTENT_FILE} is not an intent`);
  if (intent.operation_id !== name) return unreadable(`${INTENT_FILE} names operation ${intent.operation_id}`);
  const malformed = removalProblem(intent);
  if (malformed !== null) return unreadable(malformed);
  const contents = /* @__PURE__ */ new Map();
  for (const w of intent.writes) {
    if (!resolveInside(wb, w.path).ok) return unreadable(`a write names ${JSON.stringify(w.path)}, which is not inside the workbench`);
    if (w.after === null) continue;
    const staged = stagedName(w.after);
    const file = join3(abs, staged);
    let size;
    try {
      size = statSync2(file).size;
    } catch (e) {
      if (e.code === "ENOENT") return unreadable(`the staged post-bytes ${staged} of ${w.path} are missing`);
      throw e;
    }
    if (size > MAX_RECORD_BYTES) return unreadable(`the staged post-bytes ${staged} are ${size} bytes, over the ${MAX_RECORD_BYTES}-byte cap`);
    let bytes;
    try {
      bytes = readFileSync3(file);
    } catch (e) {
      if (e.code === "ENOENT") return unreadable(`the staged post-bytes ${staged} of ${w.path} are missing`);
      throw e;
    }
    if (revisionOf(bytes) !== w.after) return unreadable(`the staged file ${staged} does not hash to its name`);
    contents.set(w.path, bytes);
  }
  return { ok: true, value: { intent, contents } };
}
function fileState(wb, write) {
  const abs = resolveInside(wb, write.path);
  if (!abs.ok) throw new Error(`${write.path}: ${abs.error.detail}`);
  if (write.after === null) return removalState(abs.value, write.before);
  let hash;
  try {
    hash = revisionOf(readFileSync3(abs.value));
  } catch (e) {
    const code = e.code;
    if (code === "EISDIR") return "diverged";
    if (code !== "ENOENT") throw e;
    hash = null;
  }
  if (hash !== null && hash === write.after) return "post";
  if (hash === write.before) return "pre";
  return "diverged";
}
function removalState(abs, before) {
  try {
    if (!lstatSync2(abs).isFile()) return "diverged";
  } catch (e) {
    if (e.code === "ENOENT") return "post";
    throw e;
  }
  return revisionOf(readFileSync3(abs)) === before ? "pre" : "diverged";
}
function applyWrites(wb, writes, contents) {
  for (const w of writes) {
    const abs = resolveInside(wb, w.path);
    if (!abs.ok) throw new Error(`${w.path}: ${abs.error.detail}`);
    if (w.after === null) {
      try {
        unlinkSync2(abs.value);
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
      fsyncDirectory(dirname2(abs.value));
      continue;
    }
    const bytes = contents.get(w.path);
    if (bytes === void 0) throw new Error(`no post-bytes for ${w.path}`);
    mkdirSync2(dirname2(abs.value), { recursive: true });
    replaceAtomically(abs.value, bytes);
  }
}
function recover(wb, pending) {
  const { intent, contents } = pending;
  const states = intent.writes.map((w) => ({ w, state: fileState(wb, w) }));
  const blocked = states.filter((s) => s.state === "diverged").map((s) => s.w);
  if (blocked.length > 0) return { landed: false, blocked };
  applyWrites(
    wb,
    states.filter((s) => s.state === "pre").map((s) => s.w),
    contents
  );
  if (!existsSync2(answerPath(wb, intent.operation_id))) {
    writeAnswer(wb, { operation_id: intent.operation_id, op: intent.op, request_digest: intent.request_digest, response: intent.response });
  }
  removeIntent(wb, intent.operation_id);
  return { landed: true };
}
function writeAnswer(wb, answer) {
  checkId(answer.operation_id);
  mkdirSync2(opsDir(wb), { recursive: true });
  replaceAtomically(answerPath(wb, answer.operation_id), Buffer.from(JSON.stringify(answer, null, 2) + "\n", "utf-8"));
}
function readAnswer(wb, id) {
  checkId(id);
  const file = answerPath(wb, id);
  if (!existsSync2(file)) return { ok: true, value: null };
  const rel = relative2(wb.root, file);
  const parsed = strictParse(readFileSync3(file));
  if (!parsed.ok) return err2("conflict", "operation-record-unreadable", `${rel}: ${parsed.reason}: ${parsed.detail}`);
  const v = parsed.value;
  if (isObject2(v) && isObject2(v.response) && typeof v.request_digest === "string" && typeof v.op === "string") {
    return { ok: true, value: { operation_id: id, op: v.op, request_digest: v.request_digest, response: v.response } };
  }
  if (isObject2(v) && isObject2(v.response) && isObject2(v.request)) {
    return { ok: true, value: { operation_id: id, op: String(v.request.op), request_digest: requestDigest(v.request), response: v.response } };
  }
  return err2("conflict", "operation-record-unreadable", `${rel}: neither a stored answer nor FJ01's {operation_id, request, response}`);
}
function replayAnswer(wb, req) {
  const stored2 = readAnswer(wb, req.operation_id);
  if (!stored2.ok) return stored2;
  if (stored2.value === null) return { ok: true, value: null };
  if (stored2.value.request_digest !== requestDigest(req)) {
    return err2("conflict", "operation-id-reused", `operation_id ${req.operation_id} was already used for a different request`);
  }
  return { ok: true, value: stored2.value.response };
}

// src/migration.ts
import { existsSync as existsSync3, lstatSync as lstatSync3, readdirSync as readdirSync4, readFileSync as readFileSync4, readlinkSync } from "node:fs";
import { dirname as dirname3, join as join4 } from "node:path";
var PLAN_SCHEMA_ID = "urn:fusion:schema:fusion.migration-plan/v1";
var PROPOSAL_SCHEMA_ID = "urn:fusion:schema:fusion.migration-proposal/v1";
var RECEIPT_SCHEMA_ID = "urn:fusion:schema:fusion.migration-receipt/v1";
var MIGRATIONS_DIR = `${ARCHIVE_DIR}/migrations`;
var PROPOSAL_DIR = `${STATE_DIR}/migration`;
var PROPOSAL_CAP = 16 * MAX_RECORD_BYTES;
var ANSWER_CAP = 16 * MAX_RECORD_BYTES;
var CHUNK_WRITES = 50;
var FREEZE_MAX_FILES = 80;
var FREEZE_MAX_BYTES = 6 * MAX_RECORD_BYTES;
var PLAN_SCHEMA = PLAN_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length);
var NAMED = 5;
var PART_MARGIN = 64 * 1024;
var isObject3 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var refusal = (cls, reason, detail, errors) => ({
  ok: false,
  error: { class: cls, reason, detail, ...errors !== void 0 ? { errors } : {} }
});
var listed = (items) => items.slice(0, NAMED).join("; ") + (items.length > NAMED ? `; and ${items.length - NAMED} more` : "");
var plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
var bytewise = (a, b) => Buffer.compare(Buffer.from(a, "utf-8"), Buffer.from(b, "utf-8"));
var indexPath = (migrationId) => `${MIGRATIONS_DIR}/${migrationId}/plan.json`;
var chunkPath = (migrationId, n) => `${MIGRATIONS_DIR}/${migrationId}/chunks/${n}.json`;
var partPath = (migrationId, kind, n) => `${MIGRATIONS_DIR}/${migrationId}/parts/${kind}-${n}.json`;
var originalPath = (migrationId, narrative) => `${MIGRATIONS_DIR}/${migrationId}/originals/${narrative}`;
function inventory(root, skip) {
  const out = [];
  const walk = (dir, rel) => {
    for (const name of readdirSync4(dir)) {
      const path = rel === "" ? name : `${rel}/${name}`;
      const abs = join4(dir, name);
      let st;
      try {
        st = lstatSync3(abs);
      } catch (e) {
        if (e.code === "ENOENT") continue;
        throw e;
      }
      const kind = st.isSymbolicLink() ? "link" : st.isDirectory() ? "directory" : st.isFile() ? "file" : "other";
      if (skip(path, kind)) continue;
      if (kind === "link") out.push({ path, kind, target: readlinkSync(abs) });
      else if (kind === "directory") {
        out.push({ path, kind });
        walk(abs, path);
      } else if (kind === "file") {
        const bytes = readFileSync4(abs);
        out.push({ path, kind, size: bytes.byteLength, sha256: revisionOf(bytes) });
      } else out.push({ path, kind });
    }
  };
  walk(root, "");
  return out.sort((a, b) => bytewise(a.path, b.path));
}
var under = (path, dir) => path === dir || path.startsWith(`${dir}/`);
var EXCLUSION_ALLOWLIST = {
  ".session-marker": "file",
  ".checkout-id": "file",
  ".cadence-anchors": "file",
  ".check-stamps": "file",
  monitor: "file",
  "orchestrator-events.jsonl": "file",
  ".fusion-setup": "file",
  ".asset-provenance": "file",
  ".guard-state": "directory",
  ".commit-lock": "directory"
};
var excludedRoot = (selected, path, kind) => !path.includes("/") && selected.has(path) && EXCLUSION_ALLOWLIST[path] === kind;
var WHOLE_ALLOWLIST = new Set(Object.keys(EXCLUSION_ALLOWLIST));
function eligibleOf(entries, selected) {
  const skipped = entries.filter((e) => excludedRoot(selected, e.path, e.kind)).map((e) => e.path);
  return entries.filter((e) => !skipped.some((s) => under(e.path, s)));
}
function phaseOf(intent) {
  if (intent.op !== "migration") return null;
  if (intent.phase !== void 0) return intent.phase;
  const r = intent.response.ok ? intent.response.result : void 0;
  if (!isObject3(r)) return null;
  if ("schedule" in r || "no_op" in r) return "plan";
  if ("receipt" in r && "manifest" in r) return "verify";
  if ("restored" in r) return "rollback";
  if ("chunk" in r) return "apply";
  return null;
}
function localState(wb) {
  const unreadable = [];
  let present = true;
  try {
    lstatSync3(join4(wb.root, STATE_DIR));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    present = false;
  }
  const intents = [];
  let maintenance2 = null;
  if (present) {
    const journal = `${STATE_DIR}/${JOURNAL_DIR}`;
    let names = [];
    try {
      if (lstatSync3(journalDir(wb)).isDirectory()) names = readdirSync4(journalDir(wb)).filter((n) => !n.startsWith(".")).sort(bytewise);
      else unreadable.push({ path: journal, reason: "not-a-directory" });
    } catch (e) {
      if (e.code !== "ENOENT") unreadable.push({ path: journal, reason: e.code ?? "unreadable" });
    }
    for (const name of names) {
      const r = readIntent(wb, name);
      if (!r.ok) unreadable.push({ path: `${journal}/${name}`, reason: r.error.reason });
      else if (r.value !== null) intents.push({ operation_id: r.value.intent.operation_id, op: r.value.intent.op, phase: phaseOf(r.value.intent) });
    }
    const fence = readFence(wb);
    if (fence.ok) maintenance2 = fence.value;
    else unreadable.push({ path: `${STATE_DIR}/${MAINTENANCE_FILE}`, reason: fence.error.reason });
  }
  return { present, intents, maintenance: maintenance2, unreadable };
}
function survey(wb) {
  const entries = inventory(wb.root, (path) => path === STATE_DIR);
  const eligible_sha256 = inventoryDigest(eligibleOf(entries, WHOLE_ALLOWLIST));
  const response = { ok: true, result: { layout: wb.state, entries, eligible_sha256, local_state: localState(wb) } };
  const size = Buffer.byteLength(JSON.stringify(response), "utf-8") + 1;
  if (size > ANSWER_CAP) return { ok: false, error: { class: "schema-invalid", reason: "too-large", detail: `the survey of ${wb.root} is ${size} bytes with its LF; the answer channel carries at most ${ANSWER_CAP} (16 MiB), and an answer is never truncated` } };
  return response;
}
var invalid = (detail, errors) => refusal("schema-invalid", "proposal-invalid", detail, errors);
function proposalBytes(wb, path) {
  if (!path.startsWith(`${PROPOSAL_DIR}/`) || path.slice(PROPOSAL_DIR.length + 1).includes("/")) return invalid(`${path} is not a file directly under ${PROPOSAL_DIR}/`);
  const abs = resolveInside(wb, path);
  if (!abs.ok) return invalid(abs.error.detail);
  let size;
  try {
    const st = lstatSync3(abs.value);
    if (!st.isFile()) return invalid(`${path} is not a regular file`);
    size = st.size;
  } catch (e) {
    if (e.code === "ENOENT") return invalid(`${path} does not exist in ${wb.root}`);
    throw e;
  }
  if (size > PROPOSAL_CAP) return invalid(`${path} is ${size} bytes; a proposal is at most ${PROPOSAL_CAP} bytes (16 MiB)`);
  const bytes = readFileSync4(abs.value);
  if (bytes.byteLength > PROPOSAL_CAP) return invalid(`${path} grew to ${bytes.byteLength} bytes while it was read; a proposal is at most ${PROPOSAL_CAP} bytes (16 MiB)`);
  return { ok: true, value: bytes };
}
function boundProposal(wb, req) {
  const bytes = proposalBytes(wb, req.proposal.path);
  if (!bytes.ok) return bytes;
  const hash = revisionOf(bytes.value);
  if (hash !== req.proposal.sha256) return refusal("conflict", "source-changed", `${req.proposal.path} is ${hash}; the request binds ${req.proposal.sha256}`);
  return bytes;
}
function parseProposal(path, bytes) {
  const parsed = strictParse(bytes, PROPOSAL_CAP);
  if (!parsed.ok) return invalid(`${path}: ${parsed.reason}: ${parsed.detail}`);
  const v = validate(PROPOSAL_SCHEMA_ID, parsed.value);
  if (!v.ok) {
    if (v.class === "unsupported-format") return refusal("unsupported-format", "unknown-schema", `no schema ${v.schemaId}`);
    return invalid(`${path}: ${describeErrors(v.errors)}`, v.errors);
  }
  return { ok: true, value: parsed.value };
}
var TERMINAL_ROWS = ["package-terminal", "record-closure"];
var ROWS = { package_live: "package-live", package_terminal: "package-terminal", record_live: "record-live", record_closure: "record-closure" };
var firstSegment = (path) => path.split("/")[0];
function rangesAndExclusions(p, order2) {
  const problems = [];
  for (const id of order2) {
    const r = p.records[id];
    if (r.rewrite === null) continue;
    let end = 0;
    for (const d of r.rewrite.deletions) {
      if (d.offset < end) {
        problems.push(`${r.narrative}: the deletion at ${d.offset} overlaps or precedes the one before it, which ends at ${end}`);
        break;
      }
      end = d.offset + d.length;
    }
  }
  const touched = new Set(order2.flatMap((id) => [firstSegment(p.records[id].narrative), firstSegment(p.records[id].control_path)]));
  for (const ex of p.exclusions) {
    if (!Object.hasOwn(EXCLUSION_ALLOWLIST, ex)) problems.push(`the exclusion ${ex} is not on the codec's allowlist (${Object.keys(EXCLUSION_ALLOWLIST).join(", ")})`);
    else if (touched.has(ex)) problems.push(`the exclusion ${ex} holds a narrative or control path the plan reads or writes`);
  }
  return problems.length === 0 ? { ok: true, value: void 0 } : invalid(`${plural(problems.length, "problem")}: ${listed(problems)}`);
}
function structural(wb, p, order2) {
  const problems = [];
  const narratives = /* @__PURE__ */ new Set();
  const controls = /* @__PURE__ */ new Set();
  for (const id of order2) {
    const r = p.records[id];
    const at = `records/${id} (${r.narrative})`;
    const c = r.control;
    const isPackage = r.kind === "package";
    const schemaId = SCHEMA_ID_PREFIX + String(c.schema);
    if (isPackage !== r.row.startsWith("package-") || (isPackage ? schemaId !== PACKAGE_SCHEMA_ID : schemaId !== RECORD_SCHEMA_ID || c.kind !== r.kind)) {
      problems.push(`${at}: row ${r.row}, kind ${r.kind} and a control of ${String(c.schema)}${isPackage ? "" : ` kind ${String(c.kind)}`} do not agree`);
    }
    if (!isObject3(c.narrative) || c.narrative.path !== r.narrative) problems.push(`${at}: the control names the narrative ${JSON.stringify(isObject3(c.narrative) ? c.narrative.path : null)}`);
    const dir = dirname3(r.narrative);
    const stem = r.narrative.endsWith(".md") ? r.narrative.slice(dir.length + 1, -".md".length) : null;
    const pairControl = isPackage ? `${dir}/package.json` : stem === null ? null : `${dir}/${stem}.record.json`;
    if (dir === "." || pairControl !== r.control_path) problems.push(`${at}: the control path is ${r.control_path}; the pair's is ${pairControl ?? "none, the narrative is no .md file"}`);
    for (const path of [r.narrative, r.control_path]) {
      const inside = resolveInside(wb, path);
      if (!inside.ok) problems.push(`${at}: ${inside.error.detail}`);
      else if (archived(wb, path)) problems.push(`${at}: ${path} lies in ${ARCHIVE_DIR}/, which the migration never converts`);
    }
    const backup = originalPath(p.migration_id, r.narrative);
    if (r.backup !== backup) problems.push(`${at}: the backup is ${r.backup}; this migration's is ${backup}`);
    const named = isObject3(c.provenance) ? c.provenance.backup : void 0;
    if (!isObject3(named) || named.path !== backup || named.sha256 !== r.source_sha256) problems.push(`${at}: provenance.backup does not name ${backup} at the source sha256`);
    const source = isObject3(c.provenance) ? c.provenance.source : void 0;
    const terminal = TERMINAL_ROWS.includes(r.row);
    if (source !== (terminal ? "legacy-terminal" : "imported")) problems.push(`${at}: a ${r.row} row carries provenance.source ${JSON.stringify(source)}`);
    if (terminal && r.rewrite !== null) problems.push(`${at}: a ${r.row} row stays byte-identical and carries a rewrite`);
    if (narratives.has(r.narrative)) problems.push(`${at}: the narrative is named by another record`);
    if (controls.has(r.control_path)) problems.push(`${at}: the control path is named by another record`);
    narratives.add(r.narrative);
    controls.add(r.control_path);
  }
  for (const [count, row] of Object.entries(ROWS)) {
    const n = order2.filter((id) => p.records[id]?.row === row).length;
    if (p.counts[count] !== n) problems.push(`counts.${count} is ${String(p.counts[count])}; the records hold ${n} ${row} rows`);
  }
  return problems.length === 0 ? { ok: true, value: void 0 } : invalid(`${plural(problems.length, "problem")}: ${listed(problems)}`);
}
function uniqueIds(p, order2) {
  const twice = [];
  if (p.records[p.workbench_id] !== void 0) twice.push(`${p.workbench_id} is the workbench id and a record's`);
  for (const id of order2) {
    const c = p.records[id].control;
    if (c.id !== id) twice.push(`the record keyed ${id} carries the id ${String(c.id)}`);
    if (c.workbench_id !== p.workbench_id) twice.push(`the record ${id} carries workbench_id ${String(c.workbench_id)}, the proposal ${p.workbench_id}`);
  }
  return twice.length === 0 ? { ok: true, value: void 0 } : refusal("schema-invalid", "duplicate-id", listed(twice));
}
function closure(p, order2, sitesOf) {
  const open = [];
  for (const id of order2) {
    const r = p.records[id];
    for (const site of sitesOf({ kind: r.kind, control: r.control })) {
      const v = site.value;
      if (!isObject3(v) || typeof v.record_id !== "string") continue;
      if (v.workbench_id !== p.workbench_id || p.records[v.record_id] === void 0) open.push(`${r.narrative} ${site.at} names ${v.record_id}`);
    }
  }
  return open.length === 0 ? { ok: true, value: void 0 } : refusal("unresolved-reference", "closure-incomplete", `${plural(open.length, "record reference")} name no proposed record: ${listed(open)}`);
}
var afterHash = (r) => r.rewrite?.after_sha256 ?? r.source_sha256;
function acceptances(p, order2) {
  const wrong = [];
  for (const id of order2) {
    const r = p.records[id];
    const control = r.control.control;
    const acceptance = isObject3(control) ? control.acceptance : null;
    if (!isObject3(acceptance)) continue;
    const ref = acceptance.ref;
    const pkg = isObject3(ref) && typeof ref.record_id === "string" ? p.records[ref.record_id] : void 0;
    if (pkg === void 0 || pkg.kind !== "package") {
      wrong.push(`${r.narrative}: its acceptance names no proposed package`);
      continue;
    }
    if (acceptance.revision !== afterHash(r)) wrong.push(`${r.narrative}: its acceptance revision is ${String(acceptance.revision)}, the narrative's after-rewrite sha256 ${afterHash(r)}`);
    const docs = Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
    const entry = docs.find((d) => isObject3(d) && isObject3(d.ref) && d.ref.record_id === id);
    if (!isObject3(entry) || entry.revision !== acceptance.revision) wrong.push(`${r.narrative}: ${pkg.narrative} carries no active-document entry binding it at ${String(acceptance.revision)}`);
  }
  return wrong.length === 0 ? { ok: true, value: void 0 } : invalid(`${plural(wrong.length, "acceptance")} do not match: ${listed(wrong)}`);
}
function sources(p, order2, taken) {
  const changed2 = [];
  for (const id of order2) {
    const r = p.records[id];
    const e = taken.get(r.narrative);
    if (e === void 0) changed2.push(`${r.narrative} does not exist`);
    else if (e.kind !== "file") changed2.push(`${r.narrative} is a ${e.kind}, not a file`);
    else if (e.sha256 !== r.source_sha256) changed2.push(`${r.narrative} is ${e.sha256}, the proposal names ${r.source_sha256}`);
  }
  return changed2.length === 0 ? { ok: true, value: void 0 } : refusal("conflict", "source-changed", `${plural(changed2.length, "narrative")} not as the proposal read them: ${listed(changed2)}`);
}
function applyDeletions(source, deletions) {
  const kept = [];
  let at = 0;
  for (const d of deletions) {
    if (d.offset < at) return { ok: false, why: `the range at ${d.offset} does not ascend past ${at}` };
    if (d.offset + d.length > source.byteLength) return { ok: false, why: `the range ${d.offset}+${d.length} passes the ${source.byteLength} source bytes` };
    kept.push(source.subarray(at, d.offset));
    at = d.offset + d.length;
  }
  kept.push(source.subarray(at));
  return { ok: true, bytes: Buffer.concat(kept) };
}
function rewrites(wb, p, order2) {
  const wrong = [];
  for (const id of order2) {
    const r = p.records[id];
    if (r.rewrite === null) continue;
    const bytes = readFileSync4(join4(wb.root, r.narrative));
    if (revisionOf(bytes) !== r.source_sha256) return refusal("conflict", "source-changed", `${r.narrative} changed while plan read it`);
    const out = applyDeletions(bytes, r.rewrite.deletions);
    if (!out.ok) wrong.push(`${r.narrative}: ${out.why}`);
    else if (revisionOf(out.bytes) !== r.rewrite.after_sha256) wrong.push(`${r.narrative}: the deletions give ${revisionOf(out.bytes)}, the rewrite names ${r.rewrite.after_sha256}`);
  }
  return wrong.length === 0 ? { ok: true, value: void 0 } : invalid(`${plural(wrong.length, "rewrite")} do not apply: ${listed(wrong)}`);
}
function pairWrites(r) {
  const control = Buffer.from(serialise(r.control), "utf-8");
  const rest = [{ kind: "control", path: r.control_path, source_sha256: null, after_sha256: revisionOf(control), control: r.control }];
  if (r.rewrite !== null) rest.push({ kind: "rewrite", path: r.narrative, source_sha256: r.source_sha256, after_sha256: r.rewrite.after_sha256, deletions: r.rewrite.deletions });
  return { original: { kind: "original", path: r.backup, from: r.narrative, source_sha256: null, after_sha256: r.source_sha256 }, rest };
}
var chunkFile = (migrationId, n, pairs) => ({
  schema: PLAN_SCHEMA,
  part: "chunk",
  migration_id: migrationId,
  chunk: n,
  writes: [...pairs.map((p) => p.original), ...pairs.flatMap((p) => p.rest)]
});
var writesOf = (pair) => 1 + pair.rest.length;
function contribution(text, depth) {
  const lines = text.split("\n").length;
  return Buffer.byteLength(text, "utf-8") + lines * 2 * depth + 2;
}
function cut(migrationId, pairs) {
  const out = [];
  let current2 = [];
  let writes = 0;
  let weight = 0;
  const close = () => {
    if (current2.length === 0) return;
    const file = chunkFile(migrationId, out.length + 1, current2);
    out.push({ file, bytes: Buffer.from(serialise(file), "utf-8"), writes });
    current2 = [];
    writes = 0;
    weight = 0;
  };
  for (const pair of pairs) {
    const w = [pair.original, ...pair.rest].reduce((n, x) => n + contribution(JSON.stringify(x, null, 2), 2), 0);
    if (current2.length > 0 && (writes + writesOf(pair) > CHUNK_WRITES || weight + w > MAX_RECORD_BYTES - PART_MARGIN)) close();
    current2.push(pair);
    writes += writesOf(pair);
    weight += w;
  }
  close();
  return out;
}
var PART_ORDER = ["chunk", "records", "inventory", "findings", "repairs", "answers"];
function eligibleSkip(own, exclusions) {
  const selected = new Set(exclusions);
  return (path, kind) => path === STATE_DIR || under(path, own) || excludedRoot(selected, path, kind);
}
function split(items, size, frame) {
  const groups = [[]];
  let weight = 0;
  for (const item of items) {
    const w = size(item);
    const last = groups[groups.length - 1];
    if (last.length > 0 && weight + w > MAX_RECORD_BYTES - PART_MARGIN) {
      groups.push([item]);
      weight = w;
    } else {
      last.push(item);
      weight += w;
    }
  }
  return groups.map((g, i) => {
    const file = frame(i + 1, g);
    return { file, bytes: Buffer.from(serialise(file), "utf-8") };
  });
}
function secondRun(wb, req, manifest) {
  const bytes = boundProposal(wb, req);
  if (!bytes.ok) return bytes;
  const parsed = strictParse(bytes.value, PROPOSAL_CAP);
  const proposed = parsed.ok && isObject3(parsed.value) && typeof parsed.value.migration_id === "string" ? parsed.value.migration_id : null;
  const migration2 = manifest.migration;
  if (!isObject3(migration2) || proposed === null || migration2.id !== proposed) {
    return refusal("conflict", "manifest-present", `${wb.root} holds ${WORKBENCH_MANIFEST} and is under JSON control; ${isObject3(migration2) ? `it was migrated by ${String(migration2.id)}, not by ${proposed ?? "this proposal"}` : "it was never migrated, and a migration never replaces a manifest"}`);
  }
  const unverified = (why) => refusal("migration-incomplete", "receipt-unverified", `the receipt ${String(migration2.receipt)} of ${proposed} does not hold: ${why}; a manifest merely naming a receipt is no verified no-op`);
  const fileAt = (path) => {
    const abs = resolveInside(wb, path);
    if (!abs.ok) return null;
    try {
      return lstatSync3(abs.value).isFile() ? readFileSync4(abs.value) : null;
    } catch {
      return null;
    }
  };
  const receiptPath2 = String(migration2.receipt);
  const receiptBytes = fileAt(receiptPath2);
  if (receiptBytes === null) return unverified("it is not a file in the workbench");
  const receipt = strictParse(receiptBytes);
  if (!receipt.ok) return unverified(`${receipt.reason}: ${receipt.detail}`);
  const v = validate(RECEIPT_SCHEMA_ID, receipt.value);
  if (!v.ok) return unverified(v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`);
  const r = receipt.value;
  if (r.migration_id !== proposed || r.workbench_id !== manifest.id) return unverified(`it names ${r.migration_id} in ${r.workbench_id}`);
  const manifestRevision = revisionOf(readFileSync4(join4(wb.root, WORKBENCH_MANIFEST)));
  if (r.manifest_revision !== manifestRevision) return unverified(`it names the manifest at ${r.manifest_revision}, which is ${manifestRevision}`);
  for (const f of [r.plan, ...r.parts]) {
    const b = fileAt(f.path);
    if (b === null) return unverified(`${f.path} is not available`);
    if (revisionOf(b) !== f.sha256) return unverified(`${f.path} is ${revisionOf(b)}, the receipt names ${f.sha256}`);
  }
  const plan = readIndex(wb, r.plan);
  if (!plan.ok) return unverified(plan.error.detail);
  if (canonical(r.parts) !== canonical(plan.value.index.parts.map((x) => ({ path: x.path, sha256: x.sha256 })))) return unverified(`its parts are not those ${r.plan.path} names`);
  const baseline = readBaseline(wb, plan.value);
  if (!baseline.ok) return unverified(baseline.error.detail);
  const later = laterOperations(wb, plan.value, baseline.value);
  return {
    ok: true,
    value: {
      writes: [],
      result: { operation_id: req.operation_id, migration_id: proposed, no_op: true, receipt: { path: receiptPath2, sha256: revisionOf(receiptBytes) }, manifest_revision: manifestRevision, later_operations: later.map((s) => ({ operation_id: s.entry.operation_id, op: s.entry.op })) }
    }
  };
}
function storedNow(wb) {
  let names = [];
  try {
    names = readdirSync4(opsDir(wb));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const out = [];
  for (const name of names.filter((n) => !n.startsWith(".") && n.endsWith(".json")).sort(bytewise)) {
    const id = name.slice(0, -".json".length);
    let bytes;
    try {
      bytes = readFileSync4(answerPath(wb, id));
    } catch (e) {
      if (e.code === "ENOENT") continue;
      throw e;
    }
    const a = readAnswer(wb, id);
    const answer = a.ok ? a.value : null;
    const entry = answer === null ? { operation_id: id, op: "unreadable", request_digest: "", answer_sha256: sha(bytes) } : { operation_id: id, op: answer.op, request_digest: answer.request_digest, answer_sha256: sha(bytes) };
    out.push({ entry, answer, unreadable: a.ok ? null : a.error });
  }
  return out;
}
function scheduledRequests(index, ref) {
  const s = index.schedule;
  const out = /* @__PURE__ */ new Map();
  out.set(s.plan, { op: "migration", operation_id: s.plan, phase: "plan", proposal: index.proposal });
  for (const e of s.apply) out.set(e.operation_id, applyRequest(ref, e));
  out.set(s.verify, { op: "migration", operation_id: s.verify, phase: "verify", plan: ref });
  for (const e of s.rollback) out.set(e.operation_id, rollbackRequest(ref, e));
  return out;
}
var applyRequest = (ref, e) => ({ op: "migration", operation_id: e.operation_id, phase: "apply", plan: ref, chunk: e.chunk });
var rollbackRequest = (ref, e) => ({ op: "migration", operation_id: e.operation_id, phase: "rollback", plan: ref, chunk: e.chunk });
function reconstructs(digest, rebuilt, root) {
  const bare = { ...rebuilt };
  delete bare.workbench;
  return digest === requestDigest(bare) || digest === requestDigest({ ...bare, workbench: root });
}
function laterOperations(wb, plan, baseline, now = storedNow(wb)) {
  const base = new Set(baseline.map((e) => canonical(e)));
  const scheduled = scheduledRequests(plan.index, plan.ref);
  return now.filter((s) => {
    if (base.has(canonical(s.entry))) return false;
    const rebuilt = scheduled.get(s.entry.operation_id);
    return rebuilt === void 0 || s.answer === null || !reconstructs(s.answer.request_digest, rebuilt, wb.root);
  });
}
function readBaseline(wb, plan) {
  const parts = readParts(wb, plan, "answers");
  if (!parts.ok) return parts;
  const entries = parts.value.flatMap((p) => p.entries);
  for (let i = 1; i < entries.length; i++) {
    if (bytewise(entries[i - 1].operation_id, entries[i].operation_id) >= 0) return changed(`the answers parts of ${plan.ref.path} list ${entries[i].operation_id} out of bytewise order or twice`);
  }
  return { ok: true, value: entries };
}
function standingPlans(root) {
  const dir = join4(root, MIGRATIONS_DIR);
  let ids;
  try {
    ids = readdirSync4(dir);
  } catch {
    return [];
  }
  const holdsFile = (path) => {
    try {
      return inventory(path, () => false).some((e) => e.kind !== "directory");
    } catch {
      return false;
    }
  };
  return ids.filter((id) => existsSync3(join4(dir, id, "plan.json")) || ["chunks", "parts"].some((n) => holdsFile(join4(dir, id, n)))).sort(bytewise);
}
function prefix(ctx) {
  const now = openWorkbench(ctx.wb.root);
  if (!now.ok) return now;
  if (now.value.state === "unsupported" && now.value.diagnosis !== null) return { ok: false, error: now.value.diagnosis };
  const held2 = ctx.blocked.filter((b) => b.held !== void 0);
  if (held2.length > 0) {
    return refusal("conflict", "intent-pending", `${plural(held2.length, "intent")} pending for ${held2.length === 1 ? "its" : "their"} own request: ${listed(held2.map((b) => `${b.held} ${b.operation_id} in ${STATE_DIR}/${JOURNAL_DIR}/${b.operation_id}`))}; it is finished by that request, never by this one`);
  }
  return now;
}
function scheduleProblems(wb, p, req, chunks, order2) {
  const ids = p.operation_ids;
  const problems = [];
  if (ids.plan !== req.operation_id) problems.push(`operation_ids.plan is ${ids.plan}; this request is ${req.operation_id}`);
  if (ids.apply.length < chunks) problems.push(`the plan cuts ${plural(chunks, "chunk")} and operation_ids.apply holds ${ids.apply.length}`);
  if (ids.rollback.length < chunks + 1) problems.push(`rollback chunks 0 to ${chunks} need ${chunks + 1} ids and operation_ids.rollback holds ${ids.rollback.length}`);
  const all = [ids.plan, ...ids.apply, ids.verify, ...ids.rollback];
  const seen = /* @__PURE__ */ new Set();
  const records = /* @__PURE__ */ new Set([p.workbench_id, ...order2]);
  for (const id of all) {
    if (seen.has(id)) problems.push(`${id} occurs twice in operation_ids`);
    if (records.has(id)) problems.push(`${id} is in operation_ids and is a workbench or record UUID`);
    seen.add(id);
    if (id !== req.operation_id && (existsSync3(answerPath(wb, id)) || existsSync3(join4(journalDir(wb), id)))) problems.push(`${id} already has a stored answer or an intent in this workbench`);
  }
  return problems;
}
function migrationPlan(req, sitesOf) {
  return (ctx) => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    if (now.value.state === "json-control") return secondRun(wb, req, now.value.manifest);
    const fence = readFence(wb);
    if (!fence.ok) return refusal("conflict", "maintenance-active", fence.error.detail);
    if (fence.value !== null) return refusal("conflict", "maintenance-active", `a maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}, set by operation ${fence.value.operation_id} since ${fence.value.since}; plan freezes nothing under it`);
    const standing = standingPlans(wb.root);
    if (standing.length > 0) return refusal("conflict", "migration-planned", `plan files stand for ${standing.join(", ")} under ${MIGRATIONS_DIR}/; one migration is planned at a time, its own plan only by the request that froze it, and rollback chunk 0 removes them`);
    const bytes = boundProposal(wb, req);
    if (!bytes.ok) return bytes;
    const read2 = parseProposal(req.proposal.path, bytes.value);
    if (!read2.ok) return read2;
    const p = read2.value;
    const order2 = Object.keys(p.records).sort((a, b) => bytewise(p.records[a].narrative, p.records[b].narrative));
    if (order2.length === 0) return invalid(`${req.proposal.path} names no record; a migration converts at least one pair`);
    const ranges = rangesAndExclusions(p, order2);
    if (!ranges.ok) return ranges;
    const shape = structural(wb, p, order2);
    if (!shape.ok) return shape;
    const unique = uniqueIds(p, order2);
    if (!unique.ok) return unique;
    const present = order2.map((id) => p.records[id].control_path).filter((path) => existsSync3(join4(wb.root, path)));
    if (present.length > 0) return refusal("conflict", "record-exists", `${plural(present.length, "control file")} the proposal would write stand already: ${listed(present)}`);
    const blocking = p.findings.filter((f) => f.severity === "blocking");
    if (blocking.length > 0) {
      return refusal("migration-incomplete", "blocking-finding", `${plural(blocking.length, "blocking finding")} open; each is resolved by a consented repair before plan: ${listed(blocking.map((f) => `${f.class} in ${f.path}`))}`);
    }
    const closed = closure(p, order2, sitesOf);
    if (!closed.ok) return closed;
    const accepted = acceptances(p, order2);
    if (!accepted.ok) return accepted;
    const taken = inventory(wb.root, eligibleSkip(`${MIGRATIONS_DIR}/${p.migration_id}`, p.exclusions));
    const byPath = new Map(taken.map((e) => [e.path, e]));
    const observed = inventoryDigest(taken);
    if (observed !== p.source_inventory_sha256) {
      const named = sources(p, order2, byPath);
      return refusal("conflict", "source-changed", `the eligible inventory of ${wb.root} digests to ${observed} under the lock, and the proposal was composed over ${p.source_inventory_sha256}: an entry was added, removed, re-kinded or rewritten since the survey it was composed from${named.ok ? "" : `; among them, ${named.error.detail}`}`);
    }
    const sourced = sources(p, order2, byPath);
    if (!sourced.ok) return sourced;
    const rewritten = rewrites(wb, p, order2);
    if (!rewritten.ok) return rewritten;
    const chunks = cut(
      p.migration_id,
      order2.map((id) => pairWrites(p.records[id]))
    );
    const scheduling = scheduleProblems(wb, p, req, chunks.length, order2);
    if (scheduling.length > 0) return invalid(`the operation-id schedule: ${listed(scheduling)}`);
    const ids = p.operation_ids;
    const schedule = {
      plan: ids.plan,
      apply: chunks.map((_, i) => ({ chunk: i + 1, operation_id: ids.apply[i] })),
      verify: ids.verify,
      rollback: Array.from({ length: chunks.length + 1 }, (_, k) => ({ chunk: k, operation_id: ids.rollback[k] })),
      unassigned: [...ids.apply.slice(chunks.length), ...ids.rollback.slice(chunks.length + 1)]
    };
    const frame = (kind) => (n, extra) => ({ schema: PLAN_SCHEMA, part: kind, migration_id: p.migration_id, n, ...extra });
    const recordParts = split(
      order2,
      (id) => contribution(`"${id}": ${JSON.stringify(recordEntry(p.records[id]), null, 2)}`, 2),
      (n, group) => frame("records")(n, { ...n === 1 ? { counts: p.counts } : {}, records: Object.fromEntries(group.map((id) => [id, recordEntry(p.records[id])])) })
    );
    const inventoryParts = split(taken, (e) => contribution(JSON.stringify(e, null, 2), 2), (n, entries) => frame("inventory")(n, { entries }));
    const findingParts = split(p.findings, (f) => contribution(JSON.stringify(f, null, 2), 2), (n, findings) => frame("findings")(n, { findings }));
    const repairParts = split(p.repairs, (r) => contribution(JSON.stringify(r, null, 2), 2), (n, repairs) => frame("repairs")(n, { repairs }));
    const stored2 = storedNow(wb);
    const unreadable = stored2.find((s) => s.unreadable !== null);
    if (unreadable !== void 0) return { ok: false, error: unreadable.unreadable };
    const answerParts = split(
      stored2.map((s) => s.entry),
      (e) => contribution(JSON.stringify(e, null, 2), 2),
      (n, entries) => frame("answers")(n, { entries })
    );
    const parts = [
      ...chunks.map((c, i) => ({ entry: { part: "chunk", n: i + 1, path: chunkPath(p.migration_id, i + 1), sha256: revisionOf(c.bytes), writes: c.writes }, bytes: c.bytes, file: c.file })),
      ...[
        ["records", recordParts],
        ["inventory", inventoryParts],
        ["findings", findingParts],
        ["repairs", repairParts],
        ["answers", answerParts]
      ].flatMap(([kind, list2]) => list2.map((f, i) => ({ entry: { part: kind, n: i + 1, path: partPath(p.migration_id, kind, i + 1), sha256: revisionOf(f.bytes) }, bytes: f.bytes, file: f.file })))
    ];
    const index = {
      schema: PLAN_SCHEMA,
      part: "index",
      migration_id: p.migration_id,
      workbench_id: p.workbench_id,
      source_layout: p.source_layout,
      proposal: { path: req.proposal.path, sha256: req.proposal.sha256 },
      source_inventory_sha256: p.source_inventory_sha256,
      exclusions: p.exclusions,
      schedule,
      parts: parts.map((x) => x.entry)
    };
    for (const x of parts) {
      const v2 = ctx.validateResult(PLAN_SCHEMA_ID, x.file, `the plan file ${String(x.entry.path)} is not valid`);
      if (!v2.ok) return v2;
    }
    const v = ctx.validateResult(PLAN_SCHEMA_ID, index, "the frozen index is not valid");
    if (!v.ok) return v;
    const indexBytes = Buffer.from(serialise(index), "utf-8");
    const writes = [...parts.map((x) => ({ path: String(x.entry.path), bytes: x.bytes })), { path: indexPath(p.migration_id), bytes: indexBytes }];
    const result = { operation_id: req.operation_id, migration_id: p.migration_id, plan: { path: indexPath(p.migration_id), sha256: revisionOf(indexBytes) }, parts: index.parts, schedule, counts: p.counts };
    const over = freezeOver(req, writes, result);
    if (over !== null) return refusal("schema-invalid", "plan-too-large", `the freeze of ${p.migration_id} ${over}; nothing is published, and a multi-request freeze is not built (question 50)`);
    return { ok: true, value: { writes, result } };
  };
}
var recordEntry = (r) => ({ kind: r.kind, row: r.row, control: r.control_path, narrative: r.narrative });
function freezeOver(req, writes, result) {
  const big = writes.filter((w) => w.bytes.byteLength > MAX_RECORD_BYTES);
  if (big.length > 0) return `holds ${plural(big.length, "file")} over the ${MAX_RECORD_BYTES}-byte cap: ${listed(big.map((w) => `${w.path} (${w.bytes.byteLength} bytes)`))}`;
  const total = writes.reduce((n, w) => n + w.bytes.byteLength, 0);
  if (writes.length > FREEZE_MAX_FILES) return `writes ${writes.length} files; one freeze intent holds at most ${FREEZE_MAX_FILES}`;
  if (total > FREEZE_MAX_BYTES) return `writes ${total} bytes; one freeze intent holds at most ${FREEZE_MAX_BYTES}`;
  const intent = {
    operation_id: req.operation_id,
    op: req.op,
    request_digest: requestDigest(req),
    writes: writes.map((w) => ({ path: w.path, before: null, after: revisionOf(w.bytes) })),
    response: { ok: true, result },
    created_at: (/* @__PURE__ */ new Date(0)).toISOString()
  };
  const intentBytes = Buffer.byteLength(JSON.stringify(intent, null, 2) + "\n", "utf-8");
  if (intentBytes > MAX_RECORD_BYTES) return `needs an intent.json of ${intentBytes} bytes, over the ${MAX_RECORD_BYTES}-byte cap`;
  return null;
}
var changed = (detail) => refusal("conflict", "plan-file-changed", detail);
var outOfOrder = (detail) => refusal("migration-incomplete", "chunk-out-of-order", detail);
var sha = (bytes) => revisionOf(bytes);
function regularBytes(wb, path) {
  const abs = resolveInside(wb, path);
  if (!abs.ok) return null;
  try {
    return lstatSync3(abs.value).isFile() ? readFileSync4(abs.value) : null;
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}
function planFile(path, bytes) {
  const parsed = strictParse(bytes);
  if (!parsed.ok) return { ok: false, why: `${parsed.reason}: ${parsed.detail}` };
  const v = validate(PLAN_SCHEMA_ID, parsed.value);
  if (!v.ok) return { ok: false, why: v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}` };
  return { ok: true, value: parsed.value };
}
function readIndex(wb, ref) {
  const bytes = regularBytes(wb, ref.path);
  if (bytes === null) return changed(`${ref.path} is no regular file in ${wb.root}; the request binds it at ${ref.sha256}`);
  if (sha(bytes) !== ref.sha256) return changed(`${ref.path} is ${sha(bytes)}; the request binds ${ref.sha256}`);
  const read2 = planFile(ref.path, bytes);
  if (!read2.ok) return changed(`${ref.path}: ${read2.why}`);
  const index = read2.value;
  const own = dirname3(ref.path);
  if (index.part !== "index" || indexPath(index.migration_id) !== ref.path) return changed(`${ref.path} is no index of the migration its path names`);
  const chunks = index.parts.filter((x) => x.part === "chunk").length;
  let at = 0;
  for (const kind of PART_ORDER) {
    let n = 0;
    while (at < index.parts.length && index.parts[at].part === kind) {
      const x = index.parts[at];
      n += 1;
      const path = kind === "chunk" ? chunkPath(index.migration_id, n) : partPath(index.migration_id, kind, n);
      if (x.n !== n || x.path !== path) return changed(`${ref.path} names ${x.path} as ${kind} ${x.n}, out of the order the freeze writes`);
      at += 1;
    }
    if (n === 0 && kind !== "chunk") return changed(`${ref.path} names no ${kind} part`);
  }
  if (at !== index.parts.length) return changed(`${ref.path} names its parts out of the order the freeze writes`);
  const s = index.schedule;
  const applyOk = s.apply.length === chunks && s.apply.every((e, i) => e.chunk === i + 1);
  const rollbackOk = s.rollback.length === chunks + 1 && s.rollback.every((e, i) => e.chunk === i);
  if (chunks === 0 || !applyOk || !rollbackOk) return changed(`${ref.path} schedules ${s.apply.length} apply and ${s.rollback.length} rollback ids for ${chunks} chunks`);
  return { ok: true, value: { ref, index, own, chunks } };
}
function readPart(wb, plan, entry) {
  const bytes = regularBytes(wb, entry.path);
  if (bytes === null) return changed(`${entry.path}, named by ${plan.ref.path}, is no regular file`);
  if (sha(bytes) !== entry.sha256) return changed(`${entry.path} is ${sha(bytes)}; ${plan.ref.path} names ${entry.sha256}`);
  const read2 = planFile(entry.path, bytes);
  if (!read2.ok) return changed(`${entry.path}: ${read2.why}`);
  const v = read2.value;
  const n = entry.part === "chunk" ? v.chunk : v.n;
  if (v.part !== entry.part || n !== entry.n || v.migration_id !== plan.index.migration_id) return changed(`${entry.path} is not ${entry.part} ${entry.n} of ${plan.index.migration_id}`);
  return { ok: true, value: v };
}
function readChunks(wb, plan, last) {
  const out = [];
  for (const entry of plan.index.parts.filter((x) => x.part === "chunk" && x.n <= last)) {
    const r = readPart(wb, plan, entry);
    if (!r.ok) return r;
    out.push(r.value);
  }
  return { ok: true, value: out };
}
function readParts(wb, plan, kind) {
  const out = [];
  for (const entry of plan.index.parts.filter((x) => x.part === kind)) {
    const r = readPart(wb, plan, entry);
    if (!r.ok) return r;
    out.push(r.value);
  }
  return { ok: true, value: out };
}
function frozenInventory(wb, plan) {
  const parts = readParts(wb, plan, "inventory");
  if (!parts.ok) return parts;
  const entries = parts.value.flatMap((p) => p.entries);
  const digest = inventoryDigest(entries);
  if (digest !== plan.index.source_inventory_sha256) return changed(`the inventory parts of ${plan.ref.path} digest to ${digest}; the index froze ${plan.index.source_inventory_sha256}`);
  return { ok: true, value: entries };
}
function ownDirectory(wb, plan, expect, disk) {
  const want = /* @__PURE__ */ new Map();
  want.set(plan.ref.path, { sha256: plan.ref.sha256, plan: true });
  for (const x of plan.index.parts) want.set(x.path, { sha256: x.sha256, plan: true });
  for (const c of expect.originals) for (const w of c.writes) if (w.kind === "original") want.set(w.path, { sha256: w.after_sha256, plan: false });
  const abs = join4(wb.root, plan.own);
  let entries = [];
  try {
    entries = inventory(abs, () => false);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const seen = /* @__PURE__ */ new Set();
  for (const e of entries) {
    if (e.kind === "directory") continue;
    const path = `${plan.own}/${e.path}`;
    if (e.path === "receipt.json" && expect.receipt || e.path === "rollback.json" && expect.rollback) continue;
    const w = want.get(path);
    if (w === void 0) {
      const planArea = e.path === "plan.json" || e.path.startsWith("chunks/") || e.path.startsWith("parts/");
      return planArea ? changed(`${path} stands and ${plan.ref.path} does not name it`) : disk(`${path} stands, and this migration holds no such file at this point of its run`);
    }
    seen.add(path);
    if (e.kind !== "file" || e.sha256 !== w.sha256) {
      const what = e.kind === "file" ? e.sha256 : `a ${e.kind}`;
      return w.plan ? changed(`${path} is ${what}; ${plan.ref.path} names ${w.sha256}`) : disk(`${path} is ${what}; the original it holds is ${w.sha256}`);
    }
  }
  for (const [path, w] of want) if (!seen.has(path)) return w.plan ? changed(`${path}, named by ${plan.ref.path}, is missing`) : disk(`${path} is missing; it holds the original at ${w.sha256}`);
  return { ok: true, value: void 0 };
}
function eligible(wb, plan) {
  return inventory(wb.root, eligibleSkip(plan.own, plan.index.exclusions));
}
function controlBytes(w) {
  const bytes = Buffer.from(serialise(w.control), "utf-8");
  if (sha(bytes) !== w.after_sha256) return changed(`the control ${w.path} serialises to ${sha(bytes)}; its chunk names ${w.after_sha256}`);
  return { ok: true, value: bytes };
}
function expectedState(frozen, chunks) {
  const out = new Map(frozen.map((e) => [e.path, e]));
  for (const c of chunks) {
    for (const w of c.writes) {
      if (w.kind === "control") {
        const bytes = controlBytes(w);
        if (!bytes.ok) return bytes;
        out.set(w.path, { path: w.path, kind: "file", size: bytes.value.byteLength, sha256: w.after_sha256 });
      } else if (w.kind === "rewrite") {
        const source = out.get(w.path);
        if (source === void 0 || source.kind !== "file" || source.sha256 !== w.source_sha256) return changed(`chunk ${c.chunk} rewrites ${w.path} from ${w.source_sha256}, which the frozen inventory does not hold`);
        out.set(w.path, { path: w.path, kind: "file", size: source.size - w.deletions.reduce((n, d) => n + d.length, 0), sha256: w.after_sha256 });
      }
    }
  }
  return { ok: true, value: out };
}
var describe2 = (e) => e.kind === "file" ? `a file of ${e.size} bytes at ${e.sha256}` : e.kind === "link" ? `a link to ${JSON.stringify(e.target)}` : `a ${e.kind}`;
var sameEntry = (a, b) => canonical(a) === canonical(b);
function firstDifference(actual, expected) {
  const created = new Set([ARCHIVE_DIR, MIGRATIONS_DIR].filter((d) => !expected.has(d)));
  const problems = [];
  const seen = /* @__PURE__ */ new Set();
  for (const e of actual) {
    seen.add(e.path);
    const want = expected.get(e.path);
    if (want === void 0) {
      if (!(e.kind === "directory" && created.has(e.path))) problems.push([e.path, `${e.path} was added: ${describe2(e)}`]);
    } else if (!sameEntry(e, want)) problems.push([e.path, `${e.path} is ${describe2(e)}, expected ${describe2(want)}`]);
  }
  for (const [path, want] of expected) if (!seen.has(path)) problems.push([path, `${path} was removed: expected ${describe2(want)}`]);
  if (problems.length === 0) return null;
  problems.sort((a, b) => bytewise(a[0], b[0]));
  return problems[0][1] + (problems.length > 1 ? ` (and ${problems.length - 1} more)` : "");
}
var inventoryDigest = (entries) => sha(Buffer.from(canonical([...entries].sort((a, b) => bytewise(a.path, b.path))), "utf-8"));
function stored(wb, id) {
  return readAnswer(wb, id);
}
function landedChunks(wb, plan) {
  const out = [];
  for (let n = 1; n <= plan.chunks; n++) {
    const applied = stored(wb, plan.index.schedule.apply[n - 1].operation_id);
    if (!applied.ok) return applied;
    const undone = stored(wb, plan.index.schedule.rollback[n].operation_id);
    if (!undone.ok) return undone;
    if (applied.value !== null && undone.value === null) out.push(n);
  }
  return { ok: true, value: out };
}
var chunkList = (ns) => ns.length === 0 ? "none" : ns.join(", ");
var firstChunks = (n) => Array.from({ length: n }, (_, i) => i + 1);
var sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
var chunkOneFence = (plan) => plan.index.schedule.apply[0].operation_id;
function fenceNow(wb) {
  const fence = readFence(wb);
  if (!fence.ok) return refusal("conflict", "maintenance-active", fence.error.detail);
  return fence;
}
var fenceRefused = (standing, wanted) => refusal(
  "conflict",
  "maintenance-active",
  standing === null ? `no maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}; this phase runs under the fence ${wanted}` : `the fence in ${STATE_DIR}/${MAINTENANCE_FILE} is ${standing.operation_id} since ${standing.since}; this phase runs under ${wanted} only`
);
var manifestPresent = (wb, phase) => refusal("conflict", "manifest-present", `${wb.root} holds ${WORKBENCH_MANIFEST}; migration ${phase} runs on a legacy store only (a replay of an answer stored earlier is answered whatever the store's state)`);
var sourceChanged = (detail) => refusal("conflict", "source-changed", detail);
var afterStateChanged = (detail) => refusal("conflict", "after-state-changed", detail);
function narrativeAt(wb, path, hash) {
  const bytes = regularBytes(wb, path);
  if (bytes === null || sha(bytes) !== hash) return sourceChanged(`${path} is ${bytes === null ? "no regular file" : sha(bytes)}; the plan reads it at ${hash}`);
  return { ok: true, value: bytes };
}
function migrationApply(req, options) {
  return (ctx) => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    if (now.value.state === "json-control") return manifestPresent(wb, "apply");
    const read2 = readIndex(wb, req.plan);
    if (!read2.ok) return read2;
    const plan = read2.value;
    const frozen = frozenInventory(wb, plan);
    if (!frozen.ok) return frozen;
    const n = req.chunk;
    const chunks = readChunks(wb, plan, n);
    if (!chunks.ok) return chunks;
    if (n > plan.chunks) return outOfOrder(`${plan.index.migration_id} has ${plural(plan.chunks, "chunk")}; there is no chunk ${n} to apply`);
    const scheduled = plan.index.schedule.apply[n - 1].operation_id;
    if (req.operation_id !== scheduled) return refusal("conflict", "operation-id-unscheduled", `${plan.ref.path} schedules ${scheduled} for apply chunk ${n}, not ${req.operation_id}`);
    const f1 = chunkOneFence(plan);
    const fence = fenceNow(wb);
    if (!fence.ok) return fence;
    const standing = fence.value;
    if (n === 1 ? standing !== null && standing.operation_id !== f1 : standing === null || standing.operation_id !== f1) return fenceRefused(standing, f1);
    const landed = landedChunks(wb, plan);
    if (!landed.ok) return landed;
    if (!sameList(landed.value, firstChunks(n - 1))) return outOfOrder(`apply chunk ${n} follows chunks 1 to ${n - 1}; the chunks landed are ${chunkList(landed.value)}`);
    const before = chunks.value.slice(0, n - 1);
    const expected = expectedState(frozen.value, before);
    if (!expected.ok) return expected;
    const diff = firstDifference(eligible(wb, plan), expected.value);
    if (diff !== null) return sourceChanged(`the store is not as chunk ${n} of ${plan.index.migration_id} expects it: ${diff}`);
    const own = ownDirectory(wb, plan, { originals: before, receipt: false, rollback: false }, sourceChanged);
    if (!own.ok) return own;
    const chunk = chunks.value[n - 1];
    const writes = [];
    const revisions = {};
    for (const w of chunk.writes) {
      if (w.kind === "original") {
        const bytes = narrativeAt(wb, w.from, w.after_sha256);
        if (!bytes.ok) return bytes;
        writes.push({ path: w.path, bytes: bytes.value });
      } else if (w.kind === "control") {
        const bytes = controlBytes(w);
        if (!bytes.ok) return bytes;
        writes.push({ path: w.path, bytes: bytes.value });
        revisions[w.path] = w.after_sha256;
      } else {
        const source = narrativeAt(wb, w.path, w.source_sha256);
        if (!source.ok) return source;
        const out = applyDeletions(source.value, w.deletions);
        if (!out.ok || sha(out.bytes) !== w.after_sha256) return changed(`chunk ${n} rewrites ${w.path} to ${w.after_sha256}, which its deletions do not give`);
        writes.push({ path: w.path, bytes: out.bytes });
      }
    }
    const big = writes.filter((w) => w.bytes.byteLength > MAX_RECORD_BYTES);
    if (big.length > 0) return refusal("schema-invalid", "too-large", `chunk ${n} writes ${listed(big.map((w) => `${w.path} (${w.bytes.byteLength} bytes)`))}, over the journal's ${MAX_RECORD_BYTES}-byte cap; nothing is written`);
    const fenceFirst = n === 1 && standing === null ? { operation_id: f1, since: new Date(options.now()).toISOString() } : void 0;
    const answerFence = fenceFirst ?? standing;
    const result = {
      operation_id: req.operation_id,
      migration_id: plan.index.migration_id,
      chunk: n,
      fence: { operation_id: answerFence.operation_id, since: answerFence.since },
      writes: chunk.writes.map((w) => ({ path: w.path, kind: w.kind }))
    };
    return { ok: true, value: { writes, result, revisions, ...fenceFirst !== void 0 ? { fenceFirst } : {} } };
  };
}
function manifestOf(index, receipt) {
  return { schema: WORKBENCH_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length), id: index.workbench_id, required_features: [...SUPPORTED_FEATURES], migration: { id: index.migration_id, source_layout: index.source_layout, receipt }, extensions: {} };
}
var receiptPath = (migrationId) => `${MIGRATIONS_DIR}/${migrationId}/receipt.json`;
var rollbackPath = (migrationId) => `${MIGRATIONS_DIR}/${migrationId}/rollback.json`;
function runChecks(view, index, rows, after, hooks) {
  const checks = [];
  const pairs = { name: "pairs", checked: rows.size, problems: [] };
  const read2 = /* @__PURE__ */ new Map();
  for (const [id, row] of rows) {
    const r = readPair(view, row.control);
    if (!r.ok) {
      pairs.problems.push(`${row.control}: ${r.error.reason}`);
      continue;
    }
    read2.set(id, r.value);
    const c = r.value.control;
    if (c.id !== id || r.value.kind !== row.kind) pairs.problems.push(`${row.control} is ${r.value.kind} ${String(c.id)}; the plan converts ${row.kind} ${id}`);
    const narrative = r.value.narrative;
    if (narrative === null || narrative.path !== row.narrative || narrative.sha256 !== after.get(row.narrative)) pairs.problems.push(`${row.control} names ${JSON.stringify(narrative)}; the plan leaves ${row.narrative} at ${String(after.get(row.narrative))}`);
  }
  checks.push(pairs);
  const files = controlFiles(view, view.root);
  const ids = { name: "ids", checked: files.length, problems: [] };
  const carriers = /* @__PURE__ */ new Map();
  for (const path of files) {
    const bytes = regularBytes(view, path);
    const parsed = bytes === null ? null : strictParse(bytes);
    const control = parsed !== null && parsed.ok && isObject3(parsed.value) ? parsed.value : null;
    if (control === null || typeof control.id !== "string") {
      ids.problems.push(`${path} carries no id`);
      continue;
    }
    if (control.workbench_id !== index.workbench_id) ids.problems.push(`${path} carries workbench_id ${String(control.workbench_id)}`);
    carriers.set(control.id, [...carriers.get(control.id) ?? [], path]);
  }
  for (const [id, paths] of carriers) if (paths.length > 1) ids.problems.push(`${id} is carried by ${paths.join(", ")}`);
  if (carriers.has(index.workbench_id)) ids.problems.push(`${index.workbench_id} is the workbench id and a record's`);
  for (const [id, row] of rows) if (!(carriers.get(id) ?? []).includes(row.control)) ids.problems.push(`${id} is carried by no control file at ${row.control}`);
  checks.push(ids);
  const reconciled = hooks.reconcile(view);
  const report = reconciled.ok ? reconciled.result : null;
  const deps = report === null ? [] : report.dependencies;
  const graph = { name: "graph", checked: deps.filter((d) => d.status !== "cycle").length, problems: [] };
  for (const d of deps) {
    if (d.status === "cycle") graph.problems.push(`a cycle through ${d.ids.join(" -> ")}`);
    else if (d.class !== void 0 && d.reason !== "dependency-unmet") graph.problems.push(`${String(d.path)} ${String(d.at)}: ${String(d.reason)}`);
  }
  checks.push(graph);
  const refs = report === null ? [] : report.references;
  const references = { name: "references", checked: refs.length, problems: [] };
  for (const r of refs) if (r.status === "unresolved" || r.status === "ambiguous") references.problems.push(`${String(r.path)} ${String(r.at)}: ${String(r.status)}, ${String(r.reason)}`);
  checks.push(references);
  const acceptance = { name: "acceptance", checked: 0, problems: [] };
  for (const [id, pair] of read2) {
    const control = pair.control.control;
    const a = isObject3(control) ? control.acceptance : null;
    if (!isObject3(a)) continue;
    acceptance.checked += 1;
    const ref = a.ref;
    const pkg = isObject3(ref) && typeof ref.record_id === "string" ? read2.get(ref.record_id) : void 0;
    const docs = pkg !== void 0 && Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
    const entry = docs.find((d) => isObject3(d) && isObject3(d.ref) && d.ref.record_id === id);
    if (pkg === void 0 || pkg.kind !== "package") acceptance.problems.push(`${pair.path}: its acceptance names no converted package`);
    else if (!isObject3(entry) || entry.revision !== a.revision) acceptance.problems.push(`${pair.path}: ${pkg.path} carries no active-document entry binding it at ${String(a.revision)}`);
    else if (pair.narrative?.sha256 !== a.revision) acceptance.problems.push(`${pair.path}: accepted at ${String(a.revision)}, its narrative is ${String(pair.narrative?.sha256)}`);
  }
  checks.push(acceptance);
  const closure2 = { name: "closure", checked: 0, problems: [] };
  for (const [, pair] of read2) {
    for (const site of hooks.sitesOf({ kind: pair.kind, control: pair.control })) {
      const v = site.value;
      if (!isObject3(v) || typeof v.record_id !== "string") continue;
      if (v.workbench_id !== index.workbench_id) continue;
      closure2.checked += 1;
      if (!rows.has(v.record_id)) closure2.problems.push(`${pair.path} ${site.at} names ${v.record_id}, which this migration did not convert`);
    }
  }
  checks.push(closure2);
  const validated = hooks.validate(view);
  const vr = validated.ok ? validated.result : null;
  const findings = vr === null ? [] : vr.findings;
  const validateCheck = { name: "validate", checked: vr === null ? 0 : Number(vr.checked), problems: validated.ok ? findings.map((f) => `${String(f.path)}: ${String(f.reason)}`) : [`validate answered ${validated.error.reason}`] };
  checks.push(validateCheck);
  const reconcileCheck = { name: "reconcile", checked: report === null ? 0 : Number(report.checked), problems: [] };
  if (!reconciled.ok) reconcileCheck.problems.push(`reconcile answered ${reconciled.error.reason}`);
  else {
    for (const i of report?.intents) reconcileCheck.problems.push(`intent ${String(i.operation_id)} pending`);
    for (const r of report?.records) reconcileCheck.problems.push(`${String(r.path)}: ${String(r.reason)}`);
    for (const e of report?.evidence) if (e.status === "stale") reconcileCheck.problems.push(`${String(e.path)} ${String(e.at)}: stale evidence, ${String(e.reason)}`);
  }
  checks.push(reconcileCheck);
  return checks;
}
function migrationVerify(req, hooks) {
  return (ctx) => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    if (now.value.state === "json-control") return manifestPresent(wb, "verify");
    const read2 = readIndex(wb, req.plan);
    if (!read2.ok) return read2;
    const plan = read2.value;
    const frozen = frozenInventory(wb, plan);
    if (!frozen.ok) return frozen;
    const chunks = readChunks(wb, plan, plan.chunks);
    if (!chunks.ok) return chunks;
    const recordParts = readParts(wb, plan, "records");
    if (!recordParts.ok) return recordParts;
    for (const kind of ["findings", "repairs"]) {
      const r = readParts(wb, plan, kind);
      if (!r.ok) return r;
    }
    const baseline = readBaseline(wb, plan);
    if (!baseline.ok) return baseline;
    if (req.operation_id !== plan.index.schedule.verify) return refusal("conflict", "operation-id-unscheduled", `${plan.ref.path} schedules ${plan.index.schedule.verify} for verify, not ${req.operation_id}`);
    const f1 = chunkOneFence(plan);
    const fence = fenceNow(wb);
    if (!fence.ok) return fence;
    if (fence.value === null || fence.value.operation_id !== f1) return fenceRefused(fence.value, f1);
    const landed = landedChunks(wb, plan);
    if (!landed.ok) return landed;
    const missing = firstChunks(plan.chunks).filter((n) => !landed.value.includes(n));
    if (missing.length > 0) return refusal("migration-incomplete", "chunks-missing", `verify follows every chunk of ${plan.index.migration_id}; ${missing.length === 1 ? "chunk" : "chunks"} ${missing.join(", ")} ${missing.length === 1 ? "has" : "have"} not landed`);
    const expected = expectedState(frozen.value, chunks.value);
    if (!expected.ok) return expected;
    const actual = eligible(wb, plan);
    const diff = firstDifference(actual, expected.value);
    if (diff !== null) return sourceChanged(`the store is not the final state ${plan.index.migration_id} expects: ${diff}`);
    const own = ownDirectory(wb, plan, { originals: chunks.value, receipt: false, rollback: false }, sourceChanged);
    if (!own.ok) return own;
    const rows = /* @__PURE__ */ new Map();
    for (const part of recordParts.value) for (const [id, row] of Object.entries(part.records)) rows.set(id, row);
    const after = /* @__PURE__ */ new Map();
    for (const e of actual) if (e.kind === "file") after.set(e.path, e.sha256);
    const receipt = receiptPath(plan.index.migration_id);
    const manifest = manifestOf(plan.index, receipt);
    const view = { root: wb.root, state: "json-control", id: plan.index.workbench_id, manifest, diagnosis: null };
    const checks = runChecks(view, plan.index, rows, after, hooks);
    const failed = checks.filter((c) => c.problems.length > 0);
    if (failed.length > 0) {
      return refusal("migration-incomplete", "check-failed", `${failed.map((c) => `${c.name}: ${plural(c.problems.length, "problem")}, ${listed(c.problems)}`).join("; ")}; no receipt is written`);
    }
    const manifestBytes = Buffer.from(serialise(manifest), "utf-8");
    const v = ctx.validateResult(WORKBENCH_SCHEMA_ID, manifest, "the manifest verify would write is not valid");
    if (!v.ok) return v;
    const activated = [...actual, { path: WORKBENCH_MANIFEST, kind: "file", size: manifestBytes.byteLength, sha256: sha(manifestBytes) }];
    const counts = recordParts.value[0].counts;
    const receiptValue = {
      schema: RECEIPT_SCHEMA_ID.slice(SCHEMA_ID_PREFIX.length),
      migration_id: plan.index.migration_id,
      workbench_id: plan.index.workbench_id,
      source_layout: plan.index.source_layout,
      plan: { path: plan.ref.path, sha256: plan.ref.sha256 },
      parts: plan.index.parts.map((x) => ({ path: x.path, sha256: x.sha256 })),
      verify_operation_id: req.operation_id,
      after_inventory_sha256: inventoryDigest(activated),
      checks: checks.map((c) => ({ name: c.name, result: "passed", checked: c.checked })),
      counts,
      versions: { schemas: schemas().ids(), features: [...SUPPORTED_FEATURES] },
      manifest_revision: sha(manifestBytes)
    };
    const rv = ctx.validateResult(RECEIPT_SCHEMA_ID, receiptValue, "the receipt verify would write is not valid");
    if (!rv.ok) return rv;
    const receiptBytes = Buffer.from(serialise(receiptValue), "utf-8");
    const result = {
      operation_id: req.operation_id,
      migration_id: plan.index.migration_id,
      plan: { path: plan.ref.path, sha256: plan.ref.sha256 },
      checks: receiptValue.checks,
      counts,
      receipt: { path: receipt, sha256: sha(receiptBytes) },
      manifest: { path: WORKBENCH_MANIFEST, revision: sha(manifestBytes) }
    };
    return {
      ok: true,
      value: {
        writes: [
          { path: receipt, bytes: receiptBytes },
          { path: WORKBENCH_MANIFEST, bytes: manifestBytes }
        ],
        result
      }
    };
  };
}
var NO_OP_KEYS = "later_operations,manifest_revision,migration_id,no_op,operation_id,receipt";
var resultOf = (a) => a.response.ok && isObject3(a.response.result) ? a.response.result : {};
var exemptOf = (s) => ({ operation_id: s.entry.operation_id, op: s.entry.op, request_digest: s.entry.request_digest });
function boundBinding(wb, plan) {
  const a = stored(wb, plan.index.schedule.rollback[plan.chunks].operation_id);
  if (!a.ok) return a;
  if (a.value === null) return { ok: true, value: null };
  const b = resultOf(a.value).binding;
  if (!isObject3(b)) return { ok: true, value: null };
  return { ok: true, value: { path: String(b.path), sha256: String(b.sha256) } };
}
function readBinding(wb, plan, ref) {
  const bytes = regularBytes(wb, ref.path);
  if (bytes === null) return changed(`${ref.path} is no regular file; the first rollback after activation bound it at ${ref.sha256}`);
  if (sha(bytes) !== ref.sha256) return changed(`${ref.path} is ${sha(bytes)}; the first rollback after activation bound it at ${ref.sha256}`);
  const read2 = planFile(ref.path, bytes);
  if (!read2.ok) return changed(`${ref.path}: ${read2.why}`);
  const v = read2.value;
  if (v.part !== "rollback-binding" || v.migration_id !== plan.index.migration_id || canonical(v.plan) !== canonical(plan.ref)) return changed(`${ref.path} is not the rollback binding of ${plan.index.migration_id} at ${plan.ref.sha256}`);
  const ids = (v.no_ops ?? []).map((n) => n.operation_id);
  for (let i = 1; i < ids.length; i++) {
    if (bytewise(ids[i - 1], ids[i]) >= 0) return changed(`${ref.path} lists the no-op ${ids[i]} out of bytewise order or twice`);
  }
  return { ok: true, value: v };
}
function exemptSet(wb, plan, standing, now) {
  const f1 = chunkOneFence(plan);
  const verifyId = plan.index.schedule.verify;
  const verifies = now.filter((s) => s.answer !== null && s.entry.operation_id === verifyId && reconstructs(s.answer.request_digest, { op: "migration", operation_id: verifyId, phase: "verify", plan: plan.ref }, wb.root));
  const ends = now.filter((s) => s.answer !== null && s.entry.op === "maintenance" && reconstructs(s.answer.request_digest, { op: "maintenance", operation_id: s.entry.operation_id, action: "end", fence: f1 }, wb.root));
  const begins = now.filter((s) => s.answer !== null && s.entry.operation_id === standing.operation_id && reconstructs(s.answer.request_digest, { op: "maintenance", operation_id: standing.operation_id, action: "begin" }, wb.root));
  if (verifies.length !== 1 || ends.length !== 1 || begins.length !== 1) {
    return afterStateChanged(
      `the exempt operations of a rollback after activation are this migration's verify, the one maintenance end naming chunk 1's fence ${f1} and the begin of the standing fence ${standing.operation_id}, each found by its reconstructed request; found ${plural(verifies.length, "verify", "verifies")}, ${plural(ends.length, "end")} and ${plural(begins.length, "begin")}`
    );
  }
  return { ok: true, value: [verifies[0], ends[0], begins[0]].map((s) => exemptOf(s)).sort((a, b) => bytewise(a.operation_id, b.operation_id)) };
}
function provenNoOps(wb, plan, receipt, manifestRevision, later, exempt) {
  const exemptIds = new Set(exempt.map((e) => e.operation_id));
  const scheduled = scheduledRequests(plan.index, plan.ref);
  const out = [];
  for (const s of later) {
    const id = s.entry.operation_id;
    const a = s.answer;
    if (exemptIds.has(id) || a === null) continue;
    if (a.op !== "migration" || !a.response.ok || "revisions" in a.response) continue;
    const r = a.response.result;
    if (!isObject3(r) || Object.keys(r).sort().join(",") !== NO_OP_KEYS || r.no_op !== true || r.operation_id !== id || r.migration_id !== plan.index.migration_id) continue;
    if (scheduled.has(id) || !reconstructs(a.request_digest, { op: "migration", operation_id: id, phase: "plan", proposal: plan.index.proposal }, wb.root)) continue;
    const rc = r.receipt;
    if (!isObject3(rc) || Object.keys(rc).sort().join(",") !== "path,sha256" || rc.path !== receipt.path || rc.sha256 !== receipt.sha256 || r.manifest_revision !== manifestRevision) continue;
    out.push({ operation_id: id, request_digest: s.entry.request_digest, answer_sha256: s.entry.answer_sha256 });
  }
  return out.sort((x, y) => bytewise(x.operation_id, y.operation_id));
}
function boundNoOpsHold(noOps, now, path) {
  const byId = new Map(now.map((s) => [s.entry.operation_id, s]));
  for (const n of noOps) {
    const s = byId.get(n.operation_id);
    if (s === void 0 || s.answer === null || s.entry.op !== "migration" || s.entry.request_digest !== n.request_digest || s.entry.answer_sha256 !== n.answer_sha256) {
      return afterStateChanged(`the no-op ${n.operation_id} that ${path} binds is ${s === void 0 ? "missing" : `changed: it is ${s.entry.op} at ${s.entry.request_digest}, answer ${s.entry.answer_sha256}`}`);
    }
  }
  return { ok: true, value: void 0 };
}
function audit(plan, later, exempt, noOps) {
  const bound = new Map(exempt.map((e) => [e.operation_id, e]));
  const proven = new Map(noOps.map((n) => [n.operation_id, n]));
  for (const s of later) {
    const e = bound.get(s.entry.operation_id);
    if (e !== void 0 && s.answer !== null && e.op === s.entry.op && e.request_digest === s.entry.request_digest) continue;
    const n = proven.get(s.entry.operation_id);
    if (n !== void 0 && s.answer !== null && s.entry.op === "migration" && n.request_digest === s.entry.request_digest && n.answer_sha256 === s.entry.answer_sha256) continue;
    const what = s.answer !== null && s.entry.op === "maintenance" ? ` ${String(resultOf(s.answer).action)}` : "";
    return afterStateChanged(`the stored answer ${s.entry.operation_id} (${s.entry.op}${what}) is neither in the baseline ${plan.ref.path} froze, nor a validated answer of its schedule, nor one of the exempt operations, nor a proven no-op of this migration; a rollback after ordinary work is refused`);
  }
  return { ok: true, value: void 0 };
}
function baselineHolds(baseline, now) {
  const byId = new Map(now.map((s) => [s.entry.operation_id, s]));
  for (const e of baseline) {
    const s = byId.get(e.operation_id);
    if (s === void 0 || canonical(s.entry) !== canonical(e)) {
      return afterStateChanged(`the stored answer ${e.operation_id} (${e.op}) that the baseline froze at plan is ${s === void 0 ? "missing" : `changed: it is ${s.entry.op} at ${s.entry.request_digest}, answer ${s.entry.answer_sha256}`}`);
    }
  }
  return { ok: true, value: void 0 };
}
function receiptHolds(wb, plan, manifest) {
  const path = receiptPath(plan.index.migration_id);
  const unverified = (why) => refusal("migration-incomplete", "receipt-unverified", `the receipt ${path} of ${plan.index.migration_id} does not hold: ${why}`);
  const migration2 = manifest.migration;
  if (!isObject3(migration2) || migration2.receipt !== path) return unverified(`${WORKBENCH_MANIFEST} names ${isObject3(migration2) ? String(migration2.receipt) : "no receipt"}`);
  const bytes = regularBytes(wb, path);
  if (bytes === null) return unverified("it is no regular file in the workbench");
  const parsed = strictParse(bytes);
  if (!parsed.ok) return unverified(`${parsed.reason}: ${parsed.detail}`);
  const v = validate(RECEIPT_SCHEMA_ID, parsed.value);
  if (!v.ok) return unverified(v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`);
  const r = parsed.value;
  if (r.migration_id !== plan.index.migration_id || r.workbench_id !== plan.index.workbench_id || manifest.id !== plan.index.workbench_id) return unverified(`it names ${r.migration_id} in ${r.workbench_id}`);
  if (r.plan.path !== plan.ref.path || r.plan.sha256 !== plan.ref.sha256) return unverified(`it binds the index at ${r.plan.sha256}`);
  if (canonical(r.parts) !== canonical(plan.index.parts.map((x) => ({ path: x.path, sha256: x.sha256 })))) return unverified("its parts are not the index's");
  if (r.verify_operation_id !== plan.index.schedule.verify) return unverified(`it names the verify ${r.verify_operation_id}`);
  const manifestBytes = regularBytes(wb, WORKBENCH_MANIFEST);
  const revision = manifestBytes === null ? null : sha(manifestBytes);
  if (r.manifest_revision !== revision) return unverified(`it names the manifest at ${r.manifest_revision}, which is ${String(revision)}`);
  return { ok: true, value: { ref: { path, sha256: sha(bytes) }, after: r.after_inventory_sha256, revision: r.manifest_revision } };
}
function chunkAfterState(wb, chunk) {
  for (const w of chunk.writes) {
    if (w.kind === "original") continue;
    const bytes = regularBytes(wb, w.path);
    if (bytes === null || sha(bytes) !== w.after_sha256) return afterStateChanged(`${w.path} is ${bytes === null ? "no regular file" : sha(bytes)}; chunk ${chunk.chunk} left it at ${w.after_sha256}`);
  }
  return { ok: true, value: void 0 };
}
function migrationRollback(req) {
  return (ctx) => {
    const { wb } = ctx;
    const now = prefix(ctx);
    if (!now.ok) return now;
    const read2 = readIndex(wb, req.plan);
    if (!read2.ok) return read2;
    const plan = read2.value;
    const manifest = now.value.state === "json-control" ? now.value.manifest : null;
    const activated = manifest !== null && isObject3(manifest.migration) && manifest.migration.id === plan.index.migration_id;
    if (manifest !== null && !activated) return manifestPresent(wb, "rollback");
    const k = req.chunk;
    const frozen = frozenInventory(wb, plan);
    if (!frozen.ok) return frozen;
    const chunks = readChunks(wb, plan, plan.chunks);
    if (!chunks.ok) return chunks;
    for (const kind of ["records", "findings", "repairs"]) {
      const r = readParts(wb, plan, kind);
      if (!r.ok) return r;
    }
    const baseline = readBaseline(wb, plan);
    if (!baseline.ok) return baseline;
    let binding = null;
    if (!activated) {
      const ref = boundBinding(wb, plan);
      if (!ref.ok) return ref;
      if (ref.value !== null) {
        const b = readBinding(wb, plan, ref.value);
        if (!b.ok) return b;
        binding = { ref: ref.value, value: b.value };
      }
    }
    if (k > plan.chunks) return outOfOrder(`${plan.index.migration_id} has ${plural(plan.chunks, "chunk")}; there is no chunk ${k} to roll back`);
    const scheduled = plan.index.schedule.rollback[k].operation_id;
    if (req.operation_id !== scheduled) return refusal("conflict", "operation-id-unscheduled", `${plan.ref.path} schedules ${scheduled} for rollback chunk ${k}, not ${req.operation_id}`);
    const f1 = chunkOneFence(plan);
    const fence = fenceNow(wb);
    if (!fence.ok) return fence;
    const standing = fence.value;
    let fenceOk;
    let wanted;
    if (activated) {
      wanted = "the fence of a stored maintenance begin";
      const begin = standing === null ? null : stored(wb, standing.operation_id);
      if (begin !== null && !begin.ok) return begin;
      fenceOk = begin !== null && begin.value !== null && begin.value.op === "maintenance" && resultOf(begin.value).action === "begin";
    } else if (binding !== null) {
      wanted = binding.value.fence;
      fenceOk = standing !== null && standing.operation_id === wanted;
    } else {
      const applied = stored(wb, f1);
      if (!applied.ok) return applied;
      wanted = f1;
      fenceOk = applied.value === null ? standing === null || standing.operation_id === f1 : standing !== null && standing.operation_id === f1;
    }
    if (!fenceOk) return fenceRefused(standing, wanted);
    const landed = landedChunks(wb, plan);
    if (!landed.ok) return landed;
    const highest = landed.value.length === 0 ? 0 : Math.max(...landed.value);
    if (k !== highest) return outOfOrder(k === 0 ? `rollback chunk 0 follows the rollback of every chunk; the chunks landed are ${chunkList(landed.value)}` : `rollback runs from the highest landed chunk down; the chunks landed are ${chunkList(landed.value)}, so chunk ${k} is not next`);
    if (activated && k !== plan.chunks) return outOfOrder(`after activation every chunk of ${plan.index.migration_id} is landed; rollback starts at chunk ${plan.chunks}`);
    let receipt = null;
    let bindingBytes = null;
    if (activated) {
      const held2 = receiptHolds(wb, plan, manifest);
      if (!held2.ok) return held2;
      receipt = held2.value.ref;
      const actual = eligible(wb, plan);
      if (inventoryDigest(actual) !== held2.value.after) {
        const expected = expectedState(frozen.value, chunks.value);
        if (!expected.ok) return expected;
        const manifestBytes = regularBytes(wb, WORKBENCH_MANIFEST);
        expected.value.set(WORKBENCH_MANIFEST, { path: WORKBENCH_MANIFEST, kind: "file", size: manifestBytes.byteLength, sha256: sha(manifestBytes) });
        return afterStateChanged(`the store differs from the activated tree the receipt names (${held2.value.after}): ${firstDifference(actual, expected.value) ?? "an entry differs from the one verify compared"}`);
      }
      const answers = storedNow(wb);
      const base = baselineHolds(baseline.value, answers);
      if (!base.ok) return base;
      const derived = exemptSet(wb, plan, standing, answers);
      if (!derived.ok) return derived;
      const exempt = derived.value;
      const later = laterOperations(wb, plan, baseline.value, answers);
      const noOps = provenNoOps(wb, plan, held2.value.ref, held2.value.revision, later, exempt);
      const audited = audit(plan, later, exempt, noOps);
      if (!audited.ok) return audited;
      const value = { schema: PLAN_SCHEMA, part: "rollback-binding", migration_id: plan.index.migration_id, plan: plan.ref, receipt: held2.value.ref, fence: standing.operation_id, exempt, ...noOps.length > 0 ? { no_ops: noOps } : {} };
      const bytes = Buffer.from(serialise(value), "utf-8");
      if (bytes.byteLength > MAX_RECORD_BYTES) {
        return refusal("schema-invalid", "too-large", `${rollbackPath(plan.index.migration_id)} would be ${bytes.byteLength} bytes, binding ${plural(noOps.length, "proven no-op")}; the strict reader's cap is ${MAX_RECORD_BYTES} bytes (1 MiB), so it could not be read back, and nothing is written`);
      }
      const v = ctx.validateResult(PLAN_SCHEMA_ID, value, "the rollback binding this rollback would write is not valid");
      if (!v.ok) return v;
      bindingBytes = bytes;
    } else if (binding !== null) {
      const answers = storedNow(wb);
      const bound2 = boundNoOpsHold(binding.value.no_ops ?? [], answers, binding.ref.path);
      if (!bound2.ok) return bound2;
      const audited = audit(plan, laterOperations(wb, plan, baseline.value, answers), binding.value.exempt, binding.value.no_ops ?? []);
      if (!audited.ok) return audited;
    }
    const originals = chunks.value.slice(0, k);
    const own = ownDirectory(wb, plan, { originals, receipt: activated, rollback: binding !== null }, afterStateChanged);
    if (!own.ok) return own;
    if (k === 0) {
      const diff = firstDifference(eligible(wb, plan), new Map(frozen.value.map((e) => [e.path, e])));
      if (diff !== null) return afterStateChanged(`rollback chunk 0 runs on the frozen input of ${plan.index.migration_id} and the store differs: ${diff}`);
      return chunkZero(wb, req, plan, binding?.ref ?? null, standing);
    }
    const chunk = chunks.value[k - 1];
    const after = chunkAfterState(wb, chunk);
    if (!after.ok) return after;
    const writes = [];
    const removals = [];
    const restored = [];
    let bound = null;
    if (activated) {
      const bytes = bindingBytes;
      bound = { path: rollbackPath(plan.index.migration_id), sha256: sha(bytes) };
      writes.push({ path: bound.path, bytes });
      removals.push({ path: WORKBENCH_MANIFEST, before: sha(regularBytes(wb, WORKBENCH_MANIFEST)) }, { path: receipt.path, before: receipt.sha256 });
    }
    const originalOf = new Map(chunk.writes.filter((w) => w.kind === "original").map((w) => [w.from, w]));
    for (const w of chunk.writes) {
      if (w.kind !== "rewrite") continue;
      const original = originalOf.get(w.path);
      const bytes = original === void 0 ? null : regularBytes(wb, original.path);
      if (original === void 0 || bytes === null || sha(bytes) !== w.source_sha256) return afterStateChanged(`the original of ${w.path} is not at ${w.source_sha256}`);
      writes.push({ path: w.path, bytes });
      restored.push(w.path);
    }
    for (const w of chunk.writes) if (w.kind === "control") removals.push({ path: w.path, before: w.after_sha256 });
    for (const w of chunk.writes) if (w.kind === "original") removals.push({ path: w.path, before: w.after_sha256 });
    const result = { operation_id: req.operation_id, migration_id: plan.index.migration_id, chunk: k, restored, removed: removals.map((r) => r.path), activation_undone: activated, ...bound !== null ? { binding: bound } : {} };
    return { ok: true, value: { writes, removals, result } };
  };
}
function chunkZero(wb, req, plan, binding, standing) {
  let m = 0;
  for (let n = 1; n <= plan.chunks; n++) {
    const a = stored(wb, plan.index.schedule.apply[n - 1].operation_id);
    if (!a.ok) return a;
    if (a.value !== null) m = n;
  }
  const progress = [];
  for (let n = m; n >= 1; n--) {
    const e = plan.index.schedule.rollback[n];
    const a = stored(wb, e.operation_id);
    if (!a.ok) return a;
    const r = a.value === null ? null : resultOf(a.value);
    if (a.value === null || a.value.op !== "migration" || !a.value.response.ok || r?.migration_id !== plan.index.migration_id || r.chunk !== n || !reconstructs(a.value.request_digest, rollbackRequest(plan.ref, e), wb.root)) {
      return afterStateChanged(`rollback chunk 0 lists the rollback of chunk ${n} under ${e.operation_id}, and its stored answer is ${a.value === null ? "missing" : "not that request's answer"}`);
    }
    progress.push({ chunk: n, operation_id: e.operation_id, request_digest: a.value.request_digest });
  }
  progress.push({ chunk: 0, operation_id: req.operation_id, request_digest: requestDigest(req) });
  const removals = [];
  for (const x of plan.index.parts.filter((p) => p.part === "chunk")) removals.push({ path: x.path, before: x.sha256 });
  for (const x of plan.index.parts.filter((p) => p.part !== "chunk")) removals.push({ path: x.path, before: x.sha256 });
  if (binding !== null) removals.push({ path: binding.path, before: binding.sha256 });
  removals.push({ path: plan.ref.path, before: plan.ref.sha256 });
  const result = {
    operation_id: req.operation_id,
    migration_id: plan.index.migration_id,
    chunk: 0,
    restored: [],
    removed: removals.map((r) => r.path),
    activation_undone: false,
    plan: { path: plan.ref.path, sha256: plan.ref.sha256 },
    fence: standing === null ? null : standing.operation_id,
    progress,
    progress_sha256: progressDigest(progress)
  };
  return { ok: true, value: { writes: [], removals, result } };
}
var progressDigest = (progress) => sha(Buffer.from(canonical(progress), "utf-8"));
function cleanupEvidence(wb, fence) {
  const plain = `${wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)`;
  const legacy = (why) => refusal("unsupported-format", "legacy-workbench", `${plain}, but for the end of a fence a complete migration rollback names, and ${why}`);
  const now = storedNow(wb);
  const zeros = now.filter((s) => s.answer !== null && s.entry.op === "migration" && s.answer.response.ok && resultOf(s.answer).chunk === 0 && Array.isArray(resultOf(s.answer).progress) && resultOf(s.answer).fence === fence);
  if (zeros.length === 0) return refusal("unsupported-format", "legacy-workbench", plain);
  if (zeros.length > 1) return legacy(`${zeros.length} stored rollback chunk 0 answers name the fence ${fence}; exactly one must`);
  const zero = zeros[0];
  const r = resultOf(zero.answer);
  const progress = r.progress;
  const shaped = progress.every((p) => isObject3(p) && Object.keys(p).sort().join(",") === "chunk,operation_id,request_digest" && Number.isInteger(p.chunk) && typeof p.operation_id === "string" && typeof p.request_digest === "string");
  const list2 = progress;
  const last = list2.at(-1);
  if (!shaped || last === void 0 || last.chunk !== 0 || last.operation_id !== zero.entry.operation_id || last.request_digest !== zero.entry.request_digest || !list2.every((p, i) => p.chunk === list2.length - 1 - i)) {
    return legacy(`the progress of ${zero.entry.operation_id} is no list of the applied prefix's rollbacks ending at this chunk 0`);
  }
  const byId = new Map(now.map((s) => [s.entry.operation_id, s]));
  for (const p of list2.slice(0, -1)) {
    const s = byId.get(p.operation_id);
    const pr = s === void 0 || s.answer === null ? null : resultOf(s.answer);
    if (s === void 0 || s.answer === null || pr === null || s.entry.op !== "migration" || !s.answer.response.ok || s.entry.request_digest !== p.request_digest || pr.migration_id !== r.migration_id || pr.chunk !== p.chunk) {
      return legacy(`the rollback of chunk ${p.chunk} that ${zero.entry.operation_id} lists under ${p.operation_id} is ${s === void 0 ? "not stored" : "not the answer it lists"}`);
    }
  }
  if (progressDigest(list2) !== r.progress_sha256) return legacy(`the progress of ${zero.entry.operation_id} digests to ${progressDigest(list2)}, and it answered ${String(r.progress_sha256)}`);
  return { ok: true, value: { migration_id: String(r.migration_id) } };
}

// src/kernel.ts
import { readdirSync as readdirSync5, readFileSync as readFileSync5 } from "node:fs";

// src/cli/protocol.ts
var PROTOCOL_SCHEMA_ID = "urn:fusion:schema:fusion.protocol/v1";
var OPERATIONS = [
  "inspect",
  "list",
  "show",
  "validate",
  "initialize",
  "create",
  "transition",
  "claim",
  "release",
  "set-mode",
  "set-dependencies",
  "adopt-plan",
  "attach-evidence",
  "reconcile",
  "maintenance",
  "migration"
];
var IMPLEMENTED_OPERATIONS = ["inspect", "list", "show", "validate", "initialize", "create", "transition", "claim", "release", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "reconcile", "maintenance", "migration"];
var LANDS_IN = {};
var fail = (cls, reason, detail, errors) => ({
  ok: false,
  error: { class: cls, reason, ...detail !== void 0 ? { detail } : {}, ...errors !== void 0 ? { errors } : {} }
});
var isOperation = (op) => typeof op === "string" && OPERATIONS.includes(op);

// src/kernel.ts
var CutReached = class extends Error {
  constructor(cut2) {
    super(`fault injection: the operation was cut at ${cut2}`);
    this.cut = cut2;
    this.name = "CutReached";
  }
};
var blockedOf = (p, diverged) => ({
  operation_id: p.intent.operation_id,
  paths: p.intent.writes.map((w) => w.path),
  diverged: diverged.map((w) => w.path)
});
var heldOf = (p) => ({ operation_id: p.intent.operation_id, paths: p.intent.writes.map((w) => w.path), diverged: [], held: p.intent.op });
function isHeld(p, req, digest = req === null ? null : requestDigest(req)) {
  if (req !== null && p.intent.operation_id === req.operation_id && p.intent.request_digest === digest) return false;
  return p.intent.op === "migration" || req?.op === "migration" && p.intent.op === "initialize";
}
function recoveryBlocked(b) {
  if (b.held !== void 0) {
    return {
      class: "operation-unknown",
      reason: "migration-pending",
      detail: `operation ${b.operation_id} (${b.held}) is pending in .json-state/journal/${b.operation_id}, and only its own request finishes it; until then the files it names (${b.paths.join(", ")}) are not answered as fact`
    };
  }
  const files = b.diverged.join(", ");
  const verb = b.diverged.length === 1 ? "is" : "are";
  return {
    class: "operation-unknown",
    reason: "recovery-blocked",
    detail: `operation ${b.operation_id} is pending in .json-state/journal/${b.operation_id} and cannot land: ${files} ${verb} at neither the pre- nor the post-bytes it names (edited by hand, or changed by a pull); restore the file to its pre-bytes, or remove the intent directory and accept what landed`
  };
}
var blockedOn = (blocked, path) => blocked.find((b) => b.paths.includes(path));
function blockedIntent(wb, p) {
  const diverged = p.intent.writes.filter((w) => fileState(wb, w) === "diverged");
  return diverged.length === 0 ? null : blockedOf(p, diverged);
}
var refuse2 = (e) => fail(e.class, e.reason, e.detail, e.errors);
var ok = (value) => ({ ok: true, value });
var no = (cls, reason, detail) => ({ ok: false, error: { class: cls, reason, detail } });
var JSON_CONTROL_ONLY = ["json-control"];
var EVERY_STATE = ["json-control", "legacy", "unsupported"];
async function mutate(wb, req, plan, options = {}, admits = JSON_CONTROL_ONLY) {
  if (!admits.includes(wb.state)) {
    if (wb.state === "legacy") return fail("unsupported-format", "legacy-workbench", `${wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)`);
    if (wb.state === "unsupported") return fail("unsupported-format", wb.diagnosis?.reason ?? "unsupported", wb.diagnosis?.detail ?? "the manifest is unsupported");
    throw new Error(`mutate: ${req.op} admits ${admits.join(", ")}, and the workbench is ${wb.state}`);
  }
  const faults = options.faults;
  const point = async (at) => {
    await faults?.pause?.(at);
    if (faults?.cutAt === at) throw new CutReached(at);
  };
  const lock = await acquireLock(wb, options);
  if (!lock.ok) return refuse2(lock.error);
  try {
    await faults?.pause?.("locked");
    sweep(wb);
    const pending = readIntents(wb);
    if (!pending.ok) return refuse2(pending.error);
    const digest = requestDigest(req);
    const blocked = [];
    for (const p of pending.value) {
      if (isHeld(p, req, digest)) {
        blocked.push(heldOf(p));
        continue;
      }
      const r = recover(wb, p);
      if (!r.landed) blocked.push(blockedOf(p, r.blocked));
    }
    const own = pending.value.find((p) => p.intent.operation_id === req.operation_id);
    const ownBlocked = blocked.find((b) => b.operation_id === req.operation_id);
    if (own !== void 0 && ownBlocked !== void 0) {
      return own.intent.request_digest === digest ? refuse2(recoveryBlocked(ownBlocked)) : reused(req.operation_id);
    }
    const replay = replayAnswer(wb, req);
    if (!replay.ok) return refuse2(replay.error);
    if (replay.value !== null) return replay.value;
    const fence = readFence(wb);
    const fenced = req.op === "migration" ? null : fenceRefusal(req, fence);
    if (fenced !== null) return refuse2(fenced);
    const planned = await plan(planContext(wb, blocked, fence.ok ? fence.value : null));
    if (!planned.ok) return refuse2(planned.error);
    const removals = planned.value.removals ?? [];
    if (planned.value.fence !== void 0) {
      if (planned.value.writes.length > 0 || removals.length > 0 || planned.value.fenceFirst !== void 0) throw new Error(`the plan of ${req.op} sets a fence and writes files`);
      const response2 = { ok: true, result: planned.value.result };
      if (planned.value.fence === null) removeFence(wb);
      else writeFence(wb, planned.value.fence);
      writeAnswer(wb, { operation_id: req.operation_id, op: req.op, request_digest: digest, response: response2 });
      return response2;
    }
    for (const w of [...planned.value.writes, ...removals]) {
      const b = blockedOn(blocked, w.path);
      if (b !== void 0) return refuse2(recoveryBlocked(b));
    }
    const writes = [];
    const contents = /* @__PURE__ */ new Map();
    const named = (path) => {
      const abs = resolveInside(wb, path);
      if (abs.ok && writes.some((x) => x.path === path)) throw new Error(`the plan of ${req.op} writes ${path} twice`);
      return abs;
    };
    for (const w of planned.value.writes) {
      const abs = named(w.path);
      if (!abs.ok) return refuse2(abs.error);
      writes.push({ path: w.path, before: hashOrNull(abs.value), after: revisionOf(w.bytes) });
      contents.set(w.path, w.bytes);
    }
    for (const r of removals) {
      const abs = named(r.path);
      if (!abs.ok) return refuse2(abs.error);
      writes.push({ path: r.path, before: r.before, after: null });
    }
    const response = {
      ok: true,
      result: planned.value.result,
      ...planned.value.revisions !== void 0 ? { revisions: planned.value.revisions } : {}
    };
    const now = options.now ?? Date.now;
    const phase = req.op === "migration" ? req.phase : void 0;
    const intent = { operation_id: req.operation_id, op: req.op, ...typeof phase === "string" ? { phase } : {}, request_digest: digest, writes, response, created_at: new Date(now()).toISOString() };
    const first = planned.value.fenceFirst;
    if (first !== void 0) {
      const standing = readFence(wb);
      if (!standing.ok || standing.value === null || standing.value.operation_id !== first.operation_id) writeFence(wb, first);
      await point("after-fence");
    }
    const committed = commitIntent(wb, intent, contents);
    if (!committed.ok) return refuse2(committed.error);
    await point("after-intent");
    for (let i = 0; i < writes.length; i++) {
      applyWrites(wb, [writes[i]], contents);
      await point(`after-write:${i}`);
    }
    writeAnswer(wb, { operation_id: req.operation_id, op: req.op, request_digest: digest, response });
    await point("after-answer");
    removeIntent(wb, req.operation_id);
    return response;
  } finally {
    releaseLock(lock.value);
  }
}
function fenceRefusal(req, fence) {
  if (req.op === "initialize") return null;
  if (!fence.ok) return { class: "conflict", reason: "maintenance-active", detail: fence.error.detail };
  if (fence.value === null) return null;
  const r = req;
  if (r.op === "maintenance" && r.action === "end" && r.fence === fence.value.operation_id) return null;
  return {
    class: "conflict",
    reason: "maintenance-active",
    detail: `a maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}, set by operation ${fence.value.operation_id} since ${fence.value.since}; every fresh mutation is refused until the maintenance end naming it`
  };
}
var reused = (id) => fail("conflict", "operation-id-reused", `operation_id ${id} was already used for a different request`);
function hashOrNull(abs) {
  try {
    return revisionOf(readFileSync5(abs));
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}
function planContext(wb, blocked, fence) {
  return {
    ...readContext(wb, blocked),
    blocked,
    fence,
    cas(pair, expected) {
      if (pair.revision !== expected) return no("conflict", "revision-mismatch", `stored ${pair.revision} expected ${expected}`);
      return ok(void 0);
    },
    validateResult(schemaId, value, what) {
      const v = validate(schemaId, value);
      if (v.ok) return ok(void 0);
      if (v.class === "unsupported-format") return no("unsupported-format", "unknown-schema", `no schema ${v.schemaId}`);
      return { ok: false, error: { class: "schema-invalid", reason: "result-invalid", detail: `${what}: ${describeErrors(v.errors)}`, errors: v.errors } };
    }
  };
}
function readContext(wb, blocked) {
  return {
    wb,
    readPair(path) {
      const b = blockedOn(blocked, path);
      if (b !== void 0) return { ok: false, error: recoveryBlocked(b) };
      return readPair(wb, path);
    },
    resolveRecordId(id) {
      const hits = [];
      for (const path of controlFiles(wb, wb.root)) {
        const abs = resolveInside(wb, path);
        if (!abs.ok) continue;
        const parsed = strictParse(readFileSync5(abs.value));
        if (parsed.ok && parsed.value.id === id) hits.push(path);
      }
      if (hits.length === 0) return no("unresolved-reference", "record-not-found", `no control file in ${wb.root} carries the id ${id}`);
      if (hits.length > 1) return no("conflict", "ambiguous-reference", `the id ${id} is carried by ${hits.join(", ")}`);
      return ok({ path: hits[0], id });
    },
    resolveArtefact(ref) {
      const abs = resolveInside(wb, ref.path);
      if (!abs.ok) return abs;
      const current2 = hashOrNull(abs.value);
      if (current2 === null) return no("unresolved-reference", "artefact-missing", `${ref.path} does not exist in ${wb.root}`);
      if (current2 !== ref.sha256) return no("missing-evidence", "artefact-changed", `${ref.path} is ${current2}, the reference names ${ref.sha256}`);
      return ok({ path: ref.path, sha256: current2 });
    }
  };
}
var NO_VIEW = { blocked: [], blockedOn: () => void 0 };
function heldView(wb) {
  const held2 = [];
  let ids;
  try {
    ids = pendingIds(wb);
  } catch {
    return NO_VIEW;
  }
  for (const id of ids) {
    const r = readIntent(wb, id);
    if (r.ok && r.value !== null && isHeld(r.value, null)) held2.push(heldOf(r.value));
  }
  return held2.length === 0 ? NO_VIEW : { blocked: held2, blockedOn: (path) => blockedOn(held2, path) };
}
function answeredIds(wb) {
  try {
    return readdirSync5(opsDir(wb)).filter((n) => !n.startsWith(".") && n.endsWith(".json")).map((n) => n.slice(0, -".json".length));
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
async function snapshot(wb, phase, faults) {
  const journal = pendingIds(wb);
  await faults?.pause?.(`read:${phase}:between-listings`);
  const ops = answeredIds(wb);
  return { journal, key: [.../* @__PURE__ */ new Set([...journal, ...ops])].sort().join("\n") };
}
function classify(wb, ids) {
  const blocked = [];
  for (const id of ids) {
    const r = readIntent(wb, id);
    if (!r.ok || r.value === null) {
      if (!pendingIds(wb).includes(id)) return { kind: "changed" };
      if (!r.ok) return { kind: "unreadable", error: r.error };
      continue;
    }
    if (isHeld(r.value, null)) {
      blocked.push(heldOf(r.value));
      continue;
    }
    const b = blockedIntent(wb, r.value);
    if (b === null) return { kind: "live" };
    blocked.push(b);
  }
  return { kind: "stable", blocked };
}
async function recoverUnderLock(wb, options) {
  const lock = await acquireLock(wb, options);
  if (!lock.ok) return lock;
  try {
    sweep(wb);
    const pending = readIntents(wb);
    if (!pending.ok) return pending;
    for (const p of pending.value) if (!isHeld(p, null)) recover(wb, p);
    return ok(void 0);
  } finally {
    releaseLock(lock.value);
  }
}
async function read(wb, body, options = {}) {
  if (wb.state !== "json-control") return ok(await body(heldView(wb)));
  const now = options.now ?? Date.now;
  const waitMs = options.waitMs ?? LOCK_STALE_MS + 5e3;
  const started = now();
  for (; ; ) {
    const before = await snapshot(wb, "before", options.faults);
    const c = before.journal.length === 0 ? { kind: "stable", blocked: [] } : classify(wb, before.journal);
    if (c.kind === "unreadable") return { ok: false, error: c.error };
    if (c.kind === "live") {
      const remaining = Math.max(0, waitMs - (now() - started));
      const r = await recoverUnderLock(wb, { ...options, waitMs: remaining });
      if (!r.ok) return r;
    } else if (c.kind === "stable") {
      const blocked = c.blocked;
      const value = await body({ blocked, blockedOn: (path) => blockedOn(blocked, path) });
      const after = await snapshot(wb, "after", options.faults);
      if (after.key === before.key) return ok(value);
    }
    if (now() - started >= waitMs) {
      return no("conflict", "lock-timeout", `no consistent read of ${wb.root} within ${waitMs} ms: operations kept starting or landing under it`);
    }
  }
}

// src/transitions.ts
import { readFileSync as readFileSync6 } from "node:fs";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var CONTRACT_DIR = fileURLToPath2(new URL("../contract/", import.meta.url));
function readTable(file) {
  const abs = CONTRACT_DIR + file;
  const parsed = strictParse(readFileSync6(abs));
  if (!parsed.ok) throw new Error(`${abs}: ${parsed.reason}: ${parsed.detail}`);
  return parsed.value;
}
var transitionsTable;
var dependenciesTable;
var transitions = () => transitionsTable ??= readTable("transitions.json");
var dependencies = () => dependenciesTable ??= readTable("dependencies.json");
function useTables(t, d) {
  transitionsTable = t;
  dependenciesTable = d;
}
var kinds = () => Object.keys(transitions().kinds);
var refuse3 = (cls, reason) => ({ ok: false, class: cls, reason });
var isObject4 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function allowed(kind, from, to, payload = {}) {
  const table = transitions().kinds[kind];
  if (table === void 0) return refuse3("schema-invalid", `unknown kind "${kind}"; the table controls ${kinds().join(", ")}`);
  if (!table.states.includes(from)) return refuse3("schema-invalid", `"${from}" is not a ${kind} state`);
  if (!table.states.includes(to)) return refuse3("schema-invalid", `"${to}" is not a ${kind} state`);
  const edge = table.edges.find((e) => e.from === from && e.to === to);
  if (edge === void 0) {
    const why = table.terminal.includes(from) ? `${from} is terminal (${table.reopen})` : `no edge ${from} -> ${to} in the table`;
    return refuse3("conflict", `${kind}: ${why}`);
  }
  switch (kind) {
    case "package":
      return packageRules(table, to, payload);
    case "issue":
      return issueRules(table, to, payload);
    case "decision":
      return decisionRules(edge, payload);
    default:
      return { ok: true };
  }
}
function packageRules(table, to, payload) {
  const claimRule = table.claim?.[to];
  const hasClaim = isObject4(payload.claim);
  if (claimRule === "required" && !hasClaim) return refuse3("schema-invalid", `package: ${to} requires a claim`);
  if (claimRule === "forbidden" && payload.claim != null) return refuse3("schema-invalid", `package: ${to} carries no claim`);
  const terminal = table.terminal.includes(to);
  const outcome = payload.outcome ?? null;
  if (!terminal) {
    if (outcome !== null) return refuse3("schema-invalid", `package: outcome is null while ${to}`);
    return { ok: true };
  }
  if (!isObject4(outcome)) return refuse3("schema-invalid", `package: ${to} requires an outcome`);
  const classes = table.outcome_classes?.[to] ?? [];
  if (!classes.includes(outcome.class)) {
    return refuse3("schema-invalid", `package: ${to} admits the outcome classes ${classes.join(", ")}, not "${outcome.class}"`);
  }
  return { ok: true };
}
function issueRules(table, to, payload) {
  const terminal = table.terminal.includes(to);
  const hasDisposition = isObject4(payload.disposition);
  if (terminal && !hasDisposition) return refuse3("schema-invalid", `issue: ${to} requires a disposition`);
  if (!terminal && payload.disposition != null) return refuse3("schema-invalid", `issue: disposition is null while ${to}`);
  return { ok: true };
}
function decisionRules(edge, payload) {
  if (edge.requires === void 0) return { ok: true };
  const value = payload[edge.requires];
  if (value === void 0 || value === null) return refuse3("schema-invalid", `decision: ${edge.to} requires ${edge.requires}`);
  return { ok: true };
}
function stateRules(kind, state, payload = {}) {
  const table = transitions().kinds[kind];
  if (table === void 0) return refuse3("schema-invalid", `unknown kind "${kind}"; the table controls ${kinds().join(", ")}`);
  if (!table.states.includes(state)) return refuse3("schema-invalid", `"${state}" is not a ${kind} state`);
  switch (kind) {
    case "package":
      return packageRules(table, state, payload);
    case "issue":
      return issueRules(table, state, payload);
    default:
      return { ok: true };
  }
}
function stepAllowed(from, to) {
  const table = transitions().kinds["plan"];
  if (table === void 0 || table.step_states === void 0 || table.step_edges === void 0) {
    return refuse3("schema-invalid", "the table carries no plan step vocabulary");
  }
  if (!table.step_states.includes(from)) return refuse3("schema-invalid", `"${from}" is not a plan step state`);
  if (!table.step_states.includes(to)) return refuse3("schema-invalid", `"${to}" is not a plan step state`);
  if (!table.step_edges.some((e) => e.from === from && e.to === to)) return refuse3("conflict", `plan step: no edge ${from} -> ${to}`);
  return { ok: true };
}
function dependencySatisfied(condition, target) {
  const table = dependencies();
  const rule = table.conditions[condition];
  if (rule === void 0) {
    return refuse3("schema-invalid", `unknown depends_on condition "${condition}"; the table knows ${Object.keys(table.conditions).join(", ")}`);
  }
  if (!rule.target_status.includes(target.status)) {
    return refuse3("conflict", `${condition}: the target is ${target.status}, not ${rule.target_status.join(" or ")}`);
  }
  if (rule.outcome_class !== null) {
    const cls = target.outcome?.class;
    if (cls === void 0 || !rule.outcome_class.includes(cls)) {
      return refuse3("missing-evidence", `${condition}: the target's outcome class is ${cls ?? "absent"}, not ${rule.outcome_class.join(" or ")}`);
    }
  }
  if (rule.evidence === null) return { ok: true };
  const bindings = target.outcome?.evidence ?? [];
  const means = rule.evidence.accepted_means;
  let accepted = 0;
  for (const b of bindings) {
    const record = target.evidence_records?.[b.ref.record_id];
    if (record === void 0) {
      return refuse3("unresolved-reference", `${condition}: the outcome binds evidence ${b.ref.record_id}, which was not supplied`);
    }
    if (!means.verdict.includes(record.verdict)) continue;
    if (means.revision_matches && record.revision !== b.ref.revision) continue;
    accepted++;
  }
  if (accepted < rule.evidence.min_accepted) {
    return refuse3(
      "missing-evidence",
      `${condition}: ${accepted} accepted evidence binding(s) at a current revision, ${rule.evidence.min_accepted} required`
    );
  }
  return { ok: true };
}

// src/cli/ops.ts
var fromStore = (e) => fail(e.class, e.reason, e.detail, e.errors);
var notImplemented = (op) => fail("operation-unknown", "not-implemented", `${op} is specified (spec section 6) and lands in ${LANDS_IN[op] ?? "a later package"}`);
async function dispatch(request, options = {}) {
  if (typeof request !== "object" || request === null || Array.isArray(request)) {
    return fail("schema-invalid", "request-not-an-object", "a request is one JSON object");
  }
  const op = request.op;
  if (!isOperation(op)) {
    return fail("operation-unknown", "unknown-op", `${JSON.stringify(op)} is none of ${OPERATIONS.join(", ")}`);
  }
  const v = validate(PROTOCOL_SCHEMA_ID, request);
  if (!v.ok) {
    if (v.class === "unsupported-format") return fail("unsupported-format", "protocol-schema-missing", `no schema ${v.schemaId} loaded`);
    return fail("schema-invalid", "request", describeErrors(v.errors), v.errors);
  }
  const req = request;
  if (!IMPLEMENTED_OPERATIONS.includes(req.op)) return notImplemented(req.op);
  const root = req.workbench ?? options.defaultWorkbench;
  if (root === void 0) return fail("unknown-scope", "workbench-unspecified", "the request names no workbench and FUSION_WORKBENCH is not set");
  const opened = openWorkbench(root);
  if (!opened.ok) return fromStore(opened.error);
  const wb = opened.value;
  const kernel = options.kernel ?? {};
  switch (req.op) {
    case "inspect":
      return inspect(wb);
    case "list":
      return readable(wb) ?? reading(wb, (view) => list(wb, req, view), kernel);
    case "show":
      return readable(wb) ?? reading(wb, (view) => show(wb, req, view), kernel);
    case "validate":
      return readable(wb) ?? reading(wb, (view) => validateOp(wb, req, view), kernel);
    case "initialize":
      return initialize(wb, req, kernel);
    case "create":
      return mutate(wb, req, req.kind === "evidence" ? createEvidencePlan(req) : createPlan(req), kernel);
    case "transition":
      return mutate(wb, req, transitionPlan(req, payloadAdmitted(req)), kernel);
    case "claim":
      return mutate(wb, req, claimPlan(req), kernel);
    case "release":
      return mutate(wb, req, releasePlan(req), kernel);
    case "set-mode":
      return mutate(wb, req, setModePlan(req), kernel);
    case "set-dependencies":
      return mutate(wb, req, setDependenciesPlan(req), kernel);
    case "adopt-plan":
      return mutate(wb, req, adoptPlanPlan(req), kernel);
    case "attach-evidence":
      return mutate(wb, req, attachEvidencePlan(req), kernel);
    case "reconcile":
      return readable(wb) ?? reading(wb, (view) => reconcile(wb, req, view), kernel);
    case "maintenance":
      return maintenance(wb, req, kernel);
    case "migration":
      return migration(wb, req, kernel);
    default:
      return notImplemented(req.op);
  }
}
function readable(wb) {
  if (wb.state === "unsupported" && wb.diagnosis !== null) return fromStore(wb.diagnosis);
  return null;
}
async function reading(wb, body, options) {
  const r = await read(wb, body, options);
  return r.ok ? r.value : fromStore(r.error);
}
function inspect(wb) {
  const pending = pendingOperation(wb);
  if (!pending.ok) return fromStore(pending.error);
  const fence = readFence(wb);
  if (!fence.ok) return fromStore(fence.error);
  return {
    ok: true,
    result: {
      workbench: wb.root,
      state: wb.state,
      id: wb.id,
      manifest: wb.manifest,
      diagnosis: wb.diagnosis,
      pending: pending.value,
      maintenance: fence.value,
      schemas: schemas().ids(),
      features: [...SUPPORTED_FEATURES],
      kinds: [...KINDS],
      operations: {
        implemented: [...IMPLEMENTED_OPERATIONS],
        deferred: OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o))
      }
    }
  };
}
var NAMED_ENTRIES = 5;
var isDirectoryEntry = (path) => {
  try {
    return lstatSync4(path).isDirectory();
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
};
var namesIn = (dir) => {
  try {
    return readdirSync6(dir);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
};
function initialContent(root) {
  const found = [];
  for (const name of namesIn(root)) {
    const state = join5(root, name);
    if (name !== STATE_DIR || isDirectoryEntry(state) !== true) {
      found.push(name);
      continue;
    }
    for (const inner of namesIn(state)) {
      const rel = `${STATE_DIR}/${inner}`;
      if (inner === JOURNAL_DIR || inner === OPS_DIR) {
        const isDir = isDirectoryEntry(join5(state, inner));
        if (isDir === false) found.push(rel);
        else if (isDir === true) {
          for (const n of namesIn(join5(state, inner))) if (!n.startsWith(".")) found.push(`${rel}/${n}`);
        }
      } else if (!lockProtocolOwns(state, inner)) {
        found.push(rel);
      }
    }
  }
  return found.sort();
}
function contentRefusal(root, entries) {
  if (entries.length === 0) return null;
  const named = entries.slice(0, NAMED_ENTRIES).join(", ") + (entries.length > NAMED_ENTRIES ? ` and ${entries.length - NAMED_ENTRIES} more` : "");
  if (entries.includes(WORKBENCH_MANIFEST)) {
    return { class: "conflict", reason: "manifest-present", detail: `${root} already holds ${WORKBENCH_MANIFEST}, and initialize never replaces a manifest; it holds ${named}` };
  }
  return { class: "conflict", reason: "target-not-empty", detail: `initialize writes a new workbench into an empty directory, and ${root} holds ${named}` };
}
var INITIAL_FEATURES = ["json-control-v1"];
var unlistable = (root, name) => {
  try {
    return !statSync3(join5(root, STATE_DIR, name)).isDirectory();
  } catch (e) {
    if (e.code === "ENOENT") return false;
    throw e;
  }
};
async function initialize(wb, req, options) {
  const stateDir = () => isDirectoryEntry(join5(wb.root, STATE_DIR)) === true;
  const precheck = () => !stateDir() || unlistable(wb.root, JOURNAL_DIR) || unlistable(wb.root, OPS_DIR);
  if (precheck()) {
    const refused2 = contentRefusal(wb.root, initialContent(wb.root));
    if (refused2 !== null && precheck()) return fromStore(refused2);
  }
  return mutate(wb, req, initializePlan(req), options, EVERY_STATE);
}
function initializePlan(req) {
  return (ctx) => {
    const blocked = ctx.blocked[0];
    if (blocked !== void 0) return { ok: false, error: recoveryBlocked(blocked) };
    const refused2 = contentRefusal(ctx.wb.root, initialContent(ctx.wb.root));
    if (refused2 !== null) return { ok: false, error: refused2 };
    const manifest = { schema: schemaField(WORKBENCH_SCHEMA_ID), id: req.id, required_features: [...INITIAL_FEATURES], migration: null, extensions: {} };
    const v = ctx.validateResult(WORKBENCH_SCHEMA_ID, manifest, "the manifest initialize would write is not valid");
    if (!v.ok) return v;
    const bytes = Buffer.from(serialise(manifest), "utf-8");
    const revision = revisionOf(bytes);
    return {
      ok: true,
      value: {
        writes: [{ path: WORKBENCH_MANIFEST, bytes }],
        result: { operation_id: req.operation_id, id: req.id, path: WORKBENCH_MANIFEST, revision },
        revisions: { [WORKBENCH_MANIFEST]: revision }
      }
    };
  };
}
function pendingOperation(wb) {
  const journal = `${STATE_DIR}/${JOURNAL_DIR}`;
  const dirOf = (id) => `${journal}/${id}`;
  const refusal3 = (what) => ({
    ok: false,
    error: { class: "operation-unknown", reason: "pending-initialize-unreadable", detail: `${what}; inspect cannot say whether an initialize is pending, so the intent is to be read and corrected by hand` }
  });
  const unreadable = (id, why) => refusal3(`${dirOf(id)}: ${why}`);
  const listed2 = () => {
    try {
      return { ok: true, value: pendingIds(wb) };
    } catch (e) {
      const code = e.code ?? "an error without a code";
      return refusal3(`${journal}: the journal cannot be listed (${code})`);
    }
  };
  const ids = listed2();
  if (!ids.ok) return ids;
  const found = [];
  const verifies = [];
  for (const name of ids.value) {
    const r = readIntent(wb, name);
    if (!r.ok || r.value === null) {
      const again = listed2();
      if (!again.ok) return again;
      if (!again.value.includes(name)) continue;
    }
    if (!r.ok) return refusal3(r.error.detail);
    if (r.value === null) continue;
    const { intent, contents } = r.value;
    if (intent.op === "migration") {
      const v2 = pendingVerify(wb, r.value);
      if (!v2.ok) return v2;
      if (v2.value !== null) verifies.push(v2.value);
      continue;
    }
    if (intent.op !== "initialize") continue;
    const write = intent.writes.length === 1 ? intent.writes[0] : void 0;
    if (write === void 0 || write.path !== WORKBENCH_MANIFEST) {
      return unreadable(name, `an initialize intent writes ${intent.writes.map((w) => w.path).join(", ") || "nothing"}, not exactly ${WORKBENCH_MANIFEST}`);
    }
    const parsed = strictParse(contents.get(WORKBENCH_MANIFEST));
    if (!parsed.ok) return unreadable(name, `the staged ${WORKBENCH_MANIFEST}: ${parsed.reason}: ${parsed.detail}`);
    const v = validate(WORKBENCH_SCHEMA_ID, parsed.value);
    if (!v.ok) return unreadable(name, `the staged ${WORKBENCH_MANIFEST} is not valid: ${v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`}`);
    const id = parsed.value.id;
    const answered = intent.response.ok ? intent.response.result?.id : void 0;
    if (answered !== id) return unreadable(name, `the staged ${WORKBENCH_MANIFEST} carries id ${id}, and the intent's recorded answer ${answered === void 0 ? "names none" : `names ${JSON.stringify(answered)}`}`);
    found.push({ operation_id: intent.operation_id, id, blocked: blockedIntent(wb, r.value) !== null });
  }
  if (verifies.length > 1 || verifies.length === 1 && found.length > 0) {
    return {
      ok: false,
      error: {
        class: "operation-unknown",
        reason: "pending-migration-ambiguous",
        detail: `${verifies.length > 1 ? "more than one committed migration verify is" : "a committed migration verify and a committed initialize are"} pending: ${[...verifies, ...found].map((p) => dirOf(p.operation_id)).join(", ")}; one pending field cannot name them, so they are to be resolved by hand`
      }
    };
  }
  if (found.length > 1) {
    return {
      ok: false,
      error: { class: "operation-unknown", reason: "pending-initialize-ambiguous", detail: `more than one committed initialize is pending: ${found.map((p) => dirOf(p.operation_id)).join(", ")}; one pending field cannot name them, so they are to be resolved by hand` }
    };
  }
  return { ok: true, value: verifies[0] ?? found[0] ?? null };
}
function pendingVerify(wb, p) {
  const { intent, contents } = p;
  const writesManifest = intent.writes.some((w) => w.path === WORKBENCH_MANIFEST && w.after !== null);
  if (intent.phase !== "verify" && !writesManifest) return { ok: true, value: null };
  const unreadable = (why) => ({
    ok: false,
    error: { class: "operation-unknown", reason: "pending-migration-unreadable", detail: `${STATE_DIR}/${JOURNAL_DIR}/${intent.operation_id}: ${why}; inspect cannot say which verify is pending, so the intent is to be read and corrected by hand` }
  });
  if (intent.phase !== "verify") return unreadable(`a migration ${intent.phase ?? "intent"} writes ${WORKBENCH_MANIFEST}, which only verify writes`);
  const [receipt, manifestWrite] = intent.writes;
  if (intent.writes.length !== 2 || receipt === void 0 || manifestWrite?.path !== WORKBENCH_MANIFEST || receipt.after === null) {
    return unreadable(`a verify intent writes ${intent.writes.map((w) => w.path).join(", ") || "nothing"}, not the receipt and then ${WORKBENCH_MANIFEST}`);
  }
  const parsed = strictParse(contents.get(WORKBENCH_MANIFEST));
  if (!parsed.ok) return unreadable(`the staged ${WORKBENCH_MANIFEST}: ${parsed.reason}: ${parsed.detail}`);
  const v = validate(WORKBENCH_SCHEMA_ID, parsed.value);
  if (!v.ok) return unreadable(`the staged ${WORKBENCH_MANIFEST} is not valid: ${v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`}`);
  const manifest = parsed.value;
  const migration2 = manifest.migration;
  const result = intent.response.ok ? intent.response.result : void 0;
  const plan = result?.plan;
  if (result === void 0 || result.operation_id !== intent.operation_id || typeof result.migration_id !== "string" || typeof plan?.path !== "string" || typeof plan.sha256 !== "string") {
    return unreadable("the recorded answer names no operation, migration and plan of this intent");
  }
  if (migration2 === null || migration2.id !== result.migration_id || migration2.receipt !== receipt.path) {
    return unreadable(`the staged ${WORKBENCH_MANIFEST} names ${migration2 === null ? "no migration" : `${String(migration2.id)} and ${String(migration2.receipt)}`}; the recorded answer names ${result.migration_id} and the intent writes ${receipt.path}`);
  }
  return {
    ok: true,
    value: { op: "migration", phase: "verify", operation_id: intent.operation_id, id: manifest.id, migration_id: result.migration_id, plan: { path: plan.path, sha256: plan.sha256 }, blocked: blockedIntent(wb, p) !== null }
  };
}
var legacyRefusal = (wb) => fail("unsupported-format", "legacy-workbench", `${wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)`);
function maintenance(wb, req, kernel) {
  if (req.action !== "end" || wb.state !== "legacy") return mutate(wb, req, maintenancePlan(req, kernel), kernel);
  if (existsSync4(join5(wb.root, STATE_DIR, OPS_DIR, `${req.operation_id}.json`))) return mutate(wb, req, maintenancePlan(req, kernel), kernel, LEGACY_END_STATES);
  const evidence = cleanupEvidence(wb, req.fence);
  if (!evidence.ok) return fromStore(evidence.error);
  const fence = readFence(wb);
  if (!fence.ok || fence.value === null || fence.value.operation_id !== req.fence) return legacyRefusal(wb);
  return mutate(wb, req, maintenancePlan(req, kernel), kernel, LEGACY_END_STATES);
}
var LEGACY_END_STATES = ["legacy", "json-control"];
function maintenancePlan(req, options) {
  return (ctx) => {
    if (req.action === "end") {
      const held2 = ctx.blocked.find((x) => x.held !== void 0);
      if (held2 !== void 0) return { ok: false, error: recoveryBlocked(held2) };
      const now = openWorkbench(ctx.wb.root);
      if (!now.ok) return now;
      if (now.value.state === "unsupported" && now.value.diagnosis !== null) return { ok: false, error: now.value.diagnosis };
      if (now.value.state === "legacy") {
        const evidence = cleanupEvidence(ctx.wb, req.fence);
        if (!evidence.ok) return evidence;
        if (ctx.fence === null) return { ok: false, error: { class: "unsupported-format", reason: "legacy-workbench", detail: `${ctx.wb.root} carries no ${WORKBENCH_MANIFEST}; reads are allowed, mutation is not (spec 4.1)` } };
      }
    }
    if (req.action === "begin") {
      const blocked = ctx.blocked[0];
      if (blocked !== void 0) return { ok: false, error: recoveryBlocked(blocked) };
      const since = new Date((options.now ?? Date.now)()).toISOString();
      return { ok: true, value: { writes: [], result: { operation_id: req.operation_id, action: "begin", since }, fence: { operation_id: req.operation_id, since } } };
    }
    if (ctx.fence === null) {
      return { ok: false, error: { class: "conflict", reason: "maintenance-not-active", detail: `no maintenance fence stands in ${STATE_DIR}/${MAINTENANCE_FILE}, so there is no fence ${req.fence} to end; inspect names the standing fence, null when there is none` } };
    }
    return { ok: true, value: { writes: [], result: { operation_id: req.operation_id, action: "end", since: ctx.fence.since }, fence: null } };
  };
}
var EMPTY_VIEW = { blocked: [], blockedOn: () => void 0 };
var CHECK_HOOKS = {
  sitesOf: (pair) => referenceSites(pair),
  validate: (view) => validateOp(view, { op: "validate" }, EMPTY_VIEW),
  reconcile: (view) => reconcile(view, { op: "reconcile" }, EMPTY_VIEW)
};
function migration(wb, req, kernel) {
  switch (req.phase) {
    case "survey":
      return readable(wb) ?? survey(wb);
    case "plan":
      return mutate(wb, req, migrationPlan(req, CHECK_HOOKS.sitesOf), kernel, EVERY_STATE);
    case "apply":
      return mutate(wb, req, migrationApply(req, { now: kernel.now ?? Date.now }), kernel, EVERY_STATE);
    case "verify":
      return mutate(wb, req, migrationVerify(req, CHECK_HOOKS), kernel, EVERY_STATE);
    case "rollback":
      return mutate(wb, req, migrationRollback(req), kernel, EVERY_STATE);
  }
}
var stateOf = (pair) => pair.kind === "package" ? pair.control.status : pair.control.control?.state ?? null;
function scopeDir(wb, scope) {
  if (scope === void 0) return { ok: true, dir: wb.root };
  const abs = resolveCurrent(wb, scope, "scope");
  if (!abs.ok) return { ok: false, response: fromStore(abs.error) };
  let isDir = false;
  try {
    isDir = statSync3(abs.value).isDirectory();
  } catch {
    isDir = false;
  }
  if (!isDir) return { ok: false, response: fail("unknown-scope", "scope-missing", `${scope} is not a directory in ${wb.root}`) };
  return { ok: true, dir: abs.value };
}
function list(wb, req, view) {
  const scope = scopeDir(wb, req.scope);
  if (!scope.ok) return scope.response;
  const records = controlFiles(wb, scope.dir).map((path) => {
    const b = view.blockedOn(path);
    if (b !== void 0) return { path, problem: recoveryBlocked(b) };
    const r = readPair(wb, path);
    if (!r.ok) return { path, problem: r.error };
    return { path, kind: r.value.kind, id: r.value.control.id ?? null, status: stateOf(r.value), revision: r.value.revision, narrative: r.value.narrative };
  });
  return { ok: true, result: { workbench: wb.root, state: wb.state, scope: req.scope ?? null, records } };
}
function show(wb, req, view) {
  const blocked = view.blockedOn(req.record.path);
  if (blocked !== void 0) return fromStore(recoveryBlocked(blocked));
  const r = readPair(wb, req.record.path);
  if (!r.ok) return fromStore(r.error);
  const { path, kind, control, revision, narrative, report } = r.value;
  const narrativeBlocked = narrative === null ? void 0 : view.blockedOn(narrative.path);
  if (narrativeBlocked !== void 0) return fromStore(recoveryBlocked(narrativeBlocked));
  return { ok: true, result: { path, kind, control, revision, narrative, ...kind === "evidence" ? { report } : {} } };
}
function findingsOf(wb, path) {
  const r = readPair(wb, path);
  if (!r.ok) return [{ path, class: r.error.class, reason: r.error.reason, detail: r.error.detail }];
  const pair = r.value;
  const findings = [];
  const v = validate(pair.schemaId, pair.control);
  if (!v.ok) {
    findings.push(v.class === "schema-invalid" ? { path, class: "schema-invalid", reason: "schema", detail: describeErrors(v.errors) } : { path, class: "unsupported-format", reason: "unknown-schema", detail: `no schema ${v.schemaId}` });
    return findings;
  }
  const state = stateOf(pair);
  if (typeof state === "string") {
    const rules = stateRules(pair.kind, state, rulePayload(pair));
    if (!rules.ok) findings.push({ path, class: rules.class, reason: "state-rules", detail: rules.reason });
  }
  if (pair.kind === "evidence") {
    for (const e of [reportProblem(pair), evidenceNaming(pair)]) if (e !== null) findings.push({ path, class: e.class, reason: e.reason, detail: e.detail });
  } else if (pair.narrative === null) findings.push({ path, class: "unresolved-reference", reason: "narrative-unnamed", detail: "the record names no narrative" });
  else if (pair.narrative.sha256 === null) findings.push({ path, class: "unresolved-reference", reason: "narrative-missing", detail: `${pair.narrative.path} does not exist` });
  if (wb.id !== null && pair.control.workbench_id !== wb.id) {
    findings.push({ path, class: "unknown-scope", reason: "foreign-workbench-id", detail: `the record carries workbench_id ${JSON.stringify(pair.control.workbench_id)}; this workbench is ${wb.id}` });
  }
  return findings;
}
function blockedFindingOf(wb, path, view) {
  if (view.blocked.length === 0) return [];
  const r = readPair(wb, path);
  const narrative = r.ok ? r.value.narrative?.path : void 0;
  const b = view.blockedOn(path) ?? (narrative === void 0 ? void 0 : view.blockedOn(narrative));
  if (b === void 0) return [];
  const e = recoveryBlocked(b);
  return [{ path, class: e.class, reason: e.reason, detail: e.detail }];
}
function rulePayload(pair) {
  if (pair.kind === "package") return { claim: pair.control.claim, outcome: pair.control.outcome ?? null };
  const c = pair.control.control;
  return { disposition: c?.disposition, answer_ref: c?.answer_ref, implementation_ref: c?.implementation_ref, superseded_by: c?.superseded_by };
}
function validateOp(wb, req, view) {
  const paths = req.record !== void 0 ? [req.record.path] : controlFiles(wb, wb.root);
  const findings = paths.flatMap((p) => [...blockedFindingOf(wb, p, view), ...findingsOf(wb, p)]);
  return { ok: true, result: { workbench: wb.root, state: wb.state, checked: paths.length, valid: findings.length === 0, findings } };
}
var PROGRESS = [
  { field: "steps", noun: "step", value: "state" },
  { field: "criteria", noun: "criterion", value: "met" }
];
function repeatedIds(entries) {
  if (!Array.isArray(entries)) return [];
  const seen = /* @__PURE__ */ new Set();
  const twice = /* @__PURE__ */ new Set();
  for (const e of entries) {
    if (!isObject5(e) || typeof e.id !== "string") continue;
    if (seen.has(e.id)) twice.add(e.id);
    seen.add(e.id);
  }
  return [...twice];
}
function uniqueIds2(noun, field2, entries, where) {
  const twice = repeatedIds(entries);
  if (twice.length === 0) return { ok: true, value: void 0 };
  return refusal2("schema-invalid", `duplicate-${noun}-id`, `${where} ${field2}: the id ${twice.join(", ")} appears more than once; a ${noun} is updated by its id, which must name one entry`);
}
var COMMON_SCHEMA_ID = "urn:fusion:schema:fusion.common/v1";
var STORE_OF = { package: "work-packages", issue: "issues", plan: "plans", discussion: "discussions", decision: "decisions" };
var PACKAGE_PAYLOAD = ["domain", "references"];
var INITIAL_CONTROL = {
  issue: { keys: ["state", "disposition"], fixed: { state: "open", disposition: null } },
  plan: { keys: ["state", "steps", "criteria", "acceptance"], fixed: { state: "open", acceptance: null } },
  discussion: { keys: ["state", "participants", "outcome_refs"], fixed: { state: "open" } },
  decision: {
    keys: ["state", "answer_ref", "implementation_ref", "superseded_by", "deferral"],
    fixed: { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null }
  }
};
var refusal2 = (cls, reason, detail) => ({ ok: false, error: { class: cls, reason, detail } });
function markerlessName() {
  const doc = schemas().document(COMMON_SCHEMA_ID);
  const pattern = doc?.$defs?.["legacy_markerless_citation"]?.pattern;
  if (typeof pattern !== "string") throw new Error(`${COMMON_SCHEMA_ID}: $defs.legacy_markerless_citation.pattern is not a string`);
  return new RegExp(pattern);
}
function fileHash(wb, path) {
  const abs = resolveInside(wb, path);
  if (!abs.ok) return abs;
  if (!existsSync4(abs.value)) return { ok: true, value: null };
  if (!statSync3(abs.value).isFile()) return refusal2("unknown-scope", "not-a-file", `${path} is a directory in ${wb.root}`);
  return { ok: true, value: revisionOf(readFileSync7(abs.value)) };
}
function pairPaths(ctx, req) {
  const { kind, scope } = req;
  const narrative = req.narrative.path;
  const store = STORE_OF[kind];
  const mismatch = (why) => refusal2("unknown-scope", "store-kind-mismatch", `create ${kind}: ${why}`);
  if (scope.store !== store) return mismatch(`a ${kind} is filed in ${store}/; the scope names ${scope.store}/`);
  const slash = narrative.lastIndexOf("/");
  const dir = narrative.slice(0, Math.max(slash, 0));
  const name = narrative.slice(slash + 1);
  const stem = name.slice(0, -".md".length);
  let control;
  if (kind === "package") {
    if (scope.container !== null) return mismatch(`a package is its own directory in ${store}/, never inside the container ${scope.container}`);
    if (dir !== `${store}/${stem}`) return mismatch(`a package's narrative is ${store}/<d>/<d>.md; the request names ${narrative}`);
    control = `${dir}/package.json`;
  } else {
    const expected = scope.container === null ? `shared/${store}` : `${scope.container}/${store}`;
    if (dir !== expected) return mismatch(`a ${kind} filed in ${expected}/ has its narrative there; the request names ${narrative}`);
    if (scope.container !== null) {
      const holder = `${scope.container}/package.json`;
      const pkg = ctx.readPair(holder);
      if (!pkg.ok && pkg.error.reason !== "record-not-found") return pkg;
      if (!pkg.ok || pkg.value.kind !== "package") return refusal2("unknown-scope", "container-missing", `${scope.container} is not a package directory: ${holder} ${pkg.ok ? `is a ${pkg.value.kind} record` : "does not exist"}`);
    }
    control = `${dir}/${stem}.record.json`;
  }
  if (!markerlessName().test(name)) {
    return refusal2("schema-invalid", "narrative-name", `${name} is not a marker-free name (YYMMDD-HHMM-<topic>.md, no underscore): a new record carries its state in JSON, never in its file name`);
  }
  return { ok: true, value: { control, narrative } };
}
function checkOrigin(ctx, origin) {
  if (origin.kind === "legacy-unknown") return refusal2("schema-invalid", "origin-legacy-on-create", "legacy-unknown is kept by an import that could not recover the origin; a record created now names its own");
  if (origin.kind === "user-request") {
    return origin.ref === null ? { ok: true, value: void 0 } : refusal2("schema-invalid", "origin-ref-not-admitted", "a user-request origin carries ref null: the user's request is the mandate, no record is");
  }
  if (origin.ref === null) return refusal2("schema-invalid", "origin-ref-required", `a ${origin.kind} origin names the package whose scope the new record decomposes; its ref is null`);
  const hit = resolveRecordRef(ctx, origin.ref);
  if (!hit.ok) return hit;
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "package") {
    const campaign = origin.kind === "campaign" ? " (campaign records are not addressable in FJ02, so a campaign origin resolves against packages only)" : "";
    return refusal2("unresolved-reference", "not-a-package", `the ${origin.kind} origin ${origin.ref.record_id} is the ${pair.value.kind} record ${hit.value.path}; an origin resolves to a package${campaign}`);
  }
  return { ok: true, value: void 0 };
}
var schemaField = (schemaId) => schemaId.slice(SCHEMA_ID_PREFIX.length);
function newRecord(ctx, req) {
  const payload = req.payload;
  const admitted = req.kind === "package" ? PACKAGE_PAYLOAD : INITIAL_CONTROL[req.kind].keys;
  const extra = Object.keys(payload).filter((k) => !admitted.includes(k));
  if (extra.length > 0) {
    const whose = req.kind === "package" ? "the rest of a new package (status open, no claim, mode ordinary) is the kernel's" : `a ${req.kind} payload is its control object`;
    return refusal2("schema-invalid", "payload-field-not-admitted", `a ${req.kind} payload admits ${admitted.join(", ")}; it carries ${extra.join(", ")}, and ${whose}`);
  }
  const common = {
    id: req.id,
    workbench_id: ctx.wb.id,
    narrative: { path: req.narrative.path },
    filed_by: req.filed_by,
    provenance: { source: "created", legacy_fields: {} },
    extensions: {}
  };
  if (req.kind === "package") {
    if (payload.domain === void 0 || payload.domain === null) {
      return refusal2("schema-invalid", "domain-required", "a package payload carries its domain; null is kept only for a package imported without one");
    }
    const next2 = {
      schema: schemaField(PACKAGE_SCHEMA_ID),
      ...common,
      domain: payload.domain,
      status: "open",
      claim: null,
      mode: { value: "ordinary", source: null },
      origin: req.origin,
      depends_on: [],
      active_documents: [],
      references: payload.references ?? [],
      evidence: [],
      outcome: null
    };
    return { ok: true, value: { next: next2, schemaId: PACKAGE_SCHEMA_ID } };
  }
  const { fixed } = INITIAL_CONTROL[req.kind];
  const off = Object.keys(fixed).filter((k) => payload[k] !== fixed[k]);
  if (off.length > 0) {
    const sets = off.map((k) => `${k} ${k in payload ? JSON.stringify(payload[k]) : "absent"}`).join(", ");
    return refusal2("schema-invalid", "not-initial-state", `a new ${req.kind} record starts at ${JSON.stringify(fixed)}; the payload has ${sets}`);
  }
  if (req.kind === "plan") {
    for (const { field: field2, noun } of PROGRESS) {
      const unique = uniqueIds2(noun, field2, payload[field2], "the new plan's");
      if (!unique.ok) return unique;
    }
  }
  const next = { schema: schemaField(RECORD_SCHEMA_ID), ...common, kind: req.kind, references: [], control: { ...payload } };
  return { ok: true, value: { next, schemaId: RECORD_SCHEMA_ID } };
}
function archivedTarget(wb, paths) {
  for (const path of paths) {
    if (path === null) continue;
    const r = resolveCurrent(wb, path, "scope");
    if (!r.ok && r.error.reason === "archived-path") return r;
  }
  return { ok: true, value: void 0 };
}
function createPlan(req) {
  return (ctx) => {
    const outside = archivedTarget(ctx.wb, [req.scope.container, req.narrative.path]);
    if (!outside.ok) return outside;
    const paths = pairPaths(ctx, req);
    if (!paths.ok) return paths;
    const { control, narrative } = paths.value;
    const stored2 = fileHash(ctx.wb, control);
    if (!stored2.ok) return stored2;
    if (stored2.value !== null) return refusal2("conflict", "record-exists", `${control} exists; create never replaces a record`);
    const writes = [];
    let narrativeHash;
    const content = req.narrative.content;
    const standing = fileHash(ctx.wb, narrative);
    if (!standing.ok) return standing;
    if (content !== void 0) {
      if (standing.value !== null) return refusal2("conflict", "narrative-exists", `${narrative} exists; with narrative.content create writes both halves of a new pair and never replaces a narrative`);
      const bytes2 = Buffer.from(content, "utf-8");
      if (bytes2.toString("utf-8") !== content) return refusal2("schema-invalid", "narrative-not-utf8", "narrative.content holds a lone surrogate, which has no UTF-8 encoding");
      writes.push({ path: narrative, bytes: bytes2 });
      narrativeHash = revisionOf(bytes2);
    } else {
      if (standing.value === null) return refusal2("unresolved-reference", "narrative-missing", `${narrative} does not exist; without narrative.content create requires it`);
      narrativeHash = standing.value;
    }
    const taken = ctx.resolveRecordId(req.id);
    if (taken.ok) return refusal2("conflict", "id-in-use", `the id ${req.id} is carried by ${taken.value.path}`);
    if (taken.error.reason !== "record-not-found") return refusal2("conflict", "id-in-use", taken.error.detail);
    const origin = checkOrigin(ctx, req.origin);
    if (!origin.ok) return origin;
    const built = newRecord(ctx, req);
    if (!built.ok) return built;
    const { next, schemaId } = built.value;
    const v = ctx.validateResult(schemaId, next, `the ${req.kind} record create would write is not valid`);
    if (!v.ok) return v;
    const bytes = Buffer.from(serialise(next), "utf-8");
    const revision = revisionOf(bytes);
    writes.push({ path: control, bytes });
    return {
      ok: true,
      value: {
        writes,
        result: { operation_id: req.operation_id, path: control, kind: req.kind, revision, narrative: { path: narrative, sha256: narrativeHash } },
        revisions: { [control]: revision }
      }
    };
  };
}
function nextCorrection(wb, dir, basename2) {
  const abs = resolveInside(wb, dir);
  if (!abs.ok) return abs;
  let highest = 1;
  for (const entry of readdirSync6(abs.value)) {
    const name = evidenceName(`${dir}/${entry}`);
    if (name !== null && name.basename === basename2 && name.correction !== null) highest = Math.max(highest, name.correction);
  }
  return { ok: true, value: highest + 1 };
}
function createEvidencePlan(req) {
  return (ctx) => {
    const payload = req.payload;
    const report = payload.report;
    const outside = archivedTarget(ctx.wb, [req.scope.container, report.path]);
    if (!outside.ok) return outside;
    if (payload.id !== req.id) return refusal2("schema-invalid", "id-mismatch", `the envelope's id is ${req.id}; the payload's is ${payload.id}`);
    if (payload.workbench_id !== ctx.wb.id) {
      return refusal2("unknown-scope", "foreign-workbench-id", `the payload carries workbench_id ${payload.workbench_id}; this workbench is ${String(ctx.wb.id)}`);
    }
    const { container } = req.scope;
    const dir = `${container ?? "shared"}/${REVIEWS_STORE}`;
    const slash = report.path.lastIndexOf("/");
    if (report.path.slice(0, Math.max(slash, 0)) !== dir) {
      return refusal2("unknown-scope", "store-kind-mismatch", `create evidence: the scope's store is ${dir}/, and an evidence record sits beside its report there; the report is ${report.path}`);
    }
    if (container !== null) {
      const holder = `${container}/package.json`;
      const pkg = ctx.readPair(holder);
      if (!pkg.ok && pkg.error.reason !== "record-not-found") return pkg;
      if (!pkg.ok || pkg.value.kind !== "package") return refusal2("unknown-scope", "container-missing", `${container} is not a package directory: ${holder} ${pkg.ok ? `is a ${pkg.value.kind} record` : "does not exist"}`);
    }
    const name = report.path.slice(slash + 1);
    const basename2 = name.endsWith(".md") ? name.slice(0, -".md".length) : null;
    const first = `${dir}/${basename2 ?? name}${EVIDENCE_SUFFIX}`;
    const reading2 = evidenceName(first);
    if (basename2 === null || !markerlessName().test(name) || reading2 === null || reading2.correction !== null || reading2.report !== report.path) {
      return refusal2("schema-invalid", "report-name", `${name} is not a report name an evidence record can pair with: a marker-free YYMMDD-HHMM-<topic>.md whose last dotted segment is no correction counter, so that ${first} reads back as its first record`);
    }
    const stored2 = fileHash(ctx.wb, report.path);
    if (!stored2.ok) return stored2;
    const bytes = Buffer.from(serialise(payload), "utf-8");
    const revision = revisionOf(bytes);
    const candidate = { path: first, kind: "evidence", schemaId: EVIDENCE_SCHEMA_ID, control: payload, bytes, revision, narrative: null, report: { path: report.path, sha256: report.sha256, stored: stored2.value } };
    const problem = reportProblem(candidate);
    if (problem !== null) return { ok: false, error: problem };
    const taken = ctx.resolveRecordId(req.id);
    if (taken.ok) return refusal2("conflict", "id-in-use", `the id ${req.id} is carried by ${taken.value.path}`);
    if (taken.error.reason !== "record-not-found") return refusal2("conflict", "id-in-use", taken.error.detail);
    let path = first;
    if (payload.predecessor !== null) {
      const hit = resolveRecordRef(ctx, payload.predecessor);
      if (!hit.ok) return hit;
      const got = ctx.readPair(hit.value.path);
      if (!got.ok) return got;
      const pred = got.value;
      if (pred.kind !== "evidence") return refusal2("unresolved-reference", "not-evidence", `the predecessor ${payload.predecessor.record_id} is the ${pred.kind} record ${pred.path}; a correction names an evidence record`);
      const pinned = payload.predecessor.revision;
      if (pinned !== void 0 && pred.revision !== pinned) {
        return refusal2("missing-evidence", "evidence-revision-mismatch", `the predecessor ${pred.path} is stored at ${pred.revision}; the payload pins ${pinned}`);
      }
      if (pred.report?.path === report.path) {
        if (pred.report.sha256 !== report.sha256) {
          return refusal2("conflict", "predecessor-report-changed", `the predecessor ${pred.path} records ${report.path} at ${String(pred.report.sha256)}; this record names ${report.sha256}. A correction under the same basename is over an unchanged report; a changed report takes a new basename`);
        }
        const n = nextCorrection(ctx.wb, dir, basename2);
        if (!n.ok) return n;
        path = `${dir}/${basename2}.${n.value}${EVIDENCE_SUFFIX}`;
      }
    }
    const standing = fileHash(ctx.wb, path);
    if (!standing.ok) return standing;
    if (standing.value !== null) return refusal2("conflict", "record-exists", `${path} exists; an evidence record is immutable once accepted, and a record without a predecessor naming this report is its first record, never a correction`);
    return {
      ok: true,
      value: {
        writes: [{ path, bytes }],
        result: { operation_id: req.operation_id, path, kind: "evidence", revision, report: { path: report.path, sha256: report.sha256 } },
        revisions: { [path]: revision }
      }
    };
  };
}
var isObject5 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var TRANSITION_PAYLOAD_FIELDS = {
  package: ["claim", "outcome"],
  issue: ["disposition"],
  plan: ["steps", "criteria"],
  decision: ["answer_ref", "implementation_ref", "superseded_by", "deferral"],
  discussion: []
};
function payloadAdmitted(req) {
  return (pair) => {
    const admitted = TRANSITION_PAYLOAD_FIELDS[pair.kind] ?? [];
    const foreign = Object.keys(req.payload ?? {}).filter((k) => !admitted.includes(k));
    if (foreign.length === 0) return { ok: true, value: void 0 };
    const row = admitted.length > 0 ? admitted.join(", ") : "no field";
    const carried = foreign.map((f) => {
      const on = Object.keys(TRANSITION_PAYLOAD_FIELDS).filter((k) => TRANSITION_PAYLOAD_FIELDS[k]?.includes(f));
      return on.length > 0 ? `${f} (admitted on ${on.join(", ")})` : f;
    });
    return refusal2("schema-invalid", "payload-field-not-admitted", `${req.record.path} is a record of kind ${pair.kind}, whose transition payload admits ${row}; it carries ${carried.join(", ")}`);
  };
}
function transitionPlan(req, precheck) {
  return (ctx) => {
    const r = ctx.readPair(req.record.path);
    if (!r.ok) return r;
    const pair = r.value;
    const cas = ctx.cas(pair, req.expected_revision);
    if (!cas.ok) return cas;
    if (pair.kind === "evidence") {
      return refusal2("conflict", "evidence-immutable", `${req.record.path} is an evidence record, which has no lifecycle and is immutable once accepted (spec 4.4); a correction is a new record naming it as predecessor`);
    }
    if (precheck !== void 0) {
      const p = precheck(pair);
      if (!p.ok) return p;
    }
    const payload = req.payload ?? {};
    const moved = pair.kind === "package" ? movePackage(pair, req.to, payload) : moveRecord(ctx, pair, req.to, payload);
    if (!moved.ok) return moved;
    const { from, next, schemaId } = moved.value;
    const what = pair.kind === "package" ? "the record after the transition is not a valid package" : `the record after the transition is not a valid ${pair.kind} record`;
    const v = ctx.validateResult(schemaId, next, what);
    if (!v.ok) return v;
    if (pair.kind === "package" && req.to === EVIDENCE_CHECKED_ON) {
      const outcome = next.outcome;
      for (const binding of outcome?.evidence ?? []) {
        const bound = bindEvidence(ctx, pair, binding);
        if (!bound.ok) return bound;
      }
    }
    const bytes = Buffer.from(serialise(next), "utf-8");
    const revision = revisionOf(bytes);
    return {
      ok: true,
      value: {
        writes: [{ path: req.record.path, bytes }],
        result: { operation_id: req.operation_id, path: req.record.path, from, to: req.to, revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: revision }
      }
    };
  };
}
var refused = (rule) => ({ ok: false, error: { class: rule.class, reason: "transition-refused", detail: rule.reason } });
function movePackage(pair, to, payload) {
  const from = pair.control.status;
  const table = transitions().kinds["package"];
  const terminal = table?.terminal.includes(to) ?? false;
  const claim = "claim" in payload ? payload.claim ?? null : terminal ? pair.control.claim ?? null : null;
  const outcome = payload.outcome ?? null;
  const rule = allowed("package", from, to, { claim, outcome });
  if (!rule.ok) return refused(rule);
  if (table?.claim?.[to] === "required" && isObject5(claim) && claim.claimed_at === null) {
    return { ok: false, error: { class: "schema-invalid", reason: "claimed-at-required", detail: `package: a move into ${to} makes a new claim, whose claimed_at is known to the caller and never guessed; it is null` } };
  }
  return { ok: true, value: { from, next: { ...pair.control, status: to, claim, outcome }, schemaId: PACKAGE_SCHEMA_ID } };
}
var DECISION_FIELDS = ["answer_ref", "implementation_ref", "superseded_by", "deferral"];
function moveRecord(ctx, pair, to, payload) {
  const kind = pair.kind;
  const control = pair.control.control ?? {};
  const from = control.state;
  const terminal = transitions().kinds[kind]?.terminal.includes(to) ?? false;
  let fields = {};
  if (kind === "issue") {
    const disposition = "disposition" in payload ? payload.disposition ?? null : terminal ? control.disposition ?? null : null;
    fields = { disposition };
  } else if (kind === "decision") {
    for (const f of DECISION_FIELDS) fields[f] = f in payload ? payload[f] ?? null : control[f] ?? null;
  } else if (kind === "plan") {
    const progressed = planProgress(control, from, to, payload);
    if (!progressed.ok) return progressed;
    return { ok: true, value: { from, next: { ...pair.control, control: { ...control, state: to, ...progressed.value } }, schemaId: RECORD_SCHEMA_ID } };
  }
  const rule = allowed(kind, from, to, fields);
  if (!rule.ok) return refused(rule);
  if (kind === "decision") {
    for (const f of DECISION_FIELDS) {
      if (!(f in payload)) continue;
      const value = fields[f];
      const target = f === "deferral" && isObject5(value) ? value.target : value;
      const resolved = resolveReference(ctx, target);
      if (!resolved.ok) return resolved;
    }
  }
  return { ok: true, value: { from, next: { ...pair.control, control: { ...control, state: to, ...fields } }, schemaId: RECORD_SCHEMA_ID } };
}
function planProgress(control, from, to, payload) {
  const carried = PROGRESS.filter(({ field: field2 }) => payload[field2] !== void 0);
  if (to !== from || carried.length === 0) {
    const rule = allowed("plan", from, to);
    if (!rule.ok) return refused(rule);
  } else if (isTerminal("plan", from)) {
    return refused({ class: "conflict", reason: `plan: ${from} is terminal (${transitions().kinds["plan"]?.reopen ?? "no edge leaves it"}); plan progress is never written into it` });
  }
  const arrays = [];
  for (const { field: field2, noun, value } of carried) {
    const stored2 = Array.isArray(control[field2]) ? control[field2] : [];
    const updates = payload[field2];
    for (const [entries, where] of [
      [stored2, "the stored plan's"],
      [updates, "the payload's"]
    ]) {
      const unique = uniqueIds2(noun, field2, entries, where);
      if (!unique.ok) return unique;
    }
    const known = new Set(stored2.map((e) => e.id));
    const unknown = updates.filter((u) => !known.has(u.id)).map((u) => u.id);
    if (unknown.length > 0) {
      return refusal2("unresolved-reference", `unknown-${noun}-id`, `the payload's ${field2} names ${unknown.join(", ")}, which the stored plan lacks; plan progress updates the ${field2} it has and never adds one`);
    }
    arrays.push({ field: field2, value, stored: stored2, updates });
  }
  const byId = (entries) => new Map(entries.map((e) => [e.id, e]));
  let changed2 = false;
  for (const { field: field2, value, stored: stored2, updates } of arrays) {
    const was = byId(stored2);
    for (const u of updates) {
      const before = was.get(u.id)[value];
      if (before === u[value]) continue;
      changed2 = true;
      if (field2 !== "steps") continue;
      const rule = stepAllowed(String(before), String(u[value]));
      if (!rule.ok) return { ok: false, error: { class: rule.class, reason: "transition-refused", detail: `step ${u.id}: ${rule.reason}` } };
    }
  }
  if (to === from && !changed2) {
    return refused({ class: "conflict", reason: `plan: to is the stored state ${from} and the payload changes no step or criterion; staying in a state is admitted for plan progress only` });
  }
  const fields = {};
  for (const { field: field2, value, stored: stored2, updates } of arrays) {
    const next = byId(updates);
    fields[field2] = stored2.map((e) => {
      const u = next.get(e.id);
      return u === void 0 ? e : { ...e, [value]: u[value] };
    });
  }
  return { ok: true, value: fields };
}
function resolveReference(ctx, value) {
  if (!isObject5(value)) return { ok: true, value: void 0 };
  if (typeof value.record_id === "string") {
    const r = resolveRecordRef(ctx, { workbench_id: value.workbench_id, record_id: value.record_id });
    return r.ok ? { ok: true, value: void 0 } : r;
  }
  if (typeof value.path === "string" && typeof value.sha256 === "string") {
    const r = ctx.resolveArtefact({ path: value.path, sha256: value.sha256 });
    return r.ok ? { ok: true, value: void 0 } : r;
  }
  return { ok: true, value: void 0 };
}
function resolveRecordRef(ctx, ref) {
  if (ctx.wb.id !== null && ref.workbench_id !== ctx.wb.id) {
    return { ok: false, error: { class: "unresolved-reference", reason: "foreign-workbench", detail: `the reference names workbench ${JSON.stringify(ref.workbench_id)}; this workbench is ${ctx.wb.id}` } };
  }
  return ctx.resolveRecordId(ref.record_id);
}
function operationEdges(op) {
  const edges = (transitions().kinds["package"]?.edges ?? []).filter((e) => e.operation === op);
  const targets = [...new Set(edges.map((e) => e.to))];
  if (targets.length !== 1) throw new Error(`contract/transitions.json: the package edges of ${op} enter ${targets.join(", ") || "no state"}; exactly one is expected`);
  return { to: targets[0], from: edges.map((e) => e.from) };
}
function asTransition(req, to, reason, payload) {
  return {
    op: "transition",
    ...req.workbench !== void 0 ? { workbench: req.workbench } : {},
    operation_id: req.operation_id,
    record: req.record,
    expected_revision: req.expected_revision,
    actor: req.actor,
    to,
    reason,
    payload
  };
}
function claimPlan(req) {
  const { to } = operationEdges("claim");
  return transitionPlan(asTransition(req, to, "claim", { claim: req.claim }), (pair) => {
    if (pair.kind !== "package" || pair.control.status !== to) return { ok: true, value: void 0 };
    const held2 = isObject5(pair.control.claim) ? `checkout ${String(pair.control.claim.checkout_id)}` : "no recorded checkout";
    return { ok: false, error: { class: "conflict", reason: "already-claimed", detail: `the package is already ${to}, held by ${held2}; a second claim is a conflict` } };
  });
}
function releasePlan(req) {
  const { to, from } = operationEdges("release");
  return transitionPlan(asTransition(req, to, req.reason, { claim: null }), (pair) => {
    const state = stateOf(pair);
    if (pair.kind === "package" && typeof state === "string" && from.includes(state)) return { ok: true, value: void 0 };
    const what = pair.kind === "package" ? "the package" : `the ${pair.kind} record`;
    return { ok: false, error: { class: "conflict", reason: "not-claimed", detail: `${what} is ${String(state)}; release gives up the claim of a package that is ${from.join(" or ")}` } };
  });
}
var isTerminal = (kind, state) => typeof state === "string" && (transitions().kinds[kind]?.terminal.includes(state) ?? false);
function livePackage(ctx, req, op, does) {
  const r = ctx.readPair(req.record.path);
  if (!r.ok) return r;
  const pair = r.value;
  const cas = ctx.cas(pair, req.expected_revision);
  if (!cas.ok) return cas;
  if (pair.kind !== "package") return refusal2("schema-invalid", "not-a-package", `${req.record.path} is a ${pair.kind} record; ${op} ${does}`);
  const status = pair.control.status;
  if (isTerminal("package", status)) return refusal2("conflict", "package-terminal", `the package is ${String(status)}, which is terminal; its record is history and ${op} writes nothing into it`);
  return r;
}
function recordWrite(path, value) {
  const bytes = Buffer.from(serialise(value), "utf-8");
  return { path, bytes, revision: revisionOf(bytes) };
}
function setModePlan(req) {
  return (ctx) => {
    const r = livePackage(ctx, req, "set-mode", "sets a package's mode");
    if (!r.ok) return r;
    const pair = r.value;
    const { value, source } = req.mode;
    if (isObject5(source) && source.kind === "legacy") {
      return { ok: false, error: { class: "schema-invalid", reason: "legacy-source-on-set-mode", detail: "a legacy mode source is kept by an import only; set-mode takes the user's word or a record" } };
    }
    if (value === "ordinary" && source !== null) {
      return { ok: false, error: { class: "schema-invalid", reason: "source-on-ordinary", detail: "set-mode writes ordinary with source null; the request brings a source" } };
    }
    const next = { ...pair.control, mode: { value, source } };
    const v = ctx.validateResult(PACKAGE_SCHEMA_ID, next, "the record after set-mode is not a valid package");
    if (!v.ok) return v;
    if (isObject5(source)) {
      const resolved = resolveReference(ctx, source.kind === "user-word" ? source.ref : source);
      if (!resolved.ok) return resolved;
    }
    const bytes = Buffer.from(serialise(next), "utf-8");
    const revision = revisionOf(bytes);
    return {
      ok: true,
      value: {
        writes: [{ path: req.record.path, bytes }],
        result: { operation_id: req.operation_id, path: req.record.path, mode: next.mode, revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: revision }
      }
    };
  };
}
function resolvePackage(ctx, ref, role) {
  const hit = resolveRecordRef(ctx, ref);
  if (!hit.ok) return hit;
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "package") return refusal2("unresolved-reference", "not-a-package", `the ${role} ${ref.record_id} is the ${pair.value.kind} record ${hit.value.path}; it must be a package`);
  return pair;
}
function dependencyEdges(ctx) {
  const edges = /* @__PURE__ */ new Map();
  for (const path of controlFiles(ctx.wb, ctx.wb.root)) {
    if (!path.endsWith("/package.json") && path !== "package.json") continue;
    const r = ctx.readPair(path);
    if (!r.ok || r.value.kind !== "package" || typeof r.value.control.id !== "string") continue;
    const deps = Array.isArray(r.value.control.depends_on) ? r.value.control.depends_on : [];
    const targets = deps.flatMap((d) => isObject5(d) && isObject5(d.target) && d.target.workbench_id === ctx.wb.id && typeof d.target.record_id === "string" ? [d.target.record_id] : []);
    edges.set(r.value.control.id, targets);
  }
  return edges;
}
function cycleThrough(start, edges) {
  const seen = /* @__PURE__ */ new Set([start]);
  const path = [start];
  const visit = (node) => {
    for (const next of edges.get(node) ?? []) {
      if (next === start) return true;
      if (seen.has(next)) continue;
      seen.add(next);
      path.push(next);
      if (visit(next)) return true;
      path.pop();
    }
    return false;
  };
  return visit(start) ? [...path, start] : null;
}
function setDependenciesPlan(req) {
  return (ctx) => {
    const r = livePackage(ctx, req, "set-dependencies", "sets a package's dependencies");
    if (!r.ok) return r;
    const pkg = r.value;
    const self = pkg.control.id;
    const counted = /* @__PURE__ */ new Map();
    for (const e of req.depends_on) counted.set(e.target.record_id, (counted.get(e.target.record_id) ?? 0) + 1);
    const twice = [...counted].filter(([, n]) => n > 1).map(([id]) => id);
    if (twice.length > 0) return refusal2("schema-invalid", "duplicate-target", `depends_on names ${twice.join(", ")} more than once; one edge per target`);
    for (const e of req.depends_on) {
      if (e.target.record_id === self && e.target.workbench_id === ctx.wb.id) {
        return refusal2("conflict", "self-dependency", `depends_on names the package itself, ${self}`);
      }
      const target = resolvePackage(ctx, e.target, "dependency target");
      if (!target.ok) return target;
    }
    const edges = dependencyEdges(ctx);
    edges.set(self, req.depends_on.map((e) => e.target.record_id));
    const cycle = cycleThrough(self, edges);
    if (cycle !== null) return refusal2("conflict", "cycle", `depends_on would close the cycle ${cycle.join(" -> ")}`);
    const next = { ...pkg.control, depends_on: req.depends_on };
    const v = ctx.validateResult(PACKAGE_SCHEMA_ID, next, "the record after set-dependencies is not a valid package");
    if (!v.ok) return v;
    const w = recordWrite(req.record.path, next);
    return {
      ok: true,
      value: {
        writes: [w],
        result: { operation_id: req.operation_id, path: req.record.path, depends_on: req.depends_on, revision: w.revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: w.revision }
      }
    };
  };
}
var PLAN_ROLE = "plan";
var sameRecord = (a, id) => isObject5(a) && a.record_id === id;
var acceptedBy = (acceptance, pkg) => isObject5(acceptance) && isObject5(acceptance.ref) && acceptance.ref.record_id === pkg.control.id && acceptance.ref.workbench_id === pkg.control.workbench_id;
var withAcceptance = (doc, acceptance) => ({ ...doc.control, control: { ...doc.control.control, acceptance } });
function replacedRecord(ctx, ref, pkg) {
  const hit = resolveRecordRef(ctx, ref);
  if (!hit.ok) return hit.error.reason === "record-not-found" || hit.error.reason === "foreign-workbench" ? { ok: true, value: null } : hit;
  const pair = ctx.readPair(hit.value.path);
  if (!pair.ok) return pair;
  if (pair.value.kind !== "plan") return { ok: true, value: null };
  const control = pair.value.control.control;
  if (isTerminal("plan", control?.state)) return { ok: true, value: null };
  return { ok: true, value: acceptedBy(control?.acceptance, pkg) ? pair.value : null };
}
function adoptPlanPlan(req) {
  return (ctx) => {
    const r = livePackage(ctx, req, "adopt-plan", "binds a document into a package");
    if (!r.ok) return r;
    const pkg = r.value;
    const role = req.role ?? PLAN_ROLE;
    const docId = req.plan.record_id;
    const hit = resolveRecordRef(ctx, req.plan);
    if (!hit.ok) return hit;
    const notAPlan = (what) => refusal2("unresolved-reference", "not-a-plan", `${docId} is ${what}; adopt-plan binds a plan record, as a ${role}`);
    const got = ctx.readPair(hit.value.path);
    if (!got.ok) return got;
    const doc = got.value;
    if (doc.kind !== "plan") return notAPlan(`the ${doc.kind} record ${doc.path}`);
    const control = doc.control.control ?? {};
    if (isTerminal("plan", control.state)) {
      return refusal2("conflict", "plan-terminal", `${doc.path} is ${String(control.state)}, which is terminal; a closed or deferred plan is history and is not adopted`);
    }
    if (doc.narrative === null || doc.narrative.sha256 === null) {
      return refusal2("unresolved-reference", "narrative-missing", `${doc.path} names ${doc.narrative === null ? "no narrative" : `${doc.narrative.path}, which does not exist`}; its revision cannot be accepted`);
    }
    if (doc.narrative.sha256 !== req.revision) {
      return refusal2("conflict", "plan-revision-mismatch", `${doc.narrative.path} is ${doc.narrative.sha256}; the request accepts ${req.revision}`);
    }
    const acceptance = control.acceptance;
    if (acceptance !== null && acceptance !== void 0 && !acceptedBy(acceptance, pkg)) {
      const holder = isObject5(acceptance) && isObject5(acceptance.ref) ? String(acceptance.ref.record_id) : JSON.stringify(acceptance);
      return refusal2("conflict", "plan-adopted-elsewhere", `${doc.path} is adopted by the package ${holder}; a record is adopted by one package`);
    }
    const docs = Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
    const otherRole = docs.find((d) => sameRecord(d.ref, docId) && d.role !== role);
    if (otherRole !== void 0) {
      return refusal2("conflict", "role-conflict", `${docId} is this package's ${otherRole.role} already; a record is adopted in one role`);
    }
    const entry = { ref: req.plan, role, revision: req.revision };
    const at = docs.findIndex((d) => d.role === role && (role === PLAN_ROLE || sameRecord(d.ref, docId)));
    const nextDocs = at < 0 ? [...docs, entry] : docs.map((d, i) => i === at ? entry : d);
    const replaced = role === PLAN_ROLE && at >= 0 && !sameRecord(docs[at]?.ref, docId) ? docs[at].ref : null;
    let references = Array.isArray(pkg.control.references) ? pkg.control.references : [];
    let cleared = null;
    if (replaced !== null) {
      if (!references.some((x) => canonical(x) === canonical(replaced))) references = [...references, replaced];
      const old = replacedRecord(ctx, replaced, pkg);
      if (!old.ok) return old;
      cleared = old.value;
    }
    const nextPkg = { ...pkg.control, active_documents: nextDocs, references };
    const nextDoc = withAcceptance(doc, { ref: { workbench_id: pkg.control.workbench_id, record_id: pkg.control.id }, revision: req.revision });
    const checks = [
      [nextDoc, RECORD_SCHEMA_ID, `the ${role} record after adopt-plan is not valid`],
      [nextPkg, PACKAGE_SCHEMA_ID, "the record after adopt-plan is not a valid package"]
    ];
    const nextOld = cleared === null ? null : withAcceptance(cleared, null);
    if (nextOld !== null) checks.push([nextOld, RECORD_SCHEMA_ID, "the replaced plan record after adopt-plan is not valid"]);
    for (const [value, schemaId, what] of checks) {
      const v = ctx.validateResult(schemaId, value, what);
      if (!v.ok) return v;
    }
    const writes = [recordWrite(doc.path, nextDoc), ...cleared !== null && nextOld !== null ? [recordWrite(cleared.path, nextOld)] : [], recordWrite(req.record.path, nextPkg)];
    const pkgWrite = writes[writes.length - 1];
    return {
      ok: true,
      value: {
        writes: writes.map(({ path, bytes }) => ({ path, bytes })),
        result: {
          operation_id: req.operation_id,
          path: req.record.path,
          role,
          document: { path: doc.path, revision: writes[0].revision, narrative: doc.narrative },
          replaced,
          revision: pkgWrite.revision,
          previous_revision: req.expected_revision
        },
        revisions: Object.fromEntries(writes.map((w) => [w.path, w.revision]))
      }
    };
  };
}
var EVIDENCE_CHECKED_ON = "done";
function activePlanRevision(pkg) {
  const docs = Array.isArray(pkg.control.active_documents) ? pkg.control.active_documents : [];
  const plan = docs.find((d) => isObject5(d) && d.role === PLAN_ROLE);
  return isObject5(plan) && typeof plan.revision === "string" ? plan.revision : null;
}
function bindEvidence(ctx, pkg, binding) {
  const id = binding.ref.record_id;
  const hit = resolveRecordRef(ctx, binding.ref);
  if (!hit.ok) return hit;
  const got = ctx.readPair(hit.value.path);
  if (!got.ok) return got;
  const ev = got.value;
  if (ev.kind !== "evidence") return refusal2("unresolved-reference", "not-evidence", `${id} is the ${ev.kind} record ${ev.path}; an evidence binding names a fusion.evidence/v1 record`);
  if (ev.revision !== binding.ref.revision) {
    return refusal2("missing-evidence", "evidence-revision-mismatch", `${ev.path} is stored at ${ev.revision}; the binding names ${binding.ref.revision}`);
  }
  const v = validate(EVIDENCE_SCHEMA_ID, ev.control);
  if (!v.ok) return refusal2("schema-invalid", "evidence-invalid", `${ev.path}: ${v.class === "schema-invalid" ? describeErrors(v.errors) : `no schema ${v.schemaId}`}`);
  const naming = evidenceNaming(ev);
  if (naming !== null) return { ok: false, error: naming };
  const record = ev.control;
  if (ctx.wb.id !== null && record.workbench_id !== ctx.wb.id) {
    return refusal2("unknown-scope", "foreign-workbench-id", `${ev.path} carries workbench_id ${JSON.stringify(record.workbench_id)}; this workbench is ${ctx.wb.id}`);
  }
  if (record.execution_policy !== binding.policy) {
    return refusal2("schema-invalid", "policy-mismatch", `${ev.path} was produced ${String(record.execution_policy)}; the binding claims ${binding.policy}, and a binding never changes the policy a result was produced under`);
  }
  const brief = pkg.narrative?.sha256 ?? null;
  if (record.brief_revision !== brief) {
    return refusal2("missing-evidence", "brief-changed", `${ev.path} was produced against the brief at ${String(record.brief_revision)}; ${pkg.narrative === null ? "the package names no brief" : `${pkg.narrative.path} is ${brief ?? "absent"}`} now`);
  }
  if (record.plan_revision !== null) {
    const plan = activePlanRevision(pkg);
    if (plan === null) return refusal2("missing-evidence", "no-active-plan", `${ev.path} was produced against the plan at ${String(record.plan_revision)}; the package has no plan in force`);
    if (plan !== record.plan_revision) return refusal2("missing-evidence", "plan-changed", `${ev.path} was produced against the plan at ${String(record.plan_revision)}; the plan in force is at ${plan}`);
  }
  const report = reportProblem(ev);
  if (report !== null) return { ok: false, error: report };
  return { ok: true, value: ev };
}
function attachEvidencePlan(req) {
  return (ctx) => {
    const r = livePackage(ctx, req, "attach-evidence", "binds evidence to a package");
    if (!r.ok) return r;
    const pkg = r.value;
    const bound = Array.isArray(pkg.control.evidence) ? pkg.control.evidence : [];
    const { record_id, revision: at } = req.evidence.ref;
    if (bound.some((b) => isObject5(b.ref) && b.ref.record_id === record_id && b.ref.revision === at)) {
      return refusal2("conflict", "evidence-already-bound", `the package binds ${record_id} at ${at} already`);
    }
    const ev = bindEvidence(ctx, pkg, req.evidence);
    if (!ev.ok) return ev;
    const next = { ...pkg.control, evidence: [...bound, req.evidence] };
    const v = ctx.validateResult(PACKAGE_SCHEMA_ID, next, "the record after attach-evidence is not a valid package");
    if (!v.ok) return v;
    const w = recordWrite(req.record.path, next);
    return {
      ok: true,
      value: {
        writes: [w],
        result: { operation_id: req.operation_id, path: req.record.path, evidence: req.evidence, evidence_record: ev.value.path, revision: w.revision, previous_revision: req.expected_revision },
        revisions: { [req.record.path]: w.revision }
      }
    };
  };
}
var REVIEWS_STORE = "reviews";
var EVIDENCE_PLACE = new RegExp(`^(shared|${STORE_OF.package}/[^/]+)/${REVIEWS_STORE}/[^/]+$`);
function placementFinding(path) {
  if (!path.endsWith(EVIDENCE_SUFFIX) || EVIDENCE_PLACE.test(path)) return null;
  return {
    path,
    class: "unknown-scope",
    reason: "evidence-outside-reviews",
    detail: `${path} is an evidence record outside a ${REVIEWS_STORE}/ store; it lives beside its report in <container>/${REVIEWS_STORE}/ or shared/${REVIEWS_STORE}/`
  };
}
var field = (v, key) => isObject5(v) ? v[key] : void 0;
function referenceSites(pair) {
  const sites = [];
  const add = (at, value) => {
    if (value !== null && value !== void 0) sites.push({ at, value });
  };
  const each = (at, items, key) => {
    if (!Array.isArray(items)) return;
    items.forEach((item, i) => add(key === void 0 ? `${at}/${i}` : `${at}/${i}/${key}`, key === void 0 ? item : field(item, key)));
  };
  const c = pair.control;
  const backup = () => add("/provenance/backup", field(c.provenance, "backup"));
  if (pair.kind === "evidence") {
    add("/report", c.report);
    add("/predecessor", c.predecessor);
    return sites;
  }
  if (pair.kind === "package") {
    add("/origin/ref", field(c.origin, "ref"));
    const source = field(c.mode, "source");
    if (field(source, "kind") === "user-word") add("/mode/source/ref", field(source, "ref"));
    else if (field(source, "kind") !== "legacy") add("/mode/source", source);
    each("/depends_on", c.depends_on, "target");
    if (Array.isArray(c.active_documents)) {
      c.active_documents.forEach((binding, i) => {
        const value = field(binding, "ref");
        if (value !== null && value !== void 0) sites.push({ at: `/active_documents/${i}/ref`, value, binding });
      });
    }
    each("/references", c.references);
    each("/evidence", c.evidence, "ref");
    each("/outcome/evidence", field(c.outcome, "evidence"), "ref");
    backup();
    return sites;
  }
  each("/references", c.references);
  backup();
  const control = c.control;
  if (pair.kind === "issue") add("/control/disposition/reason_ref", field(field(control, "disposition"), "reason_ref"));
  else if (pair.kind === "plan") add("/control/acceptance/ref", field(field(control, "acceptance"), "ref"));
  else if (pair.kind === "discussion") each("/control/outcome_refs", field(control, "outcome_refs"));
  else if (pair.kind === "decision") {
    for (const f of DECISION_FIELDS) add(f === "deferral" ? "/control/deferral/target" : `/control/${f}`, f === "deferral" ? field(field(control, f), "target") : field(control, f));
  }
  return sites;
}
function referenceEntry(ctx, path, site) {
  const { value } = site;
  const role = site.binding === void 0 ? void 0 : field(site.binding, "role");
  const head = { path, at: site.at, ...role === "plan" || role === "spec" ? { role } : {} };
  if (!isObject5(value)) return { ...head, status: "unchecked" };
  if (typeof value.record_id === "string") {
    const hit = resolveRecordRef(ctx, { workbench_id: value.workbench_id, record_id: value.record_id });
    if (hit.ok) return { ...head, status: "resolved", target: hit.value.path };
    if (hit.error.reason === "foreign-workbench") return { ...head, status: "foreign" };
    return { ...head, status: hit.error.reason === "ambiguous-reference" ? "ambiguous" : "unresolved", class: hit.error.class, reason: hit.error.reason };
  }
  if (typeof value.path === "string" && typeof value.sha256 === "string") {
    const hit = ctx.resolveArtefact({ path: value.path, sha256: value.sha256 });
    return hit.ok ? { ...head, status: "resolved", target: hit.value.path } : { ...head, status: "unresolved", class: hit.error.class, reason: hit.error.reason };
  }
  if (typeof value.project === "string") return { ...head, status: "foreign" };
  return { ...head, status: "unchecked" };
}
function evidenceEntries(ctx, pkg) {
  const bound = pkg.control.evidence;
  const outcome = pkg.control.outcome;
  const sites = [
    ["/evidence", bound],
    ["/outcome/evidence", outcome?.evidence ?? []]
  ];
  return sites.flatMap(
    ([at, bindings]) => bindings.map((binding, i) => {
      const base = { path: pkg.path, at: `${at}/${i}`, record_id: binding.ref.record_id, revision: binding.ref.revision, policy: binding.policy };
      const r = bindEvidence(ctx, pkg, binding);
      return r.ok ? { ...base, status: "fresh" } : { ...base, status: "stale", class: r.error.class, reason: r.error.reason };
    })
  );
}
function evidenceRecords(ctx, outcome) {
  const out = {};
  for (const b of outcome?.evidence ?? []) {
    const hit = resolveRecordRef(ctx, b.ref);
    if (!hit.ok) continue;
    const ev = ctx.readPair(hit.value.path);
    if (!ev.ok || ev.value.kind !== "evidence") continue;
    out[b.ref.record_id] = { verdict: String(ev.value.control.verdict), revision: ev.value.revision };
  }
  return out;
}
function edgeEntries(ctx, pkg) {
  const edges = pkg.control.depends_on;
  return edges.map((edge, i) => {
    const base = { path: pkg.path, at: `/depends_on/${i}`, target: edge.target.record_id, condition: edge.condition };
    const target = resolvePackage(ctx, edge.target, "dependency target");
    if (!target.ok) return { ...base, status: "unmet", class: target.error.class, reason: target.error.reason };
    const t = target.value.control;
    const outcome = isObject5(t.outcome) ? t.outcome : null;
    const rule = dependencySatisfied(edge.condition, { status: String(t.status), outcome, evidence_records: evidenceRecords(ctx, outcome) });
    return rule.ok ? { ...base, status: "satisfied" } : { ...base, status: "unmet", class: rule.class, reason: "dependency-unmet", detail: rule.reason };
  });
}
function cyclesOf(edges) {
  const covered = /* @__PURE__ */ new Set();
  const out = [];
  for (const id of [...edges.keys()].sort()) {
    if (covered.has(id)) continue;
    const cycle = cycleThrough(id, edges);
    if (cycle === null) continue;
    for (const n of cycle) covered.add(n);
    out.push(cycle);
  }
  return out;
}
var STATUS_COPY = /^\*\*(Status|Claim|Mode|Depends-on|Active spec\/plan):\*\*/;
var CONFLICT_START = /^<{7}( |$)/;
var CONFLICT_END = /^>{7}( |$)/;
var FENCE = /^(```|~~~)/;
var SECTION = /^## /;
function narrativeEntries(wb, pair, view) {
  const narrative = pair.narrative;
  if (narrative === null || narrative.sha256 === null) return [];
  if (isTerminal(pair.kind, stateOf(pair))) return [];
  if (view.blockedOn(narrative.path) !== void 0) return [];
  const abs = resolveInside(wb, narrative.path);
  if (!abs.ok) return [];
  const lines = readFileSync7(abs.value, "utf-8").split(/\r?\n/);
  const entry = (cls, reason, i) => ({ path: pair.path, narrative: narrative.path, class: cls, reason, line: lines[i], line_number: i + 1 });
  const start = lines.findIndex((l) => CONFLICT_START.test(l));
  if (start >= 0 && lines.some((l) => CONFLICT_END.test(l))) return [entry("schema-invalid", "conflict-markers", start)];
  const out = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE.test(line)) fenced = !fenced;
    else if (!fenced && SECTION.test(line)) break;
    else if (!fenced && STATUS_COPY.test(line)) out.push(entry("conflict", "status-copy-in-narrative", i));
  }
  return out;
}
function indexedContext(ctx) {
  const { wb } = ctx;
  let index = null;
  const build = () => {
    const hits = /* @__PURE__ */ new Map();
    for (const path of controlFiles(wb, wb.root)) {
      const abs = resolveInside(wb, path);
      if (!abs.ok) continue;
      const parsed = strictParse(readFileSync7(abs.value));
      if (!parsed.ok) continue;
      const id = parsed.value.id;
      if (typeof id !== "string") continue;
      const carriers = hits.get(id);
      if (carriers === void 0) hits.set(id, [path]);
      else carriers.push(path);
    }
    return hits;
  };
  return {
    ...ctx,
    resolveRecordId(id) {
      index ??= build();
      const hits = index.get(id) ?? [];
      if (hits.length === 0) return refusal2("unresolved-reference", "record-not-found", `no control file in ${wb.root} carries the id ${id}`);
      if (hits.length > 1) return refusal2("conflict", "ambiguous-reference", `the id ${id} is carried by ${hits.join(", ")}`);
      return { ok: true, value: { path: hits[0], id } };
    }
  };
}
function reconcile(wb, req, view) {
  const scope = scopeDir(wb, req.scope);
  if (!scope.ok) return scope.response;
  const within2 = req.scope === void 0 ? null : relative3(wb.root, scope.dir).split("\\").join("/");
  const inScope = (path) => within2 === null || path === within2 || path.startsWith(`${within2}/`);
  const ctx = indexedContext(readContext(wb, view.blocked));
  const intents = [];
  for (const b of view.blocked) {
    if (!b.paths.some(inScope)) continue;
    const r = readIntent(wb, b.operation_id);
    if (!r.ok) return fromStore(r.error);
    if (r.value === null) continue;
    intents.push({ operation_id: b.operation_id, op: r.value.intent.op, files: r.value.intent.writes.map((w) => ({ path: w.path, state: fileState(wb, w) })) });
  }
  const paths = controlFiles(wb, scope.dir);
  const records = [];
  const references = [];
  const evidence = [];
  const dependencies2 = [];
  const narratives = [];
  const scopedPackages = /* @__PURE__ */ new Set();
  for (const path of paths) {
    records.push(...blockedFindingOf(wb, path, view), ...findingsOf(wb, path));
    const placed = placementFinding(path);
    if (placed !== null) records.push(placed);
    const r = ctx.readPair(path);
    if (!r.ok || !validate(r.value.schemaId, r.value.control).ok) continue;
    const pair = r.value;
    for (const site of referenceSites(pair)) references.push(referenceEntry(ctx, path, site));
    if (pair.kind === "package") {
      scopedPackages.add(pair.control.id);
      evidence.push(...evidenceEntries(ctx, pair));
      dependencies2.push(...edgeEntries(ctx, pair));
    }
    narratives.push(...narrativeEntries(wb, pair, view));
  }
  for (const ids of cyclesOf(dependencyEdges(ctx))) {
    if (ids.some((id) => scopedPackages.has(id))) dependencies2.push({ status: "cycle", ids });
  }
  return {
    ok: true,
    result: { workbench: wb.root, state: wb.state, scope: req.scope ?? null, checked: paths.length, intents, records, references, evidence, dependencies: dependencies2, narratives }
  };
}

// contract/dependencies.json
var dependencies_default = {
  description: "The two conditions a depends_on edge of a fusion.package/v1 record may carry, evaluated against the target package's live JSON only. terminal is what every legacy **Depends-on:** entry becomes and matches fusion's behaviour today: a done or dropped predecessor satisfies the ordering. succeeded is the additional, explicitly chosen condition the spec introduces for Prior: the predecessor must be done with outcome class completed and carry at least one accepted evidence binding; a dropped predecessor never satisfies it. Neither condition is inferred from prose, from a filename marker or from the target's Markdown.",
  sources: [
    "concept/fusion-json-workbench-spec.md section 4.2 (depends_on row and the paragraph on terminal and succeeded)",
    "rules/fusion-workbench-conventions.md '## Work packages' (**Depends-on:** as a terminal-condition edge)"
  ],
  conditions: {
    terminal: {
      description: "Satisfied when the target package is in a terminal status, whatever its outcome.",
      target_status: ["done", "dropped"],
      outcome_class: null,
      evidence: null,
      legacy_default: true
    },
    succeeded: {
      description: "Satisfied when the target package is done with outcome class completed and its outcome binds at least one evidence record with verdict accept; the binding's revision must equal the evidence record's current revision, otherwise the evidence is stale and the condition is unmet with the typed error missing-evidence.",
      target_status: ["done"],
      outcome_class: ["completed"],
      evidence: {
        source: "outcome.evidence",
        min_accepted: 1,
        accepted_means: {
          record_schema: "fusion.evidence/v1",
          verdict: ["accept"],
          revision_matches: true
        }
      },
      legacy_default: false
    }
  },
  legacy_edge_condition: "terminal",
  refusals: {
    unknown_condition: "schema-invalid",
    missing_target: "unresolved-reference",
    cycle: "conflict",
    self_dependency: "conflict",
    succeeded_without_accepted_evidence: "missing-evidence"
  },
  notes: [
    "An unmet condition blocks dispatch of the dependant; it changes no state on either side.",
    "legacy-completed never satisfies succeeded: it marks a done package imported without a bound evidence record.",
    "Cycle detection runs over the whole depends_on graph of the workbench at set-dependencies time and again at validate/reconcile; a cycle found later is reported, never silently cut."
  ]
};

// contract/transitions.json
var transitions_default = {
  description: "The status and state vocabularies of the five controlled kinds, their terminal subsets and every allowed edge, as data. The package matrix is spec section 4.2; the record kinds carry the conventions' marker vocabularies by value (rules/fusion-workbench-conventions.md '## State Markers \u2014 issues and planning', '## State Markers \u2014 decisions', '## Terminal states are history'). An edge absent here is refused with the typed error conflict. The package matrix is never applied to a record kind. A terminal state is left only along an edge listed here; where none exists, continuation files a new record that cites the terminal one.",
  sources: [
    "concept/fusion-json-workbench-spec.md section 4.2 (Prior repository, 2026-09-28)",
    "docs/design/fusion-fj00-prior-response.md section 5 (Prior repository, c512c4c): 5a issue and plan edges confirmed, 5b discussions narrowed to open and closed, 5c decision _d_ is deferred",
    "rules/fusion-workbench-conventions.md '## Work packages', '## State Markers \u2014 issues and planning', '## State Markers \u2014 decisions', '## Filename Patterns' (discussion row), '## Terminal states are history'"
  ],
  kinds: {
    package: {
      schema: "fusion.package/v1",
      field: "status",
      states: [
        "open",
        "claimed",
        "paused",
        "done",
        "dropped"
      ],
      terminal: [
        "done",
        "dropped"
      ],
      edges: [
        {
          from: "open",
          to: "claimed",
          operation: "claim"
        },
        {
          from: "open",
          to: "paused",
          operation: "transition"
        },
        {
          from: "open",
          to: "dropped",
          operation: "transition"
        },
        {
          from: "claimed",
          to: "open",
          operation: "release"
        },
        {
          from: "claimed",
          to: "paused",
          operation: "transition"
        },
        {
          from: "claimed",
          to: "done",
          operation: "transition"
        },
        {
          from: "claimed",
          to: "dropped",
          operation: "transition"
        },
        {
          from: "paused",
          to: "open",
          operation: "transition"
        },
        {
          from: "paused",
          to: "claimed",
          operation: "claim"
        },
        {
          from: "paused",
          to: "dropped",
          operation: "transition"
        }
      ],
      claim: {
        open: "forbidden",
        claimed: "required",
        paused: "forbidden",
        done: "optional",
        dropped: "optional"
      },
      outcome_classes: {
        open: [],
        claimed: [],
        paused: [],
        done: [
          "completed",
          "legacy-completed"
        ],
        dropped: [
          "bounded",
          "cancelled",
          "failed",
          "dropped"
        ]
      },
      reopen: "never: resumption files a new package that references the terminal one",
      notes: [
        "open and paused carry no claim; claimed needs one; a terminal record may keep its historical claim (claim optional).",
        "A merely interrupted package is paused, not failed; failed is an outcome class under dropped.",
        "Migration keeps old values, reports an invalid status/claim combination and invents no repairing edge.",
        "Only one checkout may hold the claim; a second claim on a claimed package is a conflict."
      ]
    },
    issue: {
      schema: "fusion.record/v1",
      field: "control.state",
      markers: {
        open: "_o_",
        in_progress: "_p_",
        closed: "_c_",
        deferred: "_d_"
      },
      states: [
        "open",
        "in_progress",
        "closed",
        "deferred"
      ],
      terminal: [
        "closed",
        "deferred"
      ],
      edges: [
        {
          from: "open",
          to: "in_progress"
        },
        {
          from: "open",
          to: "closed"
        },
        {
          from: "open",
          to: "deferred"
        },
        {
          from: "in_progress",
          to: "closed"
        },
        {
          from: "in_progress",
          to: "deferred"
        }
      ],
      reopen: "never: closed and deferred are terminal (conventions, ## Terminal states are history); continuation files a new record that cites the terminal one",
      notes: [
        "closed and deferred require a disposition object; open and in_progress require disposition null (record.schema.json).",
        "The selection state of a candidate block (pending, selected, admitted, ...) is a separate axis and moves independently of this lifecycle.",
        "Plan FJ00 step 6 listed deferred to open; the conventions rule _c_ and _d_ terminal with no edit back to a live state, and the spec (section 4.3) reads the existing rules per kind, so the edge is not carried."
      ]
    },
    plan: {
      schema: "fusion.record/v1",
      field: "control.state",
      markers: {
        open: "_o_",
        in_progress: "_p_",
        closed: "_c_",
        deferred: "_d_"
      },
      states: [
        "open",
        "in_progress",
        "closed",
        "deferred"
      ],
      terminal: [
        "closed",
        "deferred"
      ],
      edges: [
        {
          from: "open",
          to: "in_progress"
        },
        {
          from: "open",
          to: "closed"
        },
        {
          from: "open",
          to: "deferred"
        },
        {
          from: "in_progress",
          to: "closed"
        },
        {
          from: "in_progress",
          to: "deferred"
        }
      ],
      step_states: [
        "open",
        "in_progress",
        "done"
      ],
      step_edges: [
        {
          from: "open",
          to: "in_progress"
        },
        {
          from: "in_progress",
          to: "done"
        },
        {
          from: "open",
          to: "done"
        }
      ],
      reopen: "never: closed and deferred are terminal (conventions, ## Terminal states are history); continuation files a new record that cites the terminal one",
      notes: [
        "Step marks [OPEN] [IN PROGRESS] [DONE] map to the step states; an unclear step structure blocks the import of that plan.",
        "A plan whose steps are all done may close; closing does not require every step done (a plan may be closed early by the user)."
      ]
    },
    discussion: {
      schema: "fusion.record/v1",
      field: "control.state",
      markers: {
        open: "_o_",
        closed: "_c_"
      },
      states: [
        "open",
        "closed"
      ],
      terminal: [
        "closed"
      ],
      edges: [
        {
          from: "open",
          to: "closed"
        }
      ],
      reopen: "never",
      notes: [
        "A discussion has open and closed and the one edge between them (Prior's FJ00 response 5b, the conventions' '## Filename Patterns' row); a legacy record carrying another value is a migration finding, never an imported state.",
        "An _o_ discussion is read as interrupted, not as pending: its record is on disk from round one."
      ]
    },
    decision: {
      schema: "fusion.record/v1",
      field: "control.state",
      markers: {
        open: "_o_",
        answered: "_a_",
        implemented: "_i_",
        superseded: "_s_",
        deferred: "_d_"
      },
      states: [
        "open",
        "answered",
        "implemented",
        "superseded",
        "deferred"
      ],
      terminal: [
        "implemented",
        "superseded",
        "deferred"
      ],
      edges: [
        {
          from: "open",
          to: "answered",
          requires: "answer_ref"
        },
        {
          from: "open",
          to: "implemented",
          requires: "implementation_ref"
        },
        {
          from: "open",
          to: "deferred",
          requires: "deferral"
        },
        {
          from: "answered",
          to: "implemented",
          requires: "implementation_ref"
        },
        {
          from: "answered",
          to: "deferred",
          requires: "deferral"
        },
        {
          from: "answered",
          to: "superseded",
          requires: "superseded_by"
        },
        {
          from: "implemented",
          to: "superseded",
          requires: "superseded_by"
        }
      ],
      reopen: "never: an implemented decision that needs revisiting is superseded by a new decision",
      notes: [
        "implemented to superseded is the one terminal-to-terminal edge the conventions allow.",
        "Prior's FJ00 response 5c: _d_ is deferred, terminal, with an explicit target and who ruled (control.deferral in record.schema.json; the reason stays in the Markdown Deferred: line). The conventions (## Terminal states are history) name _i_, _s_ and _d_ on a decision terminal, and no reopening edge exists.",
        "Retired: and Revised by: lines move no state; the marker stays where it stands."
      ]
    }
  }
};

// schemas/campaign.schema.json
var campaign_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.campaign/v1",
  title: "fusion.campaign/v1",
  description: "A campaign, campaigns/<id>/campaign.json, written only when a campaign is used (spec sections 3 and 4.3). It holds what the spec keeps register-wide instead of spreading it over issue markers: Prior's campaign.Charter and campaign.State, the register-level part of candidates.Register (the candidates themselves are issues with a candidate block) and the formation plan packages.Plan (modules/fusion/campaign/campaign.go, candidates/register.go, packages/packages.go at 12d8424), each typed exactly; codec/contract/prior-mapping.json names every field. register and formation are null for a campaign that never used them; policy, snapshot, formation.policy and state.completion_evidence are null when Prior did not persist them (at 12d8424 they are call inputs, not aggregate fields). Go maps are arrays of keyed entries sorted by key on export. Rules JSON Schema cannot check: entry keys inside stable, watermarks, snapshot.versions, snapshot.source_revisions, candidates, packages, admissions and active_items are distinct beyond identical entries; a register entry's candidate_id names an issue whose candidate.prior_id matches; charter_hash equals Prior's charterHash over the charter; each revision equals Prior's hash of the aggregate with Revision cleared; a package's members, dependencies and an admission's attempts name candidates present in formation.candidates; the proposed mapping of a formation package state onto a fusion package status is unconfirmed (prior-mapping.json) and no importer applies it by default; a campaign state, claim or historical run reference grants no Prior authority and no live lease.",
  type: "object",
  additionalProperties: false,
  required: ["charter", "extensions", "formation", "id", "provenance", "register", "schema", "state", "workbench_id"],
  properties: {
    schema: { const: "fusion.campaign/v1" },
    id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    charter: { $ref: "#/$defs/charter" },
    state: { $ref: "#/$defs/state" },
    register: {
      oneOf: [
        { type: "null" },
        { $ref: "#/$defs/register" }
      ]
    },
    formation: {
      oneOf: [
        { type: "null" },
        { $ref: "#/$defs/formation" }
      ]
    },
    provenance: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/provenance" },
    extensions: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/extensions" }
  },
  $defs: {
    positive_integer: { type: "integer", minimum: 1 },
    non_negative_integer: { type: "integer", minimum: 0 },
    string_set: { type: "array", uniqueItems: true, items: { type: "string", minLength: 1 } },
    string_list: { type: "array", items: { type: "string" } },
    string_list_nonempty: {
      type: "array",
      description: "A charter list Charter.Validate requires non-empty; order and multiplicity are kept as Prior stores them and enter CharterHash (Prior's FJ00 response 2: the lists are not deduplicated).",
      minItems: 1,
      items: { type: "string", minLength: 1 }
    },
    name_list: {
      type: "array",
      description: "A charter list that may be empty; order and multiplicity are kept as Prior stores them and enter CharterHash.",
      items: { type: "string", minLength: 1 }
    },
    optional_string: { type: ["string", "null"], minLength: 1 },
    optional_prior_revision: {
      oneOf: [
        { type: "null" },
        { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_revision" }
      ]
    },
    optional_prior_opaque_revision: {
      oneOf: [
        { type: "null" },
        { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" }
      ]
    },
    limits: {
      type: "object",
      description: "campaign.Limits; bounds as Charter.Validate enforces them.",
      additionalProperties: false,
      required: ["max_attempts", "max_consecutive_failures", "max_failures", "max_reviews", "resource_units"],
      properties: {
        max_attempts: { $ref: "#/$defs/positive_integer" },
        max_failures: { $ref: "#/$defs/non_negative_integer" },
        max_consecutive_failures: { $ref: "#/$defs/positive_integer" },
        max_reviews: { $ref: "#/$defs/positive_integer" },
        resource_units: { $ref: "#/$defs/positive_integer" }
      }
    },
    charter: {
      type: "object",
      description: "campaign.Charter. Its revision is an author-assigned label, kept as a typed opaque value.",
      additionalProperties: false,
      required: ["acceptance_policy", "authorisation_ref", "autonomy_policy", "backend_policy", "budget_account", "campaign_id", "candidate_sources", "capabilities", "data_boundary", "delivery_policy", "intake_policy", "item_kinds", "limits", "objective", "package_policy", "revision", "schema_version", "selection_policy", "stop_conditions", "workflow_templates"],
      properties: {
        schema_version: { const: 1 },
        campaign_id: { type: "string", minLength: 1 },
        revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" },
        authorisation_ref: { type: "string", minLength: 1 },
        objective: { type: "string", minLength: 1 },
        item_kinds: { $ref: "#/$defs/string_list_nonempty" },
        candidate_sources: { $ref: "#/$defs/string_list_nonempty" },
        workflow_templates: { $ref: "#/$defs/string_list_nonempty" },
        stop_conditions: { $ref: "#/$defs/string_list" },
        intake_policy: { type: "string", minLength: 1 },
        selection_policy: { type: "string", minLength: 1 },
        package_policy: { type: "string", minLength: 1 },
        acceptance_policy: { type: "string", minLength: 1 },
        autonomy_policy: { type: "string", minLength: 1 },
        backend_policy: { type: "string", minLength: 1 },
        delivery_policy: { type: "string", minLength: 1 },
        data_boundary: { $ref: "#/$defs/name_list" },
        capabilities: { $ref: "#/$defs/name_list" },
        budget_account: { type: "string", minLength: 1 },
        limits: { $ref: "#/$defs/limits" }
      }
    },
    counters: {
      type: "object",
      additionalProperties: false,
      required: ["attempts", "consecutive_failures", "failures", "resource_units", "reviews"],
      properties: {
        attempts: { $ref: "#/$defs/non_negative_integer" },
        failures: { $ref: "#/$defs/non_negative_integer" },
        consecutive_failures: { $ref: "#/$defs/non_negative_integer" },
        reviews: { $ref: "#/$defs/non_negative_integer" },
        resource_units: { $ref: "#/$defs/non_negative_integer" }
      }
    },
    settlement: {
      type: "object",
      additionalProperties: false,
      required: ["open_intents", "owned_runs", "quarantined", "unknown_effects"],
      properties: {
        owned_runs: { $ref: "#/$defs/non_negative_integer" },
        open_intents: { $ref: "#/$defs/non_negative_integer" },
        unknown_effects: { $ref: "#/$defs/non_negative_integer" },
        quarantined: { $ref: "#/$defs/non_negative_integer" }
      }
    },
    completion_evidence: {
      type: "object",
      description: "campaign.CompletionEvidence as handed to Finalize.",
      additionalProperties: false,
      required: ["all_attempts_terminal", "audit_ref", "final_audit_passed", "intake_closed", "objective_met", "watermark"],
      properties: {
        objective_met: { type: "boolean" },
        intake_closed: { type: "boolean" },
        all_attempts_terminal: { type: "boolean" },
        final_audit_passed: { type: "boolean" },
        watermark: { $ref: "#/$defs/optional_string" },
        audit_ref: { $ref: "#/$defs/optional_string" }
      }
    },
    state: {
      type: "object",
      description: "campaign.State without its embedded Charter (held in charter) and with its Revision typed. State values and outcome words are those campaign.go writes at 12d8424.",
      additionalProperties: false,
      required: ["baseline_hash", "campaign_id", "charter_hash", "completion_evidence", "counters", "previous_terminal", "reason", "requested_outcome", "revision", "runs", "sessions", "settlement", "state"],
      properties: {
        campaign_id: { type: "string", minLength: 1 },
        revision: { $ref: "#/$defs/optional_prior_revision" },
        state: {
          type: "string",
          enum: ["draft", "authorised", "discarded", "running", "paused", "completed", "bounded", "failed", "cancelled", "archived"]
        },
        previous_terminal: {
          type: ["string", "null"],
          enum: ["completed", "bounded", "failed", "cancelled", null]
        },
        reason: { $ref: "#/$defs/optional_string" },
        charter_hash: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_revision" },
        counters: { $ref: "#/$defs/counters" },
        settlement: { $ref: "#/$defs/settlement" },
        requested_outcome: {
          type: ["string", "null"],
          enum: ["bounded", "failed", "cancelled", null]
        },
        sessions: { $ref: "#/$defs/string_list" },
        runs: { $ref: "#/$defs/string_list" },
        baseline_hash: { $ref: "#/$defs/optional_prior_opaque_revision" },
        completion_evidence: {
          oneOf: [
            { type: "null" },
            { $ref: "#/$defs/completion_evidence" }
          ]
        }
      },
      allOf: [
        {
          if: { type: "object", properties: { state: { const: "archived" } }, required: ["state"] },
          then: { type: "object", properties: { previous_terminal: { type: "string" } } }
        },
        {
          if: { type: "object", properties: { state: { enum: ["draft", "authorised", "discarded", "running", "paused", "completed", "bounded", "failed", "cancelled"] } }, required: ["state"] },
          then: { type: "object", properties: { previous_terminal: { type: "null" } } }
        }
      ]
    },
    policy: {
      type: "object",
      description: "candidates.Policy: the selection policy as validatePolicy accepts it. Predicate and weight fields are the four fieldValue names.",
      additionalProperties: false,
      required: ["maximum_risk", "minimum_score", "predicates", "version", "weights"],
      properties: {
        version: { type: "string", minLength: 1 },
        predicates: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["field", "operator", "value"],
            properties: {
              field: { type: "string", enum: ["severity", "confidence", "estimated_scope", "risk"] },
              operator: { type: "string", enum: ["gte", "lte", "eq"] },
              value: { type: "integer" }
            }
          }
        },
        weights: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["field", "multiplier"],
            properties: {
              field: { type: "string", enum: ["severity", "confidence", "estimated_scope", "risk"] },
              multiplier: { type: "integer" }
            }
          }
        },
        minimum_score: { type: "integer" },
        maximum_risk: { $ref: "#/$defs/non_negative_integer" }
      }
    },
    snapshot: {
      type: "object",
      description: "candidates.Snapshot: the frozen selection input. Its maps are keyed entries.",
      additionalProperties: false,
      required: ["source_revisions", "versions", "watermark"],
      properties: {
        watermark: { type: "string", minLength: 1 },
        versions: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["candidate_id", "version"],
            properties: {
              candidate_id: { type: "string", minLength: 1 },
              version: { $ref: "#/$defs/positive_integer" }
            }
          }
        },
        source_revisions: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["candidate_id", "revision"],
            properties: {
              candidate_id: { type: "string", minLength: 1 },
              revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" }
            }
          }
        }
      }
    },
    register: {
      type: "object",
      description: "candidates.Register without Candidates (each is an issue), plus the policy and snapshot of the last selection where Prior persisted them.",
      additionalProperties: false,
      required: ["closed_watermark", "id", "intake_closed", "policy", "revision", "snapshot", "stable", "watermarks"],
      properties: {
        id: { type: "string", minLength: 1 },
        revision: { $ref: "#/$defs/optional_prior_revision" },
        stable: {
          type: "array",
          description: "Register.Stable: stable key to candidate id.",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["candidate_id", "stable_key"],
            properties: {
              stable_key: { type: "string", minLength: 1 },
              candidate_id: { type: "string", minLength: 1 }
            }
          }
        },
        watermarks: {
          type: "array",
          description: "Register.Watermarks: source id to highest watermark seen.",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["source_id", "watermark"],
            properties: {
              source_id: { type: "string", minLength: 1 },
              watermark: { type: "string", minLength: 1 }
            }
          }
        },
        intake_closed: { type: "boolean" },
        closed_watermark: { $ref: "#/$defs/optional_string" },
        policy: {
          oneOf: [
            { type: "null" },
            { $ref: "#/$defs/policy" }
          ]
        },
        snapshot: {
          oneOf: [
            { type: "null" },
            { $ref: "#/$defs/snapshot" }
          ]
        }
      },
      if: { type: "object", properties: { intake_closed: { const: true } }, required: ["intake_closed"] },
      then: { type: "object", properties: { closed_watermark: { type: "string" } } }
    },
    formation_policy: {
      type: "object",
      description: "packages.FormationPolicy as Form validates it.",
      additionalProperties: false,
      required: ["budget", "max_risk", "max_size", "max_validation_cost", "version"],
      properties: {
        version: { type: "string", minLength: 1 },
        max_risk: { $ref: "#/$defs/positive_integer" },
        max_validation_cost: { $ref: "#/$defs/positive_integer" },
        max_size: { $ref: "#/$defs/positive_integer" },
        budget: { $ref: "#/$defs/non_negative_integer" }
      }
    },
    formation_candidate: {
      type: "object",
      description: "packages.Candidate: the formation view of a candidate, not the register entry. Its three metrics are signed: legacy values may be negative and are transported as stored (Prior's FJ00 response 2).",
      additionalProperties: false,
      required: ["dependencies", "estimated_size", "id", "purpose", "qualified", "resources", "risk", "selected", "validation_cost", "version"],
      properties: {
        id: { type: "string", minLength: 1 },
        purpose: { type: "string" },
        version: { $ref: "#/$defs/positive_integer" },
        resources: { $ref: "#/$defs/string_set" },
        dependencies: { $ref: "#/$defs/string_set" },
        risk: { type: "integer" },
        validation_cost: { type: "integer" },
        estimated_size: { type: "integer" },
        qualified: { type: "boolean" },
        selected: { type: "boolean" }
      }
    },
    formation_package: {
      type: "object",
      description: "packages.Package kept verbatim. Its state is Prior's vocabulary; the fusion package status it may correspond to is a proposal in codec/contract/prior-mapping.json, not a field here. Its three metrics are signed, as on the formation candidate. failure_reason occurs on stale as well as failed (required on failed, admitted on stale, null on formed, admitting and admitted). baseline_hash is set by Dispatch; a successful completion clears it on the other formed packages while rebasing them, and a failure does not execute that branch (Prior's FJ00 response 2).",
      additionalProperties: false,
      required: ["accepted_revision", "base_revision", "baseline_hash", "dependencies", "estimated_size", "failure_reason", "id", "members", "reasons", "resources", "risk", "state", "validation_cost"],
      properties: {
        id: { type: "string", minLength: 1 },
        members: { $ref: "#/$defs/string_set" },
        dependencies: { $ref: "#/$defs/string_set" },
        resources: { $ref: "#/$defs/string_set" },
        reasons: { $ref: "#/$defs/string_list" },
        risk: { type: "integer" },
        validation_cost: { type: "integer" },
        estimated_size: { type: "integer" },
        state: { type: "string", enum: ["formed", "admitting", "admitted", "running", "completed", "failed", "stale"] },
        base_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" },
        accepted_revision: { $ref: "#/$defs/optional_prior_opaque_revision" },
        baseline_hash: { $ref: "#/$defs/optional_prior_opaque_revision" },
        failure_reason: { $ref: "#/$defs/optional_string" }
      },
      allOf: [
        {
          if: { type: "object", properties: { state: { const: "failed" } }, required: ["state"] },
          then: { type: "object", properties: { failure_reason: { type: "string" } } }
        },
        {
          if: { type: "object", properties: { state: { enum: ["formed", "admitting", "admitted"] } }, required: ["state"] },
          then: { type: "object", properties: { accepted_revision: { type: "null" }, failure_reason: { type: "null" } } }
        }
      ]
    },
    attempt: {
      type: "object",
      additionalProperties: false,
      required: ["attempt", "candidate", "candidate_version", "item_id"],
      properties: {
        candidate: { type: "string", minLength: 1 },
        candidate_version: { $ref: "#/$defs/positive_integer" },
        attempt: { $ref: "#/$defs/positive_integer" },
        item_id: { type: "string", minLength: 1 }
      }
    },
    admission: {
      type: "object",
      description: "packages.Admission: one admission intent and its attempts. Status values are those packages.go writes at 12d8424.",
      additionalProperties: false,
      required: ["attempts", "id", "lease_ref", "package_id", "status", "workbench_revision"],
      properties: {
        id: { type: "string", minLength: 1 },
        package_id: { type: "string", minLength: 1 },
        status: { type: "string", enum: ["open", "leased", "workbench-written", "reconciled", "settled"] },
        lease_ref: { $ref: "#/$defs/optional_string" },
        workbench_revision: { $ref: "#/$defs/optional_prior_opaque_revision" },
        attempts: {
          type: "array",
          uniqueItems: true,
          items: { $ref: "#/$defs/attempt" }
        }
      }
    },
    formation: {
      type: "object",
      description: "packages.Plan with its Revision typed and its maps as keyed entries; policy is the FormationPolicy where Prior persisted it.",
      additionalProperties: false,
      required: ["accepted_revision", "active_items", "admissions", "candidates", "deferred", "id", "order", "packages", "policy", "policy_version", "remaining_budget", "revision"],
      properties: {
        id: { type: "string", minLength: 1 },
        revision: { $ref: "#/$defs/optional_prior_revision" },
        policy_version: { type: "string", minLength: 1 },
        accepted_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" },
        remaining_budget: { type: "integer" },
        policy: {
          oneOf: [
            { type: "null" },
            { $ref: "#/$defs/formation_policy" }
          ]
        },
        candidates: { type: "array", uniqueItems: true, items: { $ref: "#/$defs/formation_candidate" } },
        packages: { type: "array", uniqueItems: true, items: { $ref: "#/$defs/formation_package" } },
        order: { $ref: "#/$defs/string_set" },
        deferred: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["candidate", "reason"],
            properties: {
              candidate: { type: "string", minLength: 1 },
              reason: { type: "string", minLength: 1 }
            }
          }
        },
        admissions: { type: "array", uniqueItems: true, items: { $ref: "#/$defs/admission" } },
        active_items: {
          type: "array",
          description: "Plan.ActiveItems: work item id to the admission (intent) id holding it.",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["admission_id", "item_id"],
            properties: {
              item_id: { type: "string", minLength: 1 },
              admission_id: { type: "string", minLength: 1 }
            }
          }
        }
      }
    }
  }
};

// schemas/common.schema.json
var common_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.common/v1",
  title: "fusion.common/v1",
  description: "Shared definitions for the fusion JSON control contract (Prior spec concept/fusion-json-workbench-spec.md, sections 4 and 4.4). Every other fusion schema refers here by $ref; nothing here is a record on its own. The spec namespace of this file is fusion.common/v1; its $id carries the urn:fusion:schema: prefix because a scheme-less $id cannot be the base of a cross-file $ref under RFC 3986. Rules this file states but JSON Schema cannot check: a record_ref resolves to exactly one record in the named workbench (multiple hits are a conflict, a missing one is unresolved-reference); an artefact_ref's sha256 is the hash of the exact stored bytes and its path must not cross a symlink out of the workbench; a foreign_ref is a claim the writer makes and is never inferred; a legacy citation resolves by one workbench-wide basename lookup without reading state from the marker; the person half of an actor is never composed from a model name.",
  $defs: {
    uuid: {
      type: "string",
      description: "RFC 4122 UUID, lowercase hex, hyphenated.",
      format: "uuid",
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    sha256: {
      type: "string",
      description: "Algorithm-qualified SHA-256 of exact bytes: the revision of a fusion record or the hash of an artefact.",
      pattern: "^sha256:[0-9a-f]{64}$"
    },
    prior_revision: {
      type: "string",
      description: "Typed import value for a Prior aggregate revision or hash that Prior computes as hex SHA-256 over encoding/json output (registerRevision, planRevision, stateRevision, charterHash, evidenceHash, snapshot hash). Not a fusion sha256: the hashed bytes are Go's marshalling, not stored fusion bytes.",
      pattern: "^prior-json-sha256:[0-9a-f]{64}$"
    },
    prior_opaque_revision: {
      type: "string",
      description: "Typed import value for a Prior revision, hash or version label whose encoding fusion does not know (source revisions, accepted and base revisions, baseline hashes, workbench revisions, charter revision labels). The raw Prior string follows the prefix verbatim; an empty Prior string imports as null, never as this value.",
      pattern: "^prior-opaque:.+$"
    },
    timestamp: {
      type: "string",
      description: "RFC 3339 date-time with a UTC offset or Z. A legacy value without an offset is not guessed; it stays raw in provenance.legacy_fields and the field is null.",
      format: "date-time"
    },
    checkout_id: {
      type: "string",
      description: "The eight lowercase hex characters bin/fusion-identity prints as CHECKOUT=.",
      pattern: "^[0-9a-f]{8}$"
    },
    git_commit: {
      type: "string",
      description: "A git object name: abbreviated or full SHA-1, or full SHA-256.",
      pattern: "^[0-9a-f]{7,64}$"
    },
    workbench_path: {
      type: "string",
      description: "Path relative to the workbench root: no leading slash, no drive letter, no backslash, no '..' segment.",
      minLength: 1,
      pattern: "^(?![A-Za-z]:)(?!/)(?!\\.\\.(/|$))(?!.*/\\.\\.(/|$))[^\\\\]+$"
    },
    token: {
      type: "string",
      description: "A lowercase identifier token: letters, digits and hyphens, starting with a letter.",
      pattern: "^[a-z][a-z0-9-]*$"
    },
    record_ref: {
      type: "object",
      description: "Reference to a JSON-controlled record by (workbench_id, record_id), optionally pinned to an exact revision and carrying a display name for humans.",
      additionalProperties: false,
      required: ["record_id", "workbench_id"],
      properties: {
        workbench_id: { $ref: "#/$defs/uuid" },
        record_id: { $ref: "#/$defs/uuid" },
        revision: { $ref: "#/$defs/sha256" },
        display: { type: "string", minLength: 1 }
      }
    },
    artefact_ref: {
      type: "object",
      description: "Reference to a file inside the workbench by relative path, hash of its exact bytes and artefact kind. The kind is one of the closed set the decision record 260928-1420_*_which-closed-vocabularies-do-artefact-kind-and-issue-disposition-kind-take.md rules (option 3, Prior's FJ00 response 6a): the fourteen kinds rules/fusion-workbench-conventions.md '## Filename Patterns' names plus audit, test-report, integration-report, handover, manifest and json. A kind labels an artefact by what it is, never by its file format (a review's Markdown file is a review, a backup of a narrative in archive/ is other), and it proves nothing about the check it names. The set is additive-only from here: no token is removed or redefined, an addition is adopted explicitly, and a token an older reader does not know is a refusal, never a silent other.",
      additionalProperties: false,
      required: ["kind", "path", "sha256"],
      properties: {
        path: { $ref: "#/$defs/workbench_path" },
        sha256: { $ref: "#/$defs/sha256" },
        kind: {
          type: "string",
          enum: ["spec", "plan", "issue", "decision", "discussion", "review", "analysis", "consultation", "memo", "forum", "report", "patch", "log", "other", "audit", "test-report", "integration-report", "handover", "manifest", "json"]
        }
      }
    },
    foreign_ref: {
      type: "object",
      description: "Structured form of the foreign:<project>:<citation> citation: a record held in another project's workbench. Missing access is unknown, never dangling.",
      additionalProperties: false,
      required: ["citation", "project"],
      properties: {
        project: { type: "string", minLength: 1, pattern: "^[^:/\\\\\\s]+$" },
        citation: {
          oneOf: [
            { $ref: "#/$defs/legacy_marker_citation" },
            { $ref: "#/$defs/legacy_markerless_citation" }
          ]
        }
      }
    },
    legacy_marker_citation: {
      type: "string",
      description: "Storeless basename of a marker-bearing record, YYMMDD-HHMM_S_<topic>.md, with the marker wildcarded (*) or concrete (o p c d a i s). The marker carries no current state under JSON control.",
      pattern: "^[0-9]{6}-[0-9]{4}_(\\*|[opcdais])_[^/\\\\\\s]+\\.md$"
    },
    legacy_markerless_citation: {
      type: "string",
      description: "Storeless basename of a markerless artefact (work package, review, analysis, consultation, forum entry, history), YYMMDD-HHMM-<topic>.md, and the form a new marker-free record takes.",
      pattern: "^[0-9]{6}-[0-9]{4}-[^/\\\\\\s_]+\\.md$"
    },
    legacy_foreign_citation: {
      type: "string",
      description: "foreign:<project>:<citation>, both leading segments literal and required.",
      pattern: "^foreign:[^:/\\\\\\s]+:[0-9]{6}-[0-9]{4}(_(\\*|[opcdais])_[^/\\\\\\s]+|-[^/\\\\\\s_]+)\\.md$"
    },
    legacy_citation: {
      description: "Any of the three prose citation forms rules/fusion-workbench-conventions.md '## Filename Patterns' defines.",
      oneOf: [
        { $ref: "#/$defs/legacy_marker_citation" },
        { $ref: "#/$defs/legacy_markerless_citation" },
        { $ref: "#/$defs/legacy_foreign_citation" }
      ]
    },
    reference: {
      description: "One cross-reference: a structured record, artefact or foreign reference, or a legacy citation string.",
      oneOf: [
        { $ref: "#/$defs/record_ref" },
        { $ref: "#/$defs/artefact_ref" },
        { $ref: "#/$defs/foreign_ref" },
        { $ref: "#/$defs/legacy_citation" }
      ]
    },
    actor: {
      type: "object",
      description: `Who acted, in the shape of the conventions' **Filed by:** line: actor is 'user', an agent name or a host name; person is the PERSON= identity or null when unknown. Attribution, never authorisation. The token legacy-unknown is reserved (decision 261003-1746, option 1): it marks a filer a legacy workbench never recorded, is admitted as filed_by.actor only on a record or package whose provenance.source is imported or legacy-terminal, and is refused in every request that carries an actor, so no live write produces it. It is always paired with provenance.legacy_fields.derived["/filed_by/actor"] = {rule: unknown}, and is a different field from the package's origin.kind legacy-unknown.`,
      additionalProperties: false,
      required: ["actor", "person"],
      properties: {
        actor: { $ref: "#/$defs/token" },
        person: { type: ["string", "null"], minLength: 1 }
      }
    },
    legacy_unknown_actor: {
      description: "The reserved actor token for a filer a legacy workbench never recorded (decision 261003-1746, option 1). The record and package schemas admit it as filed_by.actor only under provenance.source imported or legacy-terminal; the protocol schema refuses it in every request that carries an actor.",
      const: "legacy-unknown"
    },
    execution_policy: {
      type: "string",
      description: "Under which host policy a result was produced. An import never upgrades claude-guided to prior-enforced.",
      enum: ["claude-guided", "prior-enforced"]
    },
    evidence_ref: {
      type: "object",
      description: "Binding to a fusion.evidence/v1 record at an exact revision, with the execution policy it was produced under. Prose alone never counts as a passed audit.",
      additionalProperties: false,
      required: ["policy", "ref"],
      properties: {
        ref: {
          allOf: [
            { $ref: "#/$defs/record_ref" },
            { type: "object", required: ["revision"], properties: { revision: { $ref: "#/$defs/sha256" } } }
          ]
        },
        policy: { $ref: "#/$defs/execution_policy" }
      }
    },
    narrative: {
      type: "object",
      description: "The Markdown file that carries the record's content. The link is navigation, not a status copy.",
      additionalProperties: false,
      required: ["path"],
      properties: {
        path: {
          allOf: [
            { $ref: "#/$defs/workbench_path" },
            { type: "string", pattern: "\\.md$" }
          ]
        }
      }
    },
    provenance: {
      type: "object",
      description: "Where the record came from. created: written under JSON control. imported: converted while still live; legacy_fields holds the removed original fields verbatim and backup points at the saved original. legacy-terminal: converted while already terminal; the Markdown stays byte-identical and its markers are history, not state.",
      additionalProperties: false,
      required: ["legacy_fields", "source"],
      properties: {
        source: { type: "string", enum: ["created", "imported", "legacy-terminal"] },
        legacy_fields: { type: "object" },
        backup: { $ref: "#/$defs/artefact_ref" }
      },
      if: { type: "object", properties: { source: { enum: ["imported", "legacy-terminal"] } }, required: ["source"] },
      then: { type: "object", properties: { backup: { $ref: "#/$defs/artefact_ref" } }, required: ["backup"] }
    },
    extensions: {
      type: "object",
      description: "Optional extensions, preserved verbatim. Ignorance of an extension may change neither state nor an execution decision; otherwise it needs a required feature in the workbench manifest."
    }
  }
};

// schemas/evidence.schema.json
var evidence_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.evidence/v1",
  title: "fusion.evidence/v1",
  description: "A structured review or audit result (spec section 4.4): it binds the subject git tree or range, the brief and plan revisions it was produced against, the role and profile version, the host and its execution policy, the verdict, the uncertainties, the per-check results and the hash of the Markdown report. The verdict vocabulary is Prior's review decision set (modules/fusion/schemas/review-response.json: accept, revise, escalate). Rules JSON Schema cannot check: an evidence file is immutable once accepted, a correction is a new record naming this one as predecessor; a package binds evidence through evidence_ref at an exact revision, and a changed brief_revision or plan_revision makes that binding stale; an import never upgrades claude-guided to prior-enforced; the report's sha256 is the hash of the report file's exact bytes; a check id is unique within checks beyond identical entries; a prose report without this record is not a passed audit.",
  type: "object",
  additionalProperties: false,
  required: ["accepted_at", "brief_revision", "checks", "execution_policy", "extensions", "host", "id", "plan_revision", "predecessor", "report", "role", "schema", "subject", "uncertainties", "verdict", "workbench_id"],
  properties: {
    schema: { const: "fusion.evidence/v1" },
    id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    subject: {
      type: "object",
      description: "The immutable subject: the git tree reviewed and, where the review covered a range, that range.",
      additionalProperties: false,
      required: ["git_range", "git_tree"],
      properties: {
        git_tree: { type: "string", pattern: "^([0-9a-f]{40}|[0-9a-f]{64})$" },
        git_range: {
          type: ["string", "null"],
          pattern: "^[0-9a-f]{7,64}\\.\\.[0-9a-f]{7,64}$"
        }
      }
    },
    brief_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
    plan_revision: {
      oneOf: [
        { type: "null" },
        { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      ]
    },
    role: {
      type: "object",
      additionalProperties: false,
      required: ["profile", "version"],
      properties: {
        profile: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" },
        version: { type: "string", minLength: 1 }
      }
    },
    host: {
      type: "string",
      description: "The host that ran the role.",
      enum: ["claude-code", "prior"]
    },
    execution_policy: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/execution_policy" },
    verdict: { type: "string", enum: ["accept", "revise", "escalate"] },
    uncertainties: {
      type: "array",
      items: { type: "string", minLength: 1 }
    },
    checks: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["detail", "id", "result"],
        properties: {
          id: { type: "string", minLength: 1 },
          result: { type: "string", enum: ["pass", "fail", "skipped", "unknown"] },
          detail: { type: ["string", "null"], minLength: 1 }
        }
      }
    },
    report: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/artefact_ref" },
    predecessor: {
      oneOf: [
        { type: "null" },
        { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" }
      ]
    },
    accepted_at: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/timestamp" },
    extensions: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/extensions" }
  }
};

// schemas/migration-plan.schema.json
var migration_plan_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.migration-plan/v1",
  title: "fusion.migration-plan/v1",
  description: "The frozen plan of a migration (spec section 8; FJ04 contract delta, amended for Prior ab9cb59 and a1fb17a), written by the migration's plan phase under archive/migrations/<migration id>/ in one bounded intent, the index last, and never edited afterwards. It is split into seven plan shapes, told apart by part, each file under the strict reader's 1 MiB cap. The index, plan.json, holds only the identity, the proposal it froze by path and sha256, the digest of the source inventory the proposal was composed from, the frozen root exclusions, the operation schedule and {part, n, path, sha256} of every other plan file; a request names the index by {path, sha256}. The other parts may each span several numbered files, in the order the index lists them: records (parts/records-<n>.json, the UUID map with each record's kind, cut row, control and narrative path, and on file 1 the cut's counts), inventory (parts/inventory-<n>.json, the source inventory the codec took under plan's lock, in survey's four entry forms), findings (parts/findings-<n>.json, the reported findings), repairs (parts/repairs-<n>.json, the consented repair log), answers (parts/answers-<n>.json, the operation baseline: every answer stored before plan, by hash) and chunk (chunks/<n>.json, at most 50 writes, each bound by the hash of the target before and after it). An eighth shape, rollback-binding, is no plan part and is not named by the index: it is rollback.json, written by the first rollback after activation in its own intent and bound by that rollback's stored answer (binding: {path, sha256}); rollback chunk 0 removes it. A write is an original copied to archive/migrations/<migration id>/originals/<workbench path>, a new control file carrying its target control, or a live narrative rewritten as byte deletions; apply never removes a file, and the removal writes a rollback journals (after null) are derived from these rows, not stored in them. Rules JSON Schema cannot check: every part hashes as the index names it, no part on disk is unnamed by the index, and the parts stand in the index's order (conflict/plan-file-changed); a chunk part's writes equals the length of that file's writes, and a part file's n and migration_id equal its index entry's; paths under archive/migrations/ name this migration's id; a request's operation_id is the one the schedule names for its phase and chunk, never an unassigned one (conflict/operation-id-unscheduled); the schedule holds one apply id per chunk in order from 1 and one rollback id per chunk from 0 to the chunk count, and no UUID occurs twice across schedule, records and workbench_id; a record UUID occurs once across the records parts and its control carries the id it is keyed by (schema-invalid/duplicate-id); every source and after hash matches disk at apply (conflict/source-changed); a pair's original, control file and rewrite share one chunk; deletion ranges ascend, do not overlap and lie inside the source bytes; an original's after_sha256 equals the sha256 of the file it copies; inventory entries are sorted bytewise by path across the inventory parts; the frozen inventory parts digest to the index's source_inventory_sha256 (conflict/plan-file-changed); answers entries are unique by operation_id and sorted bytewise by it across the answers parts; a rollback-binding's file hashes as the first post-activation rollback's binding names it (conflict/plan-file-changed), its fence is the standing rollback fence, its exempt entries are this migration's verify, the end naming chunk 1's fence and the begin of the standing fence, each found by reconstructing its request, and its no_ops, written only when non-empty, are the later operations proven verified second-run no-ops of this migration by the four recognition conditions of the FJ04 addendum for Prior d0fce6c, unique and ordered bytewise by operation_id, each still stored with its bound request digest and answer hash at every later fresh chunk (conflict/after-state-changed); the serialised binding stays under the strict reader's cap (schema-invalid/too-large).",
  type: "object",
  required: ["part", "schema"],
  properties: {
    schema: { const: "fusion.migration-plan/v1" },
    part: { type: "string", enum: ["index", "records", "inventory", "findings", "repairs", "answers", "chunk", "rollback-binding"] }
  },
  oneOf: [
    { $ref: "#/$defs/index" },
    { $ref: "#/$defs/records_part" },
    { $ref: "#/$defs/inventory_part" },
    { $ref: "#/$defs/findings_part" },
    { $ref: "#/$defs/repairs_part" },
    { $ref: "#/$defs/answers_part" },
    { $ref: "#/$defs/chunk" },
    { $ref: "#/$defs/rollback_binding" }
  ],
  $defs: {
    migration_id: {
      type: "string",
      description: "The migration's id, chosen by the host in the proposal; the pattern of fusion.workbench/v1's migration.id.",
      pattern: "^migration-[0-9]{8}-[a-z0-9-]+$"
    },
    source_layout: { type: "string", enum: ["fusion-v12", "fusion-pre-v12"] },
    proposal_ref: {
      type: "object",
      description: "The host's proposal, bound by its path under .json-state/migration/ and the sha256 of its exact bytes (request 45a). A hash differing from the file is conflict/source-changed.",
      additionalProperties: false,
      required: ["path", "sha256"],
      properties: {
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "^\\.json-state/migration/[^/]+$" }
          ]
        },
        sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    plan_ref: {
      type: "object",
      description: "The frozen index, archive/migrations/<migration id>/plan.json, bound by the sha256 of its exact bytes (request 45a). The index binds every other plan file by hash in turn.",
      additionalProperties: false,
      required: ["path", "sha256"],
      properties: {
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/plan\\.json$" }
          ]
        },
        sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    exclusions: {
      type: "array",
      description: "Root entries the host selects to leave out of every inventory comparison, frozen by the index: a subset of the codec's fixed allowlist (FJ04 addendum for a1fb17a, R1), which replaces any free name. .json-state/ and this migration's own archive/migrations/<id>/ are excluded always and are not listed; workbench.json is never excluded. The allowlist's regular files are .session-marker, .checkout-id, .cadence-anchors, .check-stamps, monitor, orchestrator-events.jsonl, .fusion-setup and .asset-provenance; its directories, with everything below them, are .guard-state and .commit-lock, named here without the trailing slash, as the root entry's name. Any other name is schema-invalid/proposal-invalid. The kinds are the codec's to check, not this schema's: a selected entry is skipped only while it is absent or lstats as its kind; under another kind, or as a link, it is eligible and compared, and no excluded link is followed. That an exclusion holds no narrative or control path the plan reads or writes is checked by plan (schema-invalid/proposal-invalid).",
      uniqueItems: true,
      items: {
        type: "string",
        enum: [".session-marker", ".checkout-id", ".cadence-anchors", ".check-stamps", "monitor", "orchestrator-events.jsonl", ".fusion-setup", ".asset-provenance", ".guard-state", ".commit-lock"]
      }
    },
    source_inventory_sha256: {
      $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256",
      description: "The digest of the eligible source inventory the proposal was composed from (FJ04 addendum for a1fb17a, R2): survey's eligible_sha256, taken by a survey run after the last consented repair and before composition, under the whole allowlist; sha256 over the codec's canonical JSON of the eligible entries in survey's four forms, sorted bytewise by path. plan checks it first in its Disk step, before the per-source checks: the eligible inventory it takes under the lock digesting differently is conflict/source-changed, naming both digests. After the freeze, apply, verify and rollback check that the frozen inventory parts digest to the index's value (conflict/plan-file-changed otherwise)."
    },
    answer_entry: {
      type: "object",
      description: "One answer stored before plan: its operation id, the op of its request, the digest of that request and the sha256 of the stored answer's bytes. A stored answer is a baseline entry only when all four equal one entry of the answers part.",
      additionalProperties: false,
      required: ["answer_sha256", "op", "operation_id", "request_digest"],
      properties: {
        operation_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        op: { $ref: "urn:fusion:schema:fusion.protocol/v1#/properties/op" },
        request_digest: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        answer_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    exempt_entry: {
      type: "object",
      description: "One stored answer a later rollback chunk exempts from the later-operation audit, found by reconstructing its request and comparing digests: this migration's verify (op migration), the end naming chunk 1's fence and the begin of the standing fence (op maintenance).",
      additionalProperties: false,
      required: ["op", "operation_id", "request_digest"],
      properties: {
        operation_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        op: { type: "string", enum: ["maintenance", "migration"] },
        request_digest: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    no_op_entry: {
      type: "object",
      description: "One stored answer the first rollback after activation proved to be a verified second-run no-op of this migration (FJ04 addendum for Prior d0fce6c, ### The verified no-op, its four recognition conditions): a migration plan answer under an id the schedule does not assign, whose request digest reconstructs over the index's exact proposal and whose result names this migration and the checked receipt. It is bound by its operation id, the digest of its request and the sha256 of the stored answer's bytes; a later fresh rollback chunk refuses when any of the three no longer matches the store (conflict/after-state-changed).",
      additionalProperties: false,
      required: ["answer_sha256", "operation_id", "request_digest"],
      properties: {
        operation_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        request_digest: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        answer_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    finding: {
      type: "object",
      description: "One finding of the host's legacy reader: its class, the narrative it is about and what the reader saw.",
      additionalProperties: false,
      required: ["class", "detail", "path", "severity"],
      properties: {
        class: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" },
        severity: { type: "string", enum: ["blocking", "reported"] },
        path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
        detail: { type: "string" }
      }
    },
    reported_finding: {
      description: "A finding the frozen plan carries: only reported ones, since plan refuses a proposal naming an open blocking finding (migration-incomplete/blocking-finding).",
      allOf: [
        { $ref: "#/$defs/finding" },
        { type: "object", properties: { severity: { const: "reported" } } }
      ]
    },
    repair: {
      type: "object",
      description: "One repair applied with the owner's consent before plan froze anything: the finding it cleared (blocking) or corrected at the owner's choice (reported, an optional repair), the answers given, and the sha256 of the file before and after the edit. An answer may be null where the owner left it open (a person not known; the actor is never offered from the current identity). The pre-repair bytes are in the external backup, the post-repair bytes in originals/.",
      additionalProperties: false,
      required: ["answers", "finding", "post_sha256", "pre_sha256"],
      properties: {
        finding: { $ref: "#/$defs/finding" },
        answers: { type: "object", additionalProperties: { type: ["string", "null"] } },
        pre_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        post_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    counts: {
      type: "object",
      description: "The record cut's figures as the proposal composed them: packages live and terminal, live records, terminal records the closure pulls in, terminal records left plain, empty container trees not migrated.",
      additionalProperties: false,
      required: ["empty_container", "package_live", "package_terminal", "plain_terminal", "record_closure", "record_live"],
      properties: {
        package_live: { type: "integer", minimum: 0 },
        package_terminal: { type: "integer", minimum: 0 },
        record_live: { type: "integer", minimum: 0 },
        record_closure: { type: "integer", minimum: 0 },
        plain_terminal: { type: "integer", minimum: 0 },
        empty_container: { type: "integer", minimum: 0 }
      }
    },
    deletions: {
      type: "array",
      description: "Byte ranges removed from the source bytes of a narrative: the control lines and step marks the import removes, and nothing else.",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["length", "offset"],
        properties: {
          offset: { type: "integer", minimum: 0, description: "Byte offset into the source bytes." },
          length: { type: "integer", minimum: 1 }
        }
      }
    },
    inventory_entry: {
      description: "One entry under the workbench root in survey's four forms: a regular file with its size and the sha256 of its bytes; a link with its own text, unfollowed and never hashed; a directory, with no size, mode or time; any other file type.",
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["kind", "path", "sha256", "size"],
          properties: {
            path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            kind: { const: "file" },
            size: { type: "integer", minimum: 0 },
            sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
          }
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["kind", "path", "target"],
          properties: {
            path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            kind: { const: "link" },
            target: { type: "string", minLength: 1, description: "The link's own text, with no claim about whether it resolves." }
          }
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["kind", "path"],
          properties: {
            path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            kind: { enum: ["directory", "other"] }
          }
        }
      ]
    },
    schedule_entry: {
      type: "object",
      additionalProperties: false,
      required: ["chunk", "operation_id"],
      properties: {
        chunk: { type: "integer", minimum: 0 },
        operation_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" }
      }
    },
    schedule: {
      type: "object",
      description: "Every operation id of this migration, frozen from the proposal's operation_ids before anything is dispatched (request 45f): plan's own; apply[i-1] for chunk i, chunk 1's also naming the fence it sets; verify's; rollback[k] for rollback chunk k from 0 to the chunk count; the surplus ids, unassigned. A request whose operation_id is not the one scheduled for its phase and chunk is conflict/operation-id-unscheduled.",
      additionalProperties: false,
      required: ["apply", "plan", "rollback", "unassigned", "verify"],
      properties: {
        plan: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        apply: {
          type: "array",
          minItems: 1,
          items: { allOf: [{ $ref: "#/$defs/schedule_entry" }, { type: "object", properties: { chunk: { type: "integer", minimum: 1 } } }] }
        },
        verify: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        rollback: {
          type: "array",
          minItems: 2,
          items: { $ref: "#/$defs/schedule_entry" }
        },
        unassigned: { type: "array", uniqueItems: true, items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" } }
      }
    },
    part_entry: {
      type: "object",
      description: "One plan file the index binds: its kind, its number within that kind from 1, its path and the sha256 of its exact bytes. writes, the chunk's write count, appears on chunk parts only.",
      additionalProperties: false,
      required: ["n", "part", "path", "sha256"],
      properties: {
        part: { type: "string", enum: ["records", "inventory", "findings", "repairs", "answers", "chunk"] },
        n: { type: "integer", minimum: 1 },
        path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
        sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        writes: { type: "integer", minimum: 1, maximum: 50 }
      },
      if: { type: "object", properties: { part: { const: "chunk" } } },
      then: {
        type: "object",
        required: ["writes"],
        properties: { path: { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/chunks/[1-9][0-9]*\\.json$" } }
      },
      else: {
        type: "object",
        not: { type: "object", required: ["writes"] },
        properties: { path: { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/parts/(records|inventory|findings|repairs|answers)-[1-9][0-9]*\\.json$" } }
      }
    },
    index: {
      type: "object",
      description: "archive/migrations/<migration id>/plan.json: identity, the proposal it froze, the source inventory digest, the exclusions, the schedule and the part list, nothing else.",
      additionalProperties: false,
      required: ["exclusions", "migration_id", "part", "parts", "proposal", "schedule", "schema", "source_inventory_sha256", "source_layout", "workbench_id"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "index" },
        migration_id: { $ref: "#/$defs/migration_id" },
        workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid", description: "The workbench UUID the manifest will carry; a resume reuses it." },
        source_layout: { $ref: "#/$defs/source_layout" },
        proposal: { $ref: "#/$defs/proposal_ref" },
        source_inventory_sha256: { $ref: "#/$defs/source_inventory_sha256" },
        exclusions: { $ref: "#/$defs/exclusions" },
        schedule: { $ref: "#/$defs/schedule" },
        parts: {
          type: "array",
          description: "Every other plan file, in the order plan wrote and apply reads them.",
          minItems: 1,
          items: { $ref: "#/$defs/part_entry" }
        }
      }
    },
    records_part: {
      type: "object",
      description: "parts/records-<n>.json: the UUID map, keyed by record id, with each converted pair's kind, cut row, control file and narrative; file 1 also carries the cut's counts, and no later file does. A UUID repeated as a key within one file is refused by the strict reader (duplicate-key); across files, by plan (duplicate-id).",
      additionalProperties: false,
      required: ["migration_id", "n", "part", "records", "schema"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "records" },
        migration_id: { $ref: "#/$defs/migration_id" },
        n: { type: "integer", minimum: 1 },
        counts: { $ref: "#/$defs/counts" },
        records: {
          type: "object",
          propertyNames: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
          additionalProperties: {
            type: "object",
            additionalProperties: false,
            required: ["control", "kind", "narrative", "row"],
            properties: {
              kind: { type: "string", enum: ["package", "issue", "plan", "discussion", "decision"] },
              row: { type: "string", enum: ["package-live", "package-terminal", "record-live", "record-closure"] },
              control: {
                allOf: [
                  { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
                  { type: "string", pattern: "(^|/)(package|[^/]+\\.record)\\.json$" }
                ]
              },
              narrative: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative/properties/path" }
            }
          }
        }
      },
      if: { type: "object", properties: { n: { const: 1 } } },
      then: { type: "object", required: ["counts"] },
      else: { type: "object", not: { type: "object", required: ["counts"] } }
    },
    inventory_part: {
      type: "object",
      description: "parts/inventory-<n>.json: the frozen source inventory, taken by the codec under plan's lock with survey's routine: every eligible entry, so none under .json-state/, this migration's own directory or a frozen exclusion. Each apply, verify and rollback chunk 0 compares the eligible inventory against it.",
      additionalProperties: false,
      required: ["entries", "migration_id", "n", "part", "schema"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "inventory" },
        migration_id: { $ref: "#/$defs/migration_id" },
        n: { type: "integer", minimum: 1 },
        entries: { type: "array", items: { $ref: "#/$defs/inventory_entry" } }
      }
    },
    findings_part: {
      type: "object",
      description: "parts/findings-<n>.json: the reported findings, carried for the record; a blocking one never reaches a frozen plan.",
      additionalProperties: false,
      required: ["findings", "migration_id", "n", "part", "schema"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "findings" },
        migration_id: { $ref: "#/$defs/migration_id" },
        n: { type: "integer", minimum: 1 },
        findings: { type: "array", items: { $ref: "#/$defs/reported_finding" } }
      }
    },
    repairs_part: {
      type: "object",
      description: "parts/repairs-<n>.json: the repair log, in the order the repairs were applied.",
      additionalProperties: false,
      required: ["migration_id", "n", "part", "repairs", "schema"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "repairs" },
        migration_id: { $ref: "#/$defs/migration_id" },
        n: { type: "integer", minimum: 1 },
        repairs: { type: "array", items: { $ref: "#/$defs/repair" } }
      }
    },
    answers_part: {
      type: "object",
      description: "parts/answers-<n>.json: the operation baseline (FJ04 addendum for a1fb17a, R3), every answer stored before plan, frozen inside plan's one freeze intent and counted against the freeze bound. The index names it with its hash and the receipt's parts bind it. Entries are unique and ordered bytewise by operation_id; uniqueness and order are wholly the codec's to check, not the schema's: a uniqueItems here is deep-equalled quadratically on every inventory part the root oneOf tries against this branch before part rules it out, and the codec refuses a repeated or out-of-order entry anyway. An empty list is valid on a store with no stored answer.",
      additionalProperties: false,
      required: ["entries", "migration_id", "n", "part", "schema"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "answers" },
        migration_id: { $ref: "#/$defs/migration_id" },
        n: { type: "integer", minimum: 1 },
        entries: { type: "array", items: { $ref: "#/$defs/answer_entry" } }
      }
    },
    rollback_binding: {
      type: "object",
      description: "archive/migrations/<migration id>/rollback.json (FJ04 addendum for a1fb17a, request 52): written by the first rollback after activation in its own intent, whose answer adds binding: {path, sha256} over these exact bytes. It binds the frozen index and the receipt by {path, sha256}, names the standing rollback fence, and lists the three exempt stored answers by {operation_id, op, request_digest} plus, under no_ops, each later operation proven a verified second-run no-op of this migration by {operation_id, request_digest, answer_sha256} (FJ04 addendum for Prior d0fce6c, its four recognition conditions). The codec writes no_ops only when at least one no-op was proven, so a binding without one keeps its earlier bytes; order and uniqueness by operation_id are the codec's to check, not the schema's. A later fresh rollback chunk checks the file against the bound hash before trusting it; a replay never reads it; rollback chunk 0 removes it.",
      additionalProperties: false,
      required: ["exempt", "fence", "migration_id", "part", "plan", "receipt", "schema"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "rollback-binding" },
        migration_id: { $ref: "#/$defs/migration_id" },
        plan: { $ref: "#/$defs/plan_ref" },
        receipt: {
          type: "object",
          description: "The receipt the first rollback after activation checked, by path and the sha256 of its exact bytes.",
          additionalProperties: false,
          required: ["path", "sha256"],
          properties: {
            path: {
              allOf: [
                { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
                { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/receipt\\.json$" }
              ]
            },
            sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
          }
        },
        fence: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid", description: "The operation id of the standing rollback fence's begin." },
        exempt: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          uniqueItems: true,
          items: { $ref: "#/$defs/exempt_entry" }
        },
        no_ops: {
          type: "array",
          description: "The proven no-ops, ordered bytewise by operation_id; present only when non-empty.",
          minItems: 1,
          items: { $ref: "#/$defs/no_op_entry" }
        }
      }
    },
    original_write: {
      type: "object",
      description: "The exact bytes of a converted or rewritten narrative, as they stand after repair, copied into originals/ before anything else of its pair is written.",
      additionalProperties: false,
      required: ["after_sha256", "from", "kind", "path", "source_sha256"],
      properties: {
        kind: { const: "original" },
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/originals/.+$" }
          ]
        },
        from: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative/properties/path" },
        source_sha256: { type: "null", description: "The target does not exist before the write." },
        after_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    control_write: {
      type: "object",
      description: "A new control file and the control it carries, serialised by the codec.",
      additionalProperties: false,
      required: ["after_sha256", "control", "kind", "path", "source_sha256"],
      properties: {
        kind: { const: "control" },
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "(^|/)(package|[^/]+\\.record)\\.json$" }
          ]
        },
        source_sha256: { type: "null", description: "The target does not exist before the write (conflict/record-exists otherwise)." },
        after_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        control: {
          oneOf: [
            { $ref: "urn:fusion:schema:fusion.package/v1" },
            { $ref: "urn:fusion:schema:fusion.record/v1" }
          ]
        }
      }
    },
    rewrite_write: {
      type: "object",
      description: "A live narrative rewritten by deleting byte ranges of its source (the control lines and step marks the import removes), so apply reads no Markdown grammar and never needs the proposal again.",
      additionalProperties: false,
      required: ["after_sha256", "deletions", "kind", "path", "source_sha256"],
      properties: {
        kind: { const: "rewrite" },
        path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative/properties/path" },
        source_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        after_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        deletions: { $ref: "#/$defs/deletions" }
      }
    },
    chunk: {
      type: "object",
      description: "archive/migrations/<migration id>/chunks/<n>.json: one apply request's writes, originals first.",
      additionalProperties: false,
      required: ["chunk", "migration_id", "part", "schema", "writes"],
      properties: {
        schema: { const: "fusion.migration-plan/v1" },
        part: { const: "chunk" },
        migration_id: { $ref: "#/$defs/migration_id" },
        chunk: { type: "integer", minimum: 1 },
        writes: {
          type: "array",
          minItems: 1,
          maxItems: 50,
          items: {
            oneOf: [
              { $ref: "#/$defs/original_write" },
              { $ref: "#/$defs/control_write" },
              { $ref: "#/$defs/rewrite_write" }
            ]
          }
        }
      }
    }
  }
};

// schemas/migration-proposal.schema.json
var migration_proposal_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.migration-proposal/v1",
  title: "fusion.migration-proposal/v1",
  description: "The host's mapping proposal, the input the migration's plan phase reads from .json-state/migration/ by {path, sha256} (FJ04 contract delta, amended for Prior ab9cb59 and a1fb17a). The host composes it from the legacy v12 Markdown (hooks/lib/legacy-import.ts composeProposal) and writes nothing else; the codec reads it, never writes it, and freezes it into fusion.migration-plan/v1's index and parts. It never travels and is no control record, so the 1 MiB record cap does not bind it; its cap is 16 MiB. A proposal that does not validate here is refused schema-invalid/proposal-invalid. It carries the record cut with fresh UUIDs, each record's target control, the backup path of its original, and, for a live narrative the import changes, the rewrite as byte deletions bound by the record's source_sha256 before and the rewrite's after_sha256 behind. It also carries every finding of both severities, the repair log of the consented repairs, the root exclusions the host selects from the codec's fixed allowlist, and every operation id of the run, frozen before dispatch (request 45f). It carries the digest of the eligible source inventory it was composed from, not its entries: plan takes its own inventory under the lock and digests it. Rules JSON Schema cannot check, each refused by plan in the contract's order: no UUID occurs twice across operation_ids' four members, none already has a stored answer or an intent in this workbench, the request's operation_id is operation_ids.plan, and once the writes are cut apply holds at least one id per chunk and rollback at least one more than that (proposal-invalid); an exclusion holds no narrative or control path the plan reads or writes (proposal-invalid); a record UUID occurs once across workbench_id and the records' keys, and each control's id is its key and its workbench_id the proposal's (duplicate-id); no control path is present on disk (conflict/record-exists); the eligible inventory plan takes under the lock digests to source_inventory_sha256, checked first in the Disk step (conflict/source-changed, naming both digests); no finding is blocking (migration-incomplete/blocking-finding); every record_ref at every reference site names a proposed record (closure-incomplete); every source_sha256 matches the inventory plan takes (conflict/source-changed). Also unchecked here: backup is archive/migrations/<migration_id>/originals/<narrative>; deletion ranges ascend, do not overlap and lie inside the source bytes, and applying them gives after_sha256 (proposal-invalid); a terminal record has no rewrite.",
  type: "object",
  additionalProperties: false,
  required: ["counts", "exclusions", "findings", "migration_id", "operation_ids", "records", "repairs", "schema", "source_inventory_sha256", "source_layout", "workbench_id"],
  properties: {
    schema: { const: "fusion.migration-proposal/v1" },
    migration_id: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/migration_id" },
    workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid", description: "The new workbench UUID, fixed in the index and reused by a resume." },
    source_layout: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/source_layout" },
    source_inventory_sha256: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/source_inventory_sha256", description: "survey's eligible_sha256 from the survey run after the last consented repair and before composition, whose entries the host composed from; the index carries the same value." },
    operation_ids: {
      type: "object",
      description: "Every operation id of the run, chosen by the caller and frozen before dispatch (request 45f). plan assigns apply[i-1] to chunk i (chunk 1's also names the fence it sets) and rollback[k] to rollback chunk k from 0 to the chunk count, fixes them in the index's schedule, and lists the surplus ids there as unassigned.",
      additionalProperties: false,
      required: ["apply", "plan", "rollback", "verify"],
      properties: {
        plan: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid", description: "The plan request's own operation_id." },
        apply: { type: "array", minItems: 1, uniqueItems: true, items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" } },
        verify: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        rollback: { type: "array", minItems: 2, uniqueItems: true, items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" }, description: "Rollback chunk 0's id included, so always one more than the apply ids a cut uses." }
      }
    },
    exclusions: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/exclusions" },
    records: {
      type: "object",
      description: "The record cut, keyed by the fresh record UUID. A UUID repeated as a key is refused by the strict reader (duplicate-key).",
      propertyNames: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
      additionalProperties: { $ref: "#/$defs/record" }
    },
    counts: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/counts" },
    findings: {
      type: "array",
      description: "Every finding of the reader, blocking and reported. A blocking one is admitted here and refused by plan as migration-incomplete/blocking-finding; the reported ones are frozen into the plan's findings parts, which the receipt binds by hash.",
      items: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/finding" }
    },
    repairs: {
      type: "array",
      description: "The repair log of step 8 (the session's repair-log.jsonl, outside the workbench), carried inline in the order applied, since the codec reads nothing outside the workbench; plan freezes it into the repairs parts.",
      items: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/repair" }
    }
  },
  $defs: {
    record: {
      type: "object",
      description: "One converted pair: its row of the record cut, its narrative as read, its new control file and the control it will carry.",
      additionalProperties: false,
      required: ["backup", "control", "control_path", "kind", "narrative", "rewrite", "row", "source_sha256"],
      properties: {
        row: { type: "string", enum: ["package-live", "package-terminal", "record-live", "record-closure"] },
        kind: { type: "string", enum: ["package", "issue", "plan", "discussion", "decision"] },
        narrative: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative/properties/path" },
        source_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256", description: "The narrative's bytes as the survey hashed them, after repair: the original's hash and a rewrite's before-hash." },
        control_path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "(^|/)(package|[^/]+\\.record)\\.json$" }
          ]
        },
        backup: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/originals/.+\\.md$" }
          ],
          description: "Where the original goes; the control's provenance.backup names the same path."
        },
        rewrite: {
          description: "null when the narrative stays byte-identical (every terminal record, and a live one with nothing to remove).",
          oneOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["after_sha256", "deletions"],
              properties: {
                after_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
                deletions: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/deletions" }
              }
            }
          ]
        },
        control: {
          oneOf: [
            { $ref: "urn:fusion:schema:fusion.package/v1" },
            { $ref: "urn:fusion:schema:fusion.record/v1" }
          ]
        }
      }
    }
  }
};

// schemas/migration-receipt.schema.json
var migration_receipt_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.migration-receipt/v1",
  title: "fusion.migration-receipt/v1",
  description: "The receipt of a verified migration, archive/migrations/<migration id>/receipt.json (spec section 8.3.6; FJ04 contract delta, amended for Prior ab9cb59), written by the verify phase in one intent with the manifest, the manifest last; workbench.json's migration.receipt names it by path only. The receipt hashes the manifest and the manifest does not hash the receipt, so neither refers to itself. A receipt exists only for a run whose every check passed: a failing check is migration-incomplete/check-failed and writes no receipt. It binds the frozen plan by hash instead of copying it: the index, and every part the index names, each by path and sha256; the repair log and the findings are among those parts. It holds no secret and no local journal. Rules JSON Schema cannot check: plan.sha256 is the hash of the index's exact bytes, and parts are exactly the index's parts in its order, at the hashes it names; verify_operation_id is the index's scheduled verify id; after_inventory_sha256 is the sha256 over the codec's canonical JSON of the eligible after-state inventory verify compared, entries sorted bytewise by path, the baseline a later rollback compares against; manifest_revision is the revision of the workbench.json bytes the same intent writes. A second-run plan and the first rollback after activation check identity, integrity and availability against these fields (migration-incomplete/receipt-unverified).",
  type: "object",
  additionalProperties: false,
  required: ["after_inventory_sha256", "checks", "counts", "manifest_revision", "migration_id", "parts", "plan", "schema", "source_layout", "verify_operation_id", "versions", "workbench_id"],
  properties: {
    schema: { const: "fusion.migration-receipt/v1" },
    migration_id: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/migration_id" },
    workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    source_layout: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/source_layout" },
    plan: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/plan_ref", description: "The frozen index this run executed, at its exact revision." },
    parts: {
      type: "array",
      description: "Every plan file the index names, by path and hash, in the index's order.",
      minItems: 1,
      uniqueItems: true,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "sha256"],
        properties: {
          path: {
            allOf: [
              { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
              { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/(chunks/[1-9][0-9]*|parts/(records|inventory|findings|repairs|answers)-[1-9][0-9]*)\\.json$" }
            ]
          },
          sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
        }
      }
    },
    verify_operation_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid", description: "The operation id of the verify that wrote this receipt; its stored answer is exempt from a later rollback's baseline." },
    after_inventory_sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
    checks: {
      type: "array",
      description: "Every check verify ran, each with the number of items it covered.",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["checked", "name", "result"],
        properties: {
          name: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" },
          result: { const: "passed" },
          checked: { type: "integer", minimum: 0 }
        }
      }
    },
    counts: { $ref: "urn:fusion:schema:fusion.migration-plan/v1#/$defs/counts" },
    versions: {
      type: "object",
      description: "What wrote the store: the schema ids and the features of the codec that ran verify, as inspect reports them.",
      additionalProperties: false,
      required: ["features", "schemas"],
      properties: {
        schemas: { type: "array", minItems: 1, uniqueItems: true, items: { type: "string", minLength: 1 } },
        features: { type: "array", minItems: 1, uniqueItems: true, items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" } }
      }
    },
    manifest_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
  }
};

// schemas/package.schema.json
var package_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.package/v1",
  title: "fusion.package/v1",
  description: "Control data of one work package, work-packages/<name>/package.json (spec section 4.2). Every key is required; null and the empty list are deliberately distinct. Cross-field rules expressed below with if/then: claimed requires a claim, open and paused require claim null, outcome is null exactly on the non-terminal statuses, done admits the classes completed and legacy-completed, dropped admits bounded, cancelled, failed and dropped, a non-completed class carries a reason, legacy-completed requires provenance.source legacy-terminal and legacy-terminal requires a terminal status, filed_by.actor equal to the reserved legacy-unknown requires provenance.source imported or legacy-terminal (decision 261003-1746), mode autonomous requires a non-null source, origin package and campaign require a ref and legacy-unknown forbids one, at most one active_documents entry has role plan. Rules JSON Schema cannot check and codec/contract/transitions.json plus transitions.ts enforce: which status change is legal from which status (the spec 4.2 matrix; done and dropped are terminal and never reopened, resumption files a new package citing the old); depends_on targets are distinct by record_id (uniqueItems only catches identical entries) and form no cycle; a depends_on condition is evaluated against the target's live JSON (codec/contract/dependencies.json); every record_ref resolves in the named workbench; each active_documents revision equals the hash of the referenced narrative at acceptance, and a changed brief makes bound evidence stale; the claim's checkout_id is a domain assignment, never a host lease; narrative.path names this package's own Markdown file inside its own directory; mode autonomous is written only on the user's word and never invented by an agent.",
  type: "object",
  additionalProperties: false,
  required: ["active_documents", "claim", "depends_on", "domain", "evidence", "extensions", "filed_by", "id", "mode", "narrative", "origin", "outcome", "provenance", "references", "schema", "status", "workbench_id"],
  properties: {
    schema: { const: "fusion.package/v1" },
    id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    domain: {
      description: "The conventions' **Domain:** field. null only on records imported without one.",
      type: ["string", "null"],
      enum: ["code", "data", null]
    },
    status: {
      description: "The five statuses of rules/fusion-workbench-conventions.md '## Work packages'. No further lifecycle taxonomy.",
      type: "string",
      enum: ["open", "claimed", "paused", "done", "dropped"]
    },
    claim: {
      description: "Domain assignment of the package to a checkout. A terminal record may keep its historical claim.",
      oneOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["checkout_id", "claimed_at", "person"],
          properties: {
            checkout_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/checkout_id" },
            person: { type: ["string", "null"], minLength: 1 },
            claimed_at: {
              description: "null when the historical time is unknown; never guessed.",
              oneOf: [
                { type: "null" },
                { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/timestamp" }
              ]
            }
          }
        }
      ]
    },
    mode: {
      type: "object",
      additionalProperties: false,
      required: ["source", "value"],
      properties: {
        value: { type: "string", enum: ["ordinary", "autonomous"] },
        source: {
          description: "Where the mode comes from: null (nothing recorded, value must be ordinary), a record, the user's word held in a record or artefact, or the imported legacy header line kept raw.",
          oneOf: [
            { type: "null" },
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
            {
              type: "object",
              additionalProperties: false,
              required: ["kind", "ref"],
              properties: {
                kind: { const: "user-word" },
                ref: {
                  oneOf: [
                    { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
                    { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/artefact_ref" }
                  ]
                }
              }
            },
            {
              type: "object",
              additionalProperties: false,
              required: ["kind", "raw"],
              properties: {
                kind: { const: "legacy" },
                raw: { type: "string", minLength: 1, description: "The imported **Mode:** header line, verbatim." }
              }
            }
          ]
        }
      },
      if: { type: "object", properties: { value: { const: "autonomous" } }, required: ["value"] },
      then: { type: "object", properties: { source: { type: "object" } } }
    },
    origin: {
      type: "object",
      description: "What the package was filed from. An agent's sub-package references the package or campaign whose scope it decomposes; that reference creates no new mandate and no execution right.",
      additionalProperties: false,
      required: ["kind", "ref"],
      properties: {
        kind: { type: "string", enum: ["user-request", "package", "campaign", "legacy-unknown"] },
        ref: {
          oneOf: [
            { type: "null" },
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" }
          ]
        }
      },
      allOf: [
        {
          if: { type: "object", properties: { kind: { enum: ["package", "campaign"] } }, required: ["kind"] },
          then: { type: "object", properties: { ref: { type: "object" } } }
        },
        {
          if: { type: "object", properties: { kind: { const: "legacy-unknown" } }, required: ["kind"] },
          then: { type: "object", properties: { ref: { type: "null" } } }
        }
      ]
    },
    filed_by: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/actor" },
    narrative: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative" },
    depends_on: {
      type: "array",
      description: "Ordering edges. A legacy **Depends-on:** entry becomes condition terminal; succeeded is the stricter, explicitly chosen condition (codec/contract/dependencies.json).",
      uniqueItems: true,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["condition", "target"],
        properties: {
          target: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
          condition: { type: "string", enum: ["terminal", "succeeded"] }
        }
      }
    },
    active_documents: {
      type: "array",
      description: "The specs and the plan in force, each bound to the exact revision accepted. At most one plan; any number of specs.",
      uniqueItems: true,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ref", "revision", "role"],
        properties: {
          ref: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
          role: { type: "string", enum: ["spec", "plan"] },
          revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
        }
      },
      contains: { type: "object", properties: { role: { const: "plan" } }, required: ["role"] },
      minContains: 0,
      maxContains: 1
    },
    references: {
      type: "array",
      description: "Purely informational cross-references; no ordering edge is implied.",
      uniqueItems: true,
      items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }
    },
    evidence: {
      type: "array",
      uniqueItems: true,
      items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/evidence_ref" }
    },
    outcome: {
      description: "Detail of the terminal result; not a second lifecycle. null while the package is open, claimed or paused.",
      oneOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["class", "evidence", "reason"],
          properties: {
            class: { type: "string", enum: ["completed", "bounded", "cancelled", "failed", "dropped", "legacy-completed"] },
            reason: { type: "string" },
            evidence: {
              type: "array",
              uniqueItems: true,
              items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/evidence_ref" }
            }
          },
          if: { type: "object", properties: { class: { enum: ["bounded", "cancelled", "failed", "dropped"] } }, required: ["class"] },
          then: { type: "object", properties: { reason: { type: "string", minLength: 1 } } }
        }
      ]
    },
    provenance: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/provenance" },
    extensions: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/extensions" }
  },
  allOf: [
    {
      if: { type: "object", properties: { status: { const: "claimed" } }, required: ["status"] },
      then: { type: "object", properties: { claim: { type: "object" } } }
    },
    {
      if: { type: "object", properties: { status: { enum: ["open", "paused"] } }, required: ["status"] },
      then: { type: "object", properties: { claim: { type: "null" } } }
    },
    {
      if: { type: "object", properties: { status: { enum: ["open", "claimed", "paused"] } }, required: ["status"] },
      then: { type: "object", properties: { outcome: { type: "null" } } }
    },
    {
      if: { type: "object", properties: { status: { const: "done" } }, required: ["status"] },
      then: {
        type: "object",
        properties: {
          outcome: { type: "object", properties: { class: { enum: ["completed", "legacy-completed"] } }, required: ["class"] }
        }
      }
    },
    {
      if: { type: "object", properties: { status: { const: "dropped" } }, required: ["status"] },
      then: {
        type: "object",
        properties: {
          outcome: { type: "object", properties: { class: { enum: ["bounded", "cancelled", "failed", "dropped"] } }, required: ["class"] }
        }
      }
    },
    {
      if: {
        type: "object",
        properties: { outcome: { type: "object", properties: { class: { const: "legacy-completed" } }, required: ["class"] } },
        required: ["outcome"]
      },
      then: {
        type: "object",
        properties: { provenance: { type: "object", properties: { source: { const: "legacy-terminal" } }, required: ["source"] } }
      }
    },
    {
      if: {
        type: "object",
        properties: { provenance: { type: "object", properties: { source: { const: "legacy-terminal" } }, required: ["source"] } },
        required: ["provenance"]
      },
      then: { type: "object", properties: { status: { enum: ["done", "dropped"] } } }
    },
    {
      if: {
        type: "object",
        properties: { filed_by: { type: "object", properties: { actor: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/legacy_unknown_actor" } }, required: ["actor"] } },
        required: ["filed_by"]
      },
      then: {
        type: "object",
        properties: { provenance: { type: "object", properties: { source: { enum: ["imported", "legacy-terminal"] } }, required: ["source"] } }
      }
    }
  ]
};

// schemas/protocol.schema.json
var protocol_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.protocol/v1",
  title: "fusion.protocol/v1",
  description: "One request to fusion-record (spec section 6): a JSON object discriminated by op, one branch per operation of the spec's table. Every branch is validated here whether or not the codec answers its operation yet: an operation the codec does not yet answer is refused operation-unknown, and inspect reports which operations answer. workbench is the absolute path of the workbench root and may be left out when the caller's environment carries FUSION_WORKBENCH. A record is named by the workbench-relative path of its control file. Every mutation carries an operation_id the caller may replay: the same request again returns the stored answer, the same id with a different request is conflict/operation-id-reused. initialize writes workbench.json, the manifest of a new workbench, into an existing empty directory: workbench is required on its branch, id is the new workbench's UUID, and the codec composes the manifest itself, so a request carrying one is refused. create writes the pair, control file and narrative, when narrative.content carries the Markdown body, and requires the narrative to exist when it does not. A transition on a plan may carry steps and criteria as updates keyed by id. create of kind evidence writes one immutable evidence record beside a report already on disk at its declared hash, the path chosen by the codec and returned in the answer. The reserved actor legacy-unknown (decision 261003-1746) is refused in every request that carries an actor: create's filed_by and the actor of transition, claim, release, set-mode, set-dependencies, adopt-plan and attach-evidence. Rules JSON Schema cannot check: expected_revision must equal the sha256 of the stored bytes at write time (conflict/revision-mismatch otherwise); to must be an edge of codec/contract/transitions.json from the record's current state; the payload must satisfy the target state's rules there. maintenance fences every other fresh mutation while the host moves pairs: action begin sets the fence and action end, under its own operation_id, removes the fence whose begin's operation_id it names in fence. migration is the maintenance run of spec section 8, one branch per phase: survey is a read and carries no operation_id; plan freezes the host's proposal, named by {path, sha256}, into archive/migrations/<migration id>/ as an index and its parts (fusion.migration-plan/v1) in one intent; apply, verify and rollback name that index by {path, sha256}, and each carries the operation id the index's schedule fixes for its phase and chunk (conflict/operation-id-unscheduled otherwise); apply lands one chunk per request, chunk 1 first setting the fence; verify writes the receipt (fusion.migration-receipt/v1) and then the manifest, last; rollback undoes the highest landed chunk, and chunk 0 removes the plan files.",
  type: "object",
  required: ["op"],
  properties: {
    op: {
      type: "string",
      enum: ["inspect", "list", "show", "validate", "initialize", "create", "transition", "claim", "release", "set-mode", "set-dependencies", "adopt-plan", "attach-evidence", "reconcile", "maintenance", "migration"]
    }
  },
  oneOf: [
    {
      type: "object",
      additionalProperties: false,
      required: ["op"],
      properties: {
        op: { const: "inspect" },
        workbench: { $ref: "#/$defs/workbench" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op"],
      properties: {
        op: { const: "list" },
        workbench: { $ref: "#/$defs/workbench" },
        scope: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "record"],
      properties: {
        op: { const: "show" },
        workbench: { $ref: "#/$defs/workbench" },
        record: { $ref: "#/$defs/record_selector" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op"],
      properties: {
        op: { const: "validate" },
        workbench: { $ref: "#/$defs/workbench" },
        record: { $ref: "#/$defs/record_selector" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "workbench", "operation_id", "id"],
      properties: {
        op: { const: "initialize" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid", description: "The new workbench's UUID, written as the manifest's id." }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "id", "kind", "filed_by", "origin", "scope", "narrative", "payload"],
      properties: {
        op: { const: "create" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        kind: { type: "string", enum: ["package", "issue", "plan", "discussion", "decision"] },
        filed_by: { $ref: "#/$defs/live_actor" },
        origin: {
          type: "object",
          additionalProperties: false,
          required: ["kind", "ref"],
          properties: {
            kind: { type: "string", enum: ["user-request", "package", "campaign", "legacy-unknown"] },
            ref: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" }] }
          }
        },
        scope: {
          type: "object",
          description: "Where the pair is filed: the container directory (workbench-relative) or null for shared/, and the store within it (issues, plans, ...; work-packages for a package).",
          additionalProperties: false,
          required: ["container", "store"],
          properties: {
            container: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" }] },
            store: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" }
          }
        },
        narrative: {
          type: "object",
          description: "The Markdown half of the new pair: its path, as the common narrative's, and optionally its body. With content the operation writes both files; without it the narrative must already exist.",
          additionalProperties: false,
          required: ["path"],
          properties: {
            path: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative/properties/path" },
            content: { type: "string", description: "The exact bytes of the narrative, as a UTF-8 string." }
          }
        },
        payload: { type: "object", description: "The kind-specific control fields the new record starts with." }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "id", "kind", "scope", "payload"],
      properties: {
        op: { const: "create" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
        kind: { const: "evidence", description: "Selects this branch (Prior's FJ02 response 19, the sole write route for a new fusion.evidence/v1 record); the record create branch's kind enum lacks evidence, so the two are disjoint. An evidence record has no filer, origin or narrative." },
        scope: {
          type: "object",
          description: "Where the record is filed: the container directory (workbench-relative) or null for shared/, and the reviews store within it.",
          additionalProperties: false,
          required: ["container", "store"],
          properties: {
            container: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" }] },
            store: { const: "reviews" }
          }
        },
        payload: {
          $ref: "urn:fusion:schema:fusion.evidence/v1",
          description: "The complete evidence record; the codec writes exactly these bytes, serialised, and adds nothing."
        }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "to", "reason"],
      properties: {
        op: { const: "transition" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        to: { type: "string", pattern: "^[a-z][a-z0-9_-]*$", description: "The target state, in the vocabulary of the record's kind (codec/contract/transitions.json): package statuses are hyphen-free tokens, record states may carry an underscore (in_progress)." },
        reason: { type: "string", minLength: 1 },
        payload: {
          type: "object",
          description: "What the target state may need to see, in the record's own field shapes. A field outside the target kind's row is refused schema-invalid/payload-field-not-admitted, a present null included; within the row, the target state's rules decide.",
          additionalProperties: false,
          properties: {
            claim: {
              oneOf: [
                { type: "null" },
                {
                  type: "object",
                  additionalProperties: false,
                  required: ["checkout_id", "claimed_at", "person"],
                  properties: {
                    checkout_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/checkout_id" },
                    person: { type: ["string", "null"], minLength: 1 },
                    claimed_at: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/timestamp" }] }
                  }
                }
              ]
            },
            outcome: {
              oneOf: [
                { type: "null" },
                {
                  type: "object",
                  additionalProperties: false,
                  required: ["class", "evidence", "reason"],
                  properties: {
                    class: { type: "string", enum: ["completed", "bounded", "cancelled", "failed", "dropped", "legacy-completed"] },
                    reason: { type: "string" },
                    evidence: { type: "array", uniqueItems: true, items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/evidence_ref" } }
                  }
                }
              ]
            },
            disposition: {
              oneOf: [
                { type: "null" },
                {
                  type: "object",
                  additionalProperties: false,
                  required: ["kind", "reason_ref"],
                  properties: {
                    kind: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" },
                    reason_ref: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }] }
                  }
                }
              ]
            },
            answer_ref: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }] },
            implementation_ref: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/git_commit" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }] },
            superseded_by: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" }] },
            deferral: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.record/v1#/$defs/deferral" }] },
            steps: {
              type: "array",
              description: "Plan progress (Prior's FJ02 response 18): read on a plan record only, and refused on any other kind. Each entry is an update keyed by the id of a step the stored record already has; it never adds, removes or reorders an entry, and an entry left out keeps its value and position. to may equal a live plan's current state when an entry changes a value.",
              items: { $ref: "urn:fusion:schema:fusion.record/v1#/$defs/plan_step" }
            },
            criteria: {
              type: "array",
              description: "Criterion re-evaluation (Prior's FJ02 response 18): read on a plan record only, and refused on any other kind. Each entry is an update keyed by the id of a criterion the stored record already has; it never adds, removes or reorders an entry, and an entry left out keeps its value and position. to may equal a live plan's current state when an entry changes a value.",
              items: { $ref: "urn:fusion:schema:fusion.record/v1#/$defs/plan_criterion" }
            }
          }
        }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "claim"],
      properties: {
        op: { const: "claim" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        claim: {
          type: "object",
          additionalProperties: false,
          required: ["checkout_id", "claimed_at", "person"],
          properties: {
            checkout_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/checkout_id" },
            person: { type: ["string", "null"], minLength: 1 },
            claimed_at: { oneOf: [{ type: "null" }, { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/timestamp" }] }
          }
        }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "reason"],
      properties: {
        op: { const: "release" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        reason: { type: "string", minLength: 1 }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "mode"],
      properties: {
        op: { const: "set-mode" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        mode: {
          type: "object",
          description: "The package's mode field as fusion.package/v1 shapes it; autonomous needs a non-null source with the user's provenance, which the operation checks against the package schema, not this one.",
          additionalProperties: false,
          required: ["source", "value"],
          properties: {
            value: { type: "string", enum: ["ordinary", "autonomous"] },
            source: { type: ["object", "null"] }
          }
        }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "depends_on"],
      properties: {
        op: { const: "set-dependencies" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        depends_on: {
          type: "array",
          uniqueItems: true,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["condition", "target"],
            properties: {
              target: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
              condition: { type: "string", enum: ["terminal", "succeeded"] }
            }
          }
        }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "plan", "revision"],
      properties: {
        op: { const: "adopt-plan" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        plan: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
        revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256", description: "The hash of the plan narrative as accepted." },
        role: { type: "string", enum: ["spec", "plan"], description: "The active_documents role the record is bound in; absent means plan." }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "record", "expected_revision", "actor", "evidence"],
      properties: {
        op: { const: "attach-evidence" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        record: { $ref: "#/$defs/record_selector" },
        expected_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" },
        actor: { $ref: "#/$defs/live_actor" },
        evidence: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/evidence_ref" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op"],
      properties: {
        op: { const: "reconcile" },
        workbench: { $ref: "#/$defs/workbench" },
        scope: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "action"],
      properties: {
        op: { const: "maintenance" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        action: { const: "begin" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "action", "fence"],
      properties: {
        op: { const: "maintenance" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        action: { const: "end" },
        fence: { $ref: "#/$defs/operation_id", description: "The operation_id of the begin whose fence this end removes." }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "phase"],
      properties: {
        op: { const: "migration" },
        workbench: { $ref: "#/$defs/workbench" },
        phase: { const: "survey", description: "A read: no operation_id, no stored answer, and no .json-state/ is created (request 45c)." }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "phase", "proposal"],
      properties: {
        op: { const: "migration" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        phase: { const: "plan" },
        proposal: { $ref: "#/$defs/migration_proposal" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "phase", "plan", "chunk"],
      properties: {
        op: { const: "migration" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id", description: "The operation id the frozen index's schedule fixes for this chunk (conflict/operation-id-unscheduled otherwise); chunk 1's is the fence's id." },
        phase: { const: "apply" },
        plan: { $ref: "#/$defs/migration_plan" },
        chunk: { type: "integer", minimum: 1, description: "The chunk of the frozen plan this request lands, from 1, in order." }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "phase", "plan"],
      properties: {
        op: { const: "migration" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        phase: { const: "verify" },
        plan: { $ref: "#/$defs/migration_plan" }
      }
    },
    {
      type: "object",
      additionalProperties: false,
      required: ["op", "operation_id", "phase", "plan", "chunk"],
      properties: {
        op: { const: "migration" },
        workbench: { $ref: "#/$defs/workbench" },
        operation_id: { $ref: "#/$defs/operation_id" },
        phase: { const: "rollback" },
        plan: { $ref: "#/$defs/migration_plan" },
        chunk: { type: "integer", minimum: 0, description: "The highest chunk still landed, rolled back by one intent; 0 removes the plan files once no chunk is landed. Rollback never removes the fence; only maintenance end does." }
      }
    }
  ],
  $defs: {
    workbench: {
      type: "string",
      description: "Absolute path of the workbench root (the directory holding workbench.json). Optional in the request; main.ts fills it from FUSION_WORKBENCH.",
      minLength: 1,
      pattern: "^/"
    },
    live_actor: {
      description: "An actor as fusion.common/v1 shapes it, minus the reserved legacy-unknown (decision 261003-1746, option 1): create's filed_by and the actor of transition, claim, release, set-mode, set-dependencies, adopt-plan and attach-evidence refuse it, every request that carries an actor, so no live write produces it.",
      allOf: [
        { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/actor" },
        { not: { type: "object", properties: { actor: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/legacy_unknown_actor" } }, required: ["actor"] } }
      ]
    },
    operation_id: {
      $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid",
      description: "Caller-chosen, reusable for an identical replay; stored under .json-state/ops/<operation_id>.json with the answer."
    },
    migration_proposal: {
      type: "object",
      description: "The host's mapping proposal (fusion.migration-proposal/v1), a file under .json-state/migration/ that never travels, bound by the sha256 of its exact bytes (request 45a); the codec reads it and never writes it. A hash differing from the file is conflict/source-changed; its 16 MiB cap and its content are checked by the operation (schema-invalid/proposal-invalid). The request digest covers the hash, so a changed proposal under a used operation id is conflict/operation-id-reused.",
      additionalProperties: false,
      required: ["path", "sha256"],
      properties: {
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "^\\.json-state/migration/[^/]+$" }
          ]
        },
        sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    migration_plan: {
      type: "object",
      description: "The frozen plan's index, archive/migrations/<migration id>/plan.json (fusion.migration-plan/v1), bound by the sha256 of its exact bytes (request 45a); the index binds every other plan file by hash in turn (conflict/plan-file-changed otherwise).",
      additionalProperties: false,
      required: ["path", "sha256"],
      properties: {
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/plan\\.json$" }
          ]
        },
        sha256: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
      }
    },
    record_selector: {
      type: "object",
      additionalProperties: false,
      required: ["path"],
      properties: {
        path: {
          allOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
            { type: "string", pattern: "(^|/)(package|[^/]+\\.record|[^/]+\\.evidence)\\.json$" }
          ],
          description: "The control file of the pair, workbench-relative: work-packages/<d>/package.json or <store>/<name>.record.json. The pattern also admits an evidence record's file, <store>/<name>.evidence.json, a correction's <basename>.<n>.evidence.json included; inspect's kinds say whether the codec reads that kind."
        }
      }
    }
  }
};

// schemas/record.schema.json
var record_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.record/v1",
  title: "fusion.record/v1",
  description: "Control data of an issue, plan, discussion or decision, <name>.record.json beside <name>.md (spec section 4.3). control is a union discriminated by kind; each branch forbids the other kinds' fields. Cross-field rules expressed with if/then: filed_by.actor equal to the reserved legacy-unknown requires provenance.source imported or legacy-terminal (decision 261003-1746); an issue's disposition is null while open or in_progress and an object once closed or deferred; a decision's answer_ref, implementation_ref, superseded_by and deferral are null or present exactly as its state demands (answered cites an answer, implemented an implementation, superseded a successor, deferred a deferral naming its target and who ruled; open carries none; deferred carries neither implementation nor successor, and no other state carries a deferral); in a candidate block an admitted selection carries an admission, an admission needs a qualification, a merge target and the outcome merged imply each other, and a policy-evaluated outcome carries policy version and snapshot hash while merged carries neither. Rules JSON Schema cannot check: the legal state changes per kind live in codec/contract/transitions.json (the package matrix is never applied to records); ids inside steps, criteria, evidence and the set-valued arrays are distinct beyond what uniqueItems catches; a candidate's qualification is current only if its candidate_version equals version, its source_revision equals source.revision and its evidence_hash equals Prior's evidenceHash over the current evidence and reproduction (an admission over a stale qualification is refused, never healed); a deferred decision's target is control.deferral.target, a resolvable reference or a named external target such as a release, and the reason stays in the Markdown Deferred: line (a legacy record whose Deferred: line names no target or no ruler is a migration finding, never a null the schema admits); historical markers and status heads in the narrative are evidence, not state, and a divergent status note in an active narrative is a conflict; a plan's acceptance revision equals the hash of the plan narrative when it was adopted.",
  type: "object",
  additionalProperties: false,
  required: ["control", "extensions", "filed_by", "id", "kind", "narrative", "provenance", "references", "schema", "workbench_id"],
  properties: {
    schema: { const: "fusion.record/v1" },
    id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    workbench_id: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid" },
    kind: { type: "string", enum: ["issue", "plan", "discussion", "decision"] },
    narrative: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/narrative" },
    filed_by: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/actor" },
    references: {
      type: "array",
      uniqueItems: true,
      items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }
    },
    provenance: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/provenance" },
    extensions: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/extensions" },
    control: { type: "object" }
  },
  oneOf: [
    {
      type: "object",
      properties: { kind: { const: "issue" }, control: { $ref: "#/$defs/issue_control" } },
      required: ["control", "kind"]
    },
    {
      type: "object",
      properties: { kind: { const: "plan" }, control: { $ref: "#/$defs/plan_control" } },
      required: ["control", "kind"]
    },
    {
      type: "object",
      properties: { kind: { const: "discussion" }, control: { $ref: "#/$defs/discussion_control" } },
      required: ["control", "kind"]
    },
    {
      type: "object",
      properties: { kind: { const: "decision" }, control: { $ref: "#/$defs/decision_control" } },
      required: ["control", "kind"]
    }
  ],
  allOf: [
    {
      if: {
        type: "object",
        properties: { filed_by: { type: "object", properties: { actor: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/legacy_unknown_actor" } }, required: ["actor"] } },
        required: ["filed_by"]
      },
      then: {
        type: "object",
        properties: { provenance: { type: "object", properties: { source: { enum: ["imported", "legacy-terminal"] } }, required: ["source"] } }
      }
    }
  ],
  $defs: {
    four_states: {
      type: "string",
      description: "The issues-and-planning vocabulary: _o_ open, _p_ in_progress, _c_ closed, _d_ deferred.",
      enum: ["open", "in_progress", "closed", "deferred"]
    },
    two_states: {
      type: "string",
      description: "The discussion vocabulary: _o_ open (read as interrupted), _c_ closed; the only edge is open to closed (Prior's FJ00 response 5b). A legacy record carrying another value is a migration finding, never an imported state.",
      enum: ["open", "closed"]
    },
    positive_integer: { type: "integer", minimum: 1 },
    non_negative_integer: { type: "integer", minimum: 0 },
    string_set: {
      type: "array",
      description: "Set semantics: order carries no meaning, duplicates are refused.",
      uniqueItems: true,
      items: { type: "string", minLength: 1 }
    },
    string_list: {
      type: "array",
      description: "List semantics: order is kept as written.",
      items: { type: "string" }
    },
    issue_control: {
      type: "object",
      additionalProperties: false,
      required: ["disposition", "state"],
      properties: {
        state: { $ref: "#/$defs/four_states" },
        disposition: {
          description: "How the issue left the live states: a kind from the closed set the decision record 260928-1420_*_which-closed-vocabularies-do-artefact-kind-and-issue-disposition-kind-take.md rules (option 3, Prior's FJ00 response 6a) and the record or artefact that holds the reasoning (the Markdown Resolved: note stays prose). The set is additive-only from here: no token is removed or redefined, and an addition is adopted explicitly. control.candidate.selection.outcome is Prior's separate verbatim vocabulary and never this one: pending, selected and admitted are no issue resolutions, out_of_scope keeps its underscore there, and a migration closes an issue as out-of-scope only on separately evidenced resolution, never inferred from the selection alone.",
          oneOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["kind", "reason_ref"],
              properties: {
                kind: {
                  type: "string",
                  enum: ["fixed", "duplicate", "deferred", "rejected", "out-of-scope", "merged", "superseded"]
                },
                reason_ref: {
                  oneOf: [
                    { type: "null" },
                    { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }
                  ]
                }
              }
            }
          ]
        },
        candidate: { $ref: "#/$defs/candidate" }
      },
      allOf: [
        {
          if: { type: "object", properties: { state: { enum: ["open", "in_progress"] } }, required: ["state"] },
          then: { type: "object", properties: { disposition: { type: "null" } } }
        },
        {
          if: { type: "object", properties: { state: { enum: ["closed", "deferred"] } }, required: ["state"] },
          then: { type: "object", properties: { disposition: { type: "object" } } }
        }
      ]
    },
    candidate: {
      type: "object",
      description: "Prior's candidates.Candidate with its Qualification and Disposition, typed exactly (modules/fusion/candidates/register.go at 12d8424). Disposition is split into selection (the policy's verdict) and admission (the work item binding): selection state and issue lifecycle are different axes. Statement and Purpose are prose and live in the narrative; codec/contract/prior-mapping.json names every field's home.",
      additionalProperties: false,
      required: ["admission", "affected_resources", "confidence", "dependencies", "estimated_scope", "evidence", "item_kind", "merge_into", "prior_id", "qualification", "reproduction", "risk", "schema_version", "selection", "severity", "source", "stable_key", "version"],
      properties: {
        prior_id: { type: "string", minLength: 1, description: "Prior's Candidate.ID, the join key other Prior structures use." },
        schema_version: { const: 1 },
        stable_key: { type: "string", minLength: 1 },
        item_kind: { type: "string", minLength: 1, description: "Prior's Candidate.Kind; one of the charter's item kinds." },
        version: { $ref: "#/$defs/positive_integer" },
        source: {
          type: "object",
          additionalProperties: false,
          required: ["id", "refresh_policy", "revision", "watermark"],
          properties: {
            id: { type: "string", minLength: 1 },
            revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" },
            watermark: { type: "string", minLength: 1 },
            refresh_policy: { type: "string", enum: ["snapshot", "checkpoint", "continuous"] }
          }
        },
        evidence: {
          type: "array",
          description: "Prior's Candidate.Evidence as stored: order is kept and duplicates are preserved (Prior sorts, never deduplicates). An empty Ref or Revision imports as null and exports as the empty string; Qualify records such an entry as a failed qualification, never as a pass.",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["ref", "revision"],
            properties: {
              ref: { type: ["string", "null"], minLength: 1 },
              revision: {
                oneOf: [
                  { type: "null" },
                  { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" }
                ]
              }
            }
          }
        },
        reproduction: { $ref: "#/$defs/string_list" },
        severity: { type: "integer", description: "Signed: legacy values may be negative (Prior's FJ00 response 2); confidence and risk stay non-negative, the two bounds Prior validates at intake." },
        confidence: { $ref: "#/$defs/non_negative_integer" },
        estimated_scope: { type: "integer", description: "Signed, as severity." },
        risk: { $ref: "#/$defs/non_negative_integer" },
        affected_resources: { $ref: "#/$defs/string_set" },
        dependencies: { $ref: "#/$defs/string_set" },
        qualification: {
          description: "null when never qualified; not a negative result.",
          oneOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["candidate_version", "checked_at", "evidence_hash", "passed", "reasons", "source_revision"],
              properties: {
                candidate_version: { $ref: "#/$defs/positive_integer" },
                source_revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_opaque_revision" },
                evidence_hash: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_revision" },
                passed: { type: "boolean" },
                reasons: { $ref: "#/$defs/string_list" },
                checked_at: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/timestamp" }
              }
            }
          ]
        },
        selection: {
          description: "Prior's Disposition without its work-item half. null when never evaluated.",
          oneOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["candidate_version", "outcome", "policy_version", "reasons", "score", "snapshot_hash"],
              properties: {
                candidate_version: { $ref: "#/$defs/positive_integer" },
                policy_version: { type: ["string", "null"], minLength: 1 },
                snapshot_hash: {
                  oneOf: [
                    { type: "null" },
                    { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/prior_revision" }
                  ]
                },
                outcome: {
                  type: "string",
                  description: "The values Prior's register code writes or tests for at 12d8424.",
                  enum: ["pending", "selected", "admitted", "deferred", "rejected", "out_of_scope", "merged"]
                },
                score: { type: "integer", description: "Signed: evaluate can persist a negative deferred or selected score (Prior's FJ00 response 2); no clamping." },
                reasons: { $ref: "#/$defs/string_list" }
              },
              allOf: [
                {
                  if: { type: "object", properties: { outcome: { enum: ["selected", "admitted", "deferred", "rejected", "out_of_scope"] } }, required: ["outcome"] },
                  then: { type: "object", properties: { policy_version: { type: "string" }, snapshot_hash: { type: "string" } } }
                },
                {
                  if: { type: "object", properties: { outcome: { const: "merged" } }, required: ["outcome"] },
                  then: { type: "object", properties: { policy_version: { type: "null" }, snapshot_hash: { type: "null" } } }
                }
              ]
            }
          ]
        },
        admission: {
          description: "The work-item half of Prior's Disposition. null until admitted.",
          oneOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["current_attempt", "work_item_id"],
              properties: {
                work_item_id: { type: "string", minLength: 1 },
                current_attempt: { $ref: "#/$defs/positive_integer" }
              }
            }
          ]
        },
        merge_into: { type: ["string", "null"], minLength: 1 }
      },
      allOf: [
        {
          if: {
            type: "object",
            properties: { selection: { type: "object", properties: { outcome: { const: "admitted" } }, required: ["outcome"] } },
            required: ["selection"]
          },
          then: { type: "object", properties: { admission: { type: "object" } } }
        },
        {
          if: { type: "object", properties: { admission: { type: "object" } }, required: ["admission"] },
          then: { type: "object", properties: { qualification: { type: "object" } } }
        },
        {
          if: { type: "object", properties: { merge_into: { type: "string" } }, required: ["merge_into"] },
          then: {
            type: "object",
            properties: { selection: { type: "object", properties: { outcome: { const: "merged" } }, required: ["outcome"] } }
          }
        },
        {
          if: {
            type: "object",
            properties: { selection: { type: "object", properties: { outcome: { const: "merged" } }, required: ["outcome"] } },
            required: ["selection"]
          },
          then: { type: "object", properties: { merge_into: { type: "string" } } }
        }
      ]
    },
    plan_control: {
      type: "object",
      additionalProperties: false,
      required: ["acceptance", "criteria", "state", "steps"],
      properties: {
        state: { $ref: "#/$defs/four_states" },
        steps: {
          type: "array",
          description: "Stable step anchors replacing the [OPEN] [IN PROGRESS] [DONE] marks; the step texts stay in the narrative.",
          uniqueItems: true,
          items: { $ref: "#/$defs/plan_step" }
        },
        criteria: {
          type: "array",
          description: "Acceptance criteria anchors; met is null until somebody evaluated the criterion.",
          uniqueItems: true,
          items: { $ref: "#/$defs/plan_criterion" }
        },
        acceptance: {
          description: "The package that adopted this plan and the exact plan revision it adopted; null while unadopted.",
          oneOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["ref", "revision"],
              properties: {
                ref: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" },
                revision: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/sha256" }
              }
            }
          ]
        }
      }
    },
    plan_step: {
      type: "object",
      description: "One step anchor of a plan. One definition, referenced by plan_control.steps and by the transition payload of fusion.protocol/v1.",
      additionalProperties: false,
      required: ["id", "state"],
      properties: {
        id: { type: "string", minLength: 1 },
        state: { type: "string", enum: ["open", "in_progress", "done"] }
      }
    },
    plan_criterion: {
      type: "object",
      description: "One acceptance criterion anchor of a plan. One definition, referenced by plan_control.criteria and by the transition payload of fusion.protocol/v1.",
      additionalProperties: false,
      required: ["id", "met"],
      properties: {
        id: { type: "string", minLength: 1 },
        met: { type: ["boolean", "null"] }
      }
    },
    discussion_control: {
      type: "object",
      additionalProperties: false,
      required: ["outcome_refs", "participants", "state"],
      properties: {
        state: { $ref: "#/$defs/two_states" },
        participants: {
          type: "array",
          uniqueItems: true,
          items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/actor" }
        },
        outcome_refs: {
          type: "array",
          uniqueItems: true,
          items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }
        }
      }
    },
    decision_control: {
      type: "object",
      additionalProperties: false,
      required: ["answer_ref", "deferral", "implementation_ref", "state", "superseded_by"],
      properties: {
        state: {
          type: "string",
          description: "The decisions vocabulary: _o_ open, _a_ answered, _i_ implemented, _s_ superseded, _d_ deferred (terminal, with an explicit target and who ruled: Prior's FJ00 response 5c).",
          enum: ["open", "answered", "implemented", "superseded", "deferred"]
        },
        answer_ref: {
          oneOf: [
            { type: "null" },
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }
          ]
        },
        implementation_ref: {
          description: "The Implemented: citation: a commit or a record.",
          oneOf: [
            { type: "null" },
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/git_commit" },
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" }
          ]
        },
        superseded_by: {
          oneOf: [
            { type: "null" },
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/record_ref" }
          ]
        },
        deferral: {
          description: "The Deferred: line's target and ruler, in the shape the conventions spell (Deferred: <target> \u2014 <reason>; ruled by <actor>, <person>); the reason stays Markdown. null in every state but deferred.",
          oneOf: [
            { type: "null" },
            { $ref: "#/$defs/deferral" }
          ]
        }
      },
      allOf: [
        {
          if: { type: "object", properties: { state: { const: "open" } }, required: ["state"] },
          then: { type: "object", properties: { answer_ref: { type: "null" }, implementation_ref: { type: "null" }, superseded_by: { type: "null" }, deferral: { type: "null" } } }
        },
        {
          if: { type: "object", properties: { state: { const: "answered" } }, required: ["state"] },
          then: { type: "object", properties: { answer_ref: { not: { type: "null" } }, implementation_ref: { type: "null" }, superseded_by: { type: "null" }, deferral: { type: "null" } } }
        },
        {
          if: { type: "object", properties: { state: { const: "implemented" } }, required: ["state"] },
          then: { type: "object", properties: { implementation_ref: { not: { type: "null" } }, superseded_by: { type: "null" }, deferral: { type: "null" } } }
        },
        {
          if: { type: "object", properties: { state: { const: "superseded" } }, required: ["state"] },
          then: { type: "object", properties: { superseded_by: { type: "object" }, deferral: { type: "null" } } }
        },
        {
          if: { type: "object", properties: { state: { const: "deferred" } }, required: ["state"] },
          then: { type: "object", properties: { implementation_ref: { type: "null" }, superseded_by: { type: "null" }, deferral: { type: "object" } } }
        }
      ]
    },
    deferral: {
      type: "object",
      description: "A deferred decision's target and who ruled (spec section 4.3, Prior's FJ01b response item 13). One definition, referenced by decision_control.deferral and by the transition payload of fusion.protocol/v1.",
      additionalProperties: false,
      required: ["ruled_by", "target"],
      properties: {
        target: {
          description: "A resolvable record, artefact, foreign or legacy citation, or a named external release or undertaking such as v1.x; a phrase never becomes a manufactured record id.",
          oneOf: [
            { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/reference" },
            {
              type: "object",
              additionalProperties: false,
              required: ["kind", "name"],
              properties: {
                kind: { const: "external" },
                name: { type: "string", minLength: 1 }
              }
            }
          ]
        },
        ruled_by: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/actor" }
      }
    }
  }
};

// schemas/workbench.schema.json
var workbench_schema_default = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:fusion:schema:fusion.workbench/v1",
  title: "fusion.workbench/v1",
  description: "The workbench manifest, fusion-workbench/workbench.json (spec section 4.1). Its presence switches JSON writers from legacy mode (read, validate, preview) to normal mutation; its activation is the last migration step. Rules JSON Schema cannot check: an unknown value in required_features locks supported mutation and dispatch with a precise diagnosis (unsupported-format); migration.receipt must resolve to the receipt written under archive/migrations/<migration.id>/ before activation; .fusion-setup and fusion.json neither replace nor override this manifest.",
  type: "object",
  additionalProperties: false,
  required: ["extensions", "id", "migration", "required_features", "schema"],
  properties: {
    schema: { const: "fusion.workbench/v1" },
    id: {
      $ref: "urn:fusion:schema:fusion.common/v1#/$defs/uuid",
      description: "The workbench_id every record in this workbench carries. A fresh clone keeps it; a deliberate fork imports with an identity mapping."
    },
    required_features: {
      type: "array",
      description: "Features a writer must support to mutate this workbench. json-control-v1 is the feature this contract introduces.",
      uniqueItems: true,
      minItems: 1,
      items: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/token" },
      contains: { const: "json-control-v1" }
    },
    migration: {
      description: "null for a workbench created under JSON control; otherwise the completed import that produced it.",
      oneOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["id", "receipt", "source_layout"],
          properties: {
            id: { type: "string", minLength: 1, pattern: "^migration-[0-9]{8}-[a-z0-9-]+$" },
            source_layout: { type: "string", enum: ["fusion-v12", "fusion-pre-v12"] },
            receipt: {
              allOf: [
                { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/workbench_path" },
                { type: "string", pattern: "^archive/migrations/migration-[0-9]{8}-[a-z0-9-]+/receipt\\.json$" }
              ]
            }
          }
        }
      ]
    },
    extensions: { $ref: "urn:fusion:schema:fusion.common/v1#/$defs/extensions" }
  }
};

// src/cli/schemas.ts
function installInlined() {
  const set = compileSchemas([
    { source: "schemas/campaign.schema.json", value: campaign_schema_default },
    { source: "schemas/common.schema.json", value: common_schema_default },
    { source: "schemas/evidence.schema.json", value: evidence_schema_default },
    { source: "schemas/migration-plan.schema.json", value: migration_plan_schema_default },
    { source: "schemas/migration-proposal.schema.json", value: migration_proposal_schema_default },
    { source: "schemas/migration-receipt.schema.json", value: migration_receipt_schema_default },
    { source: "schemas/package.schema.json", value: package_schema_default },
    { source: "schemas/protocol.schema.json", value: protocol_schema_default },
    { source: "schemas/record.schema.json", value: record_schema_default },
    { source: "schemas/workbench.schema.json", value: workbench_schema_default }
  ]);
  useSchemas(set);
  useTables(transitions_default, dependencies_default);
  return set;
}

// src/cli/main.ts
var USAGE = "usage: fusion-record [--file <request.json>]   (reads one JSON request from stdin otherwise; FUSION_WORKBENCH is the default workbench)";
function parseArgs(argv) {
  const args = { file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") {
      const p = argv[i + 1];
      if (p === void 0 || p.startsWith("--")) return { usage: "--file needs a path" };
      args.file = p;
      i++;
    } else {
      return { usage: `unknown argument ${JSON.stringify(a)}` };
    }
  }
  return args;
}
function readStdin() {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    process.stdin.on("data", (c) => chunks.push(c));
    process.stdin.on("end", () => resolvePromise(Buffer.concat(chunks)));
    process.stdin.on("error", reject);
  });
}
function writeStdout(text) {
  return new Promise((resolvePromise) => {
    process.stdout.write(text, () => resolvePromise());
  });
}
async function main(argv, env = process.env) {
  const args = parseArgs(argv);
  if ("usage" in args) {
    process.stderr.write(`fusion-record: ${args.usage}
${USAGE}
`);
    return 2;
  }
  try {
    installInlined();
  } catch (e) {
    process.stderr.write(`fusion-record: the schemas do not load: ${e instanceof Error ? e.message : String(e)}
`);
    return 3;
  }
  let bytes;
  if (args.file !== null) {
    try {
      bytes = readFileSync8(args.file);
    } catch (e) {
      process.stderr.write(`fusion-record: cannot read ${args.file}: ${e instanceof Error ? e.message : String(e)}
${USAGE}
`);
      return 2;
    }
  } else {
    bytes = await readStdin();
  }
  let response;
  const parsed = strictParse(bytes);
  if (!parsed.ok) response = fail("schema-invalid", parsed.reason, `request: ${parsed.detail}`);
  else response = await dispatch(parsed.value, { defaultWorkbench: env.FUSION_WORKBENCH });
  await writeStdout(JSON.stringify(response) + "\n");
  return 0;
}
var invokedDirectly = () => {
  const entry = process.argv[1];
  if (entry === void 0) return false;
  try {
    return fileURLToPath3(import.meta.url) === entry || import.meta.url.endsWith("/dist/fusion-record.js");
  } catch {
    return false;
  }
};
if (invokedDirectly()) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e) => {
      process.stderr.write(`fusion-record: ${e instanceof Error ? e.stack ?? e.message : String(e)}
`);
      process.exitCode = 1;
    }
  );
}
export {
  main
};
