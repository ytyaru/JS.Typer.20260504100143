// FORL (FunctionObjectReferenceLogger) の実装
export class FORL {
  #path;
  #args;

  // 外部からは直接 new させず、内部のファクトリからのみ Proxy として生成する
  constructor(path = 'a', args = null) {
    this.#path = path;
    this.#args = args;
  }

  // 内部データを隠蔽しつつ、検証層（TypeBuilder）に渡すためだけのゲッター
  get path() { return this.#path; }
  get args() { return this.#args; }

  // 魔法のオブジェクト（Proxy）をビルドする唯一の静的ファクトリ
  static create(currentPath = 'a') {
    const instance = new FORL(currentPath, null);
    
    // instance自体をターゲットにして Proxy で包む
    return new Proxy(instance, {
      get(target, key) {
        // 内部ログ回収用メソッド、または JS 内部シンボルはそのまま通す
        if (key === 'path' || key === 'args' || typeof key === 'symbol') {
          return Reflect.get(target, key);
        }

        // 【ガード】不正な名前空間（constructorやprototype、代入系）のアクセスを即死させる
        if (key === 'constructor' || key === 'prototype') {
          throw new Error(`[FORL Error] 許可されていないプロパティへのアクセスです: ${key}`);
        }

        // ドットが繋がれた新しいパスを計算して、次の Proxy（子ノード）を返す
        const nextPath = `${target.path}.${key}`;
        return FORL.create(nextPath);
      },

      apply(target, thisArg, callArgs) {
        // カッコが実行されたら、引数を記憶した「確定状態」のインスタンス（Proxy包み）を新しく作って返す
        const boundInstance = new FORL(target.path, callArgs);
        return new Proxy(boundInstance, this); 
      },

      set() {
        throw new Error('[FORL Error] 型アサーターへの値の代入は禁止されています。');
      }
    });
  }
}

