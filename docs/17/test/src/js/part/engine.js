import { describe, test, expect } from "bun:test";
import { TyperEngine } from "../../../src/js/part/engine.js";
import { 
    TyperTypeSpecError, 
    TyperBoxedPrimitiveValueError 
} from "../../../src/js/part/error.js";
import { i18n } from "../../../src/js/util/i18n/index.js";

// --- 1. テスト用実体の定義 (0.md + 境界値 + 異常系 + 内部パーツ用) ---

// 0.md 準拠のクラス・関数・インスタンス
class C { static M() {} m() {} get g() {} }
const c = new C();
class D extends C {}
const d = new D();
function fn() {}
const arrowFn = () => {};
class Integer extends Number {}
const integer = new Integer(1);

// 追加の関数・クラスバリエーション
function ES5Class() {}
const es5Instance = new ES5Class();
const asyncFn = async () => {};
const genFn = function* () {};
const dynamicFn = new Function('a', 'return a');
const boundFn = fn.bind(null);
const proxyFn = new Proxy(function() {}, {});

// 特殊なオブジェクト
const proxyObj = new Proxy({}, {});
const argsObj = (function() { return arguments; })();
const nullProtoObj = Object.create(null);
const propertyDescriptor = Object.getOwnPropertyDescriptor(C.prototype, 'g');
const objWithToStringTag = { [Symbol.toStringTag]: "Custom" };

// 壊れたオブジェクト (InvalidObjectError用)
const broken = {
    noConstructor: { __proto__: null },
    nullConstructor: { constructor: null },
    undefConstructor: { constructor: undefined },
    noName: { constructor: {} },
    emptyName: { constructor: { name: "" } },
    invalidName: { constructor: { name: 123 } }
};

// 矛盾オブジェクト (UnidentifiableError用)
// ※typeofを偽装できないため、構造上の特異点として定義
const mockDocumentAll = new Proxy({}, {
    get: (target, prop) => (prop === Symbol.toPrimitive) ? () => undefined : target[prop],
});

// --- 2. テストデータマトリックスの構築 ---

