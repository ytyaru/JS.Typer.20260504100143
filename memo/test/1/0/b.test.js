import { describe, test, expect, spyOn } from "bun:test";
import {B} from './b.js';
test('B.M()',()=>expect(B.M()).toBe(2));

