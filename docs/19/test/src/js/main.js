import { describe, test, expect } from "bun:test";
// 修正: ../ を一つ減らして 3つ (../../../) にする
import { Typer } from "../../../src/js/main.js";

// 比較検証用の原本クラスとデータをインポート
import { TypeSpecifier, ActualValue } from "../../../src/js/part/core.js";
import { 
    TyperError, 
    TyperNotIsError, 
    TyperNotOfError,
    TyperTypeSpecError,
    TyperBoxedPrimitiveValueError
} from "../../../src/js/part/error.js";
import { i18n } from "../../../src/js/util/i18n/index.js";

// 修正: test/data.js へのパスは 2回遡る (../../)
import { data, C, c, D, d, Integer, integer } from "../../data.js";

/*
// 1. 環境変数からテスト対象のバンドルを動的にインポート
const bundle = await import(process.env.TEST_BUNDLE_PATH);

// 2. Typer クラスの取得 (ESM なら bundle から、IIFE ならグローバルから)
const Typer = bundle.Typer || globalThis.Typer;

if (!Typer) {
    throw new Error(`Typer クラスの取得に失敗しました: ${process.env.TEST_BUNDLE_PATH}`);
}
*/

describe("main.js: Typer クラス（ファサード）の網羅的検証", () => {

    describe("静的ゲッター (Static Getters)", () => {
        test("specifier: TypeSpecifier クラスを返すこと", () => expect(Typer.specifier).toBe(TypeSpecifier));
        test("value: ActualValue クラスを返すこと", () => expect(Typer.value).toBe(ActualValue));
        test("error: TyperError クラスを返すこと", () => expect(Typer.error).toBe(TyperError));
    });

    describe("静的メソッド: is(typeSpecifier, actualValue, label, throwable)", () => {
        
        describe("正常系: 真を返す（完全一致）", () => {
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
            test("TyperTypeSpecError の透過", () => {
                try {
                    Typer.is(123, "any");
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperTypeSpecError);
                    expect(e.message).toBe(i18n.typeSpecifier());
                }
            });
        });
    });

    describe("静的メソッド: of(typeSpecifier, actualValue, label, throwable)", () => {
        
        describe("正常系: 真を返す（完全一致または継承関係）", () => {
            test.each(data.values.mapping)("完全一致: $name", ({ val, exp }) => {
                expect(Typer.of(exp, val)).toBe(true);
            });

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
    });

    describe("シングルトン・インスタンス", () => {
        test("thrower: 常に同じインスタンスを返し、例外を送出する設定であること", () => {
            const t1 = Typer.thrower;
            const t2 = Typer.thrower;
            expect(t1).toBe(t2);
            expect(() => t1.is(Number, "s")).toThrow(TyperNotIsError);
        });

        test("booler: 常に同じインスタンスを返し、false を返す設定であること", () => {
            const b1 = Typer.booler;
            const b2 = Typer.booler;
            expect(b1).toBe(b2);
            expect(b1.is(Number, "s")).toBe(false);
        });
    });

    describe("インスタンスメソッド", () => {
        test("constructor が内部状態 (_) を正しく保持すること", () => {
            const instance = new Typer(true);
            expect(instance._.throwable).toBe(true);
        });

        test("is() がインスタンスの設定に従うこと", () => {
            const instance = new Typer(false);
            expect(instance.is(Number, "s")).toBe(false);
        });
    });
});

