import { plugin } from "bun";
import { resolve, join } from "node:path";

/**
 * テスト実行時のみ i18n 定義を動的に差し替える Bun プラグイン
 */

// オーケストレーター (test/src/test.js) から渡された環境変数を取得
const lang = process.env.TEST_LANG || "ja";

// 言語ファイルのディレクトリを特定 (test/src/setup.js から見た相対パス)
const i18nDir = resolve(import.meta.dir, "../../src/js/util/i18n");

plugin({
  name: "i18n-test-resolver",
  setup(build) {
    // インポートパスが "/i18n/index.js" で終わるものをフックする
    build.onResolve({ filter: /\/i18n\/index\.js$/ }, () => {
      const targetPath = join(i18nDir, `${lang}.js`);
      
      // 物理的なファイルを書き換えるのではなく、解決先（path）をメモリ上でリダイレクトする
      return {
        path: targetPath
      };
    });
  },
});

