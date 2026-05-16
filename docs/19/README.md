[en](./README.md)

# Typer

型判定ライブラリ。

値の型が期待値と一致するか検証するライブラリです。JavaScript の破綻した型判定（`typeof`）を補正します。

<!--
# デモ

* [デモ](https://ytyaru.github.io/JS.Typer.20260504100143/)
-->

## 導入方法

ビルド済み成果物（`dist/`）から、環境に合ったファイルをコピーして使用してください。

### 1. ES Modules (ESM)
```javascript
import { Typer } from "./dist/browser/esm/ja/bundle.js";
Typer.is(String, "text"); // true
```

### 2. Classic Script (IIFE)
```html
<script src="./dist/browser/iife/ja/bundle.js"></script>
<script>
    Typer.is(Number, 123); // true
</script>
```


### クイックスタート
```javascript
import { Typer } from "./dist/browser/esm/ja/bundle.js";

// 基本的な判定
Typer.is(Number, 123); // true
Typer.is(Number, "1); // throws TyperNotIsError (デフォルトは例外送出)

// false返却への切り替え
Typer.is(Number, "1", null, false); // false
```

## 開発の背景：JavaScript の型判定の問題
JavaScript 標準の `typeof` 演算子には、以下の致命的な仕様が存在します。
- `typeof null` が `"object"` を返す。
- `typeof NaN` が `"number"` を返す。
- `typeof []`（配列）と `typeof {}`（オブジェクト）を区別できず、共に `"object"` を返す。

Typer はこれらの矛盾を排除し、値が「どの型指定子（TypeSpecifier）」に属するかを厳密に識別します。

## 特徴
- **厳格な一致判定 (`is`)**: 継承を許容しない完全一致。`Object` は `{}` のみを指し、配列やインスタンスを拒絶します。
- **継承関係の検証 (`of`)**: `instanceof` に基づく検証。
- **柔軟なエラー制御**: 判定不一致時に「例外を送出」するか「`false` を返却」するかを、引数やインスタンスごとに切り替え可能です。
- **多言語ビルド & ゼロ・オーバーヘッド**: 日本語（ja）と英語（en）のメッセージをビルド時に物理的に書き分けます。実行時に言語判定ロジックを走らせないため、パフォーマンスを損ないません。

## 識別可能な型指定子とコード例

Typer は以下の 5 つのカテゴリを個別の型として識別します。

### 1. 定数 (Constants)
`NaN`, `null`, `undefined` を正確に識別します。
```javascript
Typer.is(NaN, NaN);           // true
Typer.is(null, null);         // true
Typer.is(undefined, undefined); // true

Typer.is(Number, NaN);        // false (NaNは数値ではない)
```

### 2. プリミティブ (Primitives)
値そのものの型を識別します。
```javascript
Typer.is(Boolean, true);      // true
Typer.is(Number, 123);        // true
Typer.is(String, "abc");      // true
Typer.is(BigInt, 10n);        // true
Typer.is(Symbol, Symbol());   // true
```

### 3. コンテナ (Containers)
`Array` と `Object`（プレーンオブジェクト）を厳格に区別します。
```javascript
Typer.is(Array, [1, 2]);      // true
Typer.is(Object, { a: 1 });   // true

// 厳格な識別：配列やインスタンスは Object ではない
Typer.is(Object, []);         // false
Typer.is(Object, new Date()); // false

// of を使えば、JS標準の継承関係（instanceof）で判定可能
Typer.of(Object, []);         // true
```

### 4. 関数 (Functions)
あらゆる関数形式を `Function` として識別します。
```javascript
Typer.is(Function, function() {});    // true
Typer.is(Function, () => {});         // true
Typer.is(Function, async () => {});   // true
Typer.is(Function, function* () {});  // true
Typer.is(Function, class {});         // true
```

### 5. インスタンス (Instances)
特定のクラスから生成されたオブジェクトを識別します。
```javascript
Typer.is(Date, new Date());     // true
Typer.is(RegExp, /abc/);        // true
Typer.is(Error, new Error());   // true

class MyClass {}
Typer.is(MyClass, new MyClass()); // true
```


## API リファレンス

### 1. 型判定メソッド

#### `Typer.is(typeSpecifier, actualValue, label = null, throwable = true)`
値が型指定子と**完全一致**するか判定します。

#### `Typer.of(typeSpecifier, actualValue, label = null, throwable = true)`
値が型指定子と一致、または**継承関係（instanceof）**にあるか判定します。

**共通引数**:
- `typeSpecifier`: 期待する型（`NaN`, `null`, `undefined`, またはコンストラクタ関数）。
- `actualValue`: 判定対象の生の値。
- `label`: エラーメッセージに表示する変数名（任意）。
- `throwable`: 失敗時に例外を送出するか（デフォルト: `true`）。

### 2. インスタンスによる挙動の固定
`thrower`（例外送出）と `booler`（false返却）の二つのシングルトン・インスタンスを提供します。

```javascript
const silent = Typer.booler;
silent.is(Number, "1"); // false (例外を投げない)

const strict = Typer.thrower;
strict.is(Number, "1"); // throws TyperNotIsError
```

### 3. 識別可能な型指定子 (TypeSpecifier)
Typer は以下の値を「型」として認識し、値からこれらを抽出します。

- **定数**: `NaN`, `null`, `undefined`
- **プリミティブ**: `Boolean`, `Number`, `String`, `BigInt`, `Symbol`
- **コンテナ**: `Array`, `Object`（`{}` または `Object.create(null)` のみ）
- **インスタンス**: 任意のクラスコンストラクタ（`Date`, `RegExp`, ユーザー定義クラス等）

---

### 4. 例外システム (`Typer.error`)

Typer の例外はすべて `Typer.error`（`TyperError` クラス）を継承しています。

#### 例外階層
- `Typer.error.use`: 利用者の引数不正や判定不一致
    - `.arg.spec`: 型指示値が不正
    - `.res.notIs`: `is` 判定不一致
    - `.res.notOf`: `of` 判定不一致
- `Typer.error.ecma`: 言語仕様上の矛盾
    - `.boxedPrim`: ボックス化オブジェクト（`new Number()` 等）の検知
    - `.unidentifiable`: 型識別不能（`document.all` 等）
- `Typer.error.dev.impl`: ライブラリ内部の実装矛盾

#### `Typer.error` の静的メソッド
- `is(e)`: `e` がその型そのものであるか。
- `of(e)`: `e` がその型または継承型であるか。
- `isExpected(e)`: 想定内の検証失敗であるか。
- `isUnexpected(e)`: 想定外の異常であるか。
- `throw(message, option)`: その型で例外を送出する。

---

## コード例

### 様々な型の判定
```javascript
// 定数
Typer.is(NaN, NaN);             // true
Typer.is(null, null);           // true

// 厳格な Object 判定
Typer.is(Object, {});           // true
Typer.is(Object, []);           // false (配列は Object ではない)
Typer.is(Object, new Date());   // false (インスタンスは Object ではない)

// 継承関係 (of)
class Parent {}
class Child extends Parent {}
Typer.is(Parent, new Child());  // false
Typer.of(Parent, new Child());  // true
```

### ボックス化オブジェクトの禁止
```javascript
// JavaScript の罠であるボックス化オブジェクトは ActualValue.valid() で拒絶されます
Typer.is(Number, new Number(1)); // throws TyperBoxedPrimitiveValueError
```

## 高度な例外システム (`Typer.error`)

Typer は、エラーの責任境界を明確にする階層型例外システムを提供します。

### 1. 例外の判定メソッド
`try-catch` で受け取ったエラー `e` を、静的メソッドまたはゲッターで安全に識別できます。

```javascript
try {
    Typer.is(Number, value, "ユーザーID");
} catch (e) {
    if (Typer.error.of(e)) { // Typer由来の例外か
        if (e.isExpected) {  // 想定内の検証失敗か
            console.error(e.message); 
        } else if (e.isUnexpected) { // 実装バグや環境異常か
            console.error("致命的なエラー:", e.cause);
        }
    }
}
```

## 開発コマンド
```bash
bun run build  # ビルド (全 8 パターン)
bun run test   # テスト (原本・成果物全件)
bun run doc    # ドキュメント生成 (TypeDoc)
bun run all    # 全工程一括実行
```

# 開発環境

* <time datetime="20260504100139">20260504100139</time>
* [Raspbierry Pi](https://ja.wikipedia.org/wiki/Raspberry_Pi) 4 Model B Rev 1.2
* [Raspberry Pi OS](https://ja.wikipedia.org/wiki/Raspbian) buster 10.0 2020-08-20 <small>[setup](http://ytyaru.hatenablog.com/entry/2020/10/06/111111)</small>
* bash 5.2.15(1)-release
* python 

```sh
$ uname -a

```

# ライセンス

　このソフトウェアはCC0ライセンスである。

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png "CC0")](http://creativecommons.org/publicdomain/zero/1.0/deed.ja)

# 著者

　ytyaru

* [![github](http://www.google.com/s2/favicons?domain=github.com)](https://github.com/ytyaru "github")
* [![hatena](http://www.google.com/s2/favicons?domain=www.hatena.ne.jp)](http://ytyaru.hatenablog.com/ytyaru "hatena")
* [![BlueSky](http://www.google.com/s2/favicons?domain=bsky.app)](https://bsky.app/ "BlueSky")
* [![mastodon](http://www.google.com/s2/favicons?domain=mstdn.jp)](https://mstdn.jp/web/accounts/233143 "mastdon")

<!--* [![twitter](http://www.google.com/s2/favicons?domain=twitter.com)](https://twitter.com/ytyaru1 "twitter")-->


