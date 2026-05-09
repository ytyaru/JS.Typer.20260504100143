/**
 * Typerライブラリの基底例外クラス。
 * 【API公開】Typer.error として参照される基底クラスです。
  * {@inlineSource}
 */
export class TyperError extends TypeError {
    /**
     * 指定された値が、このクラスのインスタンスであるか判定します。
     * @param {any} value - 判定対象の値。
     * @returns {boolean} - このクラスの直接のインスタンスであれば true。
      * {@inlineSource}
 */
    static is(value) {
        return value instanceof this && value.constructor === this;
    }

    /**
     * 指定された値が、このクラス（または継承クラス）のインスタンスであるか判定します。
     * @param {any} value - 判定対象の値。
     * @returns {boolean} - このクラスを継承したインスタンスであれば true。
      * {@inlineSource}
 */
    static of(value) {
        return value instanceof this;
    }

    /**
     * 指定されたエラーが、Typerが意図的に送出した「想定内」のエラーか判定します。
     * @param {any} error - 判定対象のエラー。
     * @returns {boolean} - 想定内エラーのインスタンスであれば true。
      * {@inlineSource}
 */
    static isExpected(error) {
        return error instanceof TyperExpectedError;
    }

    /**
     * 指定されたエラーが、Typerが想定外の事態で送出した「想定外」のエラーか判定します。
     * @param {any} error - 判定対象のエラー。
     * @returns {boolean} - 想定外エラーのインスタンスであれば true。
      * {@inlineSource}
 */
    static isUnexpected(error) {
        return error instanceof TyperUnexpectedError;
    }

    /**
     * この例外（または継承クラス）をインスタンス化して送出します。
     * 三項演算子などの式の中で throw 文を使用したい場合に使用します。
     * @param {string} message - エラーメッセージ。
     * @param {ErrorOptions} [option] - エラーの原因などを格納するオプション。
     * @throws {this} - 常に自身を送出します。
      * {@inlineSource}
 */
    static throw(message, option) {
        throw new this(message, option);
    }

    /**
     * @param {string} message - エラーメッセージ。
     * @param {ErrorOptions} [option] - エラーの原因などを格納するオプション。
      * {@inlineSource}
 */
    constructor(message, option) {
        super(message, option);
        this.name = 'TyperError';
    }

    /**
     * 自身が、指定されたクラスのインスタンスであるか判定します。
     * @param {Function} type - 比較対象のコンストラクタ。
     * @returns {boolean} - 指定された型の直接のインスタンスであれば true。
      * {@inlineSource}
 */
    is(type) {
        return this instanceof type && this.constructor === type;
    }

    /**
     * 自身が、指定されたクラス（または継承クラス）のインスタンスであるか判定します。
     * @param {Function} type - 比較対象のコンストラクタ。
     * @returns {boolean} - 指定された型の継承関係にあるインスタンスであれば true。
      * {@inlineSource}
 */
    of(type) {
        return this instanceof type;
    }

    /**
     * 自身がTyperの「想定内」エラーであるか判定します。
     * @returns {boolean}
      * {@inlineSource}
 */
    get isExpected() {
        return this instanceof TyperExpectedError;
    }

    /**
     * 自身がTyperの「想定外」エラーであるか判定します。
     * @returns {boolean}
      * {@inlineSource}
 */
    get isUnexpected() {
        return this instanceof TyperUnexpectedError;
    }
}

/**
 * 想定内エラーの共通親クラス。
 * 【内部用】APIとしては公開されません。
  * {@inlineSource}
 */
class TyperExpectedError extends TyperError {
    constructor(message, option) {
        super(message, option);
        this.name = 'TyperExpectedError';
    }
}

/**
 * 想定外エラーのクラス。
 * 【内部用（モジュール公開）】Resolverでのラップに使用するため export されますが、API階層には含まれません。
  * {@inlineSource}
 */
export class TyperUnexpectedError extends TyperError {
    constructor(message, option) {
        super(message, option);
        this.name = 'TyperUnexpectedError';
    }
}

// --- 利用者 責任 (Expected) ---

/**
 * 利用者の呼び出し方に起因するエラーの基底クラス。
 * 【API公開】Typer.error.use として参照されます。
  * {@inlineSource}
 */
export class TyperUseError extends TyperExpectedError {
    constructor(message, option) { super(message, option); this.name = 'TyperUseError'; }
}

/**
 * 引数そのものが不正である場合のエラー。
 * 【API公開】Typer.error.use.arg として参照されます。
  * {@inlineSource}
 */
export class TyperArgumentError extends TyperUseError {
    constructor(message, option) { super(message, option); this.name = 'TyperArgumentError'; }
}

/**
 * 型指示値（TypeSpec）が不正である場合のエラー。
 * 【API公開】Typer.error.use.arg.spec として参照されます。
  * {@inlineSource}
 */
export class TyperTypeSpecError extends TyperArgumentError {
    constructor(message, option) { super(message, option); this.name = 'TyperTypeSpecError'; }
}

/**
 * 判定の結果、不一致であった場合のエラーの基底クラス。
 * 【API公開】Typer.error.use.res として参照されます。
  * {@inlineSource}
 */
export class TyperResultError extends TyperUseError {
    constructor(message, option) { super(message, option); this.name = 'TyperResultError'; }
}

/**
 * is() 判定において完全一致しなかった場合のエラー。
 * 【API公開】Typer.error.use.res.notIs として参照されます。
  * {@inlineSource}
 */
