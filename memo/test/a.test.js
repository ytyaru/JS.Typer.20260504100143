import { describe, test, expect, spyOn } from "bun:test";
import {C} from './a.js';
test('C.M()',()=>expect(C.M()).toBe(1));

