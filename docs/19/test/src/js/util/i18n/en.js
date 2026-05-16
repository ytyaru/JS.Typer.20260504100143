import { describe, test, expect } from "bun:test";
// setup.js により en.js に差し替えられた i18n をインポート
import { i18n } from "../../../../../src/js/util/i18n/index.js";

describe("i18n: English message accuracy verification", () => {
    test("typeSpecifier: literal match", () => {
        expect(i18n.typeSpecifier()).toBe("The TypeSpecifier is invalid. It must be NaN, null, undefined, or a constructor function.");
    });

    test("mismatch: word order and label verification", () => {
        expect(i18n.mismatch("A", "B", "Name")).toBe('The type of "Name" is invalid. Expected: A, Actual: B.');
        expect(i18n.mismatch("A", "B", null)).toBe('The type is invalid. Expected: A, Actual: B.');
    });

    test("boxedPrimitive: literal match and consistency", () => {
        const res = i18n.boxedPrimitive("V", "T");
        expect(res).toBe("Instances created by 'new' with primitive types are prohibited. This is because strict equality ('===') comparisons will fail. Although 'valueOf()' returns a primitive value, the actual entity is an object (reference type), creating an inconsistency between type and behavior. To eliminate such inconsistencies, Typer prohibits these instances. Value: V, tag: 'T'.");
    });

    test("invalidObject: conditional message verification", () => {
        expect(i18n.invalidObject(false)).toBe("The object (reference type) is invalid. It is expected to be an instance, but the 'constructor' information is missing, making it impossible to identify the type.");
        expect(i18n.invalidObject(true)).toBe("The object (reference type) is invalid. It is expected to be an instance, but the 'constructor.name' information is missing, making it impossible to identify the type.");
    });

    test("unidentifiable: literal match", () => {
        expect(i18n.unidentifiable("V", "T", "Tag")).toBe("The type of the value cannot be identified. This is because the results of 'typeof' or 'instanceof' do not match the actual type (internal slot). This contradiction is part of the ECMAScript specification (e.g., document.all, Proxy). In such cases, Typer cannot identify the type. Value: V, typeof: 'T', tag: 'Tag'.");
    });

    test("implementation: literal match", () => {
        expect(i18n.implementation()).toBe("There is a contradiction in the Typer implementation. 'TyperUnexpectedError' is being thrown as an expected error. 'TyperUnexpectedError' should only be thrown in unexpected situations. Please fix the code.");
    });

    test("unexpected: literal match", () => {
        expect(i18n.unexpected("ERR")).toBe("An unexpected error has been thrown. This may be a bug in the Typer implementation. When reporting this issue, please include the following details. Message: 'ERR'.");
    });
});
