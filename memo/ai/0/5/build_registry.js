// 自動生成された型レジストリファイル（変更禁止）
import { a } from './a.js';
import { HorderExtensions } from './HorderExtensions.js';

const getRawFunction = (path) => path.split('.').reduce((obj, key) => obj?.[key], { a });

const horderKeywords = ['.bit', '.within', '.without', '.some', '.has', '.of', '.is'];
const checkHasParams = (path) => horderKeywords.some(keyword => path.endsWith(keyword) || path.includes(keyword + '.'));

// 【DRYの極み】TSVから抽出されたメタデータの静的定義配列
const metadataSource = [
  ['a.p.bln', { shortName: 'Boolean', fullName: 'Primitive.Boolean' }],
  ['a.p.num.int', { shortName: 'Int', fullName: 'Primitive.Number.Int' }],
  ['a.p.num.int.bit', { shortName: 'IntBit<bit>', fullName: 'Primitive.Number.Int.Bit' }],
  ['a.p.str.some', { shortName: 'StringSome<candidates>', fullName: 'Primitive.String.Some' }]
];

const registry = new Map();

for (const [path, meta] of metadataSource) {
  registry.set(path, {
    shortName: meta.shortName,
    fullName: meta.fullName,
    hasParams: checkHasParams(path),
    init: HorderExtensions[path]?.init,
    test: getRawFunction(path)
  });
}

export { registry };

