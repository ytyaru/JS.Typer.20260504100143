function createMagicNode(currentPath = 'a') {
  // target を「空の関数」にすることで、すべてのドット（get）で関数呼び出し（apply）を可能にする
  const dummyTarget = function() {};

  // 隠しプロパティ（内部ログ）をセット
  dummyTarget._ = {
    path: currentPath,
    args: null // 関数実行されるまでは null
  };

  // 共通の Proxy ハンドラ
  const handler = {
    // 1. ドット結合（a.p.num）をすべて受け入れる
    get(target, key) {
      // 内部データへのアクセスや、JSシステム固有のアクセスはそのまま通す
      if (key === '_' || typeof key === 'symbol' || key === 'prototype') {
        return Reflect.get(target, key);
      }

      // ドットで繋がれた新しいパスを計算して、次の魔法のオブジェクト（子）を返す
      const nextPath = `${target._.path}.${key}`;
      return createMagicNode(nextPath);
    },

    // 2. カッコの実行（ .bit(8) ）をすべて受け入れる
    apply(target, thisArg, callArgs) {
      // 実行されたノードの args に引数を記録する
      target._.args = callArgs;

      // カッコを実行したあとに、さらにドットが続く可能性（例: a.func(1).child）を考慮し、
      // 自分自身（引数が記録された状態のProxy）をそのまま返す
      return new Proxy(target, handler);
    }
  };

  return new Proxy(dummyTarget, handler);
}
// --- 技術検証テスト ---
const a = createMagicNode();
// ユーザーが自由に記述した DSL コールバックを実行してみる
const callback1 = (a) => a.p.num.int;
const callback2 = (a) => a.p.num.int.bit(8);
const callback3 = (a) => a.p.str.some('A', 'B');
const res1 = callback1(a);
const res2 = callback2(a);
const res3 = callback3(a);
// 隠しプロパティ（データ）が正しく回収できるか確認
console.log(res1._); // { path: "a.p.num.int", args: null }
console.log(res2._); // { path: "a.p.num.int.bit", args: [8] }
console.log(res3._); // { path: "a.p.str.some", args: ["A", "B"] }


