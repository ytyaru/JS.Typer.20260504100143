const B = [Boolean, Number, String];
const P = [...B, BigInt, Symbol];
const R = [Function, Array, Object];
//const th = (v,...E)=>E.forEach(e=>{if(e===v){throw new Error(`${e}`)}});
const th = (v,...E)=>E.some(e=>e===v);
const isFn = v=>'function'===typeof v;
const isCls = v=>isFn(v) && /^[A-Z]+/.test(v?.name);
const isTs = C=>Number.isNaN(C) || [null,undefined,Infinity,-Infinity].map(x=>x===C) || isFn(C);
export const tag = v=>Number.isNaN(v) ? 'NaN' : (isCls(v) ? v.name : Object.prototype.toString.call(v).slice(8,-1));
//const NONE = Symbol('NONE');
//export const typis = (v=NONE, C=NONE) => {
//	if ([v,C].map(x=>x===undefined) || isTs(C)) {throw new Error(`引数不正です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`)}
export const typis = (v, C) => {
	if (!isTs(C)) {throw new Error(`引数不正です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`)}
	if (Number.isNaN(v) || th(v, null, undefined, Infinity, -Infinity)) {return true}
	if ('object'===typeof v && B.some(b=>b===v?.constructor)) {throw Error(`BoxedPrimitive<${v?.constructor?.name}>`)}
	if (P.some(p=>p===C)) {return typeof v === C.name.toLowerCase()}
	if (Function===C) {return isFn(v)}
	if (Array===C) {return Array.isArray(v)}
	if (Object===C) {return null!==v && 'object'===typeof v && Object.prototype===Object.getPrototypeOf(v)}
	return v instanceof C;
//	return isFn(C) ? v instanceof C : tag(v);
}
