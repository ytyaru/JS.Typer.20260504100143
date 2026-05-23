const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
const th = (v,t)=> {throw new Error(`型が期待値と違います。期待:${t} 実際:${v} tag:${getTag(v)}`);}
const a = {};
const isObj = (v)=> null!==v && 'object'===typeof v;
a.c = (v)=> [null,undefined].some(x=>x===v) || Number.isNaN(v);
a.b = (v)=> isObj(v) && [Boolean,Number,String].some(t=>t===v.constructor);
a.p = (v)=> !a.c(v) && !(isObj(v) || a.r.cal(v));
a.r = (v)=> !a.c(v) && !a.b(v) && !a.p(v);
// 破綻オブジェクト（参照型なのにconstructorもnameもないから型名取得できない。dicがそれだがdicとは別扱い）
a.invalid = (v)=> a.r(v) && (!v?.constructor || !v?.constructor?.name);
// BoxedPrimitive
a.b.bln = (v)=> isObj(v) && Boolean===v.constructor;
a.b.num = (v)=> isObj(v) && Number===v.constructor;
a.b.str = (v)=> isObj(v) && String===v.constructor;
// Constant 非活性定数(inactive constant) 使わないほうが良いかもしれない定数たち
a.c.nul = (v)=> null===v;
a.c.und = (v)=> undefined===v;
a.c.nan = (v)=> Number.isNaN(v);
// Primitive
a.p.bln = (v)=> 'boolean'===typeof v;
a.p.num = (v)=> 'number'===typeof v && !Number.isNaN(v);
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
class IntBit {
  static is(v, bit, signed=false) {return this.#isIntBitRange(v, bit, signed = false)}
  static #isIntBitRange(v, bit, signed = false) {
    if (!Number.isSafeInteger(v)) throw new Error(`vはNumber.isSafeInteger(v)がtrueを返す値であるべきです。`);
    const [min, max] = this.#calcMinMax(bit, signed);
    return v >= min && v <= max;
  }
  static #calcMinMax(bit, signed = false) {
    if (!Number.isSafeInteger(bit) || bit<1 || 53<bit) throw new Error(`bitは1〜53までの整数であるべきです。`);
    const min = signed ? -(2 ** (bit - 1)) : 0;
    const max = signed ? 2 ** (bit - 1) - 1 : 2 ** bit - 1;
    return [min, max];
  }
}
a.p.num.int.bit = (v,bit)=> IntBit.is(v,bit,true);
a.p.num.uint.bit = (v,bit)=> IntBit.is(v,bit,false);
const cartesian = (...arrays) => arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
cartesian([true,false],[8,16,32]).forEach(([signed,bit])=>a.p.num[`${signed ? 'i' : 'u'}${bit}`] = (v)=> IntBit.is(v,bit,signed));
;
class IntRange {
  static without(v,min,max,signed) {return !this.within(v,min,max,signed);}
  static within(v,min,max,signed) {
    this.#validType(v,min,max,signed);
    return min<=v && v<=max;
  }
  static #validType(v,min,max,signed) {
    if (!a.p.bln(signed)) {throw new Error(`signedは真偽値であるべきです。`)}
    const t = signed ? 'uint' : 'int';
    if(![v,min,max].every(x=>a.p.num[t](x))){throw new Error(`v,min,maxは全てa.p.num.${t}型であるべきです。`)}
  }
}
a.p.num.int.within   = (v,min,max) => IntRange.within(v,min,max,false);
a.p.num.uint.within  = (v,min,max) => IntRange.within(v,min,max,true);
a.p.num.int.without  = (v,min,max) => IntRange.without(v,min,max,false);
a.p.num.uint.without = (v,min,max) => IntRange.without(v,min,max,true);
a.p.big.i = (v)=> a.p.big(v);
a.p.big.u = (v)=> a.p.big(v) && 0n<=v;
class BigBit {
  static is(v, bit, signed=false) {return this.#isBigBitRange(v, bit, signed = false)}
  static #isBigBitRange(v, bit, signed = false) {
    if (!a.p.big(v)) throw new Error(`vはBigIntであるべきです。`);
    const [min, max] = this.#calcMinMax(bit, signed);
    return v >= min && v <= max;
  }
  static #calcMinMax(bit, signed = false) {
    if (!a.p.num.int(bit) || bit<54) throw new Error(`bitは54以上の整数であるべきです。`);
    if (!a.p.bln(signed)) {throw new Error(`signedは真偽値であるべきです。`)}
    bit = BigInt(bit);
    const min = signed ? -(2n ** (bit - 1n)) : 0n;
    const max = signed ? 2n ** (bit - 1n) - 1n : 2n ** bit - 1n;
    return [min, max];
  }
}
a.p.big.i.bit = (v,bit)=> BigBit.is(v,bit,true);
a.p.big.u.bit = (v,bit)=> BigBit.is(v,bit,false);
cartesian([true,false],[64,128,256]).forEach(([signed,bit])=>a.p.big[`${signed ? 'i' : 'u'}${bit}`] = (v)=> BigBit.is(v,bit,signed));
;
class BigRange {
  static without(v,min,max,signed) {return !this.within(v,min,max,signed);}
  static within(v,min,max,signed) {
    this.#validType(v,min,max,signed);
    return min<=v && v<=max;
  }
  static #validType(v,min,max,signed) {
    if (!a.p.bln(signed)) {throw new Error(`signedは真偽値であるべきです。`)}
    const t = signed ? 'uint' : 'int';
    if(![v,min,max].every(x=>a.p.big[t](x))){throw new Error(`v,min,maxは全てa.p.big.${t}型であるべきです。`)}
  }
}
a.p.big.i.within   = (v,min,max) => BigRange.within(v,min,max,false);
a.p.big.u.within  = (v,min,max) => BigRange.within(v,min,max,true);
a.p.big.i.without  = (v,min,max) => BigRange.without(v,min,max,false);
a.p.big.u.without = (v,min,max) => BigRange.without(v,min,max,true);
a.p.str.blk = (v)=> a.p.str(v) && 0===v.length;
a.p.str.some = (v,...candidates)=> a.p.str(v) && candidates.every(x=>a.p.str(x)) && candidates.some(x=>x===v);
a.p.str.pat = (v,R)=> {
    if (!(R instanceof RegExp)) {throw new Error(`Rは正規表現であるべきです。`)}
    return R.test(v);
}
// Reference
a.r.cls = (v)=> 'function'===typeof v && 0<v.name?.length && /^[A-Z]/.test(v.name);
a.r.cls.err = (v)=> a.r.cls(v) && Error.prototype.isPrototypeOf(v.prototype);
a.r.cls.is = (v, C) => a.r.cls(v) && v === C;
a.r.cls.of = (v, C) => a.r.cls(v) && (v === C || C.prototype.isPrototypeOf(v.prototype));
a.r.cls.is.some = (v, ...Cs) => Cs.some(C=>a.r.cls.is(v));
a.r.cls.of.some = (v, ...Cs) => Cs.some(C=>a.r.cls.of(v));
a.r.cal = (v)=> 'function'===typeof v;
a.r.ary = (v)=> Array.isArray(v);
a.r.ary.blk = (v)=> a.r.ary(v) && 0===v?.length;
a.r.ary.is = (v)=> a.r.ary(v) && Array===v?.constructor;
a.r.ary.of = (v)=> a.r.ary(v);
a.r.ary.g = (v,C)=> {// generics
    if (!a.r.cls(C)) {throw new Error(`Cはクラスであるべきです。`)}
    //return a.r.ary(v) && v?.every(x=>x instanceof C);
    return a.r.ary(v) && v?.every(x=>C===x.constructor || x instanceof C);
};
a.r.ary.bit = (v)=> [Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float16Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array].some(C=>v instanceof C);
a.r.ary.i8 = (v)=> v instanceof Int8Array;
a.r.ary.i16 = (v)=> v instanceof Int16Array;
a.r.ary.i32 = (v)=> v instanceof Int32Array;
a.r.ary.u8 = (v)=> v instanceof Uint8Array;
a.r.ary.u8c = (v)=> v instanceof Uint8ClampedArray;
a.r.ary.u16 = (v)=> v instanceof Uint16Array;
a.r.ary.u32 = (v)=> v instanceof Uint32Array;
a.r.ary.f16 = (v)=> v instanceof Float16Array;
a.r.ary.f32 = (v)=> v instanceof Float32Array;
a.r.ary.f64 = (v)=> v instanceof Float64Array;
a.r.ary.i64 = (v)=> v instanceof BigInt64Array;
a.r.ary.u64 = (v)=> v instanceof BigUint64Array;
a.r.obj = (v)=> isObj(v) && Object.prototype===Object.getPrototypeOf(v) && !a.r.des(v);
//a.r.obj = (v)=> isObj(v) && Object.prototype.isPrototypeOf(v) && !a.r.des(v);
a.r.dic = (v)=> isObj(v) && null===Object.getPrototypeOf(v);
a.r.obj.blk = (v)=> a.r.obj(v) && 0===Object.keys(v).length;
a.r.dic.blk = (v)=> a.r.dic(v) && 0===Object.keys(v).length;
const has = (isDic, v, ...keys) => {
    if (!(0<keys.length && keys.every(k=>a.p.str(k)))) {throw new Error(`...keysは残余引数かつ文字列で1個以上あるべきです。`)}
    return a.r[isDic ? 'dic' : 'obj'](v) && keys.every(k=>k in v);
};
a.r.obj.has = (v, ...keys) => has(false, v, ...keys);
a.r.dic.has = (v, ...keys) => has(true, v, ...keys);
class Descriptor {
  static is(v) {return !!this.#get(v)}
  static isDat(v) {return ['data','function'].some(x=>x===getDes(v));}
  static isDatV(v) {return 'data'===getDes(v);}
  static isDatF(v) {return 'function'===getDes(v);}
  static isAcc(v) {return ['accessor','get','set'].some(x=>x===getDes(v));}
  static isAccG(v) {return 'get'===getDes(v);}
  static isAccS(v) {return 'set'===getDes(v);}
  static isAccGS(v) {return 'accessor'===getDes(v);}
  static #get(v) {
    if (!isObj(v)) return null;
    //if (!isObj(v)) {throw new Error(`vはオブジェクトであるべきです。`)};
    const validKeys = new Set('configurable enumerable writable value get set'.split(' '));
    const keys = Object.keys(v);
    const hasInvalidKey = keys.some(k=>!validKeys.has(k));
    if (hasInvalidKey) return null;
    //if (hasInvalidKey) {throw new Error(`vは所定のプロパティを持っているべきです。:${validKeys.join(',')}`)};
    const isDataDescriptor = 'value' in v || 'writable' in v;
    const isG = 'get' in v;
    const isS = 'set' in v;
    const dat = 'function'===typeof v.value ? 'function' : 'data';
    const acc = isG && isS ? 'accessor' : (!isG && !isS ? null : (isG ? 'get' : 'set'));
    if (isDataDescriptor && (isG || isS)) return null;
//    if (isDataDescriptor && (isG || isS)) {throw new Error(`データ／アクセサの両プロパティを保有しています。どちらか一方であるべきです。`)};
    return isDataDescriptor ? dat : acc;
  }
}
a.r.des = (v)=> Descriptor.is(v);
a.r.des.dat = (v)=> Descriptor.isDat(v);
a.r.des.dat.v = (v)=> Descriptor.isDatV(v);
a.r.des.dat.fn = (v)=> Descriptor.isDatF(v);
a.r.des.acc = (v)=> Descriptor.isAcc(v);
a.r.des.acc.get = (v)=> Descriptor.isAccG(v);
a.r.des.acc.set = (v)=> Descriptor.isAccS(v);
a.r.des.acc.gs = (v)=> Descriptor.isAccGS(v);
a.r.ins = (v)=> a.r(v) && !a.r.cal(v) && !a.r.ary(v) && !a.r.dic(v) && !a.r.obj(v) && !a.r.des(v);
a.r.ins.err = (v)=> a.r.ins.of(v,Error);
a.r.ins.of = (v,C)=> a.r.ins(v) && v instanceof C;
a.r.ins.is = (v,C)=> a.r.ins.of(v,C) && C===v.constructor;
a.r.ins.is.some = (v, ...Cs) => Cs.some(C=>a.r.ins.is(v));
a.r.ins.of.some = (v, ...Cs) => Cs.some(C=>a.r.ins.of(v));

