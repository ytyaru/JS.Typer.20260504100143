import { TypeSpecifier, ActualValue } from './core.js';

/**
 * 型判定の純粋なロジック（true/false）を担当するクラス。
 * 【内部用】判定の成否のみを返し、例外のルーティングや戻り値の制御は行いません。
     */
    export class TyperEngine {
    /**
     * 型指示値と対象値が完全一致するかを判定します。
     * @param {any} typeSpecifier - 比較対象となる型指示値（NaN, null, undefined, またはコンストラクタ）。
     * @param {any} actualValue - 判定対象となる生の値。
     * @returns {boolean} - 型指示値と値の正体（Identity）が完全一致すれば true。

     * @throws {@link src/js/part/error.TyperTypeSpecError TyperTypeSpecError} - 型指示値が不正な場合。
     * @throws {@link src/js/part/error.TyperBoxedPrimitiveValueError TyperBoxedPrimitiveValueError} - 値がボックス化オブジェクトの場合。
     * @throws {@link src/js/part/error.TyperInvalidObjectError TyperInvalidObjectError} - 値の型を識別できない場合。
     * @throws {@link src/js/part/error.TyperUnidentifiableError TyperUnidentifiableError} - 言語仕様上の制限により識別不能な場合。
     */
    static isLogic(typeSpecifier, actualValue) {
        // 1. 引数の妥当性を検証。不正な場合は core.js 内で定義された例外が送出される。
        TypeSpecifier.valid(typeSpecifier);
        ActualValue.valid(actualValue);

        // 2. 対象値の正体（Identity）を取得。
        const specifier = ActualValue.getSpecifier(actualValue);

        // 3. 型指示値と正体が完全一致するかを Object.is で比較。
        return Object.is(typeSpecifier, specifier);
    }

    /**
     * 型指示値と対象値が継承関係を含めて一致するかを判定します。
     * @param {any} typeSpecifier - 比較対象となる型指示値（NaN, null, undefined, またはコンストラクタ）。
     * @param {any} actualValue - 判定対象となる生の値。
     * @returns {boolean} - 完全一致、または継承関係（instanceof）があれば true。

     * @throws {@link src/js/part/error.TyperTypeSpecError TyperTypeSpecError} - 型指示値が不正な場合。
     * @throws {@link src/js/part/error.TyperBoxedPrimitiveValueError TyperBoxedPrimitiveValueError} - 値がボックス化オブジェクトの場合。
     * @throws {@link src/js/part/error.TyperInvalidObjectError TyperInvalidObjectError} - 値の型を識別できない場合。
     * @throws {@link src/js/part/error.TyperUnidentifiableError TyperUnidentifiableError} - 言語仕様上の制限により識別不能な場合。
     */
    static ofLogic(typeSpecifier, actualValue) {
        // 1. まずは完全一致を確認。
        if (this.isLogic(typeSpecifier, actualValue)) {
            return true;
        }

        // 2. 完全一致しない場合、継承関係を確認する。
        return (typeof typeSpecifier === 'function' && actualValue instanceof typeSpecifier);
    }
}
