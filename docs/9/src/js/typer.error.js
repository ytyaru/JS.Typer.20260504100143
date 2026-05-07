class TyperError extends TypeError {
    static is(v) { return v instanceof this && v.constructor === this; }
    static of(v) { return v instanceof this; }
    constructor(message, option) {
        super(message, option);
        this.name = 'TyperError';
    }
    is(t) { return this instanceof t && this.constructor === t; }
    of(t) { return this instanceof t; }
}

// --- ECMAScript 責任 ---
class TyperECMAScriptError extends TyperError {
    constructor(message, option) { super(message, option); this.name = 'TyperECMAScriptError'; }
}
class TyperBoxedPrimitiveValueError extends TyperECMAScriptError {
    constructor(message, option) { super(message, option); this.name = 'TyperBoxedPrimitiveValueError'; }
}
class TyperInvalidObjectError extends TyperECMAScriptError {
    constructor(message, option) { super(message, option); this.name = 'TyperInvalidObjectError'; }
}
class TyperUnidentifiableError extends TyperECMAScriptError {
    constructor(message, option) { super(message, option); this.name = 'TyperUnidentifiableError'; }
}

// --- 開発者 責任 ---
class TyperDevelopError extends TyperError {
    constructor(message, option) { super(message, option); this.name = 'TyperDevelopError'; }
}
class TyperImplementationError extends TyperDevelopError {
    constructor(message, option) { super(message, option); this.name = 'TyperImplementationError'; }
}
class TyperUnreachableError extends TyperImplementationError {
    constructor(message, option) { super(message, option); this.name = 'TyperUnreachableError'; }
}
class TyperUnexpectedError extends TyperDevelopError {
    constructor(message, option) { super(message, option); this.name = 'TyperUnexpectedError'; }
}

// --- 利用者 責任 ---
class TyperUseError extends TyperError {
    constructor(message, option) { super(message, option); this.name = 'TyperUseError'; }
}
class TyperArgumentError extends TyperUseError {
    constructor(message, option) { super(message, option); this.name = 'TyperArgumentError'; }
}
class TyperTypeSpecError extends TyperArgumentError {
    constructor(message, option) { super(message, option); this.name = 'TyperTypeSpecError'; }
}
class TyperResultError extends TyperUseError {
    constructor(message, option) { super(message, option); this.name = 'TyperResultError'; }
}
class TyperNotIsError extends TyperResultError {
    constructor(message, option) { super(message, option); this.name = 'TyperNotIsError'; }
}
class TyperNotOfError extends TyperResultError {
    constructor(message, option) { super(message, option); this.name = 'TyperNotOfError'; }
}

// 階層構造の構築
TyperError.ecma = TyperECMAScriptError;
TyperError.ecma.boxedPrim = TyperBoxedPrimitiveValueError;
TyperError.ecma.invalidObj = TyperInvalidObjectError;
TyperError.ecma.unidentifiable = TyperUnidentifiableError;

TyperError.dev = TyperDevelopError;
TyperError.dev.impl = TyperImplementationError;
TyperError.dev.impl.unreachable = TyperUnreachableError;
TyperError.dev.unexpected = TyperUnexpectedError;

TyperError.use = TyperUseError;
TyperError.use.arg = TyperArgumentError;
TyperError.use.arg.spec = TyperTypeSpecError;
TyperError.use.res = TyperResultError;
TyperError.use.res.notIs = TyperNotIsError;
TyperError.use.res.notOf = TyperNotOfError;
