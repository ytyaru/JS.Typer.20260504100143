import { describe, test, expect } from "bun:test";
// バンドルではなく、原本を直接インポート
import { Typer } from "../../../src/js/main.js";

// 比較用の原本クラスとデータをインポート
import { TypeSpecifier, ActualValue } from "../../../src/js/part/core.js";
import { TyperError, TyperNotIsError, TyperNotOfError } from "../../../src/js/part/error.js";

//import { describe, test, expect } from "bun:test";
// ビルド済み成果物から Typer をインポート
//const { Typer } = await import(process.env.TEST_BUNDLE_PATH);

// 比較検証用の原本クラスとデータをインポート
import { TypeSpecifier, ActualValue } from "../../src/js/part/core.js";
import { 
    TyperError, 
    TyperNotIsError, 
    TyperNotOfError,
    TyperTypeSpecError,
    TyperBoxedPrimitiveValueError,
    TyperInvalidObjectError
} from "../../src/js/part/error.js";
import { i18n } from "../../src/js/util/i18n/index.js";
import { data, C, D, d, Integer, integer, broken } from "../data.js";

describe("main.js: Typer クラス（ファサード）の網羅的検証", () => {

    describe("静的ゲッター (Static Getters)", () => {
        test("specifier: TypeSpecifier クラスを返すこと", () => expect(Typer.specifier).toBe(TypeSpecifier));
        test("value: ActualValue クラスを返すこと", () => expect(Typer.value).toBe(ActualValue));
        test("error: TyperError クラスを返すこと", () => expect(Typer.error).toBe(TyperError));
    });

    describe("静的メソッド: is(typeSpecifier, actualValue, label, throwable)", () => {
        
        describe("正常系: 真を返す（完全一致）", () => {
            // data.values.mapping の全パターンを投入
            test.each(data.values.mapping)("$name", ({ val, exp }) => {
                expect(Typer.is(exp, val)).toBe(true);
            });
        });

        describe("異常系: 偽を返す (throwable: false)", () => {
            const mismatchCases = [
                { name: "型違い: Number, 's'", type: Number, val: "s" },
                { name: "継承関係のみ: C, d", type: C, val: d },
                { name: "コンテナ違い: Object, []", type: Object, val: [] }
            ];
            test.each(mismatchCases)("$name", ({ type, val }) => {
                expect(Typer.is(type, val, null, false)).toBe(false);
            });
        });

        describe("異常系: 不一致例外を送出 (throwable: true)", () => {
            test("TyperNotIsError の型とメッセージの検証", () => {
                const label = "テスト";
                try {
                    Typer.is(Number, "string", label, true);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperNotIsError);
                    expect(e.message).toBe(i18n.mismatch("Number", "String", label));
                }
            });
        });

        describe("異常系: core.js 由来の例外を透過", () => {
            test.each(data.specifiers.invalid)("型指定子不正: $name", ({ val }) => {
                try {
                    Typer.is(val, "any");
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperTypeSpecError);
                    expect(e.message).toBe(i18n.typeSpecifier());
                }
            });

            test.each(data.values.boxed)("ボックス化オブジェクト: $name", ({ val, tag }) => {
                try {
                    Typer.is(Object, val);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperBoxedPrimitiveValueError);
                    expect(e.message).toBe(i18n.boxedPrimitive(val, tag));
                }
            });
        });
    });

    describe("静的メソッド: of(typeSpecifier, actualValue, label, throwable)", () => {
        
        describe("正常系: 真を返す（完全一致または継承関係）", () => {
            // 1. 完全一致（mappingデータすべて）
            test.each(data.values.mapping)("完全一致: $name", ({ val, exp }) => {
                expect(Typer.of(exp, val)).toBe(true);
            });

            // 2. 継承関係による救済
            const inheritanceCases = [
                { name: "クラス継承: C, d", type: C, val: d },
                { name: "プリミティブ継承: Number, integer", type: Number, val: integer },
                { name: "Object継承: Object, c", type: Object, val: c }
            ];
            test.each(inheritanceCases)("継承救済: $name", ({ type, val }) => {
                expect(Typer.of(type, val)).toBe(true);
            });
        });

        describe("異常系: 偽を返す (throwable: false)", () => {
            const failCases = [
                { name: "型違い: String, 0", type: String, val: 0 },
                { name: "逆継承: D, c", type: D, val: c }
            ];
            test.each(failCases)("$name", ({ type, val }) => {
                expect(Typer.of(type, val, null, false)).toBe(false);
            });
        });

        describe("異常系: 不一致例外を送出 (throwable: true)", () => {
            test("TyperNotOfError の型とメッセージの検証", () => {
                const label = "フラグ";
                try {
                    Typer.of(Boolean, "true", label, true);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperNotOfError);
                    expect(e.message).toBe(i18n.mismatch("Boolean", "String", label));
                }
            });
        });

        describe("異常系: core.js 由来の例外を透過", () => {
            test.each(data.specifiers.invalid)("型指定子不正: $name", ({ val }) => {
                try {
                    Typer.of(val, "any");
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperTypeSpecError);
                }
            });
        });
    });

    describe("シングルトン・インスタンス (Singleton Instances)", () => {
        
        describe("static get thrower()", () => {
            test("Typer のインスタンスを返すこと", () => {
                expect(Typer.thrower).toBeInstanceOf(Typer);
            });

            test("常に同じインスタンスを返すこと（キャッシュの検証）", () => {
                const first = Typer.thrower;
                const second = Typer.thrower;
                expect(first).toBe(second);
            });

            test("is(): 失敗時に例外を送出する設定であること", () => {
                try {
                    Typer.thrower.is(Number, "string");
                    expect.unreachable();
                } catch (error) {
                    expect(error).toBeInstanceOf(TyperNotIsError);
                }
            });
        });

        describe("static get booler()", () => {
            test("Typer のインスタンスを返すこと", () => {
                expect(Typer.booler).toBeInstanceOf(Typer);
            });

            test("常に同じインスタンスを返すこと（キャッシュの検証）", () => {
                const first = Typer.booler;
                const second = Typer.booler;
                expect(first).toBe(second);
            });

            test("is(): 失敗時に false を返す設定であること", () => {
                const result = Typer.booler.is(Number, "string");
                expect(result).toBe(false);
            });
        });

        test("thrower と booler は異なるインスタンスであること", () => {
            expect(Typer.thrower).not.toBe(Typer.booler);
        });
    });

    describe("インスタンスメソッド (Instance Methods)", () => {
        
        describe("constructor(throwable)", () => {
            test("引数なしの場合、throwable は false に設定されること", () => {
                const instance = new Typer();
                expect(instance._.throwable).toBe(false);
            });

            test("throwable: true が正しく設定されること", () => {
                const instance = new Typer(true);
                expect(instance._.throwable).toBe(true);
            });
        });

        describe("is(typeSpecifier, actualValue, label)", () => {
            const type = Number;
            const value = "string";
            const label = "インスタンス検証";

            test("throwable: true のインスタンスは例外を送出すること", () => {
                const instance = new Typer(true);
                try {
                    instance.is(type, value, label);
                    expect.unreachable();
                } catch (error) {
                    expect(error).toBeInstanceOf(TyperNotIsError);
                    expect(error.message).toBe(i18n.mismatch("Number", "String", label));
                }
            });

            test("throwable: false のインスタンスは false を返すこと", () => {
                const instance = new Typer(false);
                const result = instance.is(type, value, label);
                expect(result).toBe(false);
            });
        });

        describe("of(typeSpecifier, actualValue, label)", () => {
            const type = String;
            const value = 123;
            const label = "継承インスタンス検証";

            test("throwable: true のインスタンスは例外を送出すること", () => {
                const instance = new Typer(true);
                try {
                    instance.of(type, value, label);
                    expect.unreachable();
                } catch (error) {
                    expect(error).toBeInstanceOf(TyperNotOfError);
                    expect(error.message).toBe(i18n.mismatch("String", "Number", label));
                }
            });

            test("throwable: false のインスタンスは false を返すこと", () => {
                const instance = new Typer(false);
                const result = instance.of(type, value, label);
                expect(result).toBe(false);
            });

            test("継承関係がある場合は true を返すこと", () => {
                const instance = new Typer(true); // 送出設定でも成功時は true
                expect(instance.of(C, d)).toBe(true);
            });
        });
    });

    describe("カバレッジ補完", () => {
        test("Typer クラスの暗黙のコンストラクタ（静的初期化）をカバーする", () => {
            // 静的プロパティへのアクセスは既に済んでいるが、
            // クラス全体の評価を確実にする
            expect(Typer).toBeDefined();
        });
    });


});

