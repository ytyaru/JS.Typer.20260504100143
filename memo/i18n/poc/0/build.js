import { build } from "bun";
import { readdirSync } from "node:fs";
import { join, basename } from "node:path";

const I18N_DIR = "./src/util/i18n";
const OUT_DIR = "./dist";

// 1. 言語ファイルを自動スキャン（index.jsを除外）
const langs = readdirSync(I18N_DIR)
    .filter(file => file.endsWith(".js") && file !== "index.js")
    .map(file => basename(file, ".js"));

console.log(`検出された言語: ${langs.join(", ")}`);

// 2. 各言語ごとにビルド実行
for (const lang of langs) {
    const result = await build({
        entrypoints: ["./src/main.js"],
        outdir: join(OUT_DIR, lang),
        naming: "bundle.js",
        // ここで alias を使う
        // キー: ソースコード内の import パス
        // 値: 実際に結合したいファイルのプロジェクトルートからのパス
        alias: {
            "./util/i18n/index.js": join(process.cwd(), I18N_DIR, `${lang}.js`)
        }
    });

    if (result.success) {
        console.log(`ビルド成功 [${lang}]: ${OUT_DIR}/${lang}/bundle.js`);
    } else {
        console.error(`ビルド失敗 [${lang}]`, result.logs);
    }
}

