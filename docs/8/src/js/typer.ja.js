const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);

// 内部用の「該当なし」マーカー
const NONE = Symbol('NONE');

class ConstantType {
    static is(v) { return Number.isNaN(v) || v === null || v === undefined; }
    static of(v) { return this.is(v); }
    static get(v) { return this.is(v) ? v : NONE; }
}

class PrimitiveType {
    static #types = {
        boolean: Boolean,
        number: Number,
        bigint: BigInt,
        string: String,
        symbol: Symbol
    };
    static is(v) { return typeof v in this.#types; }
    static of(v) { return this.is(v); } // プリミティブに継承はないためisと同じ
    static get(v) { return this.#types[typeof v] || null; }
}

class PrimitiveObjectType {
    static #types = [Boolean, Number, String]; // BigInt, Symbolはnewできない
    static get(v) {
        if (!v || typeof v !== 'object') return null;
        const proto = Object.getPrototypeOf(v);
        if (!proto) return null;
        return this.#types.find(t => t.prototype === proto) || null;
    }
    static is(v) { return !!this.get(v); }
}

class ObjectLikeType {
    static is(v) { return !!this.get(v); }
    static get(v, limit = null) {
        if (v === null || typeof v !== 'object') return null;
        
        const proto = Object.getPrototypeOf(v);
        if (proto === null) return Object; // Object.create(null)

        const constructor = v.constructor;
        if (!constructor || !constructor.name) {
            throw new TypeError(`想定外の型です。constructor情報が欠落しています。`);
        }

        const isPlainObject = constructor === Object;
        
        if (limit === 'obj') return isPlainObject ? Object : null;
        if (limit === 'ins') return isPlainObject ? null : constructor;
        return constructor;
    }
}
const getTypeName = (v) => {
    if (Number.isNaN(v)) return 'NaN';
    const tag = getTag(v);
    return ('Object'===tag) ? ObjectLikeType.get(v).name : tag;
};
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
        const isFn = FunctionType.is(v);
        const isConst = ConstantType.is(v);
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
        return v.name || 'Function';
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
    static valid(v, isThrow = true) {
        const poType = PrimitiveObjectType.get(v);
        if (poType) {
            if (isThrow) {
                throw new TypeError(`Primitive型をnewしたインスタンスは使用禁止です。実際: ${poType.name}のボックス化オブジェクト`);
            }
            return false;
        }
        return true;
    }

    static getType(v) {
        this.valid(v);
        // 判定順序が重要
        const c = ConstantType.get(v);
        if (c !== NONE) return c;
        
        const p = PrimitiveType.get(v);
        if (p) return p;

        // Array, Object(Plain), Date, etc...
        const o = ObjectLikeType.get(v);
        if (o) {
            // コンストラクタそのものが渡された場合（例: Typer.is(Function, Array)）
            if (typeof v === 'function') return Function;
            return o;
        }

        if (typeof v === 'function') return Function;
        return null;
    }

    static getName(v) {
        const type = this.getType(v);
        if (Number.isNaN(type)) return 'NaN';
        if (type === null) return 'Null';
        if (type === undefined) return 'Undefined';
        return type.name || 'Object';
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
    static #check(type, value, label, throwable = true, isOf = false) {
        this.type.valid(type);
        const typType = this.type.getType(type);
        const valType = this.value.getType(value);

        // 1. 基本的な型一致の確認
        const isMatch = Object.is(typType, valType);

        // 2. of() の場合の特殊判定（継承関係のチェック）
        let isOfMatch = false;
        if (isOf && !isMatch) {
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
    */
    static #check(type, value, label, throwable = true, isOf = false) {
        Typer.type.valid(type);
        const valType = ValueType.getType(value);
        // 1. 完全一致
        if (type === valType) return true;
        // 2. NaN 特殊判定 (Object.is)
        if (Number.isNaN(type) && Number.isNaN(value)) return true;
        // 3. 継承関係 (of)
        if (isOf && typeof type === 'function' && value instanceof type) return true;
        // 4. 相違
        return throwable ? this.#throwError(type, value, label) : false;
    }
    static #throwError(type, value, label) {throw new TypeError(`${('string'===typeof label) ? `"${label}" の` : ''}型が不正です。期待: ${this.type.getName(type)}, 実際: ${this.value.getName(value)}。`);}
    constructor(throwable=false) {this._={throwable}}
    is(type, value, label) {return Typer.is(type, value, label, this._.throwable)}
    of(type, value, label) {return Typer.of(type, value, label, this._.throwable)}
}

