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
class ContainerType {
    static is(v) {
        if (v === Array || v === Object) return true;
        if (Array.isArray(v)) return true;
        return v?.constructor === Object;
    }
    static get(v) {
        if (v === Array || Array.isArray(v)) return Array;
        if (v === Object || v?.constructor === Object) return Object;
        return null;
    }
}
class TypeValue {
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
    static getName(v) {
        this.valid(v);
        if (Number.isNaN(v)) return 'NaN';
        if (v === null) return 'Null';
        if (v === undefined) return 'Undefined';
        return v.name || 'Function'; // 渡された型シンボルの名前を出す
    }
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
        if (isThrow && isPO) {throw new TypeError(`Primitive型をnewしたインスタンスは原則使用禁止すべきです。ベストプラクティスである===比較が偽になるからです。v:${v} tag:"${getTypeName(v)}"`)}
        return !isPO;
    }
    static getName(v) {
        this.valid(v);
        if (typeof v === 'function') return 'Function';
        return getTypeName(v);
    }
    static getType(v) {
        this.valid(v);
        if ([Object,Array].some(x=>x===v)) return Function;
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
        const isMatch = Object.is(typType, valType); // NaN の場合でも正しく比較できる
        return isMatch
            ? ((isOf && Object!==type && !PrimitiveType.is(value) && !ConstantType.is(value)) ? (value instanceof type) : true)
            : (throwable ? this.#throwError(type, value, label) : false);
    }
    */
    static #check(type, value, label, throwable = true, isOf = false) {
        this.type.valid(type);
        const typType = this.type.getType(type);
        const valType = this.value.getType(value);

        // 1. 基本的な型一致の確認
        const isMatch = Object.is(typType, valType);

        // 2. of() の場合の特殊判定（継承関係のチェック）
        let isOfMatch = false;
        if (isOf && !isMatch) {
            // 以下の条件をすべて満たす場合のみ、継承関係を認める
            // - type が Object ではない（Object なら ContainerType で厳密に一致すべき）
            // - value が Primitive ではない（Primitive に継承はない）
            // - 実際に instanceof が true である
            if (type !== Object && 
                !PrimitiveType.is(value) && 
                !ConstantType.is(value) && 
                (typeof type === 'function' && value instanceof type)) {
                isOfMatch = true;
            }
        }

        if (isMatch || isOfMatch) return true;

        // 3. 失敗時
        return throwable ? this.#throwError(type, value, label) : false;
    }
    static #throwError(type, value, label) {throw new TypeError(`${('string'===typeof label) ? `"${label}" の` : ''}型が不正です。期待: ${this.type.getName(type)}, 実際: ${this.value.getName(value)}。`);}
    constructor(throwable=false) {this._={throwable}}
    is(type, value, label) {return Typer.is(type, value, label, this._.throwable)}
    of(type, value, label) {return Typer.of(type, value, label, this._.throwable)}
}

