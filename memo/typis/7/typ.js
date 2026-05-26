const B = [Boolean, Number, String];
const P = [...B, BigInt, Symbol];
const thB = v=>{if ('object'===typeof v && B.some(b=>b===v?.constructor)) {throw Error(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`)}}
const isCon = (v,...E)=>E.some(e=>e===v);
const isFn = v=>'function'===typeof v;
// /^class\b/.test(Function.prototype.toString.call(v).trim())判定はBabelで関数化すると無効故統一の為使用せず。
const isCls = v=>isFn(v) && /^[A-Z]+/.test(v?.name);
const isTs = C=>Number.isNaN(C) || [null,undefined,Infinity,-Infinity].some(x=>x===C) || isFn(C);
const isO = v=>null!==v && 'object'===typeof v;
const isIns = v=>{
    if (!isO(v)) { return false; }
    const proto = Object.getPrototypeOf(v);
    return proto !== null && [Object,Array].every(C=>C.prototype!==proto);
    //return proto !== null && [Object,Array].every(C=>C.prototype!==proto) && !Descriptor.is(v);
}
const getObjTag =v=>{
    if (!isO(v)) return tag(v);
    const proto = Object.getPrototypeOf(v);
    if (proto === null) return 'Dictionary';
    const des = Descriptor.tag(v);
    if (des) return des;
    const ctr = [Object,Array].find(C=>C.prototype===proto);
    if (ctr) return v.constructor.name;
    return isIns(v) ? `Instance<${v.constructor.name}>`: tag(v);
}
class Descriptor {
  static tag(v) {
    switch(this.#get(v)) {
      case 'data': return 'Descriptor.Data<Value>';
      case 'function': return 'Descriptor.Data<Function>';
      case 'accessor': return 'Descriptor.Accessor<Getter,Setter>';
      case 'get': return 'Descriptor.Accessor<Getter>';
      case 'set': return 'Descriptor.Accessor<Setter>';
      default: return '';
    }
  }
  static is(v) {return !!this.#get(v)}
  static isDat(v) {return ['data','function'].some(x=>x===getDes(v));}
  static isDatV(v) {return 'data'===getDes(v);}
  static isDatF(v) {return 'function'===getDes(v);}
  static isAcc(v) {return ['accessor','get','set'].some(x=>x===getDes(v));}
  static isAccG(v) {return 'get'===getDes(v);}
  static isAccS(v) {return 'set'===getDes(v);}
  static isAccGS(v) {return 'accessor'===getDes(v);}
  static #get(v) {
      console.log('#get 1');
    if (!isO(v)) return null;
    //if (!isObj(v)) {throw new Error(`vはオブジェクトであるべきです。`)};
    const validKeys = new Set('configurable enumerable writable value get set'.split(' '));
    const keys = Object.keys(v);
    const hasInvalidKey = keys.some(k=>!validKeys.has(k));
      console.log('#get 2');
    if (hasInvalidKey) return null;
    //if (hasInvalidKey) {throw new Error(`vは所定のプロパティを持っているべきです。:${validKeys.join(',')}`)};
    const isDataDescriptor = 'value' in v || 'writable' in v;
//    const isG = 'get' in v;
//    const isS = 'set' in v;
    const isG = 'get' in v && 'function'===typeof v.get;
    const isS = 'set' in v && 'function'===typeof v.set;
    const dat = 'function'===typeof v.value ? 'function' : 'data';
    const acc = isG && isS ? 'accessor' : (!isG && !isS ? null : (isG ? 'get' : 'set'));
      console.log('#get 3');
    if (isDataDescriptor && (isG || isS)) return null;
//    if (isDataDescriptor && (isG || isS)) {throw new Error(`データ／アクセサの両プロパティを保有しています。どちらか一方であるべきです。`)};
      console.log('#get 4', isDataDescriptor, dat, acc, v);
    return isDataDescriptor ? dat : acc;
  }
}
const tag = v=>Object.prototype.toString.call(v).slice(8,-1);
export const getTag = (...V)=>{
    if (0===V.length) {throw new Error(`引数不足です。1個以上の引数を渡してください。`)}
    const v = V[0];
    thB(v);
    if (Number.isNaN(v)) return 'NaN';
    else if (isCls(v)) return `Class<${v.name}>`;
    else return getObjTag(v);
}
class Typer {
    static execute(isThrow, isOf, isName, ...args) {
        console.log(`execute 0-------------------------`);
        const [v,Ts] = this.#validate(isName, ...args);
        console.log(`execute 1`);
        if (0===Ts.length) {return getTag(v)}
        console.log(`execute 2`);
        return this.#result(isThrow, isOf, isName, v, Ts);
    }
    static #result(isThrow, isOf, isName, v, Ts) {
        const R = isName ? this.#isName(v, Ts) : this.#isType(isOf, v, Ts);
        const expected = isName ? Ts.join(',') : (Ts.map(T=>isCls(T) ? T.name : getTag(T)));
        if (isThrow && !R) {throw new TypeError(`値が期待する型と違います。期待:${expected}, 実際:${getTag(v)}, 値:${v}`)}
        return R;
    }
    static #validate(isName, ...args) {
        if (0===args.length) {throw new Error('引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。')}
        const [v,Ts] = [args[0],args.slice(1)];
        thB(v);
        return [v,Ts];
    }
    static #isName(v, Ns) {
        Ns.forEach(N=>{if ('string'!==typeof N) {throw new Error(`型名は文字列であるべきです。`)}});
        return Ns.some(N=>N===getTag(v));
    }
    static #isType(isOf, v, Ts) {
        const R = []
        for (let T of Ts) {
            if (!isTs(T)) {throw new Error(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(T)}`)}
            R.push(this.#one(v,T,false,isOf));
        }
        return R.some(r=>r);
    }
    static #one(v, T, isThrow, isOf=false) {
        if (Number.isNaN(v)) {return Number.isNaN(T)}
        if ([v,T].some(x=>isCon(x, null, undefined, Infinity, -Infinity))) {return v===T}
        if (P.some(p=>p===T)) {return typeof v === T.name.toLowerCase()}
        if (Function===T) {return isFn(v)}
        if (Array===T) {return Array.isArray(v) && (isOf ? true : Array.prototype===Object.getPrototypeOf(v))}
