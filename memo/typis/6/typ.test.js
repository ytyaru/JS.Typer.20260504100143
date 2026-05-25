import { describe, test, expect } from 'bun:test';
import {getTag,typis,typof,typer,typef,typnm,typem,Typ} from './typ.js';
const isFn = v=>'function'===typeof v;
const isCls = v=>isFn(v) && /^[A-Z]+/.test(v?.name);
const P = class P {};
const C = class C extends P{};
describe('getTag', ()=>{
    test('()',()=>{
        try {getTag();expect.unreachable();}
        catch(e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不足です。1個以上の引数を渡してください。`);
        }
    });
    test('(NaN)',()=>expect(getTag(NaN)).toBe('NaN'));
    test('(undefined)',()=>expect(getTag(undefined)).toBe('Undefined'));
    test('(null)',()=>expect(getTag(null)).toBe('Null'));
    test.each([[false],[true]])('(%p)->"Boolean"',v=>expect(getTag(v)).toBe('Boolean'));
    test.each([[0],[-1],[0.1],[Number.MAX_SAFE_INTEGER],[Number.MAX_SAFE_INTEGER+1],[Infinity]])('(%p)->"Number"',v=>expect(getTag(v)).toBe('Number'));
    test.each([[''],['a'],['あ']])('(%p)->"String"',v=>expect(getTag(v)).toBe('String'));
    test.each([[0n],[-1n]])('(%p)->"BigInt"',v=>expect(getTag(v)).toBe('BigInt'));
    test.each([[Symbol()],[Symbol('')],[Symbol('a')],[Symbol.for('a')]])('(%p)->"Symbol"',v=>expect(getTag(v)).toBe('Symbol'));
    test.each([[[]],[[0]],[[0,'']]])('(%p)->"Array"',v=>expect(getTag(v)).toBe('Array'));
    test.each([[new (class A extends Array{})()]])('(%p)->"Instance<A>"',v=>expect(getTag(v)).toBe('Instance<A>'));
    test.each([[{}],[{k:1}]])('(%p)->"Object"',v=>expect(getTag(v)).toBe('Object'));
    test.each([[Object.create({})]])('(%p)->"Instance<Object>"',v=>expect(getTag(v)).toBe('Instance<Object>'));
    test.each([[Object.create(null)]])('(%p)->"Dictionary"',v=>expect(getTag(v)).toBe('Dictionary'));
    test.each([[new (class O extends Object{})]])('(%p)->"Instance<O>"',v=>expect(getTag(v)).toBe('Instance<O>'));
    test.each([[()=>{}],[function(){}],[class{}]])('(%p)->"Function"',v=>expect(getTag(v)).toBe('Function'));
    test.each([[async()=>{}],[async function(){}]])('(%p)->"AsyncFunction"',v=>expect(getTag(v)).toBe('AsyncFunction'));
    test.each([[function*(){}]])('(%p)->"GeneratorFunction"',v=>expect(getTag(v)).toBe('GeneratorFunction'));
    test.each([[async function*(){}]])('(%p)->"AsyncGeneratorFunction"',v=>expect(getTag(v)).toBe('AsyncGeneratorFunction'));
    test.each([[Array]])('(%p)->"Class<Array>"',v=>expect(getTag(v)).toBe('Class<Array>'));
    test.each([[Object]])('(%p)->"Class<Object>"',v=>expect(getTag(v)).toBe('Class<Object>'));
    test.each([[Date]])('(%p)->"Class<Date>"',v=>expect(getTag(v)).toBe('Class<Date>'));
    test.each([[class C{}]])('(%p)->"Class<C>"',v=>expect(getTag(v)).toBe('Class<C>'));
    test.each([[new Date()]])('(%p)->"Instance<Date>"',v=>expect(getTag(v)).toBe('Instance<Date>'));
    test.each([[new (class C{})]])('(%p)->"Instance<C>"',v=>expect(getTag(v)).toBe('Instance<C>'));
});
describe('typof', ()=>{
    test('exist', () => expect(typof).toBeInstanceOf(Function));
    test('()', () => {
        try {typof();expect.unreachable();}
        catch(e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。`);
        }
    });
    describe('(v)', () => {
        test.each([Boolean,Number,String].map(C=>[new C()]))(`BoxedPrimitive(%p)`,v=>{
            try{typof(v);expect.unreachable();} catch(e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`);
            }
        })
        test('undefined', ()=>expect(typof(undefined)).toBe('Undefined'));
        test('NaN', ()=>expect(typof(NaN)).toBe('NaN'));
        test('Null', ()=>expect(typof(null)).toBe('Null'));
        test.each([[false],[true]])('(%p)->"Boolean"',v=>expect(typof(v)).toBe('Boolean'));
        test.each([[0],[1],[-1],[0.1],[Infinity],[-Infinity]])('(%p)->"Number"',v=>expect(typof(v)).toBe('Number'));
        test.each([[''],['a'],['あ']])('(%p)->"String"',v=>expect(typof(v)).toBe('String'));
        test.each([[0n],[1n],[-1n]])('(%p)->"BigInt"',v=>expect(typof(v)).toBe('BigInt'));
        test.each([[Symbol()],[Symbol('')],[Symbol('a')],[Symbol.for('a')]])('(%p)->"Symbol"',v=>expect(typof(v)).toBe('Symbol'));
        test.each([[[]],[[0]],[['']]])('(%p)->"Array"',v=>expect(typof(v)).toBe('Array'));
        test.each([[{}],[{k:1}]])('(%p)->"Object"',v=>expect(typof(v)).toBe('Object'));
        //test.each([[function(){}],[async function(){}],[function*(){}],[async function*(){}],[()=>{}],[async()=>{}],[Date],[class{}],[class C{}]])('(%p)->"Function"',v=>expect(typof(v)).toBe('Function'));
        test.each([[function(){}],[()=>{}],[class{}]])('(%p)->"Function"',v=>expect(typof(v)).toBe('Function'));
        test.each([[async function(){}],[async()=>{}]])('(%p)->"AsyncFunction"',v=>expect(typof(v)).toBe('AsyncFunction'));
        test.each([[function*(){}]])('(%p)->"GeneratorFunction"',v=>expect(typof(v)).toBe('GeneratorFunction'));
        test.each([[async function*(){}]])('(%p)->"AsyncGeneratorFunction"',v=>expect(typof(v)).toBe('AsyncGeneratorFunction'));
        test.each([[Date]])('(%p)->"Class<Date>"',v=>expect(typof(v)).toBe('Class<Date>'));
        test.each([[class C{}]])('(%p)->"Class<C>"',v=>expect(typof(v)).toBe('Class<C>'));
        test.each([[new Date()]])('(%p)->"Instance<Date>"',v=>expect(typof(v)).toBe('Instance<Date>'));
        test.each([[new (class C{})()]])('(%p)->"Instance<C>"',v=>expect(typof(v)).toBe('Instance<C>'));
    });
    describe('(v,C)', () => {
        describe('true', () => {
            test.each([[NaN],[undefined],[null]])('(%p)',v=>{
                expect(typof(v,v)).toBe(true);
            });
            test.each([[false,Boolean],[0,Number],['',String],[0n,BigInt],[Symbol(),Symbol]])('(%p,%p)',(v,C)=>{
                expect(typof(v,C)).toBe(true);
            });
            // typeis/typeof差異: extends Array
            test.each([[[]],[[0]],[[0,1]],[['']],[[0,'']],[new (class A extends Array{})()]])('(%p,Array)',(v)=>{
                expect(typof(v,Array)).toBe(true);
            });
            test.each([[{}],[{k:0}]])('(%p,Object)',(v)=>{
                expect(typof(v,Object)).toBe(true);
            });
            // typis/typof差異
            test.each([[Object.create(null)],[Object.create({})],[new Date()]])('(%p,Object)',(v)=>{
                expect(typof(v,Object)).toBe(true);
            });
            test.each([[function(){}],[async function(){}],[function*(){}],[async function*(){}],[()=>{}],[async()=>{}],[Date],[class{}],[class C{}]])('(%p,Function)',(v)=>{
                expect(typof(v,Function)).toBe(true);
            });
            test.each([[new Date()],[new (function(){})()],[new (class{})()]])('(%p,Instance)',(v)=>{
                expect(typof(v,v.constructor)).toBe(true);
            });
            test.each([[new Date()],[new (class D extends Date{})()]])('(%p,Date)',(v)=>{
                expect(typof(v,v.constructor)).toBe(true);
            });
            test.each([[new P(), P],[new C(),C],[new C(),P]])('(%p,%p)',(v,C)=>{
                expect(typof(v,C)).toBe(true);
            });
        });
        describe('false', () => {
            test('(undefined,Number)',()=>expect(typof(undefined,Number)).toBe(false));
            test('(0,undefined)',()=>expect(typof(0,undefined)).toBe(false));
            test.each([[NaN,undefined],[undefined,null],[null,NaN]])('(%p,%p)',(v,C)=>{
                expect(typof(v,C)).toBe(false);
            });
            test.each([[0,Boolean],['',Number],[0n,String],[Symbol(),BigInt],[false,Symbol]])('(%p,%p)',(v,C)=>{
                expect(typof(v,C)).toBe(false);
            });
            test.each([[NaN],[null],[undefined],[false],[0],[''],[0n],[Symbol()],[{}],[new Date()],[()=>{}]])('(%p,Array)',v=>{
                expect(typof(v,Array)).toBe(false);
            });
            // typis/typof差異
            // [Object.create(null)],[Object.create({})],[new Date()],
            test.each([[()=>{}],[false],[0],[''],[0n],[Symbol()],[NaN],[null],[undefined]])('(%p,Object)',(v)=>{
                expect(typof(v,Object)).toBe(false);
            });
            test.each([[NaN],[null],[undefined],[false],[Infinity],[0],[''],[0n],[Symbol()],[{}],[Object.create(null)],[Object.create({})],[[]],[new Date()]])('(%p,Function)',(v)=>{
                expect(typof(v,Function)).toBe(false);
            });
            test.each([[NaN],[null],[undefined],[false],[Infinity],[0],[''],[0n],[Symbol()],[{}],[Object.create(null)],[Object.create({})],[[]],[Date]])('(%p,Date)',(v)=>{
                expect(typof(v,Date)).toBe(false);
            });
            // typis/typof差異
            test.each([[new P(), C],[new P(),Date],[new C(),Date]])('(%p,%p)',(v,C)=>{
                expect(typof(v,C)).toBe(false);
            });
        });
        describe('Error', () => {
            test.each([Boolean,Number,String].map(C=>[new C(),C]))(`BoxedPrimitive(%p,%p)`,(v,C)=>{
                try{typof(v,C);expect.unreachable();} catch(e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`);
                }
            })
            test.each([[0],[false],[''],[0n],[Symbol()],[new Date()]])('(%p)',C=>{
                try {typof(0,C);expect.unreachable();}
                catch(e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(C).toBeDefined();
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(C)}`);
                }
            });
        });
    });
    describe('(v,...Cs)', () => {

        describe('Error', () => {
            test.each([[0,[1,2]],[0,[Number,1]]])('(%p,%p,%p)',(v,Cs)=>{
                try{typof(v,...Cs);expect.unreachable();}catch(e){
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(1)}`);
                }
            })
            test('(0,Number,1)',()=>{
                try{typof(0,Number,1);expect.unreachable();}catch(e){
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(1)}`);
                }
            })
        });
        describe('true', () => {
            test('(0,Number,String)',()=>expect(typof(0,Number,String)).toBe(true));
            test('("",Number,String)',()=>expect(typof('',Number,String)).toBe(true));
            test('(0,Number,null)',()=>expect(typof(0,Number,null)).toBe(true));
            test('(null,Number,null)',()=>expect(typof(0,Number,null)).toBe(true));
        });
        describe('false', () => {
            test('(0,BigInt,String)',()=>expect(typof(0,BigInt,String)).toBe(false));
            test('(0n,String,Number)',()=>expect(typof(0n,String,Number)).toBe(false));
        });
    });
});
describe('typis', ()=>{
    test('exist', () => expect(typis).toBeInstanceOf(Function));
    test('()', () => {
        try {typis();expect.unreachable();}
        catch(e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。`);
        }
    });
    describe('(v)', () => {
        test.each([Boolean,Number,String].map(C=>[new C()]))(`BoxedPrimitive(%p)`,v=>{
            try{typis(v);expect.unreachable();} catch(e) {
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
        test.each([[[]],[[0]],[['']]])('(%p)->"Array"',v=>expect(typis(v)).toBe('Array'));
        test.each([[{}],[{k:1}]])('(%p)->"Object"',v=>expect(typis(v)).toBe('Object'));
        //test.each([[function(){}],[async function(){}],[function*(){}],[async function*(){}],[()=>{}],[async()=>{}],[Date],[class{}],[class C{}]])('(%p)->"Function"',v=>expect(typis(v)).toBe('Function'));
        test.each([[function(){}],[()=>{}],[class{}]])('(%p)->"Function"',v=>expect(typis(v)).toBe('Function'));
        test.each([[async function(){}],[async()=>{}]])('(%p)->"AsyncFunction"',v=>expect(typis(v)).toBe('AsyncFunction'));
        test.each([[function*(){}]])('(%p)->"GeneratorFunction"',v=>expect(typis(v)).toBe('GeneratorFunction'));
        test.each([[async function*(){}]])('(%p)->"AsyncGeneratorFunction"',v=>expect(typis(v)).toBe('AsyncGeneratorFunction'));
        test.each([[Date]])('(%p)->"Class<Date>"',v=>expect(typis(v)).toBe('Class<Date>'));
        test.each([[class C{}]])('(%p)->"Class<C>"',v=>expect(typis(v)).toBe('Class<C>'));
        test.each([[new Date()]])('(%p)->"Instance<Date>"',v=>expect(typis(v)).toBe('Instance<Date>'));
        test.each([[new (class C{})()]])('(%p)->"Instance<C>"',v=>expect(typis(v)).toBe('Instance<C>'));
    });
    describe('(v,C)', () => {
        describe('true', () => {
            test.each([[NaN],[undefined],[null]])('(%p)',v=>{
                expect(typis(v,v)).toBe(true);
            });
            test.each([[false,Boolean],[0,Number],['',String],[0n,BigInt],[Symbol(),Symbol]])('(%p,%p)',(v,C)=>{
                expect(typis(v,C)).toBe(true);
            });
            // typeis/typeof差異: extends Array
            test.each([[[]],[[0]],[[0,1]],[['']],[[0,'']]])('(%p,Array)',(v)=>{
                expect(typis(v,Array)).toBe(true);
            });
            // typis/typof差異
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
            // typis/typof差異: [new C(),P]
            test.each([[new P(), P],[new C(),C]])('(%p,%p)',(v,C)=>{
                expect(typis(v,C)).toBe(true);
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
            // typeis/typeof差異: extends Array
            test.each([[new (class A extends Array{})()]])('(%p,Array)',(v)=>{
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
            // typis/typof差異: [new C(),P]
            test.each([[new C(),P],[new P(), C],[new P(),Date],[new C(),Date]])('(%p,%p)',(v,C)=>{
                expect(typis(v,C)).toBe(false);
            });
        });
        describe('Error', () => {
            test.each([Boolean,Number,String].map(C=>[new C(),C]))(`BoxedPrimitive(%p,%p)`,(v,C)=>{
                try{typis(v,C);expect.unreachable();} catch(e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`不正な値です。BoxedPrimitive<${v?.constructor?.name}>`);
                }
            })
            test.each([[0],[false],[''],[0n],[Symbol()],[new Date()]])('(%p)',C=>{
                try {typis(0,C);expect.unreachable();}
                catch(e) {
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(C)}`);
                }
            });
        });
    });
    describe('(v,...Cs)', () => {
        describe('Error', () => {
            test.each([[0,[1,2]],[0,[Number,1]]])('(%p,%p,%p)',(v,Cs)=>{
                try{typis(v,...Cs);expect.unreachable();}catch(e){
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(1)}`);
                }
            })

            test('(0,Number,1)',()=>{
                try{typis(0,Number,1);expect.unreachable();}catch(e){
                    expect(e).toBeInstanceOf(Error);
                    expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。:${getTag(1)}`);
                }
            })
        });
        describe('true', () => {
            test('(0,Number,String)',()=>expect(typis(0,Number,String)).toBe(true));
            test('("",Number,String)',()=>expect(typis('',Number,String)).toBe(true));
            test('(0,Number,null)',()=>expect(typis(0,Number,null)).toBe(true));
            test('(null,Number,null)',()=>expect(typis(0,Number,null)).toBe(true));
        });
        describe('false', () => {
            test('(0,BigInt,String)',()=>expect(typis(0,BigInt,String)).toBe(false));
            test('(0n,String,Number)',()=>expect(typis(0n,String,Number)).toBe(false));
        });
    });
});
describe('typer', () => {
    describe('true', () => {
        test('(0,Number)',()=>expect(typer(0,Number)).toBe(true));
        test.each([[new P(), P],[new C(),C]])('(%p,%p)',(v,C)=>{
            expect(typer(v,C)).toBe(true);
        });
    });
    describe('Error', () => {
        test.each([[0,String],[new C(),P]])('(%p,%p)',(v,C)=>{
            try{typer(v,C);expect.unreachable();}catch(e){
                expect(e).toBeInstanceOf(TypeError)
                expect(e.message).toBe(`値が期待する型と違います。期待:${isCls(C) ? C.name : getTag(C)}, 実際:${getTag(v)}, 値:${v}`);
            }
        });
    });
});
describe('typef', () => {
    describe('true', () => {
        test('(0,Number)',()=>expect(typef(0,Number)).toBe(true));
        test.each([[new P(), P],[new C(),C],[new C(),P]])('(%p,%p)',(v,C)=>{
            expect(typef(v,C)).toBe(true);
        });
    });
    describe('Error', () => {
        test.each([[0,String]])('(%p,%p)',(v,C)=>{
            try{typef(0,C);expect.unreachable();}catch(e){
                expect(e).toBeInstanceOf(TypeError)
                expect(e.message).toBe(`値が期待する型と違います。期待:${isCls(C) ? C.name : getTag(C)}, 実際:${getTag(v)}, 値:${v}`);
            }
        });
    });
});
describe('typnm', () => {
    test('()',()=>{
        try{typnm();expect.unreachable();}catch(e){
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。`);
        }
    });
    describe('Error:非型名',()=>{
        test.each([...[undefined,NaN,null,false,0,0n,Symbol,Date,new Date()].map(v=>[v])])('(%p)',v=>{
            try{typnm(v,v);expect.unreachable();}catch(e){
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`型名は文字列であるべきです。`);
            }
        });
    });
    describe('(v)',()=>{
        test('(0)->"Number"',()=>expect(typnm(0)).toBe('Number'));
        test('(未定義)->"Undefined"',()=>expect(typnm(globalThis.notExistVar)).toBe('Undefined'));
    });
    describe('(v,C)',()=>{
        describe('T',()=>{
            test('(0,"Number")',()=>expect(typnm(0,"Number")).toBe(true));
            test('(未定義)',()=>expect(typnm(globalThis.notExistVar,"Undefined")).toBe(true));
        });
        describe('F',()=>{
            test('(0,"String")',()=>expect(typnm(0,"String")).toBe(false));
        });
    });
    describe('(v,...Cs)',()=>{
        describe('T',()=>{
            test('(0,"BigInt","Number")',()=>expect(typnm(0,"BigInt","Number")).toBe(true));
            test('(未定義)',()=>expect(typnm(globalThis.notExistVar,"Number","Undefined")).toBe(true));
        });
        describe('F',()=>{
            test('(0,"BigInt","String")',()=>expect(typnm(0,"BigInt","String")).toBe(false));
        });
    });
});
describe('typem', () => {
    test('()',()=>{
        try{typem();expect.unreachable();}catch(e){
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不足です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。もし第一引数のみであれば型名を、第二引数まであれば真偽値を返します。`);
        }
    });
    describe('Error:非型名',()=>{
        test.each([...[undefined,NaN,null,false,0,0n,Symbol,Date,new Date()].map(v=>[v])])('(%p)',v=>{
            try{typem(v,v);expect.unreachable();}catch(e){
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`型名は文字列であるべきです。`);
            }
        });
    });
    describe('(v)',()=>{
        test('(0)->"Number"',()=>expect(typem(0)).toBe('Number'));
        test('(未定義)->"Undefined"',()=>expect(typem(globalThis.notExistVar)).toBe('Undefined'));
    });
    describe('(v,C)',()=>{
        describe('T',()=>{
            test('(0,"Number")',()=>expect(typem(0,"Number")).toBe(true));
            test('(未定義)',()=>expect(typem(globalThis.notExistVar,"Undefined")).toBe(true));
        });
        describe('F',()=>{
            test.each([[0,["String"]]])(`(%p,%p)`,(v,Ts)=>{
                try{typem(v,...Ts);expect.unreachable();}catch(e){
                    expect(e).toBeInstanceOf(Error);
                    const isName = true;
                    const expected = isName ? Ts.join(',') : (Ts.map(T=>isCls(T) ? T.name : getTag(T)));
                    expect(e.message).toBe(`値が期待する型と違います。期待:${expected}, 実際:${getTag(v)}, 値:${v}`);
                }
            });
        });
    });
    describe('(v,...Cs)',()=>{
        describe('T',()=>{
            test('(0,"BigInt","Number")',()=>expect(typem(0,"BigInt","Number")).toBe(true));
            test('(未定義)',()=>expect(typem(globalThis.notExistVar,"Number","Undefined")).toBe(true));
        });
        describe('F',()=>{
            test.each([[0,["BigInt","String"]]])(`(%p,%p)`,(v,Ts)=>{
                try{typem(v,...Ts);expect.unreachable();}catch(e){
                    expect(e).toBeInstanceOf(Error);
                    const isName = true;
                    const expected = isName ? Ts.join(',') : (Ts.map(T=>isCls(T) ? T.name : getTag(T)));
                    expect(e.message).toBe(`値が期待する型と違います。期待:${expected}, 実際:${getTag(v)}, 値:${v}`);
                }
            });
        });
    });
});
describe('Typ', () => {
    describe('new', () => {
        test('禁止',()=>{
            try{new Typ();expect.unreachable();}catch(e){
                expect(e).toBeInstanceOf(Error)
                expect(e.message).toBe(`new禁止`);
            }
        })
    });
    describe('throw', () => {
        const T = Typ.throw;
        describe('is()', () => {
            describe('true', () => {
                test('(0,Number)',()=>expect(typer(0,Number)).toBe(true));
                test.each([[new P(), P],[new C(),C]])('(%p,%p)',(v,C)=>{
                    expect(T.is(v,C)).toBe(true);
                });
            });
            describe('Error', () => {
                test.each([[0,String],[new C(),P]])('(%p,%p)',(v,C)=>{
                    try{T.is(v,C);expect.unreachable();}catch(e){
                        expect(e).toBeInstanceOf(TypeError)
                        expect(e.message).toBe(`値が期待する型と違います。期待:${isCls(C) ? C.name : getTag(C)}, 実際:${getTag(v)}, 値:${v}`);
                    }
                });
            });
        });
        describe('of()', () => {
            describe('true', () => {
                test('(0,Number)',()=>expect(typef(0,Number)).toBe(true));
                test.each([[new P(), P],[new C(),C],[new C(),P]])('(%p,%p)',(v,C)=>{
                    expect(T.of(v,C)).toBe(true);
                });
            });
            describe('Error', () => {
                test.each([[0,String]])('(%p,%p)',(v,C)=>{
                    try{T.of(0,C);expect.unreachable();}catch(e){
                        expect(e).toBeInstanceOf(TypeError)
                        expect(e.message).toBe(`値が期待する型と違います。期待:${isCls(C) ? C.name : getTag(C)}, 実際:${getTag(v)}, 値:${v}`);
                    }
                });
            });

        });
    });
    describe('bool', () => {
        const T = Typ.bool;
        describe('is()', () => {
            describe('true', () => {
                test('(0,Number)',()=>expect(typer(0,Number)).toBe(true));
                test.each([[new P(), P],[new C(),C]])('(%p,%p)',(v,C)=>{
                    expect(T.is(v,C)).toBe(true);
                });
            });
            describe('false', () => {
                test.each([[0,String],[new C(),P]])('(%p,%p)',(v,C)=>expect(T.is(v,C)).toBe(false));
            });
        });
        describe('of()', () => {
            describe('true', () => {
                test('(0,Number)',()=>expect(typef(0,Number)).toBe(true));
                test.each([[new P(), P],[new C(),C],[new C(),P]])('(%p,%p)',(v,C)=>{
                    expect(T.of(v,C)).toBe(true);
                });
            });
            describe('false', () => {
                test.each([[0,String]])('(%p,%p)',(v,C)=>expect(T.of(v,C)).toBe(false));
            });
        });
    });
});

