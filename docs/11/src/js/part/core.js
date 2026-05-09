import { 
    TyperTypeSpecError, 
    TyperBoxedPrimitiveValueError, 
    TyperInvalidObjectError, 
    TyperUnidentifiableError 
} from './error.js';

/**
 * 内部判定用の識別不能マーカー。
 * 他のライブラリ等との衝突を避けるため、グローバルシンボルレジストリを使用します。
  * {@inlineSource}
 */
const NONE = Symbol.for('typer.identity.none');

/**
 * 値の内部スロット名（タグ）を取得します。
 * 【内部用】
 * @param {any} value - 対象の値。
 * @returns {string} - "String", "Number", "HTMLAllCollection" 等のタグ名。
  * {@inlineSource}
 */
const getTag = (value) => Object.prototype.toString.call(value).slice(8, -1);

// --- Identity Extractors (内部用パーツ) ---

/**
 * 定数（NaN, null, undefined）の識別を担当します。
  * {@inlineSource}
 */
class ConstantIdentity {
    /**
     * 値が定数であるか判定します。
     * @param {any} value - 判定対象の値。
     * @returns {boolean} - 定数であれば true。
      * {@inlineSource}
 */
    static is(value) {
        return Number.isNaN(value) || value === null || value === undefined;
    }
    /**
     * 値が定数であればその値を、そうでなければ NONE を返します。
     * @param {any} value - 抽出対象の値。
     * @returns {any|Symbol} - 定数または NONE。
      * {@inlineSource}
 */
    static get(value) {
        return this.is(value) ? value : NONE;
    }
}

/**
 * プリミティブ型（boolean, number, bigint, string, symbol）の識別を担当します。
  * {@inlineSource}
 */
class PrimitiveIdentity {
    static #types = {
        boolean: Boolean,
        number: Number,
        bigint: BigInt,
        string: String,
        symbol: Symbol
    };
    /**
     * 値に対応するプリミティブコンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - コンストラクタまたは NONE。
      * {@inlineSource}
 */
    static get(value) {
        return this.#types[typeof value] || NONE;
    }
}

/**
 * コンテナ型（Array, Object）の識別を担当します。
  * {@inlineSource}
 */
class ContainerIdentity {
    /**
     * 値が Array またはプレーンオブジェクトであればそのコンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - Array, Object または NONE。
      * {@inlineSource}
 */
    static get(value) {
        if (Array.isArray(value)) return Array;
        if (value !== null && typeof value === 'object') {
            // プレーンオブジェクト、または Object.create(null) によるオブジェクトを Object 型と識別する
            if (value.constructor === Object || Object.getPrototypeOf(value) === null) {
                return Object;
            }
        }
        return NONE;
    }
}

/**
 * 関数型の識別を担当します。
  * {@inlineSource}
 */
class FunctionIdentity {
    /**
     * 値が関数であれば Function コンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - Function または NONE。
      * {@inlineSource}
 */
    static get(value) {
        return typeof value === 'function' ? Function : NONE;
    }
}

/**
 * ボックス化されたプリミティブオブジェクトの検知を担当します。
  * {@inlineSource}
 */
class BoxedPrimitiveIdentity {
    static #types = [Boolean, Number, String];
    /**
     * 値がボックス化オブジェクトであればそのコンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - コンストラクタまたは NONE。
      * {@inlineSource}
 */
    static get(value) {
        if (value === null || typeof value !== 'object') return NONE;
        return this.#types.includes(value.constructor) ? value.constructor : NONE;
    }
}

/**
 * 一般的なクラスインスタンスの識別を担当します。
  * {@inlineSource}
 */
class InstanceIdentity {
    /**
     * 値のコンストラクタを識別して返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - コンストラクタまたは NONE。
     * @throws {@link part/error.TyperInvalidObjectError} - constructor 情報が欠落している場合。
      * {@inlineSource}
 */
    static get(value) {
        if (value === null || typeof value !== 'object') return NONE;
        const constructor = value.constructor;
        if (!constructor || !constructor.name) {
            throw new TyperInvalidObjectError("オブジェクト（参照型）が不正値です。インスタンスであると予想されますが、'constructor' 情報が欠落しており、型を識別できません。");
        }
        return constructor;
    }
}

