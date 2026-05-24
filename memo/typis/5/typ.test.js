import { describe, test, expect } from 'bun:test';
import {getTag,typis,typof,typer,typef,Typ} from './typ.js';
const isFn = v=>'function'===typeof v;
const isCls = v=>isFn(v) && /^[A-Z]+/.test(v?.name);
const P = class P {};
const C = class C extends P{};
describe('typof.js', ()=>{
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
        test.each([[Date]])('(%p)->"Date"',v=>expect(typof(v)).toBe('Date'));
        test.each([[class C{}]])('(%p)->"C"',v=>expect(typof(v)).toBe('C'));
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
describe('typis.js', ()=>{
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
        test.each([[Date]])('(%p)->"Date"',v=>expect(typis(v)).toBe('Date'));
        test.each([[class C{}]])('(%p)->"C"',v=>expect(typis(v)).toBe('C'));
        /*
        test.each([[undefined],[0]])('(%p)',v=>{
            try {typis(v);expect.unreachable();}
            catch(e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`引数不正です。第二引数は期待する型を指定してください。null,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`);
            }
        });
        */
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
            try{typer(0,String);expect.unreachable();}catch(e){
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
describe('Typ', () => {
    describe('isThrow:T', () => {
        const T = new Typ(true);
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
    describe('isThrow:F', () => {
        const T = new Typ(false);
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