const data = {
    // TypeSpecifier.valid() 検証用
    specifiers: {
        valid: [
            // 定数
            { name: "NaN", val: NaN },
            { name: "null", val: null },
            { name: "undefined", val: undefined },
            // 0.md 準拠の Callable
            { name: "匿名関数 function(){}", val: function() {} },
            { name: "アロー関数 ()=>{}", val: () => {} },
            { name: "匿名クラス class{}", val: class {} },
            { name: "クラス C", val: C },
            { name: "クラス D", val: D },
            { name: "クラス Integer", val: Integer },
            { name: "静的メソッド C.M", val: C.M },
            { name: "インスタンスメソッド c.m", val: c.m },
            { name: "関数 fn", val: fn },
            { name: "アロー関数 arrowFn", val: arrowFn },
            { name: "組み込みクラス Date", val: Date },
            { name: "Array.prototype.map", val: Array.prototype.map },
            { name: "fn.bind(null)", val: boundFn },
            { name: "組み込みコンストラクタ Array", val: Array },
            { name: "組み込みコンストラクタ Object", val: Object },
            { name: "組み込みコンストラクタ Function", val: Function },
            { name: "組み込みコンストラクタ Number", val: Number },
            { name: "組み込みコンストラクタ Boolean", val: Boolean },
            { name: "組み込みコンストラクタ BigInt", val: BigInt },
            { name: "組み込みコンストラクタ String", val: String },
            { name: "組み込みコンストラクタ Symbol", val: Symbol },
            // 追加の Callable
            { name: "ES5クラス ES5Class", val: ES5Class },
            { name: "非同期関数 asyncFn", val: asyncFn },
            { name: "ジェネレータ関数 genFn", val: genFn },
            { name: "動的生成関数 new Function()", val: dynamicFn },
            { name: "関数Proxy", val: proxyFn },
            { name: "Intl.DateTimeFormat", val: Intl.DateTimeFormat },
            { name: "Uint8Array", val: Uint8Array }
        ],
        invalid: [
            // プリミティブ値
            { name: "Boolean true", val: true },
            { name: "Boolean false", val: false },
            { name: "BigInt 0n", val: 0n },
            { name: "BigInt 1n", val: 1n },
            { name: "空文字 ''", val: '' },
            { name: "空白文字 ' '", val: ' ' },
            { name: "文字列 'abc'", val: 'abc' },
            { name: "Symbol()", val: Symbol() },
            { name: "Symbol.for('a')", val: Symbol.for('a') },
            { name: "Symbol.iterator", val: Symbol.iterator },
            // 数値境界値
            { name: "数値 0", val: 0 },
            { name: "数値 -0", val: -0 },
            { name: "数値 1", val: 1 },
            { name: "数値 -1", val: -1 },
            { name: "浮動小数点数 0.1", val: 0.1 },
            { name: "Math.PI", val: Math.PI },
            { name: "Infinity", val: Infinity },
            { name: "-Infinity", val: -Infinity },
            { name: "Number.MAX_SAFE_INTEGER", val: Number.MAX_SAFE_INTEGER },
            { name: "Number.MAX_SAFE_INTEGER + 1", val: Number.MAX_SAFE_INTEGER + 1 },
            { name: "Number.MIN_SAFE_INTEGER", val: Number.MIN_SAFE_INTEGER },
            { name: "Number.MIN_SAFE_INTEGER - 1", val: Number.MIN_SAFE_INTEGER - 1 },
            { name: "Number.MAX_VALUE", val: Number.MAX_VALUE },
            { name: "Number.MIN_VALUE", val: Number.MIN_VALUE },
            { name: "Number.EPSILON", val: Number.EPSILON },
            // インスタンス・オブジェクト
            { name: "配列 []", val: [] },
            { name: "オブジェクト {}", val: {} },
            { name: "new Date()", val: new Date() },
            { name: "new RegExp()", val: new RegExp() },
            { name: "new Error()", val: new Error() },
            { name: "new Uint8Array()", val: new Uint8Array() },
            { name: "クラスインスタンス c", val: c },
            { name: "クラスインスタンス d", val: d },
            { name: "クラスインスタンス integer", val: integer },
            { name: "ES5インスタンス es5Instance", val: es5Instance },
            { name: "Argumentsオブジェクト", val: argsObj },
            { name: "Object.create(null)", val: nullProtoObj },
            { name: "プロパティ記述子", val: propertyDescriptor },
            { name: "オブジェクトProxy", val: proxyObj },
            { name: "Symbol.toStringTagを持つオブジェクト", val: objWithToStringTag },
            // ボックス化オブジェクト
            { name: "new Number(1)", val: new Number(1) },
            { name: "new String('a')", val: new String('a') },
            { name: "new Boolean(true)", val: new Boolean(true) },
            // 名前空間オブジェクト
            { name: "Math", val: Math },
            { name: "JSON", val: JSON },
            { name: "Atomics", val: Atomics },
            { name: "Reflect", val: Reflect },
            // 壊れたオブジェクト
            { name: "constructor欠落", val: broken.noConstructor },
            { name: "constructorがnull", val: broken.nullConstructor },
            { name: "constructorがundefined", val: broken.undefConstructor },
            { name: "constructor.name欠落", val: broken.noName },
            { name: "constructor.nameが空文字", val: broken.emptyName },
            { name: "constructor.nameが不正な型", val: broken.invalidName },
            // 矛盾オブジェクト
            { name: "矛盾オブジェクト (mockDocumentAll)", val: mockDocumentAll }
        ]
    },
    // ActualValue.valid() / getSpecifier() 検証用
    values: {
        boxed: [
            { name: "new Boolean()", val: new Boolean(true), tag: "Boolean" },
            { name: "new Number()", val: new Number(1), tag: "Number" },
            { name: "new String()", val: new String("a"), tag: "String" }
        ],
        mapping: [
            { name: "NaN", val: NaN, exp: NaN },
            { name: "null", val: null, exp: null },
            { name: "undefined", val: undefined, exp: undefined },
            { name: "false", val: false, exp: Boolean },
            { name: "数値 0", val: 0, exp: Number },
            { name: "BigInt 0n", val: 0n, exp: BigInt },
            { name: "空文字 ''", val: '', exp: String },
            { name: "Symbol()", val: Symbol(), exp: Symbol },
            { name: "配列 []", val: [], exp: Array },
            { name: "オブジェクト {}", val: {}, exp: Object },
            { name: "new Date()", val: new Date(), exp: Date },
            { name: "c (Cインスタンス)", val: c, exp: C },
            { name: "d (Dインスタンス)", val: d, exp: D },
            { name: "integer (Integerインスタンス)", val: integer, exp: Integer },
            { name: "Object.create(null)", val: Object.create(null), exp: Object },
            { name: "fn (関数)", val: fn, exp: Function },
            { name: "arrowFn (アロー関数)", val: arrowFn, exp: Function }
        ]
    }
};
// --- 3. テスト実行 ---

