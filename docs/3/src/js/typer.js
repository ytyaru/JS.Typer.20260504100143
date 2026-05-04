const getObjectType = (v)=>{
    if (null===Object.getPrototypeOf(v)) return Object; // Object.create(null)
        if (!('constructor' in v)) {throw new TypeError(`想定外の型です。constructorを持っていません。`)}
        if (!('name' in v.constructor)) {throw new TypeError(`想定外の型です。constructorはnameを持っていません。`)}
   return Object === v.constructor ? Object : v.constructor;
};
class TypeValue {// 型指示値(型を示す値(NaN,null,undefined,コンストラクタ関数))
    static #primTypes = [Boolean,Number,BigInt,String,Symbol];
    static #primitives = Object.freeze(this.#primTypes.reduce((o,t)=>o[t.name.toLowerCase()]=t, {}));
    static get #prims() {return this.#primitives}
    static #getPrimType(v) {
        for (let [name, type] of Object.entries(this.#prims)) {
            if (name===typeof v) {return type}
        }
        return null;
    }
    static #isConstantType(v) {
        if ([null, undefined].map(x=>x===v)) return true;
        if (Number.isNaN(v)) return true;
        return false;
    }
    static valid(v) {
        if (Number.isNaN(v)) return true;
        if ([null, undefined].some(x=>x===v)) return true;
        if ('function'===typeof v) return true;
        throw new TypeError(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
    }
    static get(v) {
        this.valid(v);
        if (this.#isConstantType(v)) return v;
        const p = this.#getPrimType(v);
        if (p) return p;
        if (Array.isArray(v)) return Array;
        if ('function'===typeof v) return Function;
        return getObjectType(v);
    }
    static getName(v) {
        this.valid(v);
        if (null===v) return 'Null';
        if (undefined===v) return 'Undefined';
        if (Number.isNaN(v)) return 'NaN';
        return v.name;
    }
}
class ValueType {// 型名
    static #getTag(v) {return Object.prototype.toString.call(v).slice(8, -1);}
    static getName(v) {
        if (Number.isNaN(v)) return 'NaN';
        const tag = this.#getTag(v);
        if ('Object'===tag) return getObjectType(v).name;
        return tag;
    }
}
export class Typer {
    static get type() {return TypeValue}
    static get value() {return ValueType}
    static is(type, value, name) {
        this.type.valid(type);
        const typName = this.type.getName(type); // expected
        const valName = this.value.getName(value); // actual
        if (typName !== valName) {
            throw new TypeError(`${('string'===typeof name) ? `"${name}" の` : ''}型が不正です。期待: ${typName}, 実際: ${valName}。`);
        }
        return true;
    }
}
