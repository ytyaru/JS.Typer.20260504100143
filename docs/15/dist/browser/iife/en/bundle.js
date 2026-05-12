(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  function __accessProp(key) {
    return this[key];
  }
  var __toCommonJS = (from) => {
    var entry = (__moduleCache ??= new WeakMap).get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function") {
      for (var key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(entry, key))
          __defProp(entry, key, {
            get: __accessProp.bind(from, key),
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
    }
    __moduleCache.set(from, entry);
    return entry;
  };
  var __moduleCache;
  var __returnValue = (v) => v;
  function __exportSetter(name, newValue) {
    this[name] = __returnValue.bind(null, newValue);
  }
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: __exportSetter.bind(all, name)
      });
  };

  // ../src/js/main.js
  var exports_main = {};
  __export(exports_main, {
    Typer: () => Typer
  });

  // ../src/js/part/error.js
  class TyperError extends Error {
    static is(value) {
      return value instanceof this && value.constructor === this;
    }
    static of(value) {
      return value instanceof this;
    }
    static isExpected(error) {
      return error instanceof TyperExpectedError;
    }
    static isUnexpected(error) {
      return error instanceof TyperUnexpectedError;
    }
    static throw(message, option) {
      throw new this(message, option);
    }
    constructor(message, option) {
      super(message, option);
      this.name = "TyperError";
    }
    is(type) {
      return this instanceof type && this.constructor === type;
    }
    of(type) {
      return this instanceof type;
    }
    get isExpected() {
      return this instanceof TyperExpectedError;
    }
    get isUnexpected() {
      return this instanceof TyperUnexpectedError;
    }
  }

  class TyperExpectedError extends TyperError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperExpectedError";
    }
  }

  class TyperUnexpectedError extends TyperError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperUnexpectedError";
    }
  }

  class TyperUseError extends TyperExpectedError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperUseError";
    }
  }

  class TyperArgumentError extends TyperUseError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperArgumentError";
    }
  }

  class TyperTypeSpecError extends TyperArgumentError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperTypeSpecError";
    }
  }

  class TyperResultError extends TyperUseError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperResultError";
    }
  }

  class TyperNotIsError extends TyperResultError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperNotIsError";
    }
  }

  class TyperNotOfError extends TyperResultError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperNotOfError";
    }
  }

  class TyperECMAScriptError extends TyperExpectedError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperECMAScriptError";
    }
  }

  class TyperBoxedPrimitiveValueError extends TyperECMAScriptError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperBoxedPrimitiveValueError";
    }
  }

  class TyperInvalidObjectError extends TyperECMAScriptError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperInvalidObjectError";
    }
  }

  class TyperUnidentifiableError extends TyperECMAScriptError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperUnidentifiableError";
    }
  }

  class TyperDevelopError extends TyperExpectedError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperDevelopError";
    }
  }

  class TyperImplementationError extends TyperDevelopError {
    constructor(message, option) {
      super(message, option);
      this.name = "TyperImplementationError";
    }
  }
  TyperError.use = TyperUseError;
  TyperError.use.arg = TyperArgumentError;
  TyperError.use.arg.spec = TyperTypeSpecError;
  TyperError.use.res = TyperResultError;
  TyperError.use.res.notIs = TyperNotIsError;
  TyperError.use.res.notOf = TyperNotOfError;
  TyperError.ecma = TyperECMAScriptError;
  TyperError.ecma.boxedPrim = TyperBoxedPrimitiveValueError;
  TyperError.ecma.invalidObj = TyperInvalidObjectError;
  TyperError.ecma.unidentifiable = TyperUnidentifiableError;
  TyperError.dev = TyperDevelopError;
  TyperError.dev.impl = TyperImplementationError;

  // ../src/js/util/i18n/en.js
  var i18n = {
    typeSpecifier: () => "The TypeSpecifier is invalid. It must be NaN, null, undefined, or a constructor function.",
    mismatch: (expected, actual, label) => `The type${label ? " of " + '"' + label + '"' : ""} is invalid. Expected: ${expected}, Actual: ${actual}.`,
    boxedPrimitive: (value, tag) => `Instances created by 'new' with primitive types are prohibited. This is because strict equality ('===') comparisons will fail. Although 'valueOf()' returns a primitive value, the actual entity is an object (reference type), creating an inconsistency between type and behavior. To eliminate such inconsistencies, Typer prohibits these instances. Value: ${value}, tag: '${tag}'.`,
    invalidObject: (isNameMissing) => `The object (reference type) is invalid. It is expected to be an instance, but the 'constructor${isNameMissing ? ".name" : ""}' information is missing, making it impossible to identify the type.`,
    unidentifiable: (value, type, tag) => `The type of the value cannot be identified. This is because the results of 'typeof' or 'instanceof' do not match the actual type (internal slot). This contradiction is part of the ECMAScript specification (e.g., document.all, Proxy). In such cases, Typer cannot identify the type. Value: ${value}, typeof: '${type}', tag: '${tag}'.`,
    implementation: () => "There is a contradiction in the Typer implementation. 'TyperUnexpectedError' is being thrown as an expected error. 'TyperUnexpectedError' should only be thrown in unexpected situations. Please fix the code.",
    unexpected: (message) => `An unexpected error has been thrown. This may be a bug in the Typer implementation. When reporting this issue, please include the following details. Message: '${message}'.`
  };

  // ../src/js/part/core.js
  var NONE = Symbol.for("typer.specifier.none");
  var getTag = (value) => Object.prototype.toString.call(value).slice(8, -1);

  class ConstantSpecifier {
    static is(value) {
      return Number.isNaN(value) || value === null || value === undefined;
    }
    static get(value) {
      return this.is(value) ? value : NONE;
    }
  }

  class PrimitiveSpecifier {
    static #types = {
      boolean: Boolean,
      number: Number,
      bigint: BigInt,
      string: String,
      symbol: Symbol
    };
    static get(value) {
      return this.#types[typeof value] || NONE;
    }
  }

  class ContainerSpecifier {
    static get(value) {
      if (Array.isArray(value))
        return Array;
      if (value !== null && typeof value === "object") {
        if (value.constructor === Object || Object.getPrototypeOf(value) === null) {
          return Object;
        }
      }
      return NONE;
    }
  }

  class FunctionSpecifier {
    static get(value) {
      return typeof value === "function" ? Function : NONE;
    }
  }

  class BoxedPrimitiveSpecifier {
    static #types = [Boolean, Number, String];
    static get(value) {
      if (value === null || typeof value !== "object")
        return NONE;
      return this.#types.includes(value.constructor) ? value.constructor : NONE;
    }
  }

  class InstanceSpecifier {
    static get(value) {
      if (value === null || typeof value !== "object")
        return NONE;
      const constructor = value.constructor;
      if (!constructor || !constructor.name) {
        throw new TyperInvalidObjectError(i18n.invalidObject(!!constructor));
      }
      return constructor;
    }
  }

  class TypeSpecifier {
    static valid(typeSpecifier) {
      if (typeof typeSpecifier === "function" || ConstantSpecifier.is(typeSpecifier))
        return true;
      throw new TyperTypeSpecError(i18n.typeSpecifier());
    }
    static getName(typeSpecifier) {
      if (Number.isNaN(typeSpecifier))
        return "NaN";
      if (typeSpecifier === null)
        return "Null";
      if (typeSpecifier === undefined)
        return "Undefined";
      return typeSpecifier.name || "Function";
    }
  }

  class ActualValue {
    static valid(value) {
      const boxed = BoxedPrimitiveSpecifier.get(value);
      if (boxed !== NONE) {
        throw new TyperBoxedPrimitiveValueError(i18n.boxedPrimitive(value, getTag(value)));
      }
      return true;
    }
    static getSpecifier(value) {
      const extractors = [
        ConstantSpecifier,
        PrimitiveSpecifier,
        ContainerSpecifier,
        FunctionSpecifier,
        InstanceSpecifier
      ];
      for (const extractor of extractors) {
        const spec = extractor.get(value);
        if (spec !== NONE)
          return spec;
      }
      throw new TyperUnidentifiableError(i18n.unidentifiable(value, typeof value, getTag(value)));
    }
    static getName(value) {
      return TypeSpecifier.getName(this.getSpecifier(value));
    }
  }

  // ../src/js/part/engine.js
  class TyperEngine {
    static isLogic(typeSpecifier, actualValue) {
      TypeSpecifier.valid(typeSpecifier);
      ActualValue.valid(actualValue);
      const specifier = ActualValue.getSpecifier(actualValue);
      return Object.is(typeSpecifier, specifier);
    }
    static ofLogic(typeSpecifier, actualValue) {
      if (this.isLogic(typeSpecifier, actualValue)) {
        return true;
      }
      return typeof typeSpecifier === "function" && actualValue instanceof typeSpecifier;
    }
  }

  // ../src/js/part/resolver.js
  class TyperResolver {
    static is(typeSpecifier, actualValue, label, throwable) {
      return this.#resolve(TyperEngine.isLogic, typeSpecifier, actualValue, label, throwable, TyperNotIsError);
    }
    static of(typeSpecifier, actualValue, label, throwable) {
      return this.#resolve(TyperEngine.ofLogic, typeSpecifier, actualValue, label, throwable, TyperNotOfError);
    }
    static #resolve(logic, typeSpecifier, actualValue, label, throwable, MismatchError) {
      try {
        const success = logic.call(TyperEngine, typeSpecifier, actualValue);
        if (success) {
          return true;
        }
        if (throwable) {
          throw this.#createMismatchError(MismatchError, typeSpecifier, actualValue, label);
        }
        return false;
      } catch (error) {
        if (TyperError.isExpected(error)) {
          throw error;
        }
        if (TyperError.isUnexpected(error)) {
          throw new TyperImplementationError(i18n.implementation(), { cause: error });
        }
        throw new TyperUnexpectedError(i18n.unexpected(error.message), { cause: error });
      }
    }
    static #createMismatchError(MismatchError, typeSpecifier, actualValue, label) {
      const expectedName = TypeSpecifier.getName(typeSpecifier);
      const actualName = ActualValue.getName(actualValue);
      return new MismatchError(i18n.mismatch(expectedName, actualName, label));
    }
  }

  // ../src/js/main.js
  class Typer {
    static get specifier() {
      return TypeSpecifier;
    }
    static get value() {
      return ActualValue;
    }
    static get error() {
      return TyperError;
    }
    static #instances = {
      thrower: null,
      booler: null
    };
    static get thrower() {
      if (!this.#instances.thrower) {
        this.#instances.thrower = new Typer(true);
      }
      return this.#instances.thrower;
    }
    static get booler() {
      if (!this.#instances.booler) {
        this.#instances.booler = new Typer(false);
      }
      return this.#instances.booler;
    }
    static is(typeSpecifier, actualValue, label = null, throwable = true) {
      return TyperResolver.is(typeSpecifier, actualValue, label, throwable);
    }
    static of(typeSpecifier, actualValue, label = null, throwable = true) {
      return TyperResolver.of(typeSpecifier, actualValue, label, throwable);
    }
    constructor(throwable = false) {
      this._ = { throwable };
    }
    is(typeSpecifier, actualValue, label = null) {
      return Typer.is(typeSpecifier, actualValue, label, this._.throwable);
    }
    of(typeSpecifier, actualValue, label = null) {
      return Typer.of(typeSpecifier, actualValue, label, this._.throwable);
    }
  }
})();