describe("part/engine.js", () => {
    describe("class TyperEngine", () => {

        describe("static isLogic(typeSpecifier, actualValue)", () => {
            describe("真を返す: 完全一致するペア", () => {
                // data.values.mapping はすべて「正解」のペアなので、isLogic は true になるべき
                test.each(data.values.mapping)("$name", ({ val, exp }) => {
                    expect(TyperEngine.isLogic(exp, val)).toBe(true);
                });
            });

            describe("偽を返す: 型が異なる、または継承関係のみのペア", () => {
                const mismatchCases = [
                    { name: "型違い: Number, '123'", type: Number, val: "123" },
                    { name: "継承関係(子): C, d", type: C, val: d },
                    { name: "継承関係(プリミティブ): Number, integer", type: Number, val: integer },
                    { name: "コンテナ違い: Object, []", type: Object, val: [] }
                ];
                test.each(mismatchCases)("$name", ({ type, val }) => {
                    expect(TyperEngine.isLogic(type, val)).toBe(false);
                });
            });

            describe("例外を透過: core.js のバリデーション", () => {
                test.each(data.specifiers.invalid)("型指定子不正: $name", ({ val }) => {
                    try {
                        TyperEngine.isLogic(val, 123);
                        expect.unreachable();
                    } catch (e) {
                        expect(e).toBeInstanceOf(TyperTypeSpecError);
                        expect(e.message).toBe(i18n.typeSpecifier());
                    }
                });

                test.each(data.values.boxed)("ボックス化オブジェクト: $name", ({ val, tag }) => {
                    try {
                        TyperEngine.isLogic(Number, val);
                        expect.unreachable();
                    } catch (e) {
                        expect(e).toBeInstanceOf(TyperBoxedPrimitiveValueError);
                        expect(e.message).toBe(i18n.boxedPrimitive(val, tag));
                    }
                });
            });
        });

        describe("static ofLogic(typeSpecifier, actualValue)", () => {
            describe("真を返す: 完全一致または継承関係があるペア", () => {
                // 1. 完全一致（mappingデータすべて）
                test.each(data.values.mapping)("完全一致: $name", ({ val, exp }) => {
                    expect(TyperEngine.ofLogic(exp, val)).toBe(true);
                });

                // 2. 継承関係による救済（engine.js 独自のロジック）
                const inheritanceCases = [
                    { name: "C, d (クラス継承)", type: C, val: d },
                    { name: "Number, integer (プリミティブ継承)", type: Number, val: integer },
                    { name: "Object, c (全インスタンスはObject継承)", type: Object, val: c }
                ];
                test.each(inheritanceCases)("継承救済: $name", ({ type, val }) => {
                    expect(TyperEngine.ofLogic(type, val)).toBe(true);
                });
            });

            describe("偽を返す: 継承関係すらないペア", () => {
                const failCases = [
                    { name: "D, c (親クラスは不可)", type: D, val: c },
                    { name: "String, 123", type: String, val: 123 },
                    { name: "Boolean, 0", type: Boolean, val: 0 }
                ];
                test.each(failCases)("$name", ({ type, val }) => {
                    expect(TyperEngine.ofLogic(type, val)).toBe(false);
                });
            });

            describe("例外を透過", () => {
                test.each(data.specifiers.invalid)("型指定子不正: $name", ({ val }) => {
                    try {
                        TyperEngine.ofLogic(val, 123);
                        expect.unreachable();
                    } catch (e) {
                        expect(e).toBeInstanceOf(TyperTypeSpecError);
                    }
                });
            });
        });

        describe("カバレッジ補完", () => {
            test("インスタンス化が可能であること", () => {
                expect(new TyperEngine()).toBeDefined();
            });
        });
    });
});

