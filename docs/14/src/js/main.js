import { TyperError } from './part/error.js';
import { TypeSpec, ActualValue } from './part/core.js';
import { TyperResolver } from './part/resolver.js';

/**
 * 型判定ライブラリのメインクラス。
 * 静的メソッドおよびインスタンスメソッドを通じて、型の一致判定（is）および継承判定（of）を提供します。     */
    export class Typer {
    /**
     * 型指示値（TypeSpec）の検証および操作を行うクラスを取得します。
     * @returns {typeof TypeSpec}     */
    static get spec() {
        return TypeSpec;
    }

    /**
     * 対象値（ActualValue）の検証および操作を行うクラスを取得します。
     * @returns {typeof ActualValue}     */
    static get value() {
        return ActualValue;
    }

    /**
     * Typerが提供する例外クラスの基底を取得します。
     * このプロパティを起点として、各種例外クラス（.use, .ecma 等）へアクセスできます。
     * @returns {typeof TyperError}     */
    static get error() {
        return TyperError;
    }

    /** @type {Object.<string, Typer|null>} 内部インスタンスのキャッシュ
 */
    static #instances = {
        thrower: null,
        booler: null
    };

    /**
     * 判定失敗時に例外を送出する設定の Typer インスタンスを取得します。
     * @returns {Typer}     */
    static get thrower() {
        if (!this.#instances.thrower) {
            this.#instances.thrower = new Typer(true);
        }
        return this.#instances.thrower;
    }

    /**
     * 判定失敗時に false を返却する設定の Typer インスタンスを取得します。
     * @returns {Typer}     */
    static get booler() {
        if (!this.#instances.booler) {
            this.#instances.booler = new Typer(false);
        }
        return this.#instances.booler;
    }

    /**
     * 型指示値と対象値が完全一致するか判定します。
     * 
     * @param {any} typeSpec - 比較対象となる型指示値（NaN, null, undefined, またはコンストラクタ）。
     * @param {any} actualValue - 判定対象となる生の値。
     * @param {string|null} [label=null] - エラーメッセージに表示する対象の名称。
     * @param {boolean} [throwable=true] - 判定失敗時に例外を送出するかどうか。
     * @returns {boolean} - 判定に成功した場合は true。失敗し、かつ throwable が false の場合は false。
     * 
     * @throws {@link src/js/part/error.TyperTypeSpecError TyperTypeSpecError} 型指示値（typeSpec）が NaN, null, undefined またはコンストラクタ関数でない場合。
     * @throws {@link src/js/part/error.TyperBoxedPrimitiveValueError TyperBoxedPrimitiveValueError} 対象値（actualValue）がボックス化オブジェクト（new String() 等）である場合。
     * @throws {@link src/js/part/error.TyperInvalidObjectError TyperInvalidObjectError} 対象値のコンストラクタ情報が欠落しており、型を識別できない場合。
     * @throws {@link src/js/part/error.TyperUnidentifiableError TyperUnidentifiableError} 言語仕様上の制限（document.all や Proxy 等）により、対象値の型を識別できない場合。
     * @throws {@link src/js/part/error.TyperNotIsError TyperNotIsError} 型が完全一致せず、かつ throwable が true の場合。
     * @throws {@link src/js/part/error.TyperImplementationError TyperImplementationError} ライブラリの実装に矛盾（想定外エラーの手動送出等）が検知された場合。
     * @throws {@link src/js/part/error.TyperUnexpectedError TyperUnexpectedError} 上記以外の未知のネイティブエラーが送出された場合。     */
    static is(typeSpec, actualValue, label = null, throwable = true) {
        return TyperResolver.is(typeSpec, actualValue, label, throwable);
    }

    /**
     * 型指示値と対象値が継承関係を含めて一致するか判定します。
     * 
     * @param {any} typeSpec - 比較対象となる型指示値（NaN, null, undefined, またはコンストラクタ）。
     * @param {any} actualValue - 判定対象となる生の値。
     * @param {string|null} [label=null] - エラーメッセージに表示する対象の名称。
     * @param {boolean} [throwable=true] - 判定失敗時に例外を送出するかどうか。
     * @returns {boolean} - 判定に成功した場合は true。失敗し、かつ throwable が false の場合は false。
     * 
     * @throws {@link src/js/part/error.TyperTypeSpecError TyperTypeSpecError} 型指示値（typeSpec）が NaN, null, undefined またはコンストラクタ関数でない場合。
     * @throws {@link src/js/part/error.TyperBoxedPrimitiveValueError TyperBoxedPrimitiveValueError} 対象値（actualValue）がボックス化オブジェクト（new String() 等）である場合。
     * @throws {@link src/js/part/error.TyperInvalidObjectError TyperInvalidObjectError} 対象値のコンストラクタ情報が欠落しており、型を識別できない場合。
     * @throws {@link src/js/part/error.TyperUnidentifiableError TyperUnidentifiableError} 言語仕様上の制限（document.all や Proxy 等）により、対象値の型を識別できない場合。
     * @throws {@link src/js/part/error.TyperNotOfError TyperNotOfError} 型が一致せず継承関係も認められない、かつ throwable が true の場合。
     * @throws {@link src/js/part/error.TyperImplementationError TyperImplementationError} ライブラリの実装に矛盾（想定外エラーの手動送出等）が検知された場合。
     * @throws {@link src/js/part/error.TyperUnexpectedError TyperUnexpectedError} 上記以外の未知のネイティブエラーが送出された場合。     */
    static of(typeSpec, actualValue, label = null, throwable = true) {
        return TyperResolver.of(typeSpec, actualValue, label, throwable);
    }

    /**
     * 新しい Typer インスタンスを生成します。
     * @param {boolean} [throwable=false] - 判定失敗時に例外を送出する設定にするかどうか。     */
    constructor(throwable = false) {
        /** @protected
 */
        this._ = { throwable };
    }

    /**
     * インスタンスの設定（throwable）に基づき、完全一致判定を実行します。
     * 
     * @param {any} typeSpec - 型指示値。
     * @param {any} actualValue - 対象値。
     * @param {string|null} [label=null] - 対象の名称。
     * @returns {boolean} - 判定結果。
     * @see {@link is}     */
    is(typeSpec, actualValue, label = null) {
        return Typer.is(typeSpec, actualValue, label, this._.throwable);
    }

    /**
     * インスタンスの設定（throwable）に基づき、継承判定を実行します。
     * 
     * @param {any} typeSpec - 型指示値。
     * @param {any} actualValue - 対象値。
     * @param {string|null} [label=null] - 対象の名称。
     * @returns {boolean} - 判定結果。
     * @see {@link of}     */
    of(typeSpec, actualValue, label = null) {
        return Typer.of(typeSpec, actualValue, label, this._.throwable);
    }
}
