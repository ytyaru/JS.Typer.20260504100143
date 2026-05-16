import { describe, test, expect } from "bun:test";
import { i18n } from "../../../../../src/js/util/i18n/ja.js";

describe("i18n: 日本語メッセージの正確性検証", () => {
    test("typeSpecifier: 文言が仕様通りであること", () => {
        expect(i18n.typeSpecifier()).toBe("型指示値 TypeSpecifier が不正値です。NaN, null, undefined またはコンストラクタ関数であるべきです。");
    });

    test("mismatch: 文言と語順の検証", () => {
        expect(i18n.mismatch("A", "B", "名")).toBe('"名" の型が不正です。期待: A, 実際: B。');
        expect(i18n.mismatch("A", "B", null)).toBe('型が不正です。期待: A, 実際: B。');
    });

    test("boxedPrimitive: 文言と表記ゆれの検証", () => {
        const res = i18n.boxedPrimitive("V", "T");
        expect(res).toBe("プリミティブ型をnewしたインスタンスは使用禁止です。型を含めた一致判定をする '===' 比較に失敗するためです。これは 'valueOf()' によりプリミティブ値を返却するにもかかわらず、値の実体はオブジェクト（参照型）であるという矛盾によって起こります。型と挙動の整合性が取れない状態を排除するため, Typerではこれらを一律で使用禁止とします。値: V, tag: 'T'。");
    });

    test("invalidObject: 文言の出し分け検証", () => {
        expect(i18n.invalidObject(false)).toBe("オブジェクト（参照型）が不正値です。インスタンスであると予想されますが、'constructor' 情報が欠落しており、型を識別できません。");
        expect(i18n.invalidObject(true)).toBe("オブジェクト（参照型）が不正値です。インスタンスであると予想されますが、'constructor.name' 情報が欠落しており、型を識別できません。");
    });

    test("unidentifiable: 文言の検証", () => {
        expect(i18n.unidentifiable("V", "T", "Tag")).toBe("値の型を識別できません。'typeof' や 'instanceof' の結果が、実際の型（内部スロット）と一致しないためです。この矛盾はECMAScriptの言語仕様です。例えば値がdocument.allやProxy等で発生し得ます。その場合Typerは型を識別できません。値: V, typeof: 'T', tag: 'Tag'。");
    });

    test("implementation: 文言の検証", () => {
        expect(i18n.implementation()).toBe("Typerの実装に矛盾があります。'TyperUnexpectedError' が想定内のエラーとして送出されています。'TyperUnexpectedError' は想定外の事態においてのみ送出されるべきです。コードを修正してください。");
    });

    test("unexpected: 文言の検証", () => {
        expect(i18n.unexpected("ERR")).toBe("想定外のエラーが送出されました。Typerの実装に起因する不具合の可能性があります。不具合報告の際は、以下の詳細情報を添えてください。メッセージ: 'ERR'。");
    });
});

