const getObjectType = (v)=>{
    if (null===Object.getPrototypeOf(v)) return Object; // Object.create(null)
        if (!('constructor' in v)) {throw new TypeError(`Unexpected type. It does not have a constructor.`)}
        if (!('name' in v.constructor)) {throw new TypeError(`Unexpected type. The constructor does not have a "name" property.`)}
   return Object === v.constructor ? Object : v.constructor;
};
class TypeValue {
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
        throw new TypeError(`The type indicator TypeValue should be NaN, null, undefined, or a constructor function.`);
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
class ValueType {
    static #getTag(v) {return Object.prototype.toString.call(v).slice(8, -1);}
    static getName(v) {
        if (Number.isNaN(v)) return 'NaN';
        const tag = this.#getTag(v);
        if ('Object'===tag) return getObjectType(v).name;
        return tag;
    }
}
export class Typer {
    static get #insNames() {return 'thrower booler'.split(' ')}
    static #getInsNames(throwable=false) {return throwable ? 'thrower' : 'booler'}
    static #instances = this.#insNames.reduce((o,n)=>{o[n]=null;return o}, {});
    static #getIns(throwable=false) {
        const name = this.#getInsNames(throwable);
        if (!this.#instances[name]) {this.#instances[name] = new Typer(throwable);}
        return this.#instances[name];
    }
    static get thrower() {return this.#getIns(true)}
    static get booler() {return this.#getIns(false)}
    static get type() {return TypeValue}
    static get value() {return ValueType}
    static is(type, value, name, throwable=true) {return this.#check(type, value, name, throwable, false)}
    static of(type, value, name, throwable=true) {return this.#check(type, value, name, throwable, true)}
    static #check(type, value, name, throwable=true, isOf=false) {
        this.type.valid(type);
        if (this.type.get(value) === type) return true;
        if (isOf && value instanceof type) return true;
        return this.#error(type, value, name, throwable);
    }
    static #error(type, value, name, throwable) {return throwable ? this.#throwError(type, value, name) : false}
    static #throwError(type, value, name) {
        const typName = this.type.getName(type);
        const valName = this.value.getName(value);
        throw new TypeError(`The type${('string'===typeof name) ? ` of "${name}"` : ''} is invalid. Expected: ${typName}, Actual: ${valName}.`);
    }
    constructor(throwable=false) {this._={throwable}}
    is(type, value, name) {return Typer.is(type, value, name, this._.throwable)}
    of(type, value, name) {return Typer.of(type, value, name, this._.throwable)}
}

