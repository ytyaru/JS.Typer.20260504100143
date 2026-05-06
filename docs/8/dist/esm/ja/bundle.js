// ../src/js/typer.ja.js
var getObjectType = (v) => {
  if (Object.getPrototypeOf(v) === null)
    return Object;
  if (!("constructor" in v)) {
    throw new TypeError(`想定外の型です。constructorを持っていません。`);
  }
  if (!("name" in v.constructor)) {
    throw new TypeError(`想定外の型です。constructorはnameを持っていません。`);
  }
  return Object === v.constructor ? Object : v.constructor;
};

class TypeValue {
  static #primTypes = [Boolean, Number, BigInt, String, Symbol];
  static #primitives = Object.freeze(this.#primTypes.reduce((o, t) => o[t.name.toLowerCase()] = t, {}));
  static get #prims() {
    return this.#primitives;
  }
  static #getPrimType(v) {
    for (let [name, type] of Object.entries(this.#prims)) {
      if (name === typeof v) {
        return type;
      }
    }
    return null;
  }
  static #isConstantType(v) {
    if ([null, undefined].map((x) => x === v))
      return true;
    if (Number.isNaN(v))
      return true;
    return false;
  }
  static valid(v) {
    if (Number.isNaN(v))
      return true;
    if ([null, undefined].some((x) => x === v))
      return true;
    if (typeof v === "function")
      return true;
    throw new TypeError(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
  }
  static get(v) {
    this.valid(v);
    if (this.#isConstantType(v))
      return v;
    const p = this.#getPrimType(v);
    if (p)
      return p;
    if (Array.isArray(v))
      return Array;
    if (typeof v === "function")
      return Function;
    return getObjectType(v);
  }
  static getName(v) {
    this.valid(v);
    if (v === null)
      return "Null";
    if (v === undefined)
      return "Undefined";
    if (Number.isNaN(v))
      return "NaN";
    return v.name;
  }
}

class ValueType {
  static #getTag(v) {
    return Object.prototype.toString.call(v).slice(8, -1);
  }
  static getName(v) {
    if (Number.isNaN(v))
      return "NaN";
    const tag = this.#getTag(v);
    if (tag === "Object")
      return getObjectType(v).name;
    return tag;
  }
}

class Typer {
  static get type() {
    return TypeValue;
  }
  static get value() {
    return ValueType;
  }
  static is(type, value, name) {
    this.type.valid(type);
    const typName = this.type.getName(type);
    const valName = this.value.getName(value);
    if (typName !== valName) {
      throw new TypeError(`${typeof name === "string" ? `"${name}" の` : ""}型が不正です。期待: ${typName}, 実際: ${valName}。`);
    }
    return true;
  }
}
export {
  Typer
};
