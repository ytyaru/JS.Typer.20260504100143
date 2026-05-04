import { describe, test, expect } from "bun:test";
import { Typer } from "../src/js/typer.js";
class C {static M(){} m(){} get g(){}}
const c = new C();
function fn() {}
const arrowFn = ()=>{};
describe(`Typer`, ()=>{
    describe(`type`, ()=>{
        describe(`valid()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.type).toBeDefined());
            test.each([[NaN,true],[null,true],[undefined,true]])(`valid(Constant:%p)`, (v,expected)=>{
                expect(Typer.type.valid(v)).toBe(expected);
            });
            test.each([[function(){},true],[()=>{},true],[class{},true],[C,true],[C.M,true],[c.m,true],[fn,true],[arrowFn,true],[Date,true],[Array.prototype.map,true],[fn.bind(null),true]])(`valid(Callable:%p) `, (v,expected)=>{
                expect(Typer.type.valid(v)).toBe(expected);
            });
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.type.valid(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
        });
        describe(`get()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.type.get).toBeDefined());
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.type.get(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
            test.each([[NaN],[null],[undefined]])(`get(Constant:%p)`, (v)=>{
                expect(Typer.type.get(v)).toBe(v);
            });
            test.each([[Boolean],[Number],[BigInt],[String],[Symbol]])(`get(Primitive:%p)`, (v)=>{
                expect(Typer.type.get(v)).toBe(v);
            });
            test.each([[Array],[Object],[Function]])(`get(Container:%p)`, (v)=>{
                expect(Typer.type.get(v)).toBe(v);
            });
            test.each([[Date],[RegExp],[C]])(`get(Class:%p)`, (v)=>{
                expect(Typer.type.get(v)).toBe(v);
            });
        });
    });
    describe(`name`, ()=>{
        describe(`get()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.name.get).toBeDefined());
            test.each([[NaN,'NaN'],[null,'Null'],[undefined,'Undefined']])(`get(Constant:%p)->%p`, (v,expected)=>{
                expect(Typer.name.get(v)).toBe(expected);
            });
            test.each([[false,'Boolean'],[0,'Number'],[0n,'BigInt'],['','String'],[Symbol(),'Symbol']])(`get(Primitive:%p)->%p`, (v,expected)=>{
                expect(Typer.name.get(v)).toBe(expected);
            });
            test.each([[[],'Array'],[{},'Object'],[fn,'Function']])(`get(Container:%p)->%p`, (v,expected)=>{
                expect(Typer.name.get(v)).toBe(expected);
            });
            test.each([[function(){}],[()=>{}],[class{}],[C],[C.M],[c.m],[fn],[arrowFn],[Date],[Array.prototype.map],[fn.bind(null)]])(`get(Callable:%p)->"Function"`, (v)=>{
                expect(Typer.name.get(v)).toBe('Function');
            });
            test.each([[Object.create(null)],[Object.getOwnPropertyDescriptor(C.prototype, 'g')]])(`get(ObjectLike:%p)->"Function"`, (v)=>{
                expect(Typer.name.get(v)).toBe('Object');
            });
            test.each([[C],[Date],[RegExp]])(`Instance`, (v)=>{
                expect(Typer.name.get(new v())).toBe(v.name);
            });
        });
    });
    describe(`is`, ()=>{
        test(`定義済み`, ()=>expect(Typer.is).toBeDefined());
    });



});

