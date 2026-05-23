import { describe, test, expect } from 'bun:test';
import {typis} from './typis.js';
describe('typis.js', ()=>{
    test('exist', () => expect(typis).toBeInstanceOf(Function));
    test('()', () => {
        try {typis()}
        catch(e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。`);
        }
    });
    describe('(v)', () => {
        test.each([Boolean,Number,String].map(C=>[new C()]))(`BoxedPrimitive(%p)`,v=>{
            try{typis(v)} catch(e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`);
            }
        })
        test('undefined', ()=>expect(typis(undefined)).toBe('Undefined'));
        test('NaN', ()=>expect(typis(NaN)).toBe('NaN'));
        test('Null', ()=>expect(typis(null)).toBe('Null'));
        test.each([[false],[true]])('(%p)->"Boolean"',v=>expect(typis(v)).toBe('Boolean'));
        test.each([[0],[1],[-1],[0.1],[Infinity],[-Infinity]])('(%p)->"Number"',v=>expect(typis(v)).toBe('Number'));
        test.each([[''],['a'],['あ']])('(%p)->"String"',v=>expect(typis(v)).toBe('String'));
        test.each([[0n],[1n],[-1n]])('(%p)->"BigInt"',v=>expect(typis(v)).toBe('BigInt'));
        test.each([[Symbol()],[Symbol('')],[Symbol('a')],[Symbol.for('a')]])('(%p)->"Symbol"',v=>expect(typis(v)).toBe('Symbol'));
        test.each([[undefined],[0]])('(%p)',v=>{
            try {typis(v)}
            catch(e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`);
            }
        });
    });
    describe('(v,C)', () => {
        describe('true', () => {
            test.each([[NaN],[undefined],[null]])('(%p)',v=>{
                expect(typis(v,v)).toBe(true);
            });
            test.each([[false,Boolean],[0,Number],['',String],[0n,BigInt],[Symbol(),Symbol]])('(%p,%p)',(v,C)=>{
                expect(typis(v,C)).toBe(true);
            });
            test.each([[[]],[[0]],[[0,1]],[['']],[[0,'']],[new (class A extends Array{})()]])('(%p,Array)',(v)=>{
                expect(typis(v,Array)).toBe(true);
            });
            test.each([[{}],[{k:0}]])('(%p,Object)',(v)=>{
                expect(typis(v,Object)).toBe(true);
            });
            test.each([[function(){}],[async function(){}],[function*(){}],[async function*(){}],[()=>{}],[async()=>{}],[Date],[class{}],[class C{}]])('(%p,Function)',(v)=>{
                expect(typis(v,Function)).toBe(true);
            });
            test.each([[new Date()],[new (function(){})()],[new (class{})()]])('(%p,Instance)',(v)=>{
                expect(typis(v,v.constructor)).toBe(true);
            });
            test.each([[new Date()],[new (class D extends Date{})()]])('(%p,Date)',(v)=>{
                expect(typis(v,v.constructor)).toBe(true);
            });
        });
        describe('false', () => {
            test('(undefined,Number)',()=>expect(typis(undefined,Number)).toBe(false));
            test('(0,undefined)',()=>expect(typis(0,undefined)).toBe(false));
            test.each([[NaN,undefined],[undefined,null],[null,NaN]])('(%p,%p)',(v,C)=>{
                expect(typis(v,C)).toBe(false);
            });
            test.each([[0,Boolean],['',Number],[0n,String],[Symbol(),BigInt],[false,Symbol]])('(%p,%p)',(v,C)=>{
                expect(typis(v,C)).toBe(false);
            });
            test.each([[NaN],[null],[undefined],[false],[0],[''],[0n],[Symbol()],[{}],[new Date()],[()=>{}]])('(%p,Array)',v=>{
                expect(typis(v,Array)).toBe(false);
            });
            test.each([[Object.create(null)],[Object.create({})],[new Date()],[()=>{}],[false],[0],[''],[0n],[Symbol()],[NaN],[null],[undefined]])('(%p,Object)',(v)=>{
                expect(typis(v,Object)).toBe(false);
            });
            test.each([[NaN],[null],[undefined],[false],[Infinity],[0],[''],[0n],[Symbol()],[{}],[Object.create(null)],[Object.create({})],[[]],[new Date()]])('(%p,Function)',(v)=>{
                expect(typis(v,Function)).toBe(false);
            });
            test.each([[NaN],[null],[undefined],[false],[Infinity],[0],[''],[0n],[Symbol()],[{}],[Object.create(null)],[Object.create({})],[[]],[Date]])('(%p,Date)',(v)=>{
                expect(typis(v,Date)).toBe(false);
            });
        });
        describe('Error', () => {
            test.each([Boolean,Number,String].map(C=>[new C(),C]))(`BoxedPrimitive(%p,%p)`,(v,C)=>{
                try{typis(v,C)} catch(e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`);
                }
            })
            test.each([[0],[false],[''],[0n],[Symbol()],[new Date()]])('(%p)',C=>{
                try {typis(0,C)}
                catch(e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`);
                }
            });
        });
    });
});
