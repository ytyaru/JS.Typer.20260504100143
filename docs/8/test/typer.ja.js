import { describe, test, expect } from "bun:test";
import { Typer } from "../src/js/typer.ja.js";
const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
const getTypeName = (v) => {
    if (Number.isNaN(v)) return 'NaN';
    const tag = getTag(v);
    if ('Object'===tag) {
        if (Object.getPrototypeOf(v) === null) return 'Object'; // Object.create(null)
        if (!('constructor' in v)) {throw new TypeError(`想定外の型です。constructorを持っていません。`)}
        if (!('name' in v.constructor)) {throw new TypeError(`想定外の型です。constructorはnameを持っていません。`)}
        return 'Object'===v.constructor.name ? tag : v.constructor.name;
    }
    return tag;
};
class C {static M(){} m(){} get g(){}}
const c = new C();
class D extends C{}
const d = new D();
function fn() {}
const arrowFn = ()=>{};
class Integer extends Number {}
describe(`Typer`, ()=>{
    test(`定義済み`, ()=>expect(Typer).toBeDefined());
    describe(`type`, ()=>{
        test(`定義済み`, ()=>expect(Typer.type).toBeDefined());
        describe(`valid()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.type.valid).toBeDefined());
            test.each([[NaN],[null],[undefined]])(`valid(Constant:%p)`, (v)=>{
                expect(Typer.type.valid(v)).toBe(true);
            });
            test.each([[function(){}],[()=>{}],[class{}],[C],[C.M],[c.m],[fn],[arrowFn],[Date],[Array.prototype.map],[fn.bind(null)],[Array],[Object],[Function],[Number]])(`valid(Callable:%p) `, (v)=>{
                expect(Typer.type.valid(v)).toBe(true);
            });
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()],[c],[Object.create(null)]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.type.valid(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
        });
        describe(`getType()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.type.getType).toBeDefined());
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()],[Object.create(null)]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.type.getType(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
            test.each([[NaN],[null],[undefined]])(`get(Constant:%p)`, (v)=>{
                expect(Typer.type.getType(v)).toBe(v);
            });
            test.each([[Boolean],[Number],[BigInt],[String],[Symbol]])(`get(Primitive:%p)`, (v)=>{
                expect(Typer.type.getType(v)).toBe(v);
            });
            test.each([[Array],[Object],[Function]])(`get(Container:%p)`, (v)=>{
                expect(Typer.type.getType(v)).toBe(v);
            });
            test.each([[Date],[RegExp],[C]])(`get(Class:%p)`, (v)=>{
                expect(Typer.type.getType(v)).toBe(v);
            });
        });
        describe(`getName()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.type.getName).toBeDefined());
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()],[Object.create(null)]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.type.getName(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
            test.each([[NaN,'NaN'],[null,'Null'],[undefined,'Undefined']])(`get(Constant:%p)`, (v,expected)=>{
                expect(Typer.type.getName(v)).toBe(expected);
            });
            test.each([[Boolean],[Number],[BigInt],[String],[Symbol]])(`get(Primitive:%p)`, (v)=>{
                expect(Typer.type.getName(v)).toBe(v.name);
            });
            test.each([[Array],[Object],[Function]])(`get(Container:%p)`, (v)=>{
                expect(Typer.type.getName(v)).toBe(v.name);
            });
            test.each([[Date],[RegExp],[C]])(`get(Class:%p)`, (v)=>{
                expect(Typer.type.getName(v)).toBe(v.name);
            });
        });
    });
    describe(`value`, ()=>{
        test(`定義済み`, ()=>expect(Typer.value).toBeDefined());
        describe(`valid()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.value.valid).toBeDefined());
            test.each([[NaN],[null],[undefined]])(`valid(Constant:%p)`, (v)=>{
                expect(Typer.value.valid(v)).toBe(true);
            });
            test.each([[function(){}],[()=>{}],[class{}],[C],[C.M],[c.m],[fn],[arrowFn],[Date],[Array.prototype.map],[fn.bind(null)],[Array],[Object],[Function],[Number]])(`valid(Callable:%p) `, (v)=>{
                expect(Typer.value.valid(v)).toBe(true);
            });
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()],[c],[Object.create(null)]])(`Primitive:%p`,(v)=>{
                expect(Typer.value.valid(v)).toBe(true);
            });
            // new Symbol(), new BigInt()
            // TypeError: function is not a constructor (evaluating 'new Symbol')
            test.each([new Boolean(), new Number(), new String()])(`PrimitiveObject:%p`, (v)=>{
                try {
                    Typer.value.valid(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`Primitive型をnewしたインスタンスは原則使用禁止すべきです。ベストプラクティスである===比較が偽になるからです。v:${v} tag:"${getTypeName(v)}"`);
                }
            });
        });
        describe(`getType()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.value.getType).toBeDefined());
            test.each([[false,Boolean],[0,Number],[0n,BigInt],['',String],[Symbol(),Symbol],[[],Array],[{},Object],[new Date(), Date],[Object.create(null), Object]])(`例外発生:%p`,(v,expected)=>{
                expect(Typer.value.getType(v)).toBe(expected);
            });
            test.each([[NaN],[null],[undefined]])(`get(Constant:%p)`, (v)=>{
                expect(Typer.value.getType(v)).toBe(v);
            });
            test.each([[Boolean],[Number],[BigInt],[String],[Symbol]])(`get(Primitive:%p)`, (v)=>{
                expect(Typer.value.getType(v)).toBe(Function);
            });
            test.each([[Array],[Object],[Function]])(`get(Container:%p)`, (v)=>{
                expect(Typer.value.getType(v)).toBe(Function);
            });
            test.each([[Date],[RegExp],[C]])(`get(Class:%p)`, (v)=>{
                expect(Typer.value.getType(v)).toBe(Function);
            });

        });
        describe(`getName()`, ()=>{
            test(`定義済み`, ()=>expect(Typer.value.getName).toBeDefined());
            test.each([[NaN,'NaN'],[null,'Null'],[undefined,'Undefined']])(`get(Constant:%p)->%p`, (v,expected)=>{
                expect(Typer.value.getName(v)).toBe(expected);
            });
            test.each([[false,'Boolean'],[0,'Number'],[0n,'BigInt'],['','String'],[Symbol(),'Symbol']])(`get(Primitive:%p)->%p`, (v,expected)=>{
                expect(Typer.value.getName(v)).toBe(expected);
            });
            test.each([[[],'Array'],[{},'Object'],[fn,'Function']])(`get(Container:%p)->%p`, (v,expected)=>{
                expect(Typer.value.getName(v)).toBe(expected);
            });
            test.each([[function(){}],[()=>{}],[class{}],[C],[C.M],[c.m],[fn],[arrowFn],[Date],[Array.prototype.map],[fn.bind(null)]])(`get(Callable:%p)->"Function"`, (v)=>{
                expect(Typer.value.getName(v)).toBe('Function');
            });
            test.each([[Object.create(null)],[Object.getOwnPropertyDescriptor(C.prototype, 'g')]])(`get(ObjectLike:%p)->"Function"`, (v)=>{
                expect(Typer.value.getName(v)).toBe('Object');
            });
            test.each([[C],[Date],[RegExp]])(`Instance`, (v)=>{
                expect(Typer.value.getName(new v())).toBe(v.name);
            });
        });
    });
    describe(`is`, ()=>{
        test(`定義済み`, ()=>expect(Typer.is).toBeDefined());
        describe(`type不正`, ()=>{
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.is(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
        });
        describe(`期待した型でない`, ()=>{
            test.each([[Number,NaN],[Boolean,undefined],[String,null],[null,NaN],[NaN,undefined],[undefined,null]])(`Constant:%p:%p`,(t,v)=>{
                try {
                    Typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${Typer.type.getName(t)}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Number,false],[Boolean,0],[String,0n],[Symbol,''],[BigInt,Symbol()]])(`Primitive:%p`,(t,v)=>{
                try {
                    Typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Object,[]],[Function,{}],[Array,fn]])(`Container:%p`,(t,v)=>{
                try {
                    Typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[RegExp, new Date()], [URL, new RegExp()]])(`Builtin API:%p`,(t,v)=>{
                try {
                    Typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Date, c], [C, new Date()]])(`Instance:%p`,(t,v)=>{
                try {
                    Typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Number,new Integer()],[Integer,1]])(`Primitive継承型`, (t,v)=>{
                try {
                    Typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            })
        });
        describe(`期待した型である`, ()=>{
            test.each([[NaN],[null],[undefined]])(`Constant:%p`,(v)=>{
                expect(Typer.is(v,v)).toBe(true);
            });
            test.each([[Boolean,false],[Number,0],[BigInt,0n],[String,''],[Symbol,Symbol()],[Array,[]],[Object,{}],[Date, new Date()]])(`Primitive:%p`,(t,v)=>{
                expect(Typer.is(t,v)).toBe(true);
            });
            test.each([[Array,[]],[Object,{}],[Function,fn]])(`Container:%p`,(t,v)=>{
                expect(Typer.is(t,v)).toBe(true);
            });
            test.each([[Date, new Date()], [RegExp, new RegExp()]])(`Builtin API:%p`,(t,v)=>{
                expect(Typer.is(t,v)).toBe(true);
            });
            test.each([[C, new C()]])(`Instance:%p`,(t,v)=>{
                expect(Typer.is(t,v)).toBe(true);
            });
            // Objectはprototype=nullやディスクリプタの区別不能
            test.each([[Object.create(null)],[Object.getOwnPropertyDescriptor(C.prototype, 'g')]])(`ObjectLike:%p`,(v)=>{
                expect(Typer.is(Object,v)).toBe(true);
            });
            // FunctionはES5クラス、ES6クラス、関数、アロー関数式、bind関数、NativeCode、メソッドの区別不能。
            test.each([[function(){}],[()=>{}],[class{}],[C],[C.M],[c.m],[fn],[arrowFn],[Date],[Array.prototype.map],[fn.bind(null)]])(`Callable:%p`,(v)=>{
                expect(Typer.is(Function,v)).toBe(true);
            });
            test.each([[Integer,new Integer()]])(`Primitive継承型`, (t,v)=>{
                expect(Typer.is(t,v)).toBe(true);
            });
        });
        describe(`第三引数を渡す`, ()=>{
            test.each([[Number, '24', 'age']])(``, (t, v, n)=>{
                try {
                    Typer.is(t,v,n);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`"${n}" の型が不正です。期待: ${Typer.type.getName(t)}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
        });
    });
    describe(`of`, ()=>{
        test(`定義済み`, ()=>expect(Typer.of).toBeDefined());
        describe(`type不正`, ()=>{
            test.each([[false],[0],[0n],[''],[Symbol()],[[]],[{}],[new Date()]])(`例外発生:%p`,(v)=>{
                try {
                    Typer.of(v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型指示値TypeValueはNaN,null,undefinedまたはコンストラクタ関数であるべきです。`);
                }
            });
        });
        describe(`期待した型でない`, ()=>{
            test.each([[Number,NaN],[Boolean,undefined],[String,null],[null,NaN],[NaN,undefined],[undefined,null]])(`Constant:%p:%p`,(t,v)=>{
                try {
                    Typer.of(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${Typer.type.getName(t)}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Number,false],[Boolean,0],[String,0n],[Symbol,''],[BigInt,Symbol()]])(`Primitive:%p`,(t,v)=>{
                try {
                    Typer.of(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Object,[]],[Function,{}],[Array,fn]])(`Container:%p`,(t,v)=>{
                try {
                    Typer.of(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[RegExp, new Date()], [URL, new RegExp()]])(`Builtin API:%p`,(t,v)=>{
                try {
                    Typer.of(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
            test.each([[Date, c], [C, new Date()]])(`Instance:%p`,(t,v)=>{
                try {
                    Typer.of(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${t.name}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
        });
        describe(`期待した型である`, ()=>{
            test.each([[NaN],[null],[undefined]])(`Constant:%p`,(v)=>{
                expect(Typer.of(v,v)).toBe(true);
            });
            test.each([[Boolean,false],[Number,0],[BigInt,0n],[String,''],[Symbol,Symbol()],[Array,[]],[Object,{}],[Date, new Date()]])(`Primitive:%p`,(t,v)=>{
                expect(Typer.of(t,v)).toBe(true);
            });
            test.each([[Array,[]],[Object,{}],[Function,fn]])(`Container:%p`,(t,v)=>{
                expect(Typer.of(t,v)).toBe(true);
            });
            test.each([[Date, new Date()], [RegExp, new RegExp()]])(`Builtin API:%p`,(t,v)=>{
                expect(Typer.of(t,v)).toBe(true);
            });
            test.each([[C, new C()]])(`Instance:%p`,(t,v)=>{
                expect(Typer.of(t,v)).toBe(true);
            });
            // Objectはprototype=nullやディスクリプタの区別不能
            test.each([[Object.create(null)],[Object.getOwnPropertyDescriptor(C.prototype, 'g')]])(`ObjectLike:%p`,(v)=>{
                expect(Typer.of(Object,v)).toBe(true);
            });
            // FunctionはES5クラス、ES6クラス、関数、アロー関数式、bind関数、NativeCode、メソッドの区別不能。
            test.each([[function(){}],[()=>{}],[class{}],[C],[C.M],[c.m],[fn],[arrowFn],[Date],[Array.prototype.map],[fn.bind(null)]])(`Callable:%p`,(v)=>{
                expect(Typer.of(Function,v)).toBe(true);
            });
            test(`Number型継承Integer型`, ()=>{
                expect(Typer.of(Integer,new Integer())).toBe(true);
            })
            test.each([[D, d], [C, d]])(`Extends Instance:%p`,(t,v)=>{
                expect(Typer.of(t,v)).toBe(true);
            });
        });
        describe(`第三引数を渡す`, ()=>{
            test.each([[Number, '24', 'age']])(``, (t, v, n)=>{
                try {
                    Typer.of(t,v,n);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`"${n}" の型が不正です。期待: ${Typer.type.getName(t)}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
        });
    });
    describe(`thrower`, ()=>{
        test(`定義済み`, ()=>expect(Typer.thrower).toBeDefined());
        test(`返却値の型`, ()=>expect(Typer.thrower).toBeInstanceOf(Typer));
        describe(`is`, ()=>{
            test.each([[Number,0]])(`型一致時にtrueを返す`, (t,v)=>{
                expect(Typer.thrower.is(t,v)).toBe(true);
            });
            test.each([[Number,'x']])(`型不一致時に例外発生すること`, (t,v)=>{
                const typer = Typer.thrower;
                try {
                    typer.is(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${Typer.type.getName(t)}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
        });
        describe(`of`, ()=>{
            test.each([[C,d]])(`型一致時にtrueを返す`, (t,v)=>{
                expect(Typer.thrower.of(t,v)).toBe(true);
            });
            test.each([[Number,'x']])(`型不一致時に例外発生する`, (t,v)=>{
                const typer = Typer.thrower;
                try {
                    typer.of(t,v);
                    expect.unreachable("例外発生すべき所で発生しませんでした。");
                } catch (error) {
                    expect(error).toBeInstanceOf(TypeError);
                    expect(error.message).toBe(`型が不正です。期待: ${Typer.type.getName(t)}, 実際: ${Typer.value.getName(v)}。`);
                }
            });
        });
    });
    describe(`booler`, ()=>{
        test(`定義済み`, ()=>expect(Typer.booler).toBeDefined());
        test(`返却値の型`, ()=>expect(Typer.booler).toBeInstanceOf(Typer));
        describe(`is`, ()=>{
            test.each([[Number,0]])(`型一致時にtrueを返す`, (t,v)=>{
                expect(Typer.booler.is(t,v)).toBe(true);
            });
            test.each([[Number,'x']])(`型不一致時にfalseを返す`, (t,v)=>{
                expect(Typer.booler.is(t,v)).toBe(false);
            });
        });
        describe(`of`, ()=>{
            test.each([[C,d]])(`型一致時にtrueを返す`, (t,v)=>{
                expect(Typer.booler.of(t,v)).toBe(true);
            });
            test.each([[Number,'x']])(`型不一致時にfalseを返す`, (t,v)=>{
                expect(Typer.booler.of(t,v)).toBe(false);
            });
        });
    });
});

