const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
const getTypeName = (v) => {
    if (Number.isNaN(v)) return 'NaN';
    const tag = getTag(v);
    if ('Object'===tag) {
        if (Object.getPrototypeOf(v) === null) return 'Object'; // Object.create(null)
        if (!('constructor' in v)) {throw new TypeError(`想定外の型です。constructorを持っていません。`)}
        if (!('name' in v.constructor)) {throw new TypeError(`想定外の型です。constructorはnameを持っていません。`)}
        return 'Object'===v.constructor.name ? tag : v.constructor.name;
    }
    return tag;
};
class ConstantType {
    static #val = [NaN, null, undefined];
    static is(v) {
        if (Number.isNaN(v)) return true;
        if ([null, undefined].some(x=>x===v)) return true;
        return false;
    }
    static of(v) {return this.is(v)}
    static get(v) {
        if (Number.isNaN(v)) return v;
        if ([null, undefined].some(x=>x===v)) return v;
        return false; // ここが困る。nullにするとv=nullの時と被るし。区別不能。
    }
}
const primTypes = [Boolean,Number,BigInt,String,Symbol];
class PrimitiveType {
    static #ary = primTypes;
    static #obj = Object.freeze(this.#ary.reduce((o,t)=>{o[t.name.toLowerCase()]=t;return o;}, {}));
    static get #types() {return this.#obj}
    static is(v) {return !!this.get(v)}
    static of(v) {
        if (this.is(v)) return true;
        const type = this.get(v);
        return type ? v instanceof type : false;
    }
    static get(v) {
        for (let [name, type] of Object.entries(this.#obj)) {
            if (name===typeof v) {return type}
        }
        return null;
    }
}
class PrimitiveObjectType {// new Number(0)等。使うべきでない。プリミティブ値のみ使うべき。new BigInt()は不可。
    static is(v) {return !!this.get(v)}
    static of(v) {return !!this.get(v,true);}
    static get(v, isOf=false) {
        if (null===v || 'object'!==typeof v) return null;
        if (null===Object.getPrototypeOf(v)) return null;
        const p = primTypes.find(p=>p===v?.constructor);
        if (p) return p;
        return isOf ? primTypes.find(p=>p===v?.constructor) : false;
    }
}
class ObjectLikeType {// Object,Instance,Descriptor（非Constant,非Primitive,非Container,非Function）
    static is(v) {return !!this.get(v)}
    static get(v, limit=null) {
        if (null===v || 'object'!==typeof v) return null;
//        if (!ContainerType.is(v)) return null;
        if (null===Object.getPrototypeOf(v)) return Object; // Object.create(null) 将来は Dict 型にする？
        if (!('constructor' in v)) {throw new TypeError(`想定外の型です。constructorを持っていません。`)}
        if (!('name' in v.constructor)) {throw new TypeError(`想定外の型です。constructorはnameを持っていません。`)}
        return ObjectLikeType.#limitType(v, limit);
    }
    static #limits = ['obj', 'ins', null];
    static #limitType(v, limit) {
        if (!this.#limits.some(x=>x===limit)) {throw new TypeError(`limitが不正値です。期待: ${this.#limits.join(',')}, 実際:${limit}`)}
        switch (limit) {
            case 'obj': return this.#isO(v) ? Object : null;
            case 'ins': return this.#isO(v) ? null   : v.constructor;
            default:    return this.#isO(v) ? Object : v.constructor;
        }
    }
    static #isO(v) {return Object === v.constructor}
}
class ObjectType extends ObjectLikeType {static get(v) {return super.get(v, 'obj')}}
class InstanceType extends ObjectLikeType {static get(v) {return super.get(v, 'ins')}}
class FunctionType {// ES5/ES6クラス,関数,アロー関数,bind関数,NativeCode,メソッド
    static is(v) {return 'function'===typeof v}
    static get(v) {return this.is(v) ? Function : null}
}
/*
class ContainerType {
    static is(v) {return (Array.isArray(v) || ObjectType.is(v))}
    static get(v) {
        if (Array.isArray(v)) return Array;
        if (ObjectType.is(v)) return Object;
        return null;
    }
}
*/
/*
class ContainerType {
    static is(v) {
        // v が Array や Object そのものの場合、またはインスタンスが Array/Object の場合
        return v === Array || v === Object || Array.isArray(v) || ObjectType.is(v);
    }
    static get(v) {
        if (v === Array || Array.isArray(v)) return Array;
        if (v === Object || ObjectType.is(v)) return Object;
        return null;
    }
}
*/
/*
class ContainerType {
    static is(v) {
        // v が Array や Object そのものの場合、またはインスタンスが Array/Object の場合
        return v === Array || v === Object;
    }
    static get(v) {
        if (v === Array) return Array;
        if (v === Object) return Object;
        return null;
    }
}
*/
class ContainerType {
    static is(v) {
        // vがArray/Objectクラスそのもの、またはそのインスタンスか
        if (v === Array || v === Object) return true;
        if (Array.isArray(v)) return true;
        // プレーンオブジェクト(Objectインスタンス)か
        return v?.constructor === Object;
    }
    static get(v) {
        if (v === Array || Array.isArray(v)) return Array;
        if (v === Object || v?.constructor === Object) return Object;
        return null;
    }
}
class TypeValue {
    /*
    static valid(v, isThrow=true) {
        const isFn = FunctionType.is(v);
        if (isThrow && !isFn) {throw new TypeError(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`)}
        return isFn;
    }
    */
    static valid(v, isThrow=true) {
        // 関数であるか、または ConstantType (NaN, null, undefined) であれば OK
        const isFn = FunctionType.is(v);
        const isConst = ConstantType.is(v); // これを追加
        const isValid = isFn || isConst;
        if (isThrow && !isValid) {
            throw new TypeError(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
        }
        return isValid;
    }
//    static getName(v) { this.valid(v); return this.getType(v).name; }
//    static getName(v) { this.valid(v); return getTypeName(v); }
    /*
    static getName(v) {
        this.valid(v);
        const type = this.getType(v);
        // typeがオブジェクト（クラス）なら .name を、
        // NaN, null, undefined なら String() で文字列化する
        return type?.name ?? String(type);
    }
    */
    static getName(v) {
        this.valid(v);
        if (Number.isNaN(v)) return 'NaN';
        if (v === null) return 'Null';
        if (v === undefined) return 'Undefined';
        return v.name || 'Function'; // 渡された型シンボルの名前を出す
    }

    /*
    static getType(v) {
        this.valid(v);
        for (let t of [ConstantType,PrimitiveType,ContainerType,InstanceType,FunctionType]) {
            if (t.is(v)) return t.get(v);
        }
        throw new TypeError(`想定外の型です。:${v}`); // ここは通らないはず。
    }
    */
    static getType(v) {
        this.valid(v);
        // 独自クラス（コンストラクタ）なら、そのクラス自体を「型」として返す
        // ※ 組み込みの Object, Array, String 等は各 Type クラスで先に拾う
        for (let t of [ConstantType, PrimitiveType, ContainerType, InstanceType]) {
            if (t.is(v)) return t.get(v);
        }
        // ここまで来たら純粋な「関数」として扱う
        if (FunctionType.is(v)) return v; // Function ではなく v 自体を返すのがコツ
        
        throw new TypeError(`想定外の型です。`);
    }
}
class ValueType {
    static valid(v, isThrow=true) {
        const isPO = PrimitiveObjectType.is(v);
        if (isThrow && isPO) {throw new TypeError(`Primitive型をnewしたインスタンスは原則使用禁止すべきです。ベストプラクティスである===比較が偽になるからです。v:${v} tag:"${getTag(v)}"`)}
        return !isPO;
    }
//    static getName(v) { this.valid(v); return this.getType(v).name; }
//    static getName(v) { this.valid(v); return getTypeName(v); }
    static getName(v) {
        this.valid(v);
        if (typeof v === 'function') return 'Function';
        return getTypeName(v); // 以前のロジック
    }
    static getType(v) {
        this.valid(v);
        for (let t of [ConstantType,PrimitiveType,ContainerType,InstanceType,FunctionType]) {
            if (t.is(v)) return t.get(v);
        }
        throw new TypeError(`想定外の型です。:${v}`); // ここは通らないはず。
    }
}
export class Typer {
    static get #insKeys() {return 'thrower booler'.split(' ')}
    static #getInsKeys(throwable=false) {return throwable ? 'thrower' : 'booler'}
    static #instances = this.#insKeys.reduce((o,n)=>{o[n]=null;return o}, {});
    static #getIns(throwable=false) {
        const key = this.#getInsKeys(throwable);
        if (!this.#instances[key]) {this.#instances[key] = new Typer(throwable);}
        return this.#instances[key];
    }
    static get thrower() {return this.#getIns(true)}
    static get booler() {return this.#getIns(false)}
//    static get type() {return TypeValue}
//    static get value() {return ValueType}
    static get type() {return TypeValue}
    static get value() {return ValueType}
    // 型の完全一致を検証する
    static is(type, value, label, throwable=true) {return this.#check(type, value, label, throwable, false)}
    // 型の継承関係を含めて検証する（instanceof）
    static of(type, value, label, throwable=true) {return this.#check(type, value, label, throwable, true)}
    /*
    static #check(type, value, label, throwable=true, isOf=false) {
        this.type.valid(type);
        const typType = this.type.getType(type);
        const valType = this.value.getType(value);
        console.log(typType , valType );
        return (typType === valType)
            ? (isOf ? (value instanceof type) : true)
            : (throwable ? this.#throwError(type, value, label) : false);
//        const typName = this.type.getName(type); // expected
//        const valName = this.value.getName(value); // actual
//        return (typName === valName)
//            ? (isOf ? (value instanceof type) : true)
//            : (throwable ? this.#throwError(typName, valName, label) : false);
    }
    */
    static #check(type, value, label, throwable=true, isOf=false) {
        this.type.valid(type);
        const typType = this.type.getType(type);
        const valType = this.value.getType(value);
        // typType と valType が NaN の場合でも正しく比較できる
        const isMatch = Object.is(typType, valType);
        return isMatch
            ? (isOf ? (value instanceof type) : true)
            : (throwable ? this.#throwError(type, value, label) : false);
    }

    //static #throwError(typName, valName, label) {throw new TypeError(`${('string'===typeof label) ? `"${label}" の` : ''}型が不正です。期待: ${typName}, 実際: ${valName}。`);}
    static #throwError(type, value, label) {throw new TypeError(`${('string'===typeof label) ? `"${label}" の` : ''}型が不正です。期待: ${this.type.getName(type)}, 実際: ${this.value.getName(value)}。`);}
    constructor(throwable=false) {this._={throwable}}
    is(type, value, label) {return Typer.is(type, value, label, this._.throwable)}
    of(type, value, label) {return Typer.of(type, value, label, this._.throwable)}
}




/*
const getObjectType = (v)=>{
    if (null===Object.getPrototypeOf(v)) return Object; // Object.create(null)
        if (!('constructor' in v)) {throw new TypeError(`想定外の型です。constructorを持っていません。`)}
        if (!('name' in v.constructor)) {throw new TypeError(`想定外の型です。constructorはnameを持っていません。`)}
   return Object === v.constructor ? Object : v.constructor;
};
const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
const getTypeValue = (v)=>{
    if (Number.isNaN(v)) return v;
    if ([null, undefined].map(x=>x===v)) return v;
    if (Array.isArray(v)) return Array;
    return getTag(v);
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
    static getType(v) {

    }
}
export class Typer {
    static get #insKeys() {return 'thrower booler'.split(' ')}
    static #getInsKeys(throwable=false) {return throwable ? 'thrower' : 'booler'}
    static #instances = this.#insKeys.reduce((o,n)=>{o[n]=null;return o}, {});
    static #getIns(throwable=false) {
        const key = this.#getInsKeys(throwable);
        if (!this.#instances[key]) {this.#instances[key] = new Typer(throwable);}
        return this.#instances[key];
    }
    static get thrower() {return this.#getIns(true)}
    static get booler() {return this.#getIns(false)}
    static get type() {return TypeValue}
    static get value() {return ValueType}
    // 型の完全一致を検証する
    static is(type, value, label, throwable=true) {return this.#check(type, value, label, throwable, false)}
    // 型の継承関係を含めて検証する（instanceof）
    static of(type, value, label, throwable=true) {return this.#check(type, value, label, throwable, true)}
    static #check(type, value, label, throwable=true, isOf=false) {
        this.type.valid(type);
        const typName = this.type.getName(type); // expected
        const valName = this.value.getName(value); // actual
        return (typName === valName)
            ? (isOf ? (value instanceof type) : true)
            : (throwable ? this.#throwError(typName, valName, label) : false);
    }
    static #throwError(typName, valName, label) {throw new TypeError(`${('string'===typeof label) ? `"${label}" の` : ''}型が不正です。期待: ${typName}, 実際: ${valName}。`);}
    constructor(throwable=false) {this._={throwable}}
    is(type, value, label) {return Typer.is(type, value, label, this._.throwable)}
    of(type, value, label) {return Typer.of(type, value, label, this._.throwable)}
}
*/
