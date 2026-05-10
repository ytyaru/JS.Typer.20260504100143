import { describe, test, expect } from "bun:test";
import { TyperError, TyperUnexpectedError } from "../../../src/js/part/error.js";

describe("TyperError (例外クラス系譜)", () => {
    
    describe("静的メソッド (クラスレベル判定)", () => {
        test("is(): インスタンスがそのクラスそのものであるか", () => {
            const err = new TyperError("msg");
            const useErr = new TyperError.use("msg");
            expect(TyperError.is(err)).toBe(true);
            expect(TyperError.is(useErr)).toBe(false); // 継承先はfalse
        });

        test("of(): インスタンスがそのクラスの系譜であるか", () => {
            const err = new TyperError("msg");
            const useErr = new TyperError.use("msg");
            expect(TyperError.of(err)).toBe(true);
            expect(TyperError.of(useErr)).toBe(true); // 継承先もtrue
        });

        test("isExpected(): 想定内エラーの判定", () => {
            const useErr = new TyperError.use("msg");
            const unexpErr = new TyperUnexpectedError("msg");
            expect(TyperError.isExpected(useErr)).toBe(true);
            expect(TyperError.isExpected(unexpErr)).toBe(false);
        });

        test("isUnexpected(): 想定外エラーの判定", () => {
            const unexpErr = new TyperUnexpectedError("msg");
            const useErr = new TyperError.use("msg");
            expect(TyperError.isUnexpected(unexpErr)).toBe(true);
            expect(TyperError.isUnexpected(useErr)).toBe(false);
        });

        test("throw(): 例外の送出", () => {
            expect(() => TyperError.throw("test")).toThrow(TyperError);
            try {
                TyperError.throw("test msg", { cause: "reason" });
            } catch (e) {
                expect(e.message).toBe("test msg");
                expect(e.cause).toBe("reason");
            }
        });
    });

    describe("インスタンスメソッド・アクセサ", () => {
        const err = new TyperError("msg");
        const useErr = new TyperError.use("msg");
        const unexpErr = new TyperUnexpectedError("msg");

        test("is(): 自身が指定された型の直接のインスタンスか", () => {
            expect(err.is(TyperError)).toBe(true);
            expect(useErr.is(TyperError)).toBe(false);
        });

        test("of(): 自身が指定された型の系譜か", () => {
            expect(useErr.of(TyperError)).toBe(true);
            expect(unexpErr.of(TyperError)).toBe(true);
        });

        test("isExpected ゲッター", () => {
            expect(useErr.isExpected).toBe(true);
            expect(unexpErr.isExpected).toBe(false);
        });

        test("isUnexpected ゲッター", () => {
            expect(unexpErr.isUnexpected).toBe(true);
            expect(useErr.isUnexpected).toBe(false);
        });
    });

    describe("階層構造のプロパティ参照", () => {
        test("利用者責任 (use)", () => {
            expect(TyperError.use).toBeDefined();
            expect(TyperError.use.arg.spec).toBeDefined();
            expect(TyperError.use.res.notIs).toBeDefined();
        });

        test("言語仕様責任 (ecma)", () => {
            expect(TyperError.ecma).toBeDefined();
            expect(TyperError.ecma.boxedPrim).toBeDefined();
            expect(TyperError.ecma.unidentifiable).toBeDefined();
        });

        test("開発者責任 (dev)", () => {
            expect(TyperError.dev).toBeDefined();
            expect(TyperError.dev.impl).toBeDefined();
        });
    });
});
