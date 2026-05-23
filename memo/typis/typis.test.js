import { describe, test, expect } from 'bun:test';
import {typis} from './typis.js';
describe('typis.js', ()=>{
    test('exist', () => expect(typis).toBeInstanceOf(Function));
    test('()', () => {
        try {typis()}
        catch(e) {
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe(`引数不正です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`);
        }
    });
    describe('(v)', () => {
        test.each([[undefined],[1]])('(%p)',v=>{
            try {typis(v)}
            catch(e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`引数不正です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`);
            }
        });
    });
    describe('(v,C)', () => {
        test.each([[undefined,undefined],[undefined,Number],[1,undefined]])('undefined,undefined',(a,b)=>{
            try {typis(a,b)}
            catch(e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe(`引数不正です。第一引数に検査する値、第二引数に期待する型を指定してください。型はnull,undefined,NaN,Infinity,コンストラクタ関数のいずれかです。`);
            }
        });
        test.each([[NaN],[undefined],[null]])('(%p)',v=>{
            expect(typis(v,v)).toBe(true);
        });
        test.each([[false,Boolean],[0,Number],['',String],[0n,BigInt],[Symbol(),Symbol]])('(%p)',(v,C)=>{
            expect(typis(v,C)).toBe(true);
        });
    });
});
