import { describe, test, expect, spyOn } from "bun:test";
import { TypeSpecifier, ActualValue } from "../../../src/js/part/core.js";
import { 
    TyperTypeSpecError, 
    TyperBoxedPrimitiveValueError, 
    TyperInvalidObjectError, 
    TyperUnidentifiableError 
} from "../../../src/js/part/error.js";
import { i18n } from "../../../src/js/util/i18n/index.js";

// --- 1.1 0.md 準拠の定義 ---
class C { static M() {} m() {} get g() {} }
const c = new C();
class D extends C {}
const d = new D();
function fn() {}
const arrowFn = () => {};
class Integer extends Number {}
const integer = new Integer(1);

// --- 1.2 追加の関数・クラスバリエーション ---
function ES5Class() {}
const es5Instance = new ES5Class();
const asyncFn = async () => {};
const genFn = function* () {};
const dynamicFn = new Function('a', 'return a');
const boundFn = fn.bind(null);

// --- 1.3 数値境界値 (Number) ---
const nums = {
    inf: [
        { name: "Infinity", val: Infinity },
        { name: "-Infinity", val: -Infinity }
    ],
    safe: [
        { name: "Number.MAX_SAFE_INTEGER", val: Number.MAX_SAFE_INTEGER },
        { name: "Number.MAX_SAFE_INTEGER + 1", val: Number.MAX_SAFE_INTEGER + 1 },
        { name: "Number.MIN_SAFE_INTEGER", val: Number.MIN_SAFE_INTEGER },
        { name: "Number.MIN_SAFE_INTEGER - 1", val: Number.MIN_SAFE_INTEGER - 1 }
    ],
    value: [
        { name: "Number.MAX_VALUE", val: Number.MAX_VALUE },
        { name: "Number.MIN_VALUE", val: Number.MIN_VALUE },
        { name: "Number.EPSILON", val: Number.EPSILON }
    ],
    edge: [
        { name: "数値 0", val: 0 },
        { name: "数値 -0", val: -0 },
        { name: "数値 1", val: 1 },
        { name: "数値 -1", val: -1 },
        { name: "浮動小数点数 0.1", val: 0.1 },
        { name: "Math.PI", val: Math.PI }
    ]
};

