import { plugin } from "bun";
import { resolve } from "node:path";

// 環境変数 TEST_LANG に基づいて差し替え先を決定
const lang = process.env.TEST_LANG || "ja";
const i18nPath = resolve(import.meta.dir, `../src/js/util/i18n/${lang}.js`);

plugin({
  name: "i18n-test-resolver",
  setup(build) {
    // ソースコード内の index.js への参照を、指定した言語ファイルへメモリ上でリダイレクトする
    build.onResolve({ filter: /\/i18n\/index\.js$/ }, () => ({
      path: i18nPath
    }));
  },
});

