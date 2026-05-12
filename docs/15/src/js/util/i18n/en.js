/**
 * English message definitions.
 */
export const i18n = {
    typeSpecifier: () => "The TypeSpecifier is invalid. It must be NaN, null, undefined, or a constructor function.",
    mismatch: (expected, actual, label) => `The type${label ? " of " +'"'+label+'"' : ''} is invalid. Expected: ${expected}, Actual: ${actual}.`,
    boxedPrimitive: (value, tag) => `Instances created by 'new' with primitive types are prohibited. This is because strict equality ('===') comparisons will fail. Although 'valueOf()' returns a primitive value, the actual entity is an object (reference type), creating an inconsistency between type and behavior. To eliminate such inconsistencies, Typer prohibits these instances. Value: ${value}, tag: '${tag}'.`,
    invalidObject: (isNameMissing) => `The object (reference type) is invalid. It is expected to be an instance, but the 'constructor${isNameMissing ? ".name" : ""}' information is missing, making it impossible to identify the type.`,
    unidentifiable: (value, type, tag) => `The type of the value cannot be identified. This is because the results of 'typeof' or 'instanceof' do not match the actual type (internal slot). This contradiction is part of the ECMAScript specification (e.g., document.all, Proxy). In such cases, Typer cannot identify the type. Value: ${value}, typeof: '${type}', tag: '${tag}'.`,
    implementation: () => "There is a contradiction in the Typer implementation. 'TyperUnexpectedError' is being thrown as an expected error. 'TyperUnexpectedError' should only be thrown in unexpected situations. Please fix the code.",
    unexpected: (message) => `An unexpected error has been thrown. This may be a bug in the Typer implementation. When reporting this issue, please include the following details. Message: '${message}'.`,
};