// --- 1.4 壊れたオブジェクト (InvalidObjectError用) ---
const broken = {
    noConstructor: { __proto__: null }, // constructorプロパティ自体がない
    nullConstructor: { constructor: null },
    undefConstructor: { constructor: undefined },
    noName: { constructor: {} }, // constructorはあるがnameプロパティがない
    emptyName: { constructor: { name: "" } },
    invalidName: { constructor: { name: 123 } }
};

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
            { name: "function(){}", val: function() {} },
            { name: "()=>{}", val: () => {} },
            { name: "class{}", val: class {} },
            { name: "C", val: C },
            { name: "C.M", val: C.M },
            { name: "c.m", val: c.m },
            { name: "fn", val: fn },
            { name: "arrowFn", val: arrowFn },
            { name: "Date", val: Date },
            { name: "Array.prototype.map", val: Array.prototype.map },
            { name: "fn.bind(null)", val: boundFn },
            { name: "Array", val: Array },
            { name: "Object", val: Object },
            { name: "Function", val: Function },
            { name: "Number", val: Number },
            { name: "Boolean", val: Boolean },
            { name: "BigInt", val: BigInt },
            { name: "String", val: String },
            { name: "Symbol", val: Symbol },
            // 追加分
            { name: "ES5Class", val: ES5Class },
            { name: "asyncFn", val: asyncFn },
            { name: "genFn", val: genFn },
            { name: "dynamicFn", val: dynamicFn },
            { name: "Uint8Array", val: Uint8Array },
            { name: "Intl.DateTimeFormat", val: Intl.DateTimeFormat }
        ],
        invalid: [
            // 0.md 準拠
            { name: "false", val: false },
            { name: "true", val: true },
            { name: "数値 0", val: 0 },
            { name: "BigInt 0n", val: 0n },
            { name: "空文字 ''", val: '' },
            { name: "Symbol()", val: Symbol() },
            { name: "配列 []", val: [] },
            { name: "オブジェクト {}", val: {} },
            { name: "new Date()", val: new Date() },
            { name: "c (インスタンス)", val: c },
            { name: "Object.create(null)", val: Object.create(null) },
            // 境界値
            ...nums.inf, ...nums.safe, ...nums.value, ...nums.edge,
            // その他
            { name: "BigInt 1n", val: 1n },
            { name: "文字列 'a'", val: 'a' },
            { name: "d (Dインスタンス)", val: d },
            { name: "es5Instance", val: es5Instance },
            { name: "new Uint8Array()", val: new Uint8Array() },
            { name: "Math (名前空間)", val: Math },
            { name: "JSON (名前空間)", val: JSON },
            // 壊れたオブジェクト
            { name: "constructor欠落", val: broken.noConstructor },
            { name: "constructorがnull", val: broken.nullConstructor },
            { name: "constructor.name欠落", val: broken.noName },
            { name: "constructor.nameが空文字", val: broken.emptyName }
        ]
    },
    // ActualValue.valid() / getSpecifier() 検証用
    values: {
        // 0.md 準拠のボックス化オブジェクト
        boxed: [
            { name: "new Boolean()", val: new Boolean(true), tag: "Boolean" },
            { name: "new Number()", val: new Number(1), tag: "Number" },
            { name: "new String()", val: new String("a"), tag: "String" }
        ],
        // 識別マッピング (値 -> 期待される型指定子)
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











describe("part/core.js: 型指定子および対象値の網羅的検証", () => {

    // i18n メッセージの整合性確認のため、現在の言語設定のファイルをインポート
    // (test.js の環境変数 TEST_LANG を使用)

    describe("TypeSpecifier クラスの検証", () => {
        
        describe("static valid(typeSpecifier)", () => {
            describe("正常系: 真を返すケース", () => {
                // test.each(有効な型指定子)
            });
            describe("異常系: 例外を送出するケース", () => {
                // test.each(無効な型指定子)
                // 期待値: TyperTypeSpecError かつ i18n.typeSpecifier() の文言
            });
        });

        describe("static getName(typeSpecifier)", () => {
            describe("定数系", () => {
                // NaN -> "NaN", null -> "Null", undefined -> "Undefined"
            });
            describe("コンストラクタ系", () => {
                // Number -> "Number", Date -> "Date" 等
            });
            describe("名前のない関数（フォールバック）", () => {
                // () => {} -> "Function"
            });
        });
    });

    describe("ActualValue クラスの検証", () => {

        describe("static valid(value)", () => {
            describe("正常系: 真を返すケース", () => {
                // test.each(プリミティブ、通常のインスタンス、コンテナ等)
            });
            describe("異常系: 例外を送出するケース", () => {
                // test.each(ボックス化オブジェクト)
                // 期待値: TyperBoxedPrimitiveValueError かつ i18n.boxedPrimitive(...) の文言
            });
        });

        describe("static getSpecifier(value)", () => {
            describe("マッピング検証: 正しい型指定子が抽出されること", () => {
                // test.each(識別マッピング)
                // Constant, Primitive, Container, Function, Instance の各ルートを網羅
            });

            describe("異常系: 型を識別できないケース", () => {
                describe("TyperInvalidObjectError が送出されるケース", () => {
                    // test.each(特殊なオブジェクト: constructor欠落, name欠落)
                    // 期待値: i18n.invalidObject(bool) の文言
                });
                describe("TyperUnidentifiableError が送出されるケース", () => {
                    // 言語仕様上の矛盾（document.all 等）
                    // 期待値: i18n.unidentifiable(...) の文言
                });
            });
        });

        describe("static getName(value)", () => {
            describe("正常系: 値から正しい型名が得られること", () => {
                // test.each(識別マッピングをベースに、getNameの結果を検証)
            });
        });
    });
});