// 関数オブジェクトからソースコード文字列を取得する
const fnSrc = (v)=> Function.prototype.toString.call(v);
// 正規表現の先頭判定を狂わせるコメント(ブロック/インライン)を消去
const remCmt = s=>s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').trim();
const calFmt = {
    cls: (v,s)=>/^class\b/.test(s),
    fn: (v,s)=>/^(async\s+)?function([\s*()|$])/.test(s),
    arr: (v,s)=>/^(async\s*)?(\([^)]*\)|[a-zA-Z_$][\w_$]*)\s*=>/.test(s),
}
const isCalFmt = (v,t)=>{
    const s = remCmt(fnSrc(v));
    return Object.keys(calFmt).every(k=>calFmt[k](v,s)===(k===t));
}
const isNat = v=>fnSrc(v).includes('[native code]');
const isBou = v=>v.name.startsWith('bound ');
a.r.cal.arrow = (v)=> a.r.cal(v) && (!v.hasOwnProperty('prototype') && isCalFmt(v,'arr'));
a.r.cal.method = (v)=> a.r.cal(v) && isCalFmt(v,'method');
a.r.cal.native = (v)=> a.r.cal(v) && isNat(v) && !isBou(v);
a.r.cal.bound = (v)=> a.r.cal(v) && isNat(v) && isBou(v);
a.r.cal.fn = (v)=> a.r.cal(v) && isCalFmt(v,'fn') && !isNat(v);
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
class FunctionAttributeVerifier {
  static #validIds = ['a.r.cal.fn.some', 'a.r.cal.method.some', 'a.r.cal.arrow.some'];
  static verify(v, options, id) {
    this.#validateId(id);
    const key = this.#validateAttribute(options, id);
    const fnObj = this.#getFn(id);
    if (!fnObj(v)) return false; 
    return this.#matchAttribute(v, key, options[key], fnObj);
  }
  static #getFn(id) {return id.includes('.method.') ? a.r.cal.method : (id.includes('.arrow.')  ? a.r.cal.arrow : a.r.cal.fn);}
  static #validateId(id) {
    if (!this.#validIds.includes(id)) {
      throw new Error(`[a.js System Error] 不正な id (パス) が検出されました: ${id}`);
    }
  }
  static #getValidKeys(id) {return id.includes('.arrow.') ? ['s', 'a'] : ['s', 'a', 'g'];}
  static #validateAttribute(options, id) {
    if (!a.r.obj(options)) {throw new Error(`${id} の options はプレーンオブジェクトであるべきです。`);}
    const keys = Object.keys(options);
    if (1!==keys.length) {throw new Error(`${id} のオプションキーは1つだけ指定してください。`);}
    const [key] = keys;
    const validKeys = this.#getValidKeys(id);
    if (!validKeys.includes(key)) {throw new Error(`不正なオプションキーです: ${key} (${validKeys.join(', ')} のみ許可)`);}
    if (!a.p.bln(options[key])) {throw new Error(`${id} のオプション値は真偽値であるべきです。`);}
    return key;
  }
  static #matchAttribute(v, key, targetFlag, fnObj) {
    if ('s'===key) return targetFlag === fnObj.s(v);
    if ('a'===key) return targetFlag === (fnObj.a(v) || (fnObj.ag ? fnObj.ag(v) : false));
    if ('g'===key) return targetFlag === ((fnObj.g ? fnObj.g(v) : false) || (fnObj.ag ? fnObj.ag(v) : false));
    return false;
  }
}
a.r.cal.fn.some     = (v, options) => FunctionAttributeVerifier.verify(v, options, 'a.r.cal.fn.some');
a.r.cal.method.some = (v, options) => FunctionAttributeVerifier.verify(v, options, 'a.r.cal.method.some');
a.r.cal.arrow.some  = (v, options) => FunctionAttributeVerifier.verify(v, options, 'a.r.cal.arrow.some');
// 4. Thenable (a.r.then / .obj.then / .ins.then) の判定// Promises/A+ 仕様に基づく: オブジェクトまたは関数で、かつ then が関数であること
const isThenable = (v) => a.r(v) && 'function' === typeof v?.then;
a.r.then = (v) => isThenable(v);
a.r.obj.then = (v) => a.r.obj(v) && isThenable(v);
a.r.ins.then = (v) => a.r.ins(v) && isThenable(v);
export {a};
