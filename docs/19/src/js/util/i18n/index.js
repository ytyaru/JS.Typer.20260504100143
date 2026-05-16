/**
 * i18n メッセージ定義のインターフェース。
 * ビルド時に各言語の実装に差し替えられます。
 */
export const i18n = {
    typeSpecifier: () => "",
    mismatch: (expected, actual, label) => "",
    boxedPrimitive: (value, tag) => "",
    invalidObject: () => "",
    unidentifiable: (value, type, tag) => "",
    implementation: (error) => "",
    unexpected: (message) => "",
};
