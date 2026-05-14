import { i18n } from '../util/i18n/index.js';
import { 
    TyperError, 
    TyperImplementationError, 
    TyperUnexpectedError, 
    TyperNotIsError, 
    TyperNotOfError 
} from './error.js';
import { TypeSpecifier, ActualValue } from './core.js';
import { TyperEngine } from './engine.js';

/**
 * 判定ロジックの実行と、その結果に基づく例外の送出・戻り値の解決を担当するクラス。
 * 【内部用】判定の成否だけでなく、利用者の設定に応じた挙動の制御、
 * および発生した例外が「想定内」か「想定外」かを識別し、適切な責任境界へルーティングします。
 */
export class TyperResolver {
    /**
     * 型指示値と対象値の完全一致判定（is）を実行し、その結果を解決します。
     * 
     * @param {any} typeSpecifier - 比較対象となる型指示値。
     * @param {any} actualValue - 判定対象となる生の値。
     * @param {string|null} label - 対象の名称。
     * @param {boolean} throwable - 判定失敗時に例外を送出するかどうか。
     * @returns {boolean} - 判定に成功した場合は true。失敗し、かつ throwable が false の場合は false。
     * @throws {@link src/js/part/error.TyperNotIsError} - 判定に失敗し、かつ throwable が true の場合。
     */
    static is(typeSpecifier, actualValue, label, throwable) {
        return this.#resolve(TyperEngine.isLogic, typeSpecifier, actualValue, label, throwable, TyperNotIsError);
    }

    /**
     * 型指示値と対象値の継承関係を含めた一致判定（of）を実行し、その結果を解決します。
     * 
     * @param {any} typeSpecifier - 比較対象となる型指示値。
     * @param {any} actualValue - 判定対象となる生の値。
     * @param {string|null} label - 対象の名称。
     * @param {boolean} throwable - 判定失敗時に例外を送出するかどうか。
     * @returns {boolean} - 判定に成功した場合は true。失敗し、かつ throwable が false の場合は false。
     * @throws {@link src/js/part/error.TyperNotOfError} - 判定に失敗し、かつ throwable が true の場合。
     */
    static of(typeSpecifier, actualValue, label, throwable) {
        return this.#resolve(TyperEngine.ofLogic, typeSpecifier, actualValue, label, throwable, TyperNotOfError);
    }

    /**
     * 判定ロジックを実行し、例外の送出または戻り値を決定します。
     * 
     * @param {Function} logic - 実行する判定ロジック（TyperEngine の静的メソッド）。
     * @param {any} typeSpecifier - 型指示値。
     * @param {any} actualValue - 対象値。
     * @param {string|null} label - 対象の名称。
     * @param {boolean} throwable - 例外送出の有無。
     * @param {typeof TyperResultError} MismatchError - 判定失敗時に送出する例外クラス。
     * @returns {boolean} - 判定結果。
     * @private
     */
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

    /**
     * 判定失敗時の不一致例外（MismatchError）を生成します。
     * 
     * @param {typeof TyperResultError} MismatchError - 生成する例外クラス。
     * @param {any} typeSpecifier - 期待されていた型指示値。
     * @param {any} actualValue - 実際に渡された値。
     * @param {string|null} label - 対象の名称。
     * @returns {TyperResultError} - 構築された例外インスタンス。
     * @private
     */
    static #createMismatchError(MismatchError, typeSpecifier, actualValue, label) {
        const expectedName = TypeSpecifier.getName(typeSpecifier);
        const actualName = ActualValue.getName(actualValue);
        return new MismatchError(i18n.mismatch(expectedName, actualName, label));
    }
}
