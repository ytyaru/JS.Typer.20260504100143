const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
const th = (v,t)=> {throw new Error(`型が期待値と違います。期待:${t} 実際:${v} tag:${getTag(v)}`);}
const a = {};
a.p = (v)=> !Object(v);
a.r = (v)=> !!Object(v);
a.c = (v)=> [null,undefined].some(x=>x===v) || Number.isNaN(v);
// Constant 非活性定数(inactive constant) 使わないほうが良いかもしれない定数たち
a.c.nul = (v)=> null===v;
a.c.und = (v)=> undefined===v;
a.c.nan = (v)=> Number.isNaN(v);
// Primitive
a.p.bln = (v)=> 'boolean'===typeof v;
a.p.num = (v)=> 'number'===typeof v;
a.p.big = (v)=> 'bigint'===typeof v;
a.p.str = (v)=> 'string'===typeof v;
a.p.sym = (v)=> 'symbol'===typeof v;
// Number
a.p.num.inf = (v)=> [Infinity, -Infinity].some(x=>x===v);
a.p.num.inf.p = (v)=> Infinity===v;
a.p.num.inf.n = (v)=> -Infinity===v;
a.p.num.unsafe = (v)=> a.p.num(v) && (Number.MAX_SAFE_INTEGER<v || v<Number.MIN_SAFE_INTEGER);
a.p.num.fin = (v)=> a.p.num(v) && (v<=Number.MAX_SAFE_INTEGER && Number.MIN_SAFE_INTEGER<=v);
a.p.num.flt = (v)=> a.p.num.fin(v) && !Number.isSafeInteger(v);
a.p.num.int = (v)=> Number.isSafeInteger(v);
a.p.num.uint = (v)=> Number.isSafeInteger(v) && 0<=v;
const getIntBitRange = (bit, signed = false) => {
  if (!Number.isSafeInteger(bit) || bit<1 || 53<bit) throw new Error(`bitは1〜53までの整数であるべきです。`);
  const min = signed ? -(2 ** (bit - 1)) : 0;
  const max = signed ? 2 ** (bit - 1) - 1 : 2 ** bit - 1;
  return [min, max];
};
const isIntBitRange = (v, bit, signed = false) => {
  if (!Number.isSafeInteger(v)) throw new Error(`vはNumber.isSafeInteger(v)がtrueを返す値であるべきです。`);
  const [min, max] = getIntBitRange(bit, signed);
  return v >= min && v <= max;
};
a.p.num.int.bit = (v,bit)=> isIntBitRange(v,bit,true);
a.p.num.uint.bit = (v,bit)=> isIntBitRange(v,bit,false);
a.p.num.i8 = (v)=> isIntBitRange(v,8,true);
a.p.num.i16 = (v)=> isIntBitRange(v,16,true);
a.p.num.i32 = (v)=> isIntBitRange(v,32,true);
a.p.num.u8 = (v)=> isIntBitRange(v,8,false);
a.p.num.u16 = (v)=> isIntBitRange(v,16,false);
a.p.num.u32 = (v)=> isIntBitRange(v,32,false);
const within = (v,min,max,signed) => {
  if (!a.p.bln(signed)) {throw new Error(`signedは真偽値であるべきです。`)}
  const t = signed ? 'uint' : 'int'; // 符号なし(uint)が0以上、符号あり(int)が負数あり
  if (![v,min,max].every(x=>a.p.num[t](x))) {throw new Error(`v,min,maxは全てa.p.num.${t}型であるべきです。`)}
  return min<=v && v<=max;
}
a.p.num.int.within = (v,min,max)=> [v,min,max].every(x=>a.p.num.int(x)) && min<=v && v<=max;
a.p.num.uint.within = (v,min,max)=> [v,min,max].every(x=>a.p.num.uint(x)) && min<=v && v<=max;
a.p.num.int.without = (v,min,max)=> [v,min,max].every(x=>a.p.num.int(x)) && (v<min || max<v);
a.p.num.uint.without = (v,min,max)=> [v,min,max].every(x=>a.p.num.uint(x)) && (v<min || max<v);
a.p.str.blk = (v)=> a.p.str(v) && 0===v.length;
a.p.str.some = (v,...candidates)=> a.p.str(v) && candidates.every(x=>a.p.str(x)) && candidates.some(x=>x===v);
// Reference
a.r.cls = (v)=> 'function'===typeof v && 0<v.name?.length && /^[A-Z]/.test(v.name);
a.r.cal = (v)=> 'function'===typeof v;
a.r.ary = (v)=> Array.isArray(v);
const isObj = (v)=> null!==v && 'object'===typeof v;
a.r.obj = (v)=> isObj(v) && Object.prototype===Object.getPrototypeOf(v);
a.r.dic = (v)=> isObj(v) && null===Object.getPrototypeOf(v);
a.r.obj.has = (v, ...keys)=> a.r.obj(v) && keys.every(k=>k in v);
a.r.obj.hasOwn = (v, ...keys)=> a.r.obj(v) && keys.every(k=>Object.hasOwn(v, k));
a.r.dic.has = (v, ...keys)=> a.r.dic(v) && keys.every(k=>k in v);
a.r.dic.hasOwn = (v, ...keys)=> a.r.dic(v) && keys.every(k=>Object.hasOwn(v, k));
const getDes = (v)=> {
  if (!isObj(v)) return null;
  const validKeys = new Set('configurable enumerable writable value get set'.split(' '));
  const keys = Object.keys(v);
  const hasInvalidKey = keys.some(k=>!validKeys.has(k));
  if (hasInvalidKey) return null;
  const isDataDescriptor = 'value' in v || 'writable' in v;
  const isGetter = 'get' in v;
  const isSetter = 'set' in v;
  const dat = 'function'===typeof v.value ? 'function' : 'data';
  const acc = isGetter && isSetter ? 'accessor' : (!isGetter && !isSetter ? null : (isGetter ? 'get' : 'set'));
  if (isDataDescriptor && (isGetter || isSetter)) return null;
  return isDataDescriptor ? dat : acc;
}
a.r.des = (v)=> !!getDes(v);
a.r.des.dat = (v)=> ['data','function'].some(x=>x===getDes(v));
a.r.des.dat.v = (v)=> 'data'===getDes(v);
a.r.des.dat.fn = (v)=> 'function'===getDes(v);
a.r.des.acc = (v)=> ['accessor','get','set'].some(x=>x===getDes(v));
a.r.des.acc.get = (v)=> 'get'===getDes(v);
a.r.des.acc.set = (v)=> 'set'===getDes(v);
a.r.des.acc.gs = (v)=> 'accessor'===getDes(v);
a.r.ins = (v)=> a.r(v) && !a.r.cal(v) && !a.r.ary(v) && !a.r.dic(v) && !a.r.obj(v) && !a.r.des(v);
a.r.ins.of = (v,C)=> a.r.ins(v) && v instanceof C;
a.r.ins.is = (v,C)=> a.r.ins.of(v,C) && C===v.constructor;
a.r.ins.err = (v)=> a.r.ins.of(v,Error);
const fnSrc = (v)=> Function.prototype.toString.call(v);
a.r.cal.arrow = (v)=> a.r.cal(v) && (!v.hasOwnProperty('prototype') && fnSrc(v).includes('=>'));
a.r.cal.method = (v)=> a.r.cal(v) && (!v.hasOwnProperty('prototype') && !fnSrc(v).startsWith('function'));
a.r.cal.native = (v)=> a.r.cal(v) && fnSrc(v).includes('[native code]');
a.r.cal.bound = (v)=> a.r.cal.native(v) && v.name.startsWith('bound ');
a.r.cal.fn = (v)=> a.r.cal(v) && !a.r.cal.arrow(v) && !a.r.cal.method(v) && !a.r.cal.native(v) && !a.r.cal.bound(v);
const AsyncFunction = (async () => {}).constructor;
const GeneratorFunction = (function* () {}).constructor;
const AsyncGeneratorFunction = (async function* () {}).constructor;
// 1. 通常のユーザー定義関数 (a.r.cal.fn) の詳細分類
a.r.cal.fn.a = (v) => a.r.cal.fn(v) && v instanceof AsyncFunction;
a.r.cal.fn.g = (v) => a.r.cal.fn(v) && v instanceof GeneratorFunction;
a.r.cal.fn.ag = (v) => a.r.cal.fn(v) && v instanceof AsyncGeneratorFunction;// 同期関数は、上記3つのいずれでもないもの
a.r.cal.fn.s = (v) => a.r.cal.fn(v) && !'a g ag'.split(' ').some(n => a.r.cal.fn[n](v));
// 2. アロー関数 (a.r.cal.arrow) の詳細分類// ※仕様上、アロー関数のジェネレータは存在しないため async かどうかだけで判定可能
a.r.cal.arrow.a = (v) => a.r.cal.arrow(v) && v instanceof AsyncFunction;
a.r.cal.arrow.s = (v) => a.r.cal.arrow(v) && !a.r.cal.arrow.a(v);
// 3. メソッド (a.r.cal.method) の詳細分類
a.r.cal.method.a = (v) => a.r.cal.method(v) && v instanceof AsyncFunction;
a.r.cal.method.g = (v) => a.r.cal.method(v) && v instanceof GeneratorFunction;
a.r.cal.method.ag = (v) => a.r.cal.method(v) && v instanceof AsyncGeneratorFunction;// 同期メソッドは、上記3つのいずれでもないもの
a.r.cal.method.s = (v) => a.r.cal.method(v) && !'a g ag'.split(' ').some(n => a.r.cal.method[n](v));
// 4. Thenable (a.r.then / .obj.then / .ins.then) の判定// Promises/A+ 仕様に基づく: オブジェクトまたは関数で、かつ then が関数であること
const isThenable = (v) => a.r(v) && 'function' === typeof v.then;
a.r.then = (v) => isThenable(v);
a.r.obj.then = (v) => a.r.obj(v) && isThenable(v);
a.r.ins.then = (v) => a.r.ins(v) && isThenable(v);
a.r.cls.err = (v)=> a.r.cls(v) && Error.prototype.isPrototypeOf(v.prototype);
a.r.cls.is = (v, C) => a.r.cls(v) && v === C;
a.r.cls.of = (v, C) => a.r.cls(v) && (v === C || C.prototype.isPrototypeOf(v.prototype));
export {a};
