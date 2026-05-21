import { describe, test, expect } from 'bun:test';
import {a} from './a.js';
class Data {
    static B(...blacks) {return this.#wrap(this.#except([Boolean,Number,String], ...blacks).map(C=>new C()))}
    static C(...blacks) {return this.#data([null,undefined,NaN], ...blacks).map(v=>v)}
    static P(...blacks) {return this.#data([false,0,'',0n,Symbol.for('a')], ...blacks).map(v=>v)}
    static bln(...blacks) {return this.#data([true,false], ...blacks).map(v=>v)}
    static num(...blacks) {return this.#data([-1,0,1,0.1,Infinity,-Infinity,Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER+1,Number.MIN_SAFE_INTEGER,Number.MIN_SAFE_INTEGER-1], ...blacks).map(v=>v)}
    static big(...blacks) {return this.#data([-1n,0n,1n,BigInt(Number.MAX_SAFE_INTEGER),BigInt(Number.MAX_SAFE_INTEGER)+1n,BigInt(Number.MIN_SAFE_INTEGER),BigInt(Number.MIN_SAFE_INTEGER)-1n], ...blacks).map(v=>v)}
    static str(...blacks) {return this.#data(['','a','あ'], ...blacks).map(v=>v)}
    static sym(...blacks) {return this.#wrap(this.#except(['a','あ'], ...blacks).map(v=>Symbol.for(v)))}
    static int(...blacks) {return this.#data([-1,0,1,Number.MAX_SAFE_INTEGER,Number.MIN_SAFE_INTEGER], ...blacks).map(v=>v)}
    static flt(...blacks) {return this.#data([-0.1,0.1], ...blacks).map(v=>v)}
    static ctn() {return this.#wrap([[],{},Object.create(null)])}
    static obj() {return this.#wrap([{},Object.create(null)])}
    static cls() {return this.#wrap([class C{},Date,function C(){}])}
    static ins() {return this.#wrap([new (class C{})(),new Date(),new (function C(){})()])}
    static #data(values, ...blacks) {return this.#wrap(this.#except(values, ...blacks))}
    static #except(values, ...blacks) {return values.filter(v=>!blacks.includes(v));}
    static #wrap(values) {return values.map(v=>[v])}
}
describe('a.js', ()=>{
    test('a', () => expect(a).toBeInstanceOf(Object));
    describe('a.b', ()=>{
        test('exist', () => expect(a.b).toBeInstanceOf(Function));
        test.each([[Boolean,false],[Number,1],[String,'']])('(%p)->T', (t,v) => expect(a.b(new t(v))).toBe(true));
        test.each([[Boolean,false],[Number,1],[String,'']])('(%p)->F', (t,v) => expect(a.b(t(v))).toBe(false));
        test.each(Data.P())('(%p)->F', (v) => expect(a.b(v)).toBe(false));
        describe('a.b.bln', ()=>{
            test('true', ()=>expect(a.b.bln(new Boolean(false))).toBe(true));
            test.each([[Boolean,false],[Number,1],[String,'']])(`(%p)`, (t,v)=>expect(a.b.bln(new t(v))));
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
        test.each([[false],[1],[''],[1n],[Symbol()]])('(%p)->T', (v) => expect(a.p(v)).toBe(true));
        test.each([[null],[undefined],[NaN],[new Boolean()],[new Number()],[new String()],[new Date()],[{}],[[]],[()=>{}]])('(%p)->F', (v) => expect(a.p(v)).toBe(false));
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
            test.each([[new Date()],[new (class{})()]])('true %p', (v) => expect(a.r.ins(v)).toBe(true));
            test.each([[null],[undefined],[NaN],[1],[1n],[''],[Symbol()],[{}],[[]],[Object.create(null)],[new Boolean()],[new Number()],[new String()],[Date],[class C{}],[function(){}],[()=>{}]])('false %p', (v) => expect(a.r.ins(v)).toBe(false));
        });
        describe('.then', ()=>{
        });
        describe('.des', ()=>{
        });
        describe('.ary', ()=>{
        });
        describe('.obj', ()=>{
        });
        describe('.dic', ()=>{
        });
        describe('.cal', ()=>{
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