//        if (Object===T) {return isO(v) && (isOf ? true : Object.prototype===Object.getPrototypeOf(v))}
        if (Object===T) {return isO(v) && (isOf ? true : (Object.prototype===Object.getPrototypeOf(v) && !Descriptor.is(v)))}
        const R = v instanceof T && isOf ? true : v.constructor===T;
        return R;
    }
}
export const typis = (...args) => Typer.execute(false, false, false, ...args);
export const typof = (...args) => Typer.execute(false, true , false, ...args);
export const typer = (...args) => Typer.execute(true , false, false, ...args);
export const typef = (...args) => Typer.execute(true , true , false, ...args);
// 型名一致はisOfを考慮しない厳密判定である
export const typnm = (...args) => Typer.execute(false, false, true , ...args);
export const typem = (...args) => Typer.execute(true , false, true , ...args);
// isThrow:偽判定時例外送出するか否か:boolean, Ary/Obj/Ins継承関係まで遡るか否か:boolean
const ins = {bool:null, throw:null};
const NB = Symbol('NewBlock');
export class Typ {
    static get bool() {return this.#get('bool')}
    static get throw() {return this.#get('throw')}
    static #get(n) {
        if (!['bool','throw'].some(x=>x===n)) {throw new Error(`Implementation Error.`)}
        if (!ins[n]) {ins[n]=new Typ(NB, 'throw'===n);}
        return ins[n];
    }
    constructor(block, isThrow=false) {
        if (NB!==block) {throw new Error(`new禁止`)}
        this._={isThrow}
        if ('boolean'!==typeof isThrow) {throw new Error(`isThrowは真偽値であるべきです。`)}
    }
    is(...args) {console.log(`Typ.is:`);return Typer.execute(this._.isThrow, false, false, ...args);}
    of(...args) {return Typer.execute(this._.isThrow, true , false, ...args);}
    as(...args) {return Typer.execute(this._.isThrow, false, true, ...args);}
    isInvalidObj(v) {}
    isB(v) {}// BoxedPrimitive
    isC(v) {}// Constant
    isP(v) {}// Primitive
    isCls(v,C) {}
    isIns(v,C) {}
    isAry(v) {}
    isObj(v) {}
    isDic(v) {}
    isDes(v,options) {}// {data/accessor, value/function, g/s/gs}
    isFn(v,options) {//{s:false, a:false, g:false}/{fn:, arrow:, method:, native:, bound:}
    }
}
