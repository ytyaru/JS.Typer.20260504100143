import { describe, test, expect } from "bun:test";

/**
 * テスト・オーケストレーターから渡された環境変数を使用して
 * ビルド済み成果物をインポートする
 */
const { Typer } = await import(process.env.TEST_BUNDLE_PATH);
const TyperError = Typer.error;
// TyperUnexpectedError は名前空間に含まれないため個別に取得（exportされている前提）
const { TyperUnexpectedError } = await import(process.env.TEST_BUNDLE_PATH);

describe("part/error.js: 例外クラス構造・名前空間の網羅的検証", () => {

    describe("基底クラス TyperError の根本検証", () => {
        test("TyperError が関数（コンストラクタ）として存在すること", () => {
            expect(typeof TyperError).toBe("function");
        });

        test("TyperError が Error を直接継承していること", () => {
            // prototype を辿って Error のインスタンスであることを確認
            expect(TyperError.prototype).toBeInstanceOf(Error);
        });

        test("TyperError が TypeError を継承していないこと（以前のバグ修正の担保）", () => {
            expect(TyperError.prototype).not.toBeInstanceOf(TypeError);
        });
    });

    describe("エクスポートされた全例外クラスの存在と名称の検証", () => {
        const classEntries = [
            ["TyperError", TyperError],
            ["TyperUnexpectedError", TyperUnexpectedError],
            ["TyperUseError", TyperError.use],
            ["TyperArgumentError", TyperError.use.arg],
            ["TyperTypeSpecError", TyperError.use.arg.spec],
            ["TyperResultError", TyperError.use.res],
            ["TyperNotIsError", TyperError.use.res.notIs],
            ["TyperNotOfError", TyperError.use.res.notOf],
            ["TyperECMAScriptError", TyperError.ecma],
            ["TyperBoxedPrimitiveValueError", TyperError.ecma.boxedPrim],
            ["TyperInvalidObjectError", TyperError.ecma.invalidObj],
            ["TyperUnidentifiableError", TyperError.ecma.unidentifiable],
            ["TyperDevelopError", TyperError.dev], // 実体は ImplementationError
            ["TyperImplementationError", TyperError.dev.impl]
        ];

        test.each(classEntries)("%s クラスが正しく定義され、name プロパティが一致すること", (expectedName, Cls) => {
            expect(Cls).toBeDefined();
            expect(typeof Cls).toBe("function");
            expect(Cls.name).toBe(expectedName);
        });
    });

    describe("TyperError 静的プロパティ（名前空間）の階層構造検証", () => {
        
        describe("利用者責任 (use) 階層の繋がり", () => {
            const useHierarchy = [
                ["use", TyperError.use],
                ["use.arg", TyperError.use.arg],
                ["use.arg.spec", TyperError.use.arg.spec],
                ["use.res", TyperError.use.res],
                ["use.res.notIs", TyperError.use.res.notIs],
                ["use.res.notOf", TyperError.use.res.notOf]
            ];
            test.each(useHierarchy)("TyperError.%s が定義されていること", (_, prop) => {
                expect(prop).toBeDefined();
            });
        });

        describe("言語仕様責任 (ecma) 階層の繋がり", () => {
            const ecmaHierarchy = [
                ["ecma", TyperError.ecma],
                ["ecma.boxedPrim", TyperError.ecma.boxedPrim],
                ["ecma.invalidObj", TyperError.ecma.invalidObj],
                ["ecma.unidentifiable", TyperError.ecma.unidentifiable]
            ];
            test.each(ecmaHierarchy)("TyperError.%s が定義されていること", (_, prop) => {
                expect(prop).toBeDefined();
            });
        });

        describe("開発者責任 (dev) 階層の繋がり", () => {
            test("TyperError.dev が定義されていること", () => {
                expect(TyperError.dev).toBeDefined();
            });
            test("TyperError.dev.impl が定義されていること", () => {
                expect(TyperError.dev.impl).toBeDefined();
            });
            test("TyperError.dev.unreachable が未定義（コメントアウト）であること", () => {
                // 実装でコメントアウトされていることを担保
                expect(TyperError.dev.unreachable).toBeUndefined();
            });
        });
    });
});