// --- 公開クラス ---

/**
 * 型指示値（TypeSpec）の検証と名前取得を担当するクラス。
 * 【API公開】Typer.spec として参照されます。
  * {@inlineSource}
 */
export class TypeSpec {
    /**
     * 指定された値が型指示値として妥当か検証します。
     * @param {any} typeSpec - 検証対象の値。
     * @returns {boolean} - 妥当であれば true。
     * @throws {@link part/error.TyperTypeSpecError} - 不正な値の場合。
      * {@inlineSource}
 */
    static valid(typeSpec) {
        if (typeof typeSpec === 'function' || ConstantIdentity.is(typeSpec)) return true;
        throw new TyperTypeSpecError("型指示値 TypeSpec が不正値です。NaN, null, undefined またはコンストラクタ関数であるべきです。");
    }

    /**
     * 型指示値の表示名を取得します。
     * @param {any} typeSpec - 名称を取得する型指示値。
     * @returns {string} - 型名（"NaN", "Null", "Undefined", またはコンストラクタ名）。
      * {@inlineSource}
 */
    static getName(typeSpec) {
        if (Number.isNaN(typeSpec)) return 'NaN';
        if (typeSpec === null) return 'Null';
        if (typeSpec === undefined) return 'Undefined';
        return typeSpec.name || 'Function';
    }
}

/**
 * 対象値（ActualValue）の検証とIdentity（正体）の抽出を担当するクラス。
 * 【API公開】Typer.value として参照されます。
  * {@inlineSource}
 */
export class ActualValue {
    /**
     * 指定された値が対象値として妥当か検証します。
     * JavaScriptの仕様上の矛盾を避けるため、ボックス化オブジェクト（new String()等）を排除します。
     * @param {any} value - 検証対象の値。
     * @returns {boolean} - 妥当であれば true。
     * @throws {@link part/error.TyperBoxedPrimitiveValueError} - ボックス化オブジェクトの場合。
      * {@inlineSource}
 */
    static valid(value) {
        const boxedConstructor = BoxedPrimitiveIdentity.get(value);
        if (boxedConstructor !== NONE) {
            const tag = getTag(value);
            throw new TyperBoxedPrimitiveValueError(`Primitive型をnewしたインスタンスは使用禁止です。型を含めた一致判定をする '===' 比較に失敗するためです。これは 'valueOf()' によりプリミティブ値を返却するにもかかわらず、値の実体はオブジェクト（参照型）であるという矛盾によって起こります。型と挙動の整合性が取れない状態を排除するため、Typerではこれらを一律で使用禁止とします。値: ${value}, tag: '${tag}'。`);
        }
        return true;
    }

    /**
     * 値の「正体（Identity）」である型指示値を抽出します。
     * @param {any} value - 抽出対象の値。
     * @returns {any|Function} - 抽出された型指示値。
     * @throws {@link part/error.TyperUnidentifiableError} - 言語仕様上の制限により識別不能な場合。
      * {@inlineSource}
 */
    static getIdentity(value) {
        const extractors = [
            ConstantIdentity, 
            PrimitiveIdentity, 
            ContainerIdentity, 
            FunctionIdentity, 
            InstanceIdentity
        ];

        for (const extractor of extractors) {
            const identity = extractor.get(value);
            if (identity !== NONE) return identity;
        }

        // 全ての抽出器を通り抜けた場合（document.all や特殊な Proxy 等）
        const tag = getTag(value);
        throw new TyperUnidentifiableError(`値の型を識別できません。'typeof' や 'instanceof' の結果が、実際の型（内部スロット）と一致しないためです。この矛盾はECMAScriptの言語仕様です。例えば値がdocument.allやProxy等で発生し得ます。その場合Typerは型を識別できません。値: ${value}, typeof: '${typeof value}', tag: '${tag}'。`);
    }

    /**
     * 値の型名を取得します。
     * @param {any} value - 型名を取得する値。
     * @returns {string} - 識別された型名。
      * {@inlineSource}
 */
    static getName(value) {
        return TypeSpec.getName(this.getIdentity(value));
    }
}

