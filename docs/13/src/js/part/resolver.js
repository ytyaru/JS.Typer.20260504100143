import { 
    TyperError, 
    TyperImplementationError, 
    TyperUnexpectedError, 
    TyperNotIsError, 
    TyperNotOfError 
} from './error.js';
import { TypeSpec, ActualValue } from './core.js';
import { TyperEngine } from './engine.js';

/**
 * 判定ロジックの実行と、その結果に基づく例外の送出・戻り値の解決を担当するクラス。
 * 【内部用】判定の成否だけでなく、利用者の設定に応じた挙動の制御、
 * および発生した例外が「想定内」か「想定外」かを識別し、適切な責任境界へルーティングします。     */
    export class TyperResolver {
    /**
     * 型指示値と対象値の完全一致判定（is）を実行し、その結果を解決します。
     * 
     * @param {any} typeSpec - 比較対象となる型指示値。
     * @param {any} actualValue - 判定対象となる生の値。
     * @param {string|null} label - 対象の名称。
     * @param {boolean} throwable - 判定失敗時に例外を送出するかどうか。
     * @returns {boolean} - 判定に成功した場合は true。失敗し、かつ throwable が false の場合は false。
     * @throws {@link src/js/part/error.TyperNotIsError TyperNotIsError} - 判定に失敗し、かつ throwable が true の場合。
     * @throws {@link src/js/part/error.TyperError TyperError} - 想定内のエラーが発生した場合。
     * @throws {@link src/js/part/error.TyperUnexpectedError TyperUnexpectedError} - 想定外のエラーが発生した場合。     */
    static is(typeSpec, actualValue, label, throwable) {
        return this.#resolve(TyperEngine.isLogic, typeSpec, actualValue, label, throwable, TyperNotIsError);
    }

    /**
     * 型指示値と対象値の継承関係を含めた一致判定（of）を実行し、その結果を解決します。
     * 
     * @param {any} typeSpec - 比較対象となる型指示値。
     * @param {any} actualValue - 判定対象となる生の値。
     * @param {string|null} label - 対象の名称。
     * @param {boolean} throwable - 判定失敗時に例外を送出するかどうか。
     * @returns {boolean} - 判定に成功した場合は true。失敗し、かつ throwable が false の場合は false。
     * @throws {@link src/js/part/error.TyperNotOfError TyperNotOfError} - 判定に失敗し、かつ throwable が true の場合。
     * @throws {@link src/js/part/error.TyperError TyperError} - 想定内のエラーが発生した場合。
     * @throws {@link src/js/part/error.TyperUnexpectedError TyperUnexpectedError} - 想定外のエラーが発生した場合。     */
    static of(typeSpec, actualValue, label, throwable) {
        return this.#resolve(TyperEngine.ofLogic, typeSpec, actualValue, label, throwable, TyperNotOfError);
    }

    /**
     * 判定ロジックを実行し、例外の送出または戻り値を決定します。
     * 
     * @param {Function} logic - 実行する判定ロジック（TyperEngine の静的メソッド）。
     * @param {any} typeSpec - 型指示値。
     * @param {any} actualValue - 対象値。
     * @param {string|null} label - 対象の名称。
     * @param {boolean} throwable - 例外送出の有無。
     * @param {typeof TyperResultError} MismatchError - 判定失敗時に送出する例外クラス。
     * @returns {boolean} - 判定結果。
     * @private
 */
    static #resolve(logic, typeSpec, actualValue, label, throwable, MismatchError) {
        try {
            // 判定ロジックの実行。
            const success = logic.call(TyperEngine, typeSpec, actualValue);

            if (success) {
                return true;
            }

            // 判定失敗時の処理。throwable 設定に従い、例外送出か false 返却かを選択する。
            if (throwable) {
                throw this.#createMismatchError(MismatchError, typeSpec, actualValue, label);
            }
            return false;

        } catch (error) {
            // 例外のルーティング（責任分配ロジック）。

            // 1. Typerが意図的に送出した「想定内」のエラーなら、そのまま上位へ送出する。
            if (TyperError.isExpected(error)) {
                throw error;
            }

            // 2. もし「想定外」エラーがキャッチされたなら、それは実装上の矛盾である。
            //    TyperUnexpectedError は本来 catch 節で生成されるべきものであり、
            //    ロジック内で明示的に throw されている場合は実装ミスとして検知する。
            if (TyperError.isUnexpected(error)) {
                throw new TyperImplementationError(
                    `Typerの実装に矛盾があります。'TyperUnexpectedError' が想定内のエラーとして送出されています。'TyperUnexpectedError' は想定外の事態においてのみ送出されるべきです。コードを修正してください。`,
                    { cause: error }
                );
            }

            // 3. それ以外の未知のエラー（Native Error等）をここで初めてラップし、
            //    「想定外」のエラーとして送出する。
            throw new TyperUnexpectedError(
                `想定外のエラーが送出されました。Typerの実装に起因する不具合の可能性があります。不具合報告の際は、以下の詳細情報を添えてください。メッセージ: '${error.message}'。`,
                { cause: error }
            );
        }
    }

    /**
     * 判定失敗時の不一致例外（MismatchError）を生成します。
     * 
     * @param {typeof TyperResultError} MismatchError - 生成する例外クラス。
     * @param {any} typeSpec - 期待されていた型指示値。
     * @param {any} actualValue - 実際に渡された値。
     * @param {string|null} label - 対象の名称。
     * @returns {TyperResultError} - 構築された例外インスタンス。
     * @private
 */
    static #createMismatchError(MismatchError, typeSpec, actualValue, label) {
        const expectedName = TypeSpec.getName(typeSpec);
        const actualName = ActualValue.getName(actualValue);
        const prefix = (typeof label === 'string') ? `"${label}" の` : '';
        return new MismatchError(`${prefix}型が不正です。期待: ${expectedName}, 実際: ${actualName}。`);
    }
}

