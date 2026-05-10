import { build } from "bun";
import { readdirSync } from "node:fs";
import { join, basename, resolve } from "node:path";

const SRC_DIR = "../src/js";
const I18N_DIR = join(SRC_DIR, "util/i18n");
const OUT_DIR = "../dist/browser";

/**
 * 言語ディレクトリから有効な言語リストを自動取得する
 */
const getLanguages = () => {
  return readdirSync(I18N_DIR)
    .filter(file => file.endsWith(".js") && file !== "index.js")
    .map(file => basename(file, ".js"));
};

/**
 * 指定された言語の i18n ファイルに差し替える Bun Plugin を生成する
 */
const createI18nPlugin = (lang) => ({
  name: `i18n-resolver-${lang}`,
  setup(build) {
    build.onResolve({ filter: /\/i18n\/index\.js$/ }, () => ({
      path: resolve(import.meta.dir, I18N_DIR, `${lang}.js`)
    }));
  },
});

/**
 * オブジェクトの各プロパティ（配列）から直積を生成する
 */
const crossProduct = (obj) => {
  const keys = Object.keys(obj);
  return keys.reduce((acc, key) => {
    const values = obj[key];
    return acc.flatMap(combo => values.map(val => ({ ...combo, [key]: val })));
  }, [{}]);
};

// ビルド設定の組み合わせを生成
const configs = crossProduct({
  format: 'esm iife'.split(' '),
  minify: [false, true],
  lang: getLanguages(),
});

async function run() {
  console.log(`📦 Detected languages: ${getLanguages().join(", ")}`);
  console.log("🛠️  Starting builds...");

  const builds = configs.map(({ format, minify, lang }) => {
    return build({
      entrypoints: [join(SRC_DIR, "main.js")], // エントリポイントは常に main.js
      target: "browser",
      format: format,
      minify: minify,
      outdir: join(OUT_DIR, format, lang),
      naming: `bundle${minify ? ".min" : ""}.js`,
      plugins: [createI18nPlugin(lang)],
    });
  });

  const results = await Promise.all(builds);

  results.forEach((res, i) => {
    const conf = configs[i];
    if (!res.success) {
      console.error(`❌ Error [${conf.lang} | ${conf.format} | minify:${conf.minify}]:`, ...res.logs);
    } else {
      console.log(`✅ Generated: ${res.outputs[0].path}`);
    }
  });
}

run();
