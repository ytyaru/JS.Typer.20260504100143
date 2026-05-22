// 自動生成された型レジストリファイル（変更禁止）
import { a } from './a.js';

const horderImplementations = // ここに上記で設計した horderImplementations のオブジェクトを記述;

// 文字列パスから a.js の実際の生関数オブジェクトを引き抜くヘルパー
function getRawFunction(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], { a });
}

const registry = new Map();

  // null, undefined, NaN のいずれか
  registry.set('a.c', {
    shortName: 'Constant',
    fullName: 'InactiveConstant',
    test: getRawFunction('a.c')
  });

  // null 厳密一致
  registry.set('a.c.nul', {
    shortName: 'Null',
    fullName: 'InactiveConstant.Null',
    test: getRawFunction('a.c.nul')
  });

  // undefined 厳密一致
  registry.set('a.c.und', {
    shortName: 'Undefined',
    fullName: 'InactiveConstant.Undefined',
    test: getRawFunction('a.c.und')
  });

  // NaN 厳密一致
  registry.set('a.c.nan', {
    shortName: 'NaN',
    fullName: 'InactiveConstant.NaN',
    test: getRawFunction('a.c.nan')
  });

  // プリミティブ型全般
  registry.set('a.p', {
    shortName: 'Primitive',
    fullName: 'Primitive',
    test: getRawFunction('a.p')
  });

  // 真偽値型
  registry.set('a.p.bln', {
    shortName: 'Boolean',
    fullName: 'Primitive.Boolean',
    test: getRawFunction('a.p.bln')
  });

  // 数値型（NaNを除く）
  registry.set('a.p.num', {
    shortName: 'Number',
    fullName: 'Primitive.Number',
    test: getRawFunction('a.p.num')
  });

  // 巨大整数型
  registry.set('a.p.big', {
    shortName: 'BigInt',
    fullName: 'Primitive.BigInt',
    test: getRawFunction('a.p.big')
  });

  // 文字列型
  registry.set('a.p.str', {
    shortName: 'String',
    fullName: 'Primitive.String',
    test: getRawFunction('a.p.str')
  });

  // シンボル型
  registry.set('a.p.sym', {
    shortName: 'Symbol',
    fullName: 'Primitive.Symbol',
    test: getRawFunction('a.p.sym')
  });

  // 無限数（正負問わず）
  registry.set('a.p.num.inf', {
    shortName: 'Infinity',
    fullName: 'Primitive.Number.Infinity',
    test: getRawFunction('a.p.num.inf')
  });

  // 正の無限数
  registry.set('a.p.num.inf.p', {
    shortName: 'PositiveInfinity',
    fullName: 'Primitive.Number.Infinity.Positive',
    test: getRawFunction('a.p.num.inf.p')
  });

  // 負の無限数
  registry.set('a.p.num.inf.n', {
    shortName: 'NegativeInfinity',
    fullName: 'Primitive.Number.Infinity.Negative',
    test: getRawFunction('a.p.num.inf.n')
  });

  // 安全な整数の範囲外の数値
  registry.set('a.p.num.unsafe', {
    shortName: 'UnsafeNumber',
    fullName: 'Primitive.Number.Unsafe',
    test: getRawFunction('a.p.num.unsafe')
  });

  // 安全な整数の範囲内の数値
  registry.set('a.p.num.fin', {
    shortName: 'Finite',
    fullName: 'Primitive.Number.Finite',
    test: getRawFunction('a.p.num.fin')
  });

  // 浮動小数点数（整数でない）
  registry.set('a.p.num.flt', {
    shortName: 'Float',
    fullName: 'Primitive.Number.Float',
    test: getRawFunction('a.p.num.flt')
  });

  // 安全な整数
  registry.set('a.p.num.int', {
    shortName: 'Int',
    fullName: 'Primitive.Number.Int',
    test: getRawFunction('a.p.num.int')
  });

  // 0以上の安全な整数（正の整数）
  registry.set('a.p.num.uint', {
    shortName: 'UInt',
    fullName: 'Primitive.Number.UInt',
    test: getRawFunction('a.p.num.uint')
  });

  // bit幅指定 of 符号付き整数
  registry.set('a.p.num.int.bit', {
    shortName: 'IntBit<bit>',
    fullName: 'Primitive.Number.Int.Bit',
    init: horderImplementations['a.p.num.int.bit']?.init,
    test: getRawFunction('a.p.num.int.bit')
  });

  // bit幅指定 of 符号なし整数
  registry.set('a.p.num.uint.bit', {
    shortName: 'UIntBit<bit>',
    fullName: 'Primitive.Number.UInt.Bit',
    init: horderImplementations['a.p.num.uint.bit']?.init,
    test: getRawFunction('a.p.num.uint.bit')
  });

  // 8bit 符号付き整数
  registry.set('a.p.num.i8', {
    shortName: 'Int8',
    fullName: 'Primitive.Number.Int.Int8',
    test: getRawFunction('a.p.num.i8')
  });

  // 16bit 符号付き整数
  registry.set('a.p.num.i16', {
    shortName: 'Int16',
    fullName: 'Primitive.Number.Int.Int16',
    test: getRawFunction('a.p.num.i16')
  });

  // 32bit 符号付き整数
  registry.set('a.p.num.i32', {
    shortName: 'Int32',
    fullName: 'Primitive.Number.Int.Int32',
    test: getRawFunction('a.p.num.i32')
  });

  // 8bit 符号なし整数
  registry.set('a.p.num.u8', {
    shortName: 'UInt8',
    fullName: 'Primitive.Number.UInt.UInt8',
    test: getRawFunction('a.p.num.u8')
  });

  // 16bit 符号なし整数
  registry.set('a.p.num.u16', {
    shortName: 'UInt16',
    fullName: 'Primitive.Number.UInt.UInt16',
    test: getRawFunction('a.p.num.u16')
  });

  // 32bit 符号なし整数
  registry.set('a.p.num.u32', {
    shortName: 'UInt32',
    fullName: 'Primitive.Number.UInt.UInt32',
    test: getRawFunction('a.p.num.u32')
  });

  // 指定範囲内の整数
  registry.set('a.p.num.int.within', {
    shortName: 'IntWithin<min,max>',
    fullName: 'Primitive.Number.Int.Within',
    init: horderImplementations['a.p.num.int.within']?.init,
    test: getRawFunction('a.p.num.int.within')
  });

  // 指定範囲内の正の整数
  registry.set('a.p.num.uint.within', {
    shortName: 'UIntWithin<min,max>',
    fullName: 'Primitive.Number.UInt.Within',
    init: horderImplementations['a.p.num.uint.within']?.init,
    test: getRawFunction('a.p.num.uint.within')
  });

  // 指定範囲外の整数
  registry.set('a.p.num.int.without', {
    shortName: 'IntWithout<min,max>',
    fullName: 'Primitive.Number.Int.Without',
    init: horderImplementations['a.p.num.int.without']?.init,
    test: getRawFunction('a.p.num.int.without')
  });

  // 指定範囲外の正の整数
  registry.set('a.p.num.uint.without', {
    shortName: 'UIntWithout<min,max>',
    fullName: 'Primitive.Number.UInt.Without',
    init: horderImplementations['a.p.num.uint.without']?.init,
    test: getRawFunction('a.p.num.uint.without')
  });

  // 空文字（lengthが0）
  registry.set('a.p.str.blk', {
    shortName: 'BlankString',
    fullName: 'Primitive.String.Blank',
    test: getRawFunction('a.p.str.blk')
  });

  // 候補のいずれかに一致する文字列
  registry.set('a.p.str.some', {
    shortName: 'StringSome<candidates>',
    fullName: 'Primitive.String.Some',
    init: horderImplementations['a.p.str.some']?.init,
    test: getRawFunction('a.p.str.some')
  });

  // 参照型全般
  registry.set('a.r', {
    shortName: 'Reference',
    fullName: 'Reference',
    test: getRawFunction('a.r')
  });

  // thenメソッドを持つ任意の参照型（Promise含む）
  registry.set('a.r.then', {
    shortName: 'Thenable',
    fullName: 'Reference.Thenable',
    test: getRawFunction('a.r.then')
  });

  // 大文字始まりのクラス（コンストラクタ）
  registry.set('a.r.cls', {
    shortName: 'Class<T>',
    fullName: 'Reference.Class',
    test: getRawFunction('a.r.cls')
  });

  // Errorを継承したカスタムクラス
  registry.set('a.r.cls.err', {
    shortName: 'ErrorClass',
    fullName: 'Reference.Class.Error',
    test: getRawFunction('a.r.cls.err')
  });

  // 実行可能オブジェクト（関数全般）
  registry.set('a.r.cal', {
    shortName: 'Callable',
    fullName: 'Reference.Callable',
    test: getRawFunction('a.r.cal')
  });

  // アロー関数（同期・非同期問わず）
  registry.set('a.r.cal.arrow', {
    shortName: 'ArrowFunction',
    fullName: 'Reference.Callable.ArrowFunction',
    test: getRawFunction('a.r.cal.arrow')
  });

  // 同期アロー関数
  registry.set('a.r.cal.arrow.s', {
    shortName: 'SyncArrowFunction',
    fullName: 'Reference.Callable.ArrowFunction.Sync',
    test: getRawFunction('a.r.cal.arrow.s')
  });

  // 非同期アロー関数
  registry.set('a.r.cal.arrow.a', {
    shortName: 'AsyncArrowFunction',
    fullName: 'Reference.Callable.ArrowFunction.Async',
    test: getRawFunction('a.r.cal.arrow.a')
  });

  // オブジェクトのメソッド全般
  registry.set('a.r.cal.method', {
    shortName: 'Method',
    fullName: 'Reference.Callable.Method',
    test: getRawFunction('a.r.cal.method')
  });

  // 同期メソッド
  registry.set('a.r.cal.method.s', {
    shortName: 'SyncMethod',
    fullName: 'Reference.Callable.Method.Sync',
    test: getRawFunction('a.r.cal.method.s')
  });

  // 非同期メソッド
  registry.set('a.r.cal.method.a', {
    shortName: 'AsyncMethod',
    fullName: 'Reference.Callable.Method.Async',
    test: getRawFunction('a.r.cal.method.a')
  });

  // ジェネレータメソッド
  registry.set('a.r.cal.method.g', {
    shortName: 'GeneratorMethod',
    fullName: 'Reference.Callable.Method.Generator',
    test: getRawFunction('a.r.cal.method.g')
  });

  // 非同期ジェネレータメソッド
  registry.set('a.r.cal.method.ag', {
    shortName: 'AsyncGeneratorMethod',
    fullName: 'Reference.Callable.Method.AsyncGenerator',
    test: getRawFunction('a.r.cal.method.ag')
  });

  // 組み込み関数
  registry.set('a.r.cal.native', {
    shortName: 'NativeFunction',
    fullName: 'Reference.Callable.Native',
    test: getRawFunction('a.r.cal.native')
  });

  // bindされた関数
  registry.set('a.r.cal.bound', {
    shortName: 'BoundFunction',
    fullName: 'Reference.Callable.BoundFunction',
    test: getRawFunction('a.r.cal.bound')
  });

  // 通常のユーザー定義関数全般
  registry.set('a.r.cal.fn', {
    shortName: 'Function',
    fullName: 'Reference.Callable.Function',
    test: getRawFunction('a.r.cal.fn')
  });

  // 同期通常の関数
  registry.set('a.r.cal.fn.s', {
    shortName: 'SyncFunction',
    fullName: 'Reference.Callable.Function.Sync',
    test: getRawFunction('a.r.cal.fn.s')
  });

  // async関数の通常形態
  registry.set('a.r.cal.fn.a', {
    shortName: 'AsyncFunction',
    fullName: 'Reference.Callable.Function.Async',
    test: getRawFunction('a.r.cal.fn.a')
  });

  // *付きのジェネレータ関数
  registry.set('a.r.cal.fn.g', {
    shortName: 'GeneratorFunction',
    fullName: 'Reference.Callable.Function.Generator',
    test: getRawFunction('a.r.cal.fn.g')
  });

  // async*付きのジェネレータ関数
  registry.set('a.r.cal.fn.ag', {
    shortName: 'AsyncGeneratorFunction',
    fullName: 'Reference.Callable.Function.AsyncGenerator',
    test: getRawFunction('a.r.cal.fn.ag')
  });

  // 配列
  registry.set('a.r.ary', {
    shortName: 'Array',
    fullName: 'Reference.Array',
    test: getRawFunction('a.r.ary')
  });

  // プレーンオブジェクト（POJO）
  registry.set('a.r.obj', {
    shortName: 'Object',
    fullName: 'Reference.Object',
    test: getRawFunction('a.r.obj')
  });

  // thenを持つプレーンオブジェクト
  registry.set('a.r.obj.then', {
    shortName: 'ThenableObject',
    fullName: 'Reference.Object.Thenable',
    test: getRawFunction('a.r.obj.then')
  });

  // 指定キーを持つオブジェクト
  registry.set('a.r.obj.has', {
    shortName: 'ObjectHas<keys>',
    fullName: 'Reference.Object.Has',
    init: horderImplementations['a.r.obj.has']?.init,
    test: getRawFunction('a.r.obj.has')
  });

  // 指定の自前キーを持つオブジェクト
  registry.set('a.r.obj.hasOwn', {
    shortName: 'ObjectHasOwn<keys>',
    fullName: 'Reference.Object.HasOwn',
    init: horderImplementations['a.r.obj.hasOwn']?.init,
    test: getRawFunction('a.r.obj.hasOwn')
  });

  // 純粋な辞書（prototypeなし）
  registry.set('a.r.dic', {
    shortName: 'Dictionary',
    fullName: 'Reference.Dictionary',
    test: getRawFunction('a.r.dic')
  });

  // 指定キーを持つ辞書
  registry.set('a.r.dic.has', {
    shortName: 'DictionaryHas<keys>',
    fullName: 'Reference.Dictionary.Has',
    init: horderImplementations['a.r.dic.has']?.init,
    test: getRawFunction('a.r.dic.has')
  });

  // 指定の自前キーを持つ辞書
  registry.set('a.r.dic.hasOwn', {
    shortName: 'DictionaryHasOwn<keys>',
    fullName: 'Reference.Dictionary.HasOwn',
    init: horderImplementations['a.r.dic.hasOwn']?.init,
    test: getRawFunction('a.r.dic.hasOwn')
  });

  // プロパティ記述子全般
  registry.set('a.r.des', {
    shortName: 'Descriptor',
    fullName: 'Reference.PropertyDescriptor',
    test: getRawFunction('a.r.des')
  });

  // データまたは関数記述子
  registry.set('a.r.des.dat', {
    shortName: 'DataDescriptor',
    fullName: 'Reference.PropertyDescriptor.Data',
    test: getRawFunction('a.r.des.dat')
  });

  // 値を持つデータ記述子
  registry.set('a.r.des.dat.v', {
    shortName: 'ValueDescriptor',
    fullName: 'Reference.PropertyDescriptor.Data.Value',
    test: getRawFunction('a.r.des.dat.v')
  });

  // 関数を持つデータ記述子
  registry.set('a.r.des.dat.fn', {
    shortName: 'FunctionDescriptor',
    fullName: 'Reference.PropertyDescriptor.Data.Function',
    test: getRawFunction('a.r.des.dat.fn')
  });

  // アクセサ記述子全般
  registry.set('a.r.des.acc', {
    shortName: 'AccessorDescriptor',
    fullName: 'Reference.PropertyDescriptor.Accessor',
    test: getRawFunction('a.r.des.acc')
  });

  // getterを持つ記述子
  registry.set('a.r.des.acc.get', {
    shortName: 'Getter',
    fullName: 'Reference.PropertyDescriptor.Accessor.Getter',
    test: getRawFunction('a.r.des.acc.get')
  });

  // setterを持つ記述子
  registry.set('a.r.des.acc.set', {
    shortName: 'Setter',
    fullName: 'Reference.PropertyDescriptor.Accessor.Setter',
    test: getRawFunction('a.r.des.acc.set')
  });

  // getter/setter両方を持つ記述子
  registry.set('a.r.des.acc.gs', {
    shortName: 'GetterSetter',
    fullName: 'Reference.PropertyDescriptor.Accessor.GetterSetter',
    test: getRawFunction('a.r.des.acc.gs')
  });

  // プレーン以外のすべてのインスタンス
  registry.set('a.r.ins', {
    shortName: 'Instance',
    fullName: 'Reference.Instance',
    test: getRawFunction('a.r.ins')
  });

  // thenを持つインスタンスオブジェクト
  registry.set('a.r.ins.then', {
    shortName: 'ThenableInstance',
    fullName: 'Reference.Instance.Thenable',
    test: getRawFunction('a.r.ins.then')
  });

  // クラスを継承したインスタンス
  registry.set('a.r.ins.of', {
    shortName: 'InstanceOf<T>',
    fullName: 'Reference.Instance.Of',
    init: horderImplementations['a.r.ins.of']?.init,
    test: getRawFunction('a.r.ins.of')
  });

  // クラスと厳密一致するインスタンス
  registry.set('a.r.ins.is', {
    shortName: 'InstanceIs<T>',
    fullName: 'Reference.Instance.Is',
    init: horderImplementations['a.r.ins.is']?.init,
    test: getRawFunction('a.r.ins.is')
  });

  // Errorのインスタンス
  registry.set('a.r.ins.err', {
    shortName: 'ErrorInstance',
    fullName: 'Reference.Instance.Error',
    test: getRawFunction('a.r.ins.err')
  });


export { registry };
