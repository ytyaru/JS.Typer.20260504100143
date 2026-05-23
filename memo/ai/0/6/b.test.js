import { describe, test, expect } from 'bun:test';
import {a} from './a.js';
test(`{}`, ()=>expect(a.r.obj.has({},'k')).toBe(true));
const P = {k:1};
const C = Object.create(P);
test(`P`, ()=>expect(a.r.obj.has(P,'k')).toBe(true));
test(`C`, ()=>expect(a.r.obj.has(C,'k')).toBe(true));

