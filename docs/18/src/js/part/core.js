import { i18n } from '../util/i18n/index.js';
import { 
    TyperTypeSpecError, 
    TyperBoxedPrimitiveValueError, 
    TyperInvalidObjectError, 
    TyperUnidentifiableError 
} from './error.js';

/**
 * 内部判定用の識別不能マーカー。
 * 他のライブラリ等との衝突を避けるため、グローバルシンボルレジストリを使用します。
 */
const NONE = Symbol.for('typer.specifier.none');

/**
 * 値の内部スロット名（タグ）を取得します。
 * 【内部用】
 * @param {any} value - 対象の値。
 * @returns {string} - "String", "Number", "HTMLAllCollection" 等のタグ名。
 */
const getTag = (value) => Object.prototype.toString.call(value).slice(8, -1);

// --- Specifier Extractors (内部用パーツ) ---

/**
 * 定数（NaN, null, undefined）の識別を担当します。
 */
class ConstantSpecifier {
    /**
     * 値が定数であるか判定します。
     * @param {any} value - 判定対象の値。
     * @returns {boolean} - 定数であれば true。
     */
    static is(value) {
        return Number.isNaN(value) || value === null || value === undefined;
    }
    /**
     * 値が定数であればその値を、そうでなければ NONE を返します。
     * @param {any} value - 抽出対象の値。
     * @returns {any|Symbol} - 定数または NONE。
     */
    static get(value) {
        return this.is(value) ? value : NONE;
    }
}

/**
 * プリミティブ型（boolean, number, bigint, string, symbol）の識別を担当します。
 */
class PrimitiveSpecifier {
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
     */
    static get(value) {
        return this.#types[typeof value] || NONE;
    }
}

/**
 * コンテナ型（Array, Object）の識別を担当します。
 */
class ContainerSpecifier {
    /**
     * 値が Array またはプレーンオブジェクトであればそのコンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - Array, Object または NONE。
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
 */
class FunctionSpecifier {
    /**
     * 値が関数であれば Function コンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - Function または NONE。
     */
    static get(value) {
        return typeof value === 'function' ? Function : NONE;
    }
}

/**
 * ボックス化されたプリミティブオブジェクトの検知を担当します。
 */
class BoxedPrimitiveSpecifier {
    static #types = [Boolean, Number, String];
    /**
     * 値がボックス化オブジェクトであればそのコンストラクタを返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - コンストラクタまたは NONE。
     */
    static get(value) {
        if (value === null || typeof value !== 'object') return NONE;
        return this.#types.includes(value.constructor) ? value.constructor : NONE;
    }
}

/**
 * 一般的なクラスインスタンスの識別を担当します。
 */
class InstanceSpecifier {
    /**
     * 値のコンストラクタを識別して返します。
     * @param {any} value - 抽出対象の値。
     * @returns {Function|Symbol} - コンストラクタまたは NONE。

     * @throws {@link src/js/part/error.TyperInvalidObjectError TyperInvalidObjectError} - constructor 情報が欠落している場合。
     */
    static get(value) {
        if (value === null || typeof value !== 'object') return NONE;
        const constructor = value.constructor;

        // constructor が無い、または constructor.name が無い場合に例外を送出
        if (!constructor || !constructor.name) {
            // constructor が存在すれば true (name欠落)、存在しなければ false (constructor欠落) を渡す
            throw new TyperInvalidObjectError(i18n.invalidObject(!!constructor));
        }
        return constructor;
    }
}

// --- 公開クラス ---

/**
 * 型指定子（TypeSpecifier）の検証と名前取得を担当するクラス。
 * 【API公開】Typer.specifier として参照されます。
     */
    export class TypeSpecifier {
    /**
     * 指定された値が型指定子として妥当か検証します。
     * @param {any} typeSpecifier - 検証対象の値。
     * @returns {boolean} - 妥当であれば true。

     * @throws {@link src/js/part/error.TyperTypeSpecError TyperTypeSpecError} - 不正な値の場合。
     */
    static valid(typeSpecifier) {
        if (typeof typeSpecifier === 'function' || ConstantSpecifier.is(typeSpecifier)) return true;
        throw new TyperTypeSpecError(i18n.typeSpecifier());
    }

    /**
     * 型指定子の表示名を取得します。
     * @param {any} typeSpecifier - 名称を取得する型指定値。
     * @returns {string} - 型名（"NaN", "Null", "Undefined", またはコンストラクタ名）。
     */
    static getName(typeSpecifier) {
        if (Number.isNaN(typeSpecifier)) return 'NaN';
        if (typeSpecifier === null) return 'Null';
        if (typeSpecifier === undefined) return 'Undefined';
        return typeSpecifier.name || 'Function';
    }
}

/**
 * 対象値（ActualValue）の検証と型指定子の抽出を担当するクラス。
 * 【API公開】Typer.value として参照されます。
     */
    export class ActualValue {
    /**
     * 指定された値が対象値として妥当か検証します。
     * JavaScriptの仕様上の矛盾を避けるため、ボックス化オブジェクトを排除します。
     * @param {any} value - 検証対象の値。
     * @returns {boolean} - 妥当であれば true。

     * @throws {@link src/js/part/error.TyperBoxedPrimitiveValueError TyperBoxedPrimitiveValueError} - ボックス化オブジェクトの場合。
     */
    static valid(value) {
        const boxed = BoxedPrimitiveSpecifier.get(value);
        if (boxed !== NONE) {
            throw new TyperBoxedPrimitiveValueError(i18n.boxedPrimitive(value, getTag(value)));
        }
        return true;
    }

    /**
     * 値の「正体（Identity）」である型指定子を抽出します。
     * @param {any} value - 抽出対象の値。
     * @returns {any|Function} - 抽出された型指定子。

     * @throws {@link src/js/part/error.TyperUnidentifiableError TyperUnidentifiableError} - 言語仕様上の制限により識別不能な場合。
     */
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
            if (spec !== NONE) return spec;
        }

        throw new TyperUnidentifiableError(i18n.unidentifiable(value, typeof value, getTag(value)));
    }

    /**
     * 値の型名を取得します。
     * @param {any} value - 型名を取得する値。
     * @returns {string} - 識別された型名。
     */
    static getName(value) {
        return TypeSpecifier.getName(this.getSpecifier(value));
    }
}
