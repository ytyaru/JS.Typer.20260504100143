import { describe, test, expect } from "bun:test";
import { data, C, c, D, d } from "../../data.js";

/**
 * ビルド成果物（bundle.js）の最終疎通確認テスト
 */

// 1. 環境変数からテスト対象のパスを取得
const bundlePath = process.env.TEST_BUNDLE_PATH;
let Typer;

// 2. 形式（ESM/IIFE）に応じてロード方法を切り替える
if (bundlePath.includes("/esm/")) {
    // ESM形式: 名前付きエクスポートから取得
    const bundle = await import(bundlePath);
    Typer = bundle.Typer;
} else {
    // IIFE形式: 
    // 1. 以前のテストによる globalThis.Typer の残骸を掃除
    delete globalThis.Typer;
    // 2. 成果物をインポート（実行され、プラグインが注入した globalThis.Typer = Typer が走る）
    await import(bundlePath);
    // 3. グローバルから取得
    Typer = globalThis.Typer;
}

if (!Typer) {
    throw new Error(`Typer クラスの取得に失敗しました: ${bundlePath}`);
}

// 3. 比較用の「正解」メッセージを原本（src）からインポート
const { i18n } = await import(`../../../src/js/util/i18n/${process.env.TEST_LANG}.js`);


describe(`成果物検証: ${process.env.TEST_BUNDLE_PATH}`, () => {

    describe("公開APIの生存確認 (Minify耐性テスト)", () => {
        test("Typer クラスが正しくエクスポートされていること", () => {
            expect(Typer).toBeDefined();
            expect(typeof Typer.is).toBe("function");
            expect(typeof Typer.of).toBe("function");
        });

        test("Typer.error 階層が保持されていること", () => {
            expect(Typer.error.use.arg.spec).toBeDefined();
            expect(Typer.error.ecma.unidentifiable).toBeDefined();
        });
    });

    describe("ロジックとメッセージの結合確認 (i18n埋め込みテスト)", () => {
        
        test("is(): 正常系 (Number)", () => {
            expect(Typer.is(Number, 123)).toBe(true);
        });

        test("is(): 異常系 (不一致例外とメッセージ)", () => {
            const label = "テスト";
            try {
                Typer.is(Number, "string", label);
                expect.unreachable();
            } catch (error) {
                // 成果物内の例外クラスを使って判定
                expect(error).toBeInstanceOf(Typer.error.use.res.notIs);
                // 原本の定義（i18n）と成果物の出力が一致するか検証
                expect(error.message).toBe(i18n.mismatch("Number", "String", label));
            }
        });

        test("of(): 正常系 (継承関係)", () => {
            // 成果物内のロジックが正しく結合されているか確認
            expect(Typer.of(C, d)).toBe(true);
        });

        test("of(): 異常系 (不一致例外)", () => {
            try {
                Typer.of(D, c);
                expect.unreachable();
            } catch (error) {
                expect(error).toBeInstanceOf(Typer.error.use.res.notOf);
            }
        });
    });

    describe("シングルトン・インスタンスの動作確認", () => {
        test("thrower: 失敗時に例外を送出すること", () => {
            expect(() => Typer.thrower.is(Number, "s")).toThrow();
        });

        test("booler: 失敗時に false を返すこと", () => {
            expect(Typer.booler.is(Number, "s")).toBe(false);
        });
    });
});

