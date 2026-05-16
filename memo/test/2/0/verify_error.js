import { test } from 'bun:test'; test('error', () => { throw new Error('crash'); });
