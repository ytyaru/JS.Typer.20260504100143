import { describe, test, expect } from 'bun:test';
import {a} from './a.js';
class Data {
    static #all = 'B C bln num big str sym obj dic ary cls fn ins des'.split(' ');
    static all(names, ...blacks) {return (Array.isArray(names) ? names : this.#all).flatMap(n=>this[n](...blacks));}
    static without(...blacks) {return this.all(this.#except(this.#all, ...blacks))}
    static B(...blacks) {return this.#wrap(this.#except([Boolean,Number,String], ...blacks).map(C=>new C()))}
    static C(...blacks) {return this.#data([null,undefined,NaN], ...blacks)}
    static P(...blacks) {return this.#data([false,0,'',0n,Symbol.for('a')], ...blacks)}
    static bln(...blacks) {return this.#data([true,false], ...blacks)}
    static num(...blacks) {return this.#data([-1,0,1,0.1,Infinity,-Infinity,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1,Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER-1], ...blacks)}
    static big(...blacks) {return this.#data([-1n,0n,1n,BigInt(Number.MAX_SAFE_INTEGER),BigInt(Number.MAX_SAFE_INTEGER)+1n,BigInt(Number.MIN_SAFE_INTEGER),BigInt(Number.MIN_SAFE_INTEGER)-1n], ...blacks)}
    static str(...blacks) {return this.#data(['','a','あ'], ...blacks)}
    static sym(...blacks) {return this.#wrap(this.#except(['a','あ'], ...blacks).map(v=>Symbol.for(v)))}
    static int(...blacks) {return this.#data([-1,0,1,Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER], ...blacks)}
    static flt(...blacks) {return this.#data([-0.1,0.1], ...blacks)}
    static ctn() {return this.#wrap([[],{},Object.create(null)])}
    static ary() {return this.#wrap([[], new (class A extends Array{})()])}
    static obj() {return this.#wrap([{}])}
    static dic() {return this.#wrap([Object.create(null)])}
    static cls() {return this.#wrap([Date,function C(){},class C{},this.#C,this.#D])}
    static ins() {return this.#wrap([new Date(),new (function C(){})(),new (class C{})(),this.#c,this.#d])}
    static #desV = Object.defineProperty({}, 'des', {value:'v'});
    static #desF = Object.defineProperty({}, 'des', {value:()=>'f'});
    static #desG = Object.defineProperty({}, 'des', {get:()=>'g'});
    static #desS = Object.defineProperty({}, 'des', {set:(v)=>'s'});
    static #desA = Object.defineProperty({}, 'des', {get:()=>'ag',set:(v)=>'as'});
    static des() {return this.#data([this.#desV, this.#desF, this.#desG, this.#desS, this.#desA].map(d=>Object.getOwnPropertyDescriptor(d, 'des')))}
    static #AsyncFunction = (async () => {}).constructor;
    static #GeneratorFunction = (function* () {}).constructor;
    static #AsyncGeneratorFunction = (async function* () {}).constructor;
    static #C = class C {
        static M() {return 'M'}
        static async AM() {return 'AM'}
        static *GM() {return 'GM'}
        static async *AGM() {return 'AGM'}
        static get G() {return 'G'}
        static set S(v) {return 'S'}
        static get GS() {return 'GS'}
        static set GS(v) {return 'GS'}
        get V() {return 'V'}
        get F() {return ()=>'F'}
        m() {return 'm'}
        *gm() {return 'gm'}
        async am() {return 'am'}
        async *agm() {return 'agm'}
        get g() {return 'g'}
        set s(v) {return 's'}
        get gs() {return 'gs'}
        set gs(v) {return 'gs'}
        get v() {return 'v'}
        get f() {return ()=>'f'}
    };
    static #c = new this.#C();
    static #D = class D extends this.#C {constructor(){super()}}
    static #d = new this.#D();
    static cal() {return this.#data([...this.fn(), ...this.cls()].flatMap(v=>v))}
    //static fn() {return this.#data([()=>{}, async()=>{}, function(){}, function fn(){}, async function afn(){}, function *gfn(){}, async function *agfn(){}, this.#C.M, this.#c.m])}
    static fn() {return 'arrow clsMethod insMethod native bound functions'.split(' ').flatMap(n=>this[n]())}
    static arrow() {return this.#data([()=>{}, async()=>{}])}
    static clsMethod() {return this.#data([this.#C.M, this.#C.AM, this.#C.GM, this.#C.AGM])}
    static insMethod() {return this.#data([this.#c.m, this.#c.am, this.#c.gm, this.#c.agm])}
    static native() {return this.#data([Array.prototype.map])}
    static bound() {return this.#data([(function(){}).bind(null)])}
    static functions() {return this.#data([function(){}, function fn(){}, async function afn(){}, function *gfn(){}, async function *agfn(){}])}
    static #data(values, ...blacks) {return this.#wrap(this.#except(values, ...blacks))}
    static #except(values, ...blacks) {return values.filter(v=>!blacks.includes(v));}
    static #wrap(values) {return values.map(v=>[v])}
}
describe('a.js', ()=>{
    test('a', () => expect(a).toBeInstanceOf(Object));
    describe('a.b', ()=>{
        test('exist', () => expect(a.b).toBeInstanceOf(Function));
        const D = [[Boolean,false],[Number,1],[String,'']];
        test.each(D)('(%p)->T', (t,v) => expect(a.b(new t(v))).toBe(true));
        test.each(D)('(%p)->F', (t,v) => expect(a.b(t(v))).toBe(false));
        test.each(Data.P())('(%p)->F', (v) => expect(a.b(v)).toBe(false));
        describe('a.b.bln', ()=>{
            test('true', ()=>expect(a.b.bln(new Boolean(false))).toBe(true));
            test.each(D)(`(%p)`, (t,v)=>expect(a.b.bln(new t(v))));
        });
        describe('a.b.num', ()=>{
            test('true', ()=>expect(a.b.num(new Number(1))).toBe(true));
            test.each([[Boolean,false],[String,'']])(`(%p)`, (t,v)=>expect(a.b.num(new t(v))));
        });
        describe('a.b.str', ()=>{
            test('true', ()=>expect(a.b.str(new String(''))).toBe(true));
            test.each([[Boolean,false],[Number,1]])(`(%p)`, (t,v)=>expect(a.b.str(new t(v))));
        });
    });
    describe('a.c', ()=>{
        test('exist', () => expect(a.c).toBeInstanceOf(Function));
        test.each(Data.C())('(%p)->T', (v) => expect(a.c(v)).toBe(true));
        test.each([...Data.P(),[new Date()]])('(%p)->F', (v) => expect(a.c(v)).toBe(false));
        describe('a.c.nul', ()=>{
            test('true', ()=>expect(a.c.nul(null)).toBe(true));
            test.each(Data.C(null))('false', (v)=>expect(a.c.nul(v)).toBe(false));
        });
        describe('a.c.und', ()=>{
            test('true', ()=>expect(a.c.und(undefined)).toBe(true));
            test.each(Data.C(undefined))('false', (v)=>expect(a.c.und(v)).toBe(false));
        });
        describe('a.c.nan', ()=>{
            test('true', ()=>expect(a.c.nan(NaN)).toBe(true));
            test.each(Data.C(NaN))('false', (v)=>expect(a.c.nan(v)).toBe(false));
        });
    });
    describe('a.p', ()=>{
        test('exist', () => expect(a.p).toBeInstanceOf(Function));
        test.each(Data.P())('(%p)->T', (v) => expect(a.p(v)).toBe(true));
        test.each(Data.all('C B ins ctn cal'.split(' ')))('(%p)->F', (v) => expect(a.p(v)).toBe(false));
        describe('.bln', ()=>{
            test('exist', () => expect(a.p.bln).toBeInstanceOf(Function));
            test.each(Data.bln())('true P(%p)', (v) => expect(a.p.bln(v)).toBe(true));
            test.each(Data.bln())('true F(%p)', (v) => expect(a.p.bln(Boolean(v))).toBe(true));
            test.each(Data.bln())('false B(%p)', (v) => expect(a.p.bln(new Boolean(v))).toBe(false));
            test.each([...Data.C(), ...Data.P(false), ...Data.B(), [new Date()]])('false T(%p)', (v) => expect(a.p.bln(v)).toBe(false));
        });
        describe('.num', ()=>{
            test('exist', () => expect(a.p.num).toBeInstanceOf(Function));
            test.each(Data.num())('true P(%p)', (v) => expect(a.p.num(v)).toBe(true));
            test.each([['1']])('true F(%p)', (v) => expect(a.p.num(Number(v))).toBe(true));
            test.each([[null]])('true F(%p)', (v) => expect(a.p.num(Number(v))).toBe(true));// 0
            test.each([[undefined]])('true F(%p)', (v) => expect(a.p.num(Number(v))).toBe(false));// NaN
            test.each([[1],['1'],[undefined],[null]])('false B(%p)', (v) => expect(a.p.num(new Number(v))).toBe(false));
            test.each([...Data.C(), ...Data.P(0), ...Data.B(), ...Data.ins()])(`false T(%p)`, (v) => expect(a.p.num(v)).toBe(false));
        });
        describe('.big', ()=>{
            test('exist', () => expect(a.p.big).toBeInstanceOf(Function));
            test.each([[-1n],[0n],[1n],[BigInt(Number.MAX_SAFE_INTEGER)],[BigInt(Number.MAX_SAFE_INTEGER)+1n]])('true P(%p)', (v) => expect(a.p.big(v)).toBe(true));
            test.each([['1']])('true F(%p)', (v) => expect(a.p.big(BigInt(v))).toBe(true));
//            test.each([[null]])('true F(%p)', (v) => expect(a.p.big(BigInt(v))).toBe(true));// 0
//            test.each([[undefined]])('true F(%p)', (v) => expect(a.p.big(BigInt(v))).toBe(false));// NaN
//            test.each([[1],['1'],[undefined],[null]])('false B(%p)', (v) => expect(a.p.big(new BigInt(v))).toBe(false));
            test.each([...Data.C(), ...Data.P(0n), ...Data.B(), ...Data.ins()])(`false T(%p)`, (v) => expect(a.p.big(v)).toBe(false));
        });
        describe('.str', ()=>{
            test('exist', () => expect(a.p.str).toBeInstanceOf(Function));
            test.each([[''],['a']])('true P(%p)', (v) => expect(a.p.str(v)).toBe(true));
            test.each([[''],['a']])('true F(%p)', (v) => expect(a.p.str(String(v))).toBe(true));
            test.each([[''],['a']])('false B(%p)', (v) => expect(a.p.str(new String(v))).toBe(false));
            test.each([...Data.C(), ...Data.P(''), ...Data.B(), ...Data.ins()])('false T(%p)', (v) => expect(a.p.str(v)).toBe(false));
        });
        describe('.sym', ()=>{
            test('exist', () => expect(a.p.sym).toBeInstanceOf(Function));
            const D = [[Symbol()],[Symbol('a')]];
            test.each(D)('true P(%p)', (v) => expect(a.p.sym(v)).toBe(true));
//            test.each(D)('true F(%p)', (v) => expect(a.p.sym(Symbol(v))).toBe(true));
//            test.each(D)('false B(%p)', (v) => expect(a.p.sym(new Symbol(v))).toBe(false));
            test.each([...Data.C(), ...Data.P(Symbol.for('a')), ...Data.B(), ...Data.ins()])('false T(%p)', (v) => expect(a.p.sym(v)).toBe(false));
        });
    });
    describe('a.r', ()=>{
        test('exist', () => expect(a.r).toBeInstanceOf(Function));
        
        test.each([[{}],[[]],[Object.create(null)],[function(){}],[()=>{}],[new Date()],[new (class{})()]])(``,(v)=>expect(a.r(v)).toBe(true));
        test.each([[null],[undefined],[NaN],[new Boolean()],[new Number()],[new String()],[false],[1],[''],[1n],[Symbol()]])('(%p)->F', (v) => expect(a.r(v)).toBe(false));
        describe('.cls', ()=>{
            test('exist', () => expect(a.r.cls).toBeInstanceOf(Function));
            test('true class(1字目が大文字)', () => expect(a.r.cls(class A{})).toBe(true));
            test('true NativeCode(Date)', () => expect(a.r.cls(Date)).toBe(true));
            test('true 関数(1字目が大文字)', () => expect(a.r.cls(function A(){})).toBe(true));
            test('false 関数(1字目が小文字)', () => expect(a.r.cls(function a(){})).toBe(false));
            test('false 関数(無名)', () => expect(a.r.cls(function(){})).toBe(false));
            test('false class(1字目が小文字)', () => expect(a.r.cls(class a{})).toBe(false));
            test('false class(無名)', () => expect(a.r.cls(class{})).toBe(false));
            test.each([[null],[undefined],[NaN],[new (class C{})()],[new Date()]])('false T(%p)', () => expect(a.r.cls(class{})).toBe(false));
        });
        describe('.ins', ()=>{
            test('exist', () => expect(a.r.ins).toBeInstanceOf(Function));
            test.each(Data.ins())('true %p', (v) => expect(a.r.ins(v)).toBe(true));
            //test.each([[null],[undefined],[NaN],[1],[1n],[''],[Symbol()],[{}],[[]],[Object.create(null)],[new Boolean()],[new Number()],[new String()],[Date],[class C{}],[function(){}],[()=>{}]])('false %p', (v) => expect(a.r.ins(v)).toBe(false));
            test.each(Data.without('ins'))('false %p', (v) => expect(a.r.ins(v)).toBe(false));
            describe('.then', ()=>{
                class A {async then() {}}
                const O = {then:()=>{}};
                test.each([[new A()]])('(%p)->T', (v)=>expect(a.r.ins.then(v)).toBe(true));
                test.each([[O]])('(%p)->F', (v)=>expect(a.r.ins.then(v)).toBe(false));
                test.each([...Data.C(), ...Data.P(), ...Data.cls(), [A]])('(%p)->F', (v)=>expect(a.r.ins.then(v)).toBe(false));
            });
        });
        describe('.then', ()=>{
            class A {async then() {}}
            const O = {then:()=>{}};
            test.each([[new A()],[O]])('(%p)->T', (v)=>expect(a.r.then(v)).toBe(true));
            test.each(Data.all())('(%p)->F', (v)=>expect(a.r.then(v)).toBe(false));
        });
        describe('.des', ()=>{
            test.each(Data.des())('(%p)->T', (v) => expect(a.r.des(v)).toBe(true));
            test.each(Data.without('des'))('false %p', (v) => expect(a.r.des(v)).toBe(false));
        });
        describe('.ary', ()=>{
            test.each(Data.ary())(`(%p)->T`, (v)=>expect(a.r.ary(v)).toBe(true));
            test.each(Data.without('ary'))(`(%p)->F`, (v)=>expect(a.r.ary(v)).toBe(false));
            describe('.blk', ()=>{
                test.each(Data.ary())(`(%p)->T`, (v)=>expect(a.r.ary.blk(v)).toBe(true));
                test.each([[[0],[0,1],new (class A extends Array{constructor(){super(1)}})()]])(`(%p)->F`, (v)=>expect(a.r.ary.blk(v)).toBe(false));
            });
            describe('.is', ()=>{
                test.each([[[]],[[0]],[[0,1]]])(`(%p)->T`, (v)=>expect(a.r.ary.is(v)).toBe(true));
                test.each([
                    [new (class A extends Array{})()],
                    [new (class A extends Array{constructor(){super(1)}})()],
                ])(`(%p)->F`, (v)=>expect(a.r.ary.is(v)).toBe(false));
                test.each(Data.without('ary'))(`(%p)->F`, (v)=>expect(a.r.ary.is(v)).toBe(false));
            });
            describe('.of', ()=>{
                test.each([[[]],[[0]],[[0,1]]])(`(%p)->T`, (v)=>expect(a.r.ary.of(v)).toBe(true));
                test.each([
                    [new (class A extends Array{})()],
                    [new (class A extends Array{constructor(){super(1)}})()],
                ])(`(%p)->F`, (v)=>expect(a.r.ary.of(v)).toBe(true));
                test.each(Data.without('ary'))(`(%p)->F`, (v)=>expect(a.r.ary.of(v)).toBe(false));
            });
            describe('.g', ()=>{
                const nums = [0,-1,0.1];
                const blns = [true,false,true];
                const strs = ['', 'a', 'あ'];
                const bigs = [0n,-1n,1n];
                const syms = [Symbol(), Symbol(''), Symbol('a')];
                test.each([[blns]])(`(%p)->T`, (v)=>expect(a.r.ary.g(v,Boolean)).toBe(true));
                test.each([[nums]])(`(%p)->T`, (v)=>expect(a.r.ary.g(v,Number)).toBe(true));
                test.each([[strs]])(`(%p)->T`, (v)=>expect(a.r.ary.g(v,String)).toBe(true));
                test.each([[bigs]])(`(%p)->T`, (v)=>expect(a.r.ary.g(v,BigInt)).toBe(true));
                test.each([[syms]])(`(%p)->T`, (v)=>expect(a.r.ary.g(v,Symbol)).toBe(true));
                test.each([[blns]])(`(%p)->F`, (v)=>expect(a.r.ary.g(v,Number)).toBe(false));
                test.each([[...blns, ...nums]])(`(%p)->F`, (v)=>expect(a.r.ary.g(v,Boolean)).toBe(false));
                // 空配列は真になる
                test.each(Data.ary())(`(%p)->T`, (v)=>expect(a.r.ary.g(v,Symbol)).toBe(true));
                test.each(Data.without('bln','ary'))(`(%p)->F`, (v)=>expect(a.r.ary.g(v,Boolean)).toBe(false));
            });
            const VS = [Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float16Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array];
            const vs = VS.map(C=>[new C(1)]);
            const get = (T)=> [undefined,1].map(l=>[new T(l)]);
            const except = (...blacks)=> VS.filter(v=>!blacks.includes(v)).map(C=>[new C(1)]);
            describe('.bit', ()=>{
                test.each(vs)(`(%p)->T`,(v)=>expect(a.r.ary.bit(v)).toBe(true));
                test.each(Data.all())(`(%p)->F`, (v)=>expect(a.r.ary.bit(v)).toBe(false));
            });
            describe('.i8', ()=>{
                test.each(get(Int8Array))(`(%p)->T`, (v)=>expect(a.r.ary.i8(v)).toBe(true));
                test.each([except(Int8Array)])(`(%p)->F`, (v)=>expect(a.r.ary.i8(v)).toBe(false));
            });
            describe('.i16', ()=>{
                test.each(get(Int16Array))(`(%p)->T`, (v)=>expect(a.r.ary.i16(v)).toBe(true));
                test.each([except(Int16Array)])(`(%p)->F`, (v)=>expect(a.r.ary.i16(v)).toBe(false));
            });
            describe('.i32', ()=>{
                test.each(get(Int32Array))(`(%p)->T`, (v)=>expect(a.r.ary.i32(v)).toBe(true));
                test.each([except(Int32Array)])(`(%p)->F`, (v)=>expect(a.r.ary.i32(v)).toBe(false));
            });
            describe('.u8', ()=>{
                test.each(get(Uint8Array))(`(%p)->T`, (v)=>expect(a.r.ary.u8(v)).toBe(true));
                test.each([except(Uint8Array)])(`(%p)->F`, (v)=>expect(a.r.ary.u8(v)).toBe(false));
            });
            describe('.u8c', ()=>{
                test.each(get(Uint8ClampedArray))(`(%p)->T`, (v)=>expect(a.r.ary.u8c(v)).toBe(true));
                test.each([except(Uint8ClampedArray)])(`(%p)->F`, (v)=>expect(a.r.ary.u8c(v)).toBe(false));
            });
            describe('.u16', ()=>{
                test.each(get(Uint16Array))(`(%p)->T`, (v)=>expect(a.r.ary.u16(v)).toBe(true));
                test.each([except(Uint16Array)])(`(%p)->F`, (v)=>expect(a.r.ary.u16(v)).toBe(false));
            });
            describe('.u32', ()=>{
                test.each(get(Uint32Array))(`(%p)->T`, (v)=>expect(a.r.ary.u32(v)).toBe(true));
                test.each([except(Uint32Array)])(`(%p)->F`, (v)=>expect(a.r.ary.u32(v)).toBe(false));
            });
            describe('.f16', ()=>{
                test.each(get(Float16Array))(`(%p)->T`, (v)=>expect(a.r.ary.f16(v)).toBe(true));
                test.each([except(Float16Array)])(`(%p)->F`, (v)=>expect(a.r.ary.f16(v)).toBe(false));
            });
            describe('.f32', ()=>{
                test.each(get(Float32Array))(`(%p)->T`, (v)=>expect(a.r.ary.f32(v)).toBe(true));
                test.each([except(Float32Array)])(`(%p)->F`, (v)=>expect(a.r.ary.f32(v)).toBe(false));
            });
            describe('.f64', ()=>{
                test.each(get(Float64Array))(`(%p)->T`, (v)=>expect(a.r.ary.f64(v)).toBe(true));
                test.each([except(Float64Array)])(`(%p)->F`, (v)=>expect(a.r.ary.f64(v)).toBe(false));
            });
            describe('.i64', ()=>{
                test.each(get(BigInt64Array))(`(%p)->T`, (v)=>expect(a.r.ary.i64(v)).toBe(true));
                test.each([except(BigInt64Array)])(`(%p)->F`, (v)=>expect(a.r.ary.i64(v)).toBe(false));
            });
            describe('.u64', ()=>{
                test.each(get(BigUint64Array))(`(%p)->T`, (v)=>expect(a.r.ary.u64(v)).toBe(true));
                test.each([except(BigUint64Array)])(`(%p)->F`, (v)=>expect(a.r.ary.u64(v)).toBe(false));
            });
        });
        describe('.obj', ()=>{
            test.each(Data.obj())(`(%p)->T`, v=>expect(a.r.obj(v)).toBe(true));
            test.each(Data.without('obj'))(`(%p)->F`, v=>expect(a.r.obj(v)).toBe(false));
            describe('.blk', ()=>{
                test.each(Data.obj())(`(%p)->T`, v=>expect(a.r.obj.blk(v)).toBe(true));
                test.each([[{k:'v'}]])(`(%p)->F`, v=>expect(a.r.obj.blk(v)).toBe(false));
            });
            const P = {k:1};
            const C = Object.create(P);
            describe('.has', ()=>{
                test.each([[P]])(`P(%p)->T`, v=>expect(a.r.obj.has(v,'k')).toBe(true));
                test.each([[C]])(`C(%p)->T`, v=>expect(a.r.obj.has(v,'k')).toBe(false));
                test.each(Data.obj())(`(%p)->F`, v=>expect(a.r.obj.has(v,'k')).toBe(false));
            });
            describe('.then', ()=>{
                class A {async then() {}}
                const O = {then:()=>{}};
                test.each([[O]])('(%p)->T', (v)=>expect(a.r.obj.then(v)).toBe(true));
                test.each([[new A()]])('(%p)->F', (v)=>expect(a.r.obj.then(v)).toBe(false));
                test.each([...Data.C(), ...Data.P(), ...Data.cls(), [A]])('(%p)->F', (v)=>expect(a.r.obj.then(v)).toBe(false));
            });
        });
        describe('.dic', ()=>{
            test.each(Data.dic())(`(%p)->T`, v=>expect(a.r.dic(v)).toBe(true));
            test.each(Data.without('dic'))(`(%p)->F`, v=>expect(a.r.dic(v)).toBe(false));
            describe('.blk', ()=>{
                test.each(Data.dic())(`(%p)->T`, v=>expect(a.r.dic.blk(v)).toBe(true));
                test.each([[{k:'v'}]])(`(%p)->F`, v=>expect(a.r.dic.blk(v)).toBe(false));
            });
            const P = Object.create(null);
            P.k = 1;
            const C = Object.create(P);
            describe('.has', ()=>{
                test.each([[P]])(`P(%p)->T`, v=>expect(a.r.dic.has(v,'k')).toBe(true));
                test.each([[C]])(`C(%p)->T`, v=>expect(a.r.dic.has(v,'k')).toBe(false));
                test.each(Data.dic())(`(%p)->F`, v=>expect(a.r.dic.has(v,'k')).toBe(false));
            });
        });
        describe('.cal', ()=>{
            test.each(Data.cal())(`(%p)->T`, v=>expect(a.r.cal(v)).toBe(true));
            test.each(Data.without('cls','fn'))(`(%p)->T`, v=>expect(a.r.cal(v)).toBe(false));
            describe('.arrow', ()=>{
            });
            describe('.method', ()=>{
            });
            describe('.native', ()=>{
            });
            describe('.bound', ()=>{
            });
            describe('.fn', ()=>{
            });
        });




    });
    describe('a.invalid', ()=>{
        test('exist', () => expect(a.invalid).toBeInstanceOf(Function));
        test(`(constructor無し)`,()=>{
            const o = {};
            o.constructor = undefined;
            expect(a.invalid(o)).toBe(true);
        });
        test(`(Object.create(null))`,()=>{
            const o = Object.create(null);
            expect(a.invalid(o)).toBe(true);
        });
        test.skip(`(constructor.name無し(readonlyのため不能))`,()=>{
            const o = {};
            o.constructor.name = undefined;
            expect(a.invalid(o)).toBe(true);
        });
        test(`(constructor.name無し(Object.create(null)にconstructorを{}しname無しにしsetPrototypeOfして作成))`,()=>{
            const o = Object.create(null);
            const p = Object.create(null);
            p.constructor = {};
            Object.setPrototypeOf(o,p);
            expect(a.invalid(o)).toBe(true);
        });
        test.each([[false],[1],[''],[1n],[Symbol()],[{}]])('(%p)->F', (v) => expect(a.invalid(v)).toBe(false));
    });
});


