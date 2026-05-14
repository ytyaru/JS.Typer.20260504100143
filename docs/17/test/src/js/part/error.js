import { describe, test, expect } from "bun:test";
import * as Err from "../../../../src/js/part/error.js";

describe("part/error.js: 例外クラス単体テスト", () => {

    describe("1. エクスポート識別子の実体検証", () => {
        // 文字列ではなく、エクスポートされた型（参照）そのものを配列にする
        const exportedTypes = [
            Err.TyperError,
            Err.TyperUnexpectedError,
            Err.TyperUseError,
            Err.TyperArgumentError,
            Err.TyperTypeSpecError,
            Err.TyperResultError,
            Err.TyperNotIsError,
            Err.TyperNotOfError,
            Err.TyperECMAScriptError,
            Err.TyperBoxedPrimitiveValueError,
            Err.TyperInvalidObjectError,
            Err.TyperUnidentifiableError,
            Err.TyperDevelopError,
            Err.TyperImplementationError
        ];

        test.each(exportedTypes)("エクスポートされた %p が関数（クラス）であること", (Target) => {
            // 存在確認と型確認を、参照に対して直接行う
            expect(Target).toBeDefined();
            expect(Target).toBeInstanceOf(Function);
        });

        test("TyperUnreachableError がエクスポートされていないこと（コメントアウトの確認）", () => {
            expect(Err.TyperUnreachableError).toBeUndefined();
        });
    });

    describe("2. 物理的な継承構造 (Prototype Chain) の検証", () => {

        describe("標準 Error クラスからの継承", () => {
            test("TyperError が Error を直接継承していること", () => {
                // TyperError.prototype の親が Error.prototype であることを参照比較
                expect(Object.getPrototypeOf(Err.TyperError.prototype)).toBe(Error.prototype);
            });
        });

        describe("内部抽象クラス TyperExpectedError の介在検証", () => {
            // 非公開の TyperExpectedError への参照を、既知の子クラスから取得する
            const TyperExpectedError = Object.getPrototypeOf(Err.TyperUseError.prototype).constructor;

            test("取得した親クラスが TyperExpectedError という名前であること", () => {
                expect(TyperExpectedError.name).toBe("TyperExpectedError");
            });

            const expectedSubClasses = [
                Err.TyperUseError,
                Err.TyperECMAScriptError,
                Err.TyperDevelopError
            ];

            test.each(expectedSubClasses)("%p の親クラスが TyperExpectedError であること", (Child) => {
                expect(Object.getPrototypeOf(Child.prototype).constructor).toBe(TyperExpectedError);
            });
        });

        describe("各責任階層内の詳細な継承関係", () => {
            const hierarchy = [
                [Err.TyperArgumentError, Err.TyperUseError],
                [Err.TyperTypeSpecError, Err.TyperArgumentError],
                [Err.TyperResultError, Err.TyperUseError],
                [Err.TyperNotIsError, Err.TyperResultError],
                [Err.TyperNotOfError, Err.TyperResultError],
                [Err.TyperBoxedPrimitiveValueError, Err.TyperECMAScriptError],
                [Err.TyperInvalidObjectError, Err.TyperECMAScriptError],
                [Err.TyperUnidentifiableError, Err.TyperECMAScriptError],
                [Err.TyperImplementationError, Err.TyperDevelopError],
                [Err.TyperUnexpectedError, Err.TyperError]
            ];

            test.each(hierarchy)("%p が %p を直接継承していること", (Child, ExpectedParent) => {
                // 子のプロトタイプの親が、期待される親のプロトタイプと同一参照であることを確認
                expect(Object.getPrototypeOf(Child.prototype)).toBe(ExpectedParent.prototype);
            });
        });
    });
    // --- Part 3 用のテストデータ準備 ---

    // 1. 検証対象となる全例外クラスのリスト
    const typerClasses = [
        { name: "TyperError", Cls: Err.TyperError },
        { name: "TyperUnexpectedError", Cls: Err.TyperUnexpectedError },
        { name: "TyperUseError", Cls: Err.TyperUseError },
        { name: "TyperArgumentError", Cls: Err.TyperArgumentError },
        { name: "TyperTypeSpecError", Cls: Err.TyperTypeSpecError },
        { name: "TyperResultError", Cls: Err.TyperResultError },
        { name: "TyperNotIsError", Cls: Err.TyperNotIsError },
        { name: "TyperNotOfError", Cls: Err.TyperNotOfError },
        { name: "TyperECMAScriptError", Cls: Err.TyperECMAScriptError },
        { name: "TyperBoxedPrimitiveValueError", Cls: Err.TyperBoxedPrimitiveValueError },
        { name: "TyperInvalidObjectError", Cls: Err.TyperInvalidObjectError },
        { name: "TyperUnidentifiableError", Cls: Err.TyperUnidentifiableError },
        { name: "TyperDevelopError", Cls: Err.TyperDevelopError },
        { name: "TyperImplementationError", Cls: Err.TyperImplementationError }
    ];

    // 2. 入力値として使用する全パターンのインスタンス
    const allTestInstances = [
        ...typerClasses.map(item => ({ name: item.name, val: new item.Cls(`test ${item.name}`) })),
        { name: "Error", val: new Error("e") },
        { name: "TypeError", val: new TypeError("t") },
        { name: "ReferenceError", val: new ReferenceError("r") },
        { name: "PlainObject", val: {} },
        { name: "Array", val: [] },
        { name: "null", val: null },
        { name: "undefined", val: undefined },
        { name: "NaN", val: NaN },
        { name: "Number", val: 123 },
        { name: "String", val: "str" },
        { name: "Boolean", val: true },
        { name: "Symbol", val: Symbol("s") }
    ];

    // 3. 期待値算出ロジック（JS仕様および内部継承構造に基づく真実）
    // 非公開の TyperExpectedError 参照をプロトタイプから正確に取得
    const TyperExpectedError = Object.getPrototypeOf(Err.TyperUseError.prototype).constructor;

    const getStaticExpectation = {
        is: (Cls, val) => (val instanceof Cls && val.constructor === Cls),
        of: (Cls, val) => (val instanceof Cls),
        isExpected: (val) => (val instanceof TyperExpectedError),
        isUnexpected: (val) => (val instanceof Err.TyperUnexpectedError)
    };

    describe("3. 静的メソッドの網羅的検証", () => {

        typerClasses.forEach(({ name, Cls }) => {
            describe(`${name} クラスの静的メソッド`, () => {

                describe("is(value): 直接のインスタンス判定", () => {
                    test.each(allTestInstances)("引数が $name のとき、期待値を返すこと", ({ val }) => {
                        const expected = getStaticExpectation.is(Cls, val);
                        expect(Cls.is(val)).toBe(expected);
                    });
                });

                describe("of(value): 継承関係を含めた判定", () => {
                    test.each(allTestInstances)("引数が $name のとき、期待値を返すこと", ({ val }) => {
                        const expected = getStaticExpectation.of(Cls, val);
                        expect(Cls.of(val)).toBe(expected);
                    });
                });

                describe("isExpected(error): 想定内エラーの判定", () => {
                    test.each(allTestInstances)("引数が $name のとき、期待値を返すこと", ({ val }) => {
                        const expected = getStaticExpectation.isExpected(val);
                        expect(Cls.isExpected(val)).toBe(expected);
                    });
                });

                describe("isUnexpected(error): 想定外エラーの判定", () => {
                    test.each(allTestInstances)("引数が $name のとき、期待値を返すこと", ({ val }) => {
                        const expected = getStaticExpectation.isUnexpected(val);
                        expect(Cls.isUnexpected(val)).toBe(expected);
                    });
                });

                describe("throw(message, option): 例外送出の検証", () => {
                    const throwPatterns = [
                        { label: "メッセージのみ", msg: "test message", opt: undefined },
                        { label: "メッセージとcause", msg: "with cause", opt: { cause: new Error("original") } },
                        { label: "空メッセージ", msg: "", opt: undefined },
                        { label: "undefined（引数なし相当）", msg: undefined, opt: undefined }
                    ];

                    test.each(throwPatterns)("$label の場合、正しく送出されること", ({ msg, opt }) => {
                        try {
                            Cls.throw(msg, opt);
                            expect.unreachable("例外が送出されませんでした");
                        } catch (e) {
                            expect(e).toBeInstanceOf(Cls);
                            expect(e.constructor).toBe(Cls);
                            expect(e.message).toBe(msg === undefined ? "" : String(msg));
                            if (opt) expect(e.cause).toBe(opt.cause);
                        }
                    });
                });
            });
        });
    });
    // --- Part 4 用の追加データ準備 ---

    // インスタンスメソッドの引数として使用する「型（コンストラクタ）」のリスト
    const allConstructorTypes = [
        ...typerClasses.map(item => ({ name: item.name, val: item.Cls })),
        { name: "Error", val: Error },
        { name: "TypeError", val: TypeError },
        { name: "ReferenceError", val: ReferenceError },
        { name: "Object", val: Object },
        { name: "Array", val: Array }
    ];

    // 期待値算出ロジック（インスタンス用）
    const getInstanceExpectation = {
        is: (ins, Type) => (ins instanceof Type && ins.constructor === Type),
        of: (ins, Type) => (ins instanceof Type),
        isExpected: (ins) => (ins instanceof TyperExpectedError),
        isUnexpected: (ins) => (ins instanceof Err.TyperUnexpectedError)
    };

    describe("4. インスタンスメソッド・プロパティの網羅的検証", () => {

        typerClasses.forEach(({ name, Cls }) => {
            describe(`${name} クラスのインスタンス`, () => {
                
                // 検証用の標準インスタンスを一つ生成
                const ins = new Cls("instance test message");

                describe("is(type): 直接のインスタンス判定", () => {
                    test.each(allConstructorTypes)("引数が $name 型のとき、期待値を返すこと", (item) => {
                        const expected = getInstanceExpectation.is(ins, item.val);
                        expect(ins.is(item.val)).toBe(expected);
                    });
                });

                describe("of(type): 継承関係を含めた判定", () => {
                    test.each(allConstructorTypes)("引数が $name 型のとき、期待値を返すこと", (item) => {
                        const expected = getInstanceExpectation.of(ins, item.val);
                        expect(ins.of(item.val)).toBe(expected);
                    });
                });

                describe("get isExpected: 想定内エラー判定ゲッター", () => {
                    test("インスタンスの状態に応じた正しい真偽値を返すこと", () => {
                        const expected = getInstanceExpectation.isExpected(ins);
                        expect(ins.isExpected).toBe(expected);
                    });
                });

                describe("get isUnexpected: 想定外エラー判定ゲッター", () => {
                    test("インスタンスの状態に応じた正しい真偽値を返すこと", () => {
                        const expected = getInstanceExpectation.isUnexpected(ins);
                        expect(ins.isUnexpected).toBe(expected);
                    });
                });

                describe("name プロパティ", () => {
                    test(`値が "${name}" であること`, () => {
                        expect(ins.name).toBe(name);
                    });
                });

                describe("constructor(message, option) の詳細検証", () => {
                    const ctorPatterns = [
                        { label: "引数なし", msg: undefined, opt: undefined },
                        { label: "メッセージのみ", msg: "hello", opt: undefined },
                        { label: "メッセージとオプション", msg: "hello", opt: { cause: "reason" } }
                    ];

                    test.each(ctorPatterns)("$label で生成した場合、プロパティが正しく設定されること", ({ msg, opt }) => {
                        const testIns = opt ? new Cls(msg, opt) : new Cls(msg);
                        
                        // メッセージの検証（undefined時は空文字になる仕様）
                        expect(testIns.message).toBe(msg === undefined ? "" : String(msg));
                        
                        // causeの検証
                        if (opt) {
                            expect(testIns.cause).toBe(opt.cause);
                        }

                        // インスタンス自身が message プロパティを物理的に持っているか（仕様の深掘り）
                        // 引数なし(undefined)の場合は false、それ以外は true になるはず
                        expect(Object.prototype.hasOwnProperty.call(testIns, 'message')).toBe(msg !== undefined);
                    });
                });
            });
        });
    });
});