export class TyperNotIsError extends TyperResultError {
    constructor(message, option) { super(message, option); this.name = 'TyperNotIsError'; }
}

/**
 * of() 判定において継承関係も認められなかった場合のエラー。
 * 【API公開】Typer.error.use.res.notOf として参照されます。
  * {@inlineSource}
 */
export class TyperNotOfError extends TyperResultError {
    constructor(message, option) { super(message, option); this.name = 'TyperNotOfError'; }
}

// --- ECMAScript 責任 (Expected) ---

/**
 * 言語仕様上の制限や矛盾に起因するエラーの基底クラス。
 * 【API公開】Typer.error.ecma として参照されます。
  * {@inlineSource}
 */
export class TyperECMAScriptError extends TyperExpectedError {
    constructor(message, option) { super(message, option); this.name = 'TyperECMAScriptError'; }
}

/**
 * ボックス化されたプリミティブオブジェクトが渡された場合のエラー。
 * 【API公開】Typer.error.ecma.boxedPrim として参照されます。
  * {@inlineSource}
 */
export class TyperBoxedPrimitiveValueError extends TyperECMAScriptError {
    constructor(message, option) { super(message, option); this.name = 'TyperBoxedPrimitiveValueError'; }
}

/**
 * オブジェクト（参照型）が不正値です。インスタンスであると予想されますが、'constructor' 情報が欠落しており、型を識別できません。
 * 【API公開】Typer.error.ecma.invalidObj として参照されます。
  * {@inlineSource}
 */
export class TyperInvalidObjectError extends TyperECMAScriptError {
    constructor(message, option) { super(message, option); this.name = 'TyperInvalidObjectError'; }
}

/**
 * 言語仕様上の制限により、型を識別できない特殊な値（document.all等）の場合のエラー。
 * 【API公開】Typer.error.ecma.unidentifiable として参照されます。
  * {@inlineSource}
 */
export class TyperUnidentifiableError extends TyperECMAScriptError {
    constructor(message, option) { super(message, option); this.name = 'TyperUnidentifiableError'; }
}

// --- 開発者 責任 (Expected) ---

/**
 * 開発者の実装に起因するエラーの基底クラス。
 * 【API公開】Typer.error.dev として参照されます。
  * {@inlineSource}
 */
export class TyperDevelopError extends TyperExpectedError {
    constructor(message, option) { super(message, option); this.name = 'TyperDevelopError'; }
}
/**
 * Typerの実装上の矛盾に起因するエラー。
 * 【API公開】Typer.error.dev.impl として参照されます。
  * {@inlineSource}
 */
export class TyperImplementationError extends TyperDevelopError {
    constructor(message, option) { super(message, option); this.name = 'TyperImplementationError'; }
}
/**
 * 到達不能なコードパスに到達した場合のエラー。
 * 【API公開】Typer.error.dev.impl.unreachable として参照されます。
  * {@inlineSource}
 */
/*
export class TyperUnreachableError extends TyperImplementationError {
    constructor(message, option) { super(message, option); this.name = 'TyperUnreachableError'; }
}
*/
// --- 階層構造の構築 (Identityの一意性を維持) ---

/** @type {typeof TyperUseError} 利用者責任のエラー階層。  * {@inlineSource}
 */
TyperError.use = TyperUseError;
/** @type {typeof TyperArgumentError} 引数不正に関するエラー階層。  * {@inlineSource}
 */
TyperError.use.arg = TyperArgumentError;
/** @type {typeof TyperTypeSpecError} 型指示値の不正に関するエラー。  * {@inlineSource}
 */
TyperError.use.arg.spec = TyperTypeSpecError;
/** @type {typeof TyperResultError} 判定不一致に関するエラー階層。  * {@inlineSource}
 */
TyperError.use.res = TyperResultError;
/** @type {typeof TyperNotIsError} 完全一致（is）失敗時のエラー。  * {@inlineSource}
 */
TyperError.use.res.notIs = TyperNotIsError;
/** @type {typeof TyperNotOfError} 継承一致（of）失敗時のエラー。  * {@inlineSource}
 */
TyperError.use.res.notOf = TyperNotOfError;

/** @type {typeof TyperECMAScriptError} 言語仕様責任のエラー階層。  * {@inlineSource}
 */
TyperError.ecma = TyperECMAScriptError;
/** @type {typeof TyperBoxedPrimitiveValueError} ボックス化オブジェクトに関するエラー。  * {@inlineSource}
 */
TyperError.ecma.boxedPrim = TyperBoxedPrimitiveValueError;
/** @type {typeof TyperInvalidObjectError} オブジェクト情報欠落に関するエラー。  * {@inlineSource}
 */
TyperError.ecma.invalidObj = TyperInvalidObjectError;
/** @type {typeof TyperUnidentifiableError} 型識別不能に関するエラー。  * {@inlineSource}
 */
TyperError.ecma.unidentifiable = TyperUnidentifiableError;

/** @type {typeof TyperImplementationError} 開発者責任のエラー階層。  * {@inlineSource}
 */
TyperError.dev = TyperImplementationError;
/** @type {typeof TyperImplementationError} Typerの実装上の矛盾に起因するエラー。  * {@inlineSource}
 */
TyperError.dev.impl = TyperImplementationError;
/** @type {typeof TyperUnreachableError} 到達不能エラー。  * {@inlineSource}
 */
//TyperError.dev.unreachable = TyperUnreachableError;

