import { describe, test, expect, spyOn } from "bun:test";
import {A} from './a.js';
test('A.M()',()=>expect(A.M()).toBe(1));

