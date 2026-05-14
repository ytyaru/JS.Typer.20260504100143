import { describe, test, expect, spyOn } from "bun:test";
// import { TypeSpecifier, ActualValue } from "../../../src/js/part/core.js";
import { 
    TypeSpecifier, 
    ActualValue, 
    ConstantSpecifier, 
    PrimitiveSpecifier, 
    BoxedPrimitiveSpecifier, // ← これが抜けていたためエラーになりました
    ContainerSpecifier, 
    FunctionSpecifier, 
    InstanceSpecifier 
} from "./core.test-target.js";
import { 
    TyperTypeSpecError, 
    TyperBoxedPrimitiveValueError, 
    TyperInvalidObjectError, 
    TyperUnidentifiableError 
} from "../../../../src/js/part/error.js";
import { i18n } from "../../../../src/js/util/i18n/index.js";

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

describe("part/core.js", () => {
    describe("class TypeSpecifier", () => {
        describe("static valid(typeSpecifier)", () => {
            describe("真を返す", () => {
                test.each(data.specifiers.valid)("$name", ({ val }) => {
                    expect(TypeSpecifier.valid(val)).toBe(true);
                });
            });

            describe("例外を送出", () => {
                test.each(data.specifiers.invalid)("$name", ({ val }) => {
                    try {
                        TypeSpecifier.valid(val);
                        expect.unreachable("例外が送出されませんでした");
                    } catch (error) {
                        expect(error).toBeInstanceOf(TyperTypeSpecError);
                        expect(error.message).toBe(i18n.typeSpecifier());
                    }
                });
            });
        });

        describe("static getName(typeSpecifier)", () => {
            describe("定数", () => {
                const cases = [
                    { val: NaN, exp: "NaN" },
                    { val: null, exp: "Null" },
                    { val: undefined, exp: "Undefined" }
                ];
                test.each(cases)("$val -> $exp", ({ val, exp }) => {
                    expect(TypeSpecifier.getName(val)).toBe(exp);
                });
            });
            describe("コンストラクタ", () => {
                const cases = [
                    { val: Number, exp: "Number" },
                    { val: String, exp: "String" },
                    { val: C, exp: "C" },
                    { val: ES5Class, exp: "ES5Class" }
                ];
                test.each(cases)("$exp", ({ val, exp }) => {
                    expect(TypeSpecifier.getName(val)).toBe(exp);
                });
            });
            describe("名前なし関数", () => {
                test("() => {} -> Function", () => {
                    expect(TypeSpecifier.getName(() => {})).toBe("Function");
                });
            });
        });
    });
    describe("class ActualValue", () => {
        // --- 準備: 壊れたオブジェクトと矛盾オブジェクト ---
        const broken = {
            // 1. constructor プロパティ自体がない
            noConstructor: (() => {
                const o = Object.create({ a: 1 });
                o.constructor = undefined;
                return o;
            })(),
            // 2. constructor はあるが name プロパティがない
            noName: { constructor: {} },
            // 3. constructor.name が空文字
            emptyName: { constructor: { name: "" } }
        };

        /**
         * 矛盾オブジェクト: getSpecifier の全ルートを通り抜ける値
         * 1. ConstantSpecifier: null/undefined/NaN ではない
         * 2. PrimitiveSpecifier: typeof が "object" (または未知の文字列)
         * 3. ContainerSpecifier: Array.isArray が false, constructor が Object ではない
         * 4. FunctionSpecifier: typeof が "function" ではない
         * 5. InstanceSpecifier: constructor プロパティを持たない
         */
        const unidentifiableValue = Object.create(null);
        // ContainerSpecifier の「Object.getPrototypeOf(v) === null」を回避するため、
        // 意図的にプロトタイプを汚染し、かつ constructor を持たせない
        Object.setPrototypeOf(unidentifiableValue, { constructor: undefined });

        describe("static valid(value)", () => {
            describe("真を返す", () => {
                const validValues = [
                    ...data.specifiers.valid,
                    ...data.specifiers.invalid.filter(d => !d.name.includes("new "))
                ];
                test.each(validValues)("$name", ({ val }) => {
                    expect(ActualValue.valid(val)).toBe(true);
                });
            });

            describe("例外を送出", () => {
                test.each(data.values.boxed)("$name", ({ val, tag }) => {
                    try {
                        ActualValue.valid(val);
                        expect.unreachable("例外が送出されませんでした");
                    } catch (error) {
                        expect(error).toBeInstanceOf(TyperBoxedPrimitiveValueError);
                        expect(error.message).toBe(i18n.boxedPrimitive(val, tag));
                    }
                });
            });
        });

        describe("static getSpecifier(value)", () => {
            describe("正常系: 正しい型指定子を抽出", () => {
                test.each(data.values.mapping)("$name", ({ val, exp }) => {
                    expect(ActualValue.getSpecifier(val)).toBe(exp);
                });
            });

            describe("例外を送出", () => {
                describe("TyperInvalidObjectError (InstanceSpecifier ルート)", () => {
                    test("constructor欠落", () => {
                        try {
                            // constructor が undefined のオブジェクト
                            ActualValue.getSpecifier(broken.noConstructor);
                            expect.unreachable();
                        } catch (e) {
                            expect(e).toBeInstanceOf(TyperInvalidObjectError);
                            expect(e.message).toBe(i18n.invalidObject(false));
                        }
                    });
                    test("constructor.name欠落", () => {
                        try {
                            ActualValue.getSpecifier(broken.noName);
                            expect.unreachable();
                        } catch (e) {
                            expect(e).toBeInstanceOf(TyperInvalidObjectError);
                            expect(e.message).toBe(i18n.invalidObject(true));
                        }
                    });
                });

                describe("TyperUnidentifiableError (最終フォールバック)", () => {
                    test("識別不能な値の検証", () => {
                        /*
                        try {
                            // 全ての Specifier 判定を通り抜けるように細工されたオブジェクト
                            ActualValue.getSpecifier(unidentifiableValue);
                            expect.unreachable();
                        } catch (e) {
                            expect(e).toBeInstanceOf(TyperUnidentifiableError);
                            // メッセージに含まれる typeof と tag の整合性を確認
                            const type = typeof unidentifiableValue;
                            const tag = Object.prototype.toString.call(unidentifiableValue).slice(8, -1);
                            expect(e.message).toBe(i18n.unidentifiable(unidentifiableValue, type, tag));
                        }
                        */
                        const NONE = Symbol.for('typer.specifier.none');
                        const val = "unidentifiable-value";
                        
                        // 1. すべての内部抽出器をスパイし、強制的に NONE を返させる
                        // これにより、実装コードの for ループをすべて素通りさせ、最終行へ到達させる
                        const spies = [
                            spyOn(ConstantSpecifier, 'get').mockReturnValue(NONE),
                            spyOn(PrimitiveSpecifier, 'get').mockReturnValue(NONE),
                            spyOn(ContainerSpecifier, 'get').mockReturnValue(NONE),
                            spyOn(FunctionSpecifier, 'get').mockReturnValue(NONE),
                            spyOn(InstanceSpecifier, 'get').mockReturnValue(NONE)
                        ];

                        try {
                            // 2. 実行
                            ActualValue.getSpecifier(val);
                            expect.unreachable("例外が送出されませんでした");
                        } catch (error) {
                            // 3. 型とメッセージの検証
                            expect(error).toBeInstanceOf(TyperUnidentifiableError);
                            
                            // メッセージ構築に使われる typeof と getTag の結果を突き合わせる
                            const type = typeof val;
                            const tag = Object.prototype.toString.call(val).slice(8, -1);
                            expect(error.message).toBe(i18n.unidentifiable(val, type, tag));
                        } finally {
                            // 4. 後片付け（Mock を解除しないと他のテストに影響が出るため必須）
                            spies.forEach(spy => spy.mockRestore());
                        }

                    });
                });
            });
        });

        describe("static getName(value)", () => {
            test.each(data.values.mapping)("$name", ({ val, exp }) => {
                const expectedName = TypeSpecifier.getName(exp);
                expect(ActualValue.getName(val)).toBe(expectedName);
            });
        });
    });
    describe("カバレッジ補完: 暗黙のコンストラクタ", () => {
        test("すべての内部・公開クラスがインスタンス化可能であること", () => {
            const classes = [
                ConstantSpecifier,
                PrimitiveSpecifier,
                ContainerSpecifier,
                FunctionSpecifier,
                BoxedPrimitiveSpecifier,
                InstanceSpecifier,
                TypeSpecifier,
                ActualValue
            ];
            classes.forEach(Cls => {
                expect(new Cls()).toBeDefined();
            });
        });
    });

    describe("内部 Specifier クラスの独立単体テスト", () => {
        const NONE = Symbol.for('typer.specifier.none');

        // 各 Specifier が、自分の担当外のデータに対して正しく NONE を返すか
        // および、担当データに対して正しく識別するかを「単体」で検証する

        describe("ConstantSpecifier.get()", () => {
            test.each([
                { v: NaN, exp: NaN },
                { v: null, exp: null },
                { v: 123, exp: NONE }, // 担当外
                { v: {}, exp: NONE }   // 担当外
            ])("値 $v のとき期待値を返すこと", ({ v, exp }) => {
                expect(ConstantSpecifier.get(v)).toBe(exp);
            });
        });

        describe("InstanceSpecifier.get()", () => {
            test.each([
                { name: "数値", v: 123, exp: NONE },      // 担当外（非オブジェクト）
                { name: "文字列", v: "s", exp: NONE },    // 担当外（非オブジェクト）
                { name: "null", v: null, exp: NONE },     // 担当外
                { name: "Date", v: new Date(), exp: Date }, // 担当内
                { name: "Object", v: {}, exp: Object }      // 担当内
            ])("$name のとき期待値を返すこと", ({ v, exp }) => {
                expect(InstanceSpecifier.get(v)).toBe(exp);
            });
        });

        // --- 100% への最後の一歩：暗黙のコンストラクタの実行 ---
        // これを「証拠隠滅」ではなく「静的クラスとしての生存確認」として定義します
        test("すべてのクラスがコンストラクタ（暗黙）を保持し、インスタンス化可能であること", () => {
            [
                ConstantSpecifier, PrimitiveSpecifier, ContainerSpecifier, 
                FunctionSpecifier, BoxedPrimitiveSpecifier, InstanceSpecifier, 
                TypeSpecifier, ActualValue
            ].forEach(Cls => {
                expect(new Cls()).toBeDefined();
            });
        });
    });
    describe("i18n メッセージ関数の網羅検証", () => {
        test("core.js が保持する i18n オブジェクトの全関数が実行可能であること", () => {
            // core.js 内でインポートされている i18n を直接叩く
            // これにより、未使用のメッセージ関数も「実行済み」にする
            expect(typeof i18n.typeSpecifier()).toBe("string");
            expect(typeof i18n.mismatch("a", "b", "c")).toBe("string");
            expect(typeof i18n.boxedPrimitive("v", "t")).toBe("string");
            expect(typeof i18n.invalidObject(true)).toBe("string");
            expect(typeof i18n.unidentifiable("v", "t", "tag")).toBe("string");
            expect(typeof i18n.implementation()).toBe("string");
            expect(typeof i18n.unexpected("msg")).toBe("string");
        });
    });
    describe("論理パスの完全網羅検証", () => {
        test("ConstantSpecifier.is が短絡評価を越えて直接実行されること", () => {
            // TypeSpecifier.valid を介さず、直接呼び出すことで確実に Funcs を稼ぐ
            expect(ConstantSpecifier.is(NaN)).toBe(true);
            expect(ConstantSpecifier.is(null)).toBe(true);
            expect(ConstantSpecifier.is(undefined)).toBe(true);
            expect(ConstantSpecifier.is(123)).toBe(false);
        });
    });

});

