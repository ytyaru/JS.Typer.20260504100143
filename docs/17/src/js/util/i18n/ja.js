/**
 * 日本語メッセージ定義。
 */
export const i18n = {
    typeSpecifier: () => "型指示値 TypeSpecifier が不正値です。NaN, null, undefined またはコンストラクタ関数であるべきです。",
    mismatch: (expected, actual, label) => `${label ? `"${label}" の` : ''}型が不正です。期待: ${expected}, 実際: ${actual}。`,
    boxedPrimitive: (value, tag) => `プリミティブ型をnewしたインスタンスは使用禁止です。型を含めた一致判定をする '===' 比較に失敗するためです。これは 'valueOf()' によりプリミティブ値を返却するにもかかわらず、値の実体はオブジェクト（参照型）であるという矛盾によって起こります。型と挙動の整合性が取れない状態を排除するため、Typerではこれらを一律で使用禁止とします。値: ${value}, tag: '${tag}'。`,
    invalidObject: (isNameMissing) => `オブジェクト（参照型）が不正値です。インスタンスであると予想されますが、'constructor${isNameMissing ? ".name" : ""}' 情報が欠落しており、型を識別できません。`,
    unidentifiable: (value, type, tag) => `値の型を識別できません。'typeof' や 'instanceof' の結果が、実際の型（内部スロット）と一致しないためです。この矛盾はECMAScriptの言語仕様です。例えば値がdocument.allやProxy等で発生し得ます。その場合Typerは型を識別できません。値: ${value}, typeof: '${type}', tag: '${tag}'。`,
    implementation: () => "Typerの実装に矛盾があります。'TyperUnexpectedError' が想定内のエラーとして送出されています。'TyperUnexpectedError' は想定外の事態においてのみ送出されるべきです。コードを修正してください。",
    unexpected: (message) => `想定外のエラーが送出されました。Typerの実装に起因する不具合の可能性があります。不具合報告の際は、以下の詳細情報を添えてください。メッセージ: '${message}'。`,
};

