const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
const th = (v,t)=> {throw new Error(`型が期待値と違います。期待:${t} 実際:${v} tag:${getTag(v)}`);}
const a = {};
a.p = (v)=> !Object(v);
a.r = (v)=> !!Object(v);
a.c = (v)=> [null,undefined].some(x=>x===v) || Number.isNaN(v);
// Constant
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
a.p.num.unsafe = (v)=> a.p.num(v) && Number.MAX_SAFE_INTEGER<v || v<Number.MIN_SAFE_INTEGER;
a.p.num.fin = (v)=> a.p.num(v) && v<=Number.MAX_SAFE_INTEGER || Number.MIN_SAFE_INTEGER<=v;
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
  if (!signed && [v,min,max].some(x=>x<0)) throw new Error(``);
}
a.p.num.int.within = (v,min,max)=> [v,min,max].every(x=>a.p.num.int(x)) && min<=v && v<=max;
a.p.num.uint.within = (v,min,max)=> [v,min,max].every(x=>a.p.num.uint(x)) && min<=v && v<=max;
a.p.num.int.without = (v,min,max)=> [v,min,max].every(x=>a.p.num.int(x)) && (v<min || max<v);
a.p.num.uint.without = (v,min,max)=> [v,min,max].every(x=>a.p.num.uint(x)) && (v<min || max<v);
export {a};
