import { describe, test, expect } from 'bun:test';
import {a} from './a.js';
describe('a.js', ()=>{
    test('a', () => expect(a).toBeInstanceOf(Object));
});


