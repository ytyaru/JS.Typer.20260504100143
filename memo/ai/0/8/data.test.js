import { describe, test, expect } from 'bun:test';
import { Data } from './data.js';
describe('data.js',()=>{
describe('class Data',()=>{
    test('exist',()=>expect(Data).toBeDefined());
describe('static',()=>{
    describe('all',()=>{
        test('exist', ()=>expect(Data.all).toBeDefined());
        console.log(Data.clsDes());
        //console.log(Data.all());
//        console.log(Data.fn());
//        console.log(Data.P());
//        console.log(Data.cal());
//        console.log(Data.cls());
        // ary ctn を除外する
        test.each('B C bln num big str sym obj dic cls fn ins des int flt des'.split(' '))('%p',n=>{
            const d = Data[n]();
            expect(Array.isArray(d)).toBe(true);
            for (let e of d) {
                if (!Array.isArray(e)) console.log(e);
                expect(Array.isArray(e)).toBe(true);
                expect(e.length).toBe(1);
                for (let f of e) {expect(Array.isArray(f)).toBe(false);}
            }
        });
    });
//    test.each()('',)
});
});
});
