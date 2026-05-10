import { build } from "bun";
import { readdirSync } from "node:fs";
import { join, basename, resolve } from "node:path";

const I18N_DIR = "./src/util/i18n";
const OUT_DIR = "./dist";

// 1. 言語ファイルを自動スキャン
const langs = readdirSync(I18N_DIR)
    .filter(file => file.endsWith(".js") && file !== "index.js")
    .map(file => basename(file, ".js"));

console.log(`検出された言語: ${langs.join(", ")}`);

// 2. 言語ごとにビルド
for (const lang of langs) {
    // 言語ごとに専用のプラグインを作成
    const i18nPlugin = {
        name: "i18n-resolver",
        setup(build) {
            // index.js へのインポートを検知して差し替える
            build.onResolve({ filter: /\/i18n\/index\.js$/ }, (args) => {
                return {
                    path: resolve(join(I18N_DIR, `${lang}.js`))
                };
            });
        },
    };

    const result = await build({
        entrypoints: ["./src/main.js"],
        outdir: join(OUT_DIR, lang),
        naming: "bundle.js",
        plugins: [i18nPlugin], // プラグインを注入
    });

    if (result.success) {
        console.log(`ビルド成功 [${lang}]: ${OUT_DIR}/${lang}/bundle.js`);
    } else {
        console.error(`ビルド失敗 [${lang}]`, result.logs);
    }
}
