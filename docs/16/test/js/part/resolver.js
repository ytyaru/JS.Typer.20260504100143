import { describe, test, expect, spyOn } from "bun:test";
import { TyperResolver } from "../../../src/js/part/resolver.js";
import { TyperEngine } from "../../../src/js/part/engine.js";
import { 
    TyperNotIsError, 
    TyperNotOfError, 
    TyperTypeSpecError, 
    TyperBoxedPrimitiveValueError,
    TyperImplementationError,
    TyperUnexpectedError
} from "../../../src/js/part/error.js";
import { i18n } from "../../../src/js/util/i18n/index.js";
// あなたが定義したエクスポート内容と一字一句一致させたインポート
import { 
    data, broken,
    C, c, D, d, fn, arrowFn, Integer, integer, 
    ES5Class, es5Instance, asyncFn, genFn, dynamicFn, boundFn, proxyFn,
    proxyObj, argsObj, nullProtoObj, propertyDescriptor, objWithToStringTag
} from "../../data.js";

describe("part/resolver.js", () => {
    describe("class TyperResolver", () => {

        describe("static is(typeSpecifier, actualValue, label, throwable)", () => {
            describe("真を返す: 型が完全一致する場合", () => {
                test.each(data.values.mapping)("$name", ({ val, exp }) => {
                    expect(TyperResolver.is(exp, val, null, true)).toBe(true);
                });
            });

            describe("偽を返す: 型が不一致で throwable が false の場合", () => {
                const mismatchCases = [
                    { name: "型違い: Number, 's'", type: Number, val: "s" },
                    { name: "継承関係のみ: C, d", type: C, val: d },
                    { name: "コンテナ違い: Object, []", type: Object, val: [] }
                ];
                test.each(mismatchCases)("$name", ({ type, val }) => {
                    expect(TyperResolver.is(type, val, null, false)).toBe(false);
                });
            });

            describe("例外を送出: 型が不一致で throwable が true の場合", () => {
                test("labelなし: 正しい型とメッセージで TyperNotIsError が送出されること", () => {
                    try {
                        TyperResolver.is(String, 123, null, true);
                        expect.unreachable();
                    } catch (e) {
                        expect(e).toBeInstanceOf(TyperNotIsError);
                        expect(e.message).toBe(i18n.mismatch("String", "Number", null));
                    }
                });

                test("labelあり: メッセージにラベルが含まれること", () => {
                    const label = "ユーザー名";
                    try {
                        TyperResolver.is(String, 123, label, true);
                        expect.unreachable();
                    } catch (e) {
                        expect(e).toBeInstanceOf(TyperNotIsError);
                        expect(e.message).toBe(i18n.mismatch("String", "Number", label));
                    }
                });
            });
        });

        describe("static of(typeSpecifier, actualValue, label, throwable)", () => {
            describe("真を返す: 完全一致または継承関係がある場合", () => {
                test.each(data.values.mapping)("完全一致: $name", ({ val, exp }) => {
                    expect(TyperResolver.of(exp, val, null, true)).toBe(true);
                });

                const inheritanceCases = [
                    { name: "クラス継承: C, d", type: C, val: d },
                    { name: "プリミティブ継承: Number, integer", type: Number, val: integer },
                    { name: "Object継承: Object, c", type: Object, val: c },
                    { name: "ES5もどき継承: ES5Class, es5Instance", type: ES5Class, val: es5Instance }
                ];
                test.each(inheritanceCases)("継承救済: $name", ({ type, val }) => {
                    expect(TyperResolver.of(type, val, null, true)).toBe(true);
                });
            });

            describe("偽を返す: 継承関係すらない場合 (throwable: false)", () => {
                const failCases = [
                    { name: "型違い: String, 0", type: String, val: 0 },
                    { name: "逆継承: D, c", type: D, val: c },
                    { name: "無関係なProxy: Date, proxyObj", type: Date, val: proxyObj }
                ];
                test.each(failCases)("$name", ({ type, val }) => {
                    expect(TyperResolver.of(type, val, null, false)).toBe(false);
                });
            });

            describe("例外を送出: 継承関係がなく throwable が true の場合", () => {
                test("TyperNotOfError が送出されること", () => {
                    try {
                        TyperResolver.of(Boolean, "true", "フラグ", true);
                        expect.unreachable();
                    } catch (e) {
                        expect(e).toBeInstanceOf(TyperNotOfError);
                        expect(e.message).toBe(i18n.mismatch("Boolean", "String", "フラグ"));
                    }
                });
            });
        });

        describe("例外の透過: core.js 由来のバリデーション例外", () => {
            test.each(data.specifiers.invalid)("型指定子不正: $name", ({ val }) => {
                try {
                    TyperResolver.is(val, "any", null, true);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperTypeSpecError);
                    expect(e.message).toBe(i18n.typeSpecifier());
                }
            });

            test.each(data.values.boxed)("ボックス化オブジェクト: $name", ({ val, tag }) => {
                try {
                    TyperResolver.is(Object, val, null, true);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperBoxedPrimitiveValueError);
                    expect(e.message).toBe(i18n.boxedPrimitive(val, tag));
                }
            });
        });

        describe("例外ルーティング (内部ロジックの検証)", () => {
            test("想定外エラーの手動送出は ImplementationError に変換すること", () => {
                const spy = spyOn(TyperEngine, 'isLogic').mockImplementation(() => {
                    throw new TyperUnexpectedError("manual throw");
                });

                try {
                    TyperResolver.is(Number, 123, null, true);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperImplementationError);
                    expect(e.message).toBe(i18n.implementation());
                } finally {
                    spy.mockRestore();
                }
            });

            test("未知のネイティブエラーは UnexpectedError でラップすること", () => {
                const spy = spyOn(TyperEngine, 'isLogic').mockImplementation(() => {
                    throw new ReferenceError("native error");
                });

                try {
                    TyperResolver.is(Number, 123, null, true);
                    expect.unreachable();
                } catch (e) {
                    expect(e).toBeInstanceOf(TyperUnexpectedError);
                    expect(e.message).toBe(i18n.unexpected("native error"));
                } finally {
                    spy.mockRestore();
                }
            });
        });
    });
});

