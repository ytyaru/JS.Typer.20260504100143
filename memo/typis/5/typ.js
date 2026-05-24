const B = [Boolean, Number, String];
const P = [...B, BigInt, Symbol];
const isCon = (v,...E)=>E.some(e=>e===v);
const isFn = v=>'function'===typeof v;
const isCls = v=>isFn(v) && /^[A-Z]+/.test(v?.name);
const isTs = C=>Number.isNaN(C) || [null,undefined,Infinity,-Infinity].some(x=>x===C) || isFn(C);
const isO = v=>null!==v && 'object'===typeof v;
export const getTag = v=>Number.isNaN(v) ? 'NaN' : (isCls(v) ? v.name : Object.prototype.toString.call(v).slice(8,-1));
const TYPIS = (isThrow, isOf, ...args) => {
	if (0===args.length) {throw new Error('引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。')}
	const v = args[0];
	if ('object'===typeof v && B.some(b=>b===v?.constructor)) {throw Error(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`)}
	if (1===args.length) {return getTag(args[0])}
	const A = args.slice(1);
	const NotT = A.find(C=>!isTs(C));
	//if (A.some(C=>!isTs(C))) {throw new Error(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(A.find(C=>!isTs(C)))}`)}
	if (null!==NotT) {throw new Error(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(NotT)}`)}
	const R = A.some(C=>TYPEONE(v,C,false,isOf));
	//if (isThrow && !R) {throw new TypeError(`値が期待する型と違います。期待:${isCls(C) ? C.name : getTag(C)}, 実際:${getTag(v)}, 値:${v}`)}
	if (isThrow && !R) {throw new TypeError(`値が期待する型と違います。期待:${A.map(C=>isCls(C) ? C.name : getTag(C))}, 実際:${getTag(v)}, 値:${v}`)}
	return R;
//	return args.slice(1).some(C=>TYPEONE(v,C,isThrow,isOf));
}
const TYPEONE = (v, C, isThrow, isOf=false) => {
//	if (!isTs(C)) {throw new Error(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(C)}`)}
	if (Number.isNaN(v)) {return Number.isNaN(C)}
	if ([v,C].some(x=>isCon(x, null, undefined, Infinity, -Infinity))) {return v===C}
	if (P.some(p=>p===C)) {return typeof v === C.name.toLowerCase()}
	if (Function===C) {return isFn(v)}
	if (Array===C) {return Array.isArray(v) && (isOf ? true : Array.prototype===Object.getPrototypeOf(v))}
	if (Object===C) {return isO(v) && (isOf ? true : Object.prototype===Object.getPrototypeOf(v))}
	const R = v instanceof C && isOf ? true : v.constructor===C;
//	if (isThrow && !R) {throw new TypeError(`値が期待する型と違います。期待:${isCls(C) ? C.name : getTag(C)}, 実際:${getTag(v)}, 値:${v}`)}
	return R;
}
export const typis = (...args) => TYPIS(false, false, ...args);
export const typof = (...args) => TYPIS(false, true, ...args);
export const typer = (...args) => TYPIS(true, false, ...args);
export const typef = (...args) => TYPIS(true, true, ...args);
// isThrow:偽判定時例外送出するか否か:boolean, Ary/Obj/Ins継承関係まで遡るか否か:boolean
const ins = {bool:null, throw:null};
export class Typ {
    static get bool() {return this.#get('bool')}
    static get throw() {return this.#get('throw')}
    static #get(n) {
        if (!['bool','throw'].some(x=>x===n)) {throw new Error(`Implementation Error.`)}
        if (!ins[n]) {ins[n]=new Typ('throw'===n);}
        return ins[n];
    }
    constructor(isThrow=false) {
        this._={isThrow}
        if ('boolean'!==typeof isThrow) {throw new Error(`isThrowは真偽値であるべきです。`)}
    }
    is(...args) {return TYPIS(this._.isThrow, false, ...args);}
    of(...args) {return TYPIS(this._.isThrow, true, ...args);}
}
