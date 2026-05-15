import { build } from "bun";
import { readdirSync } from "node:fs";
import { join, basename, resolve } from "node:path";

// パス設定（build/ から見た相対パス）
const PROJECT_ROOT = resolve(import.meta.dir, "..");
const SRC_DIR = join(PROJECT_ROOT, "src/js");
const I18N_DIR = join(SRC_DIR, "util/i18n");
const OUT_DIR = join(PROJECT_ROOT, "dist/browser");
/**
 * Bun がサボっている「グローバルへの露出」を強制するプラグイン
 */
const iifeGlobalPlugin = {
    name: "iife-global-expose",
    setup(build) {
        // main.js（エントリポイント）の読み込み時に処理を挟む
        build.onLoad({ filter: /main\.js$/ }, async (args) => {
            const text = await Bun.file(args.path).text();
            // コードの末尾に、グローバルへの代入を追記する
            // これにより、IIFEの関数スコープの中から globalThis に Typer が登録される
            const injection = `\nif (typeof globalThis !== 'undefined') { globalThis.Typer = Typer; }`;
            return {
                contents: text + injection,
                loader: "js",
            };
        });
    },
};


/**
 * 言語ディレクトリから有効な言語リスト（ja, en等）を自動取得する
 */
const getLanguages = () => {
    try {
        return readdirSync(I18N_DIR)
            .filter(file => file.endsWith(".js") && file !== "index.js")
            .map(file => basename(file, ".js"));
    } catch (e) {
        console.error("❌ i18nディレクトリが見つかりません:", I18N_DIR);
        return [];
    }
};

/**
 * 指定された言語の i18n ファイルに差し替える Bun Plugin を生成する
 */
const createI18nPlugin = (lang) => ({
    name: `i18n-resolver-${lang}`,
    setup(build) {
        // ソースコード内の '../util/i18n/index.js' へのインポートをフック
        build.onResolve({ filter: /\/i18n\/index\.js$/ }, () => ({
            path: resolve(I18N_DIR, `${lang}.js`)
        }));
    },
});

/**
 * オブジェクトの各プロパティ（配列）から直積（全組み合わせ）を生成する
 */
const crossProduct = (obj) => {
    const keys = Object.keys(obj);
    return keys.reduce((acc, key) => {
        const values = obj[key];
        return acc.flatMap(combo => values.map(val => ({ ...combo, [key]: val })));
    }, [{}]);
};

// ビルド設定の組み合わせ（format x minify x lang）
const configs = crossProduct({
    format: ['esm', 'iife'],
    minify: [false, true],
    lang: getLanguages(),
});

async function run() {
    const langs = getLanguages();
    if (langs.length === 0) {
        console.error("❌ 言語ファイルが見つからないため、ビルドを中止します。");
        return;
    }

    console.log(`📦 検出された言語: ${langs.join(", ")}`);
    console.log(`🛠️  ${configs.length} 個のビルドタスクを開始します...`);

    /*
    const builds = configs.map(({ format, minify, lang }) => {
        return build({
            entrypoints: [join(SRC_DIR, "main.js")],
            target: "browser",
            format: format,
            minify: minify,
            outdir: join(OUT_DIR, format, lang),
            naming: `bundle${minify ? ".min" : ""}.js`,
            plugins: [createI18nPlugin(lang)],
            // 追記: IIFE 形式の時にグローバル変数名を付与する
            globalName: "Typer"
        });
    });
    */
    const builds = configs.map(({ format, minify, lang }) => {
        const plugins = [createI18nPlugin(lang)];
        
        // IIFE 形式の時だけ、手動露出プラグインを有効にする
        if (format === "iife") {
            plugins.push(iifeGlobalPlugin);
        }

        return build({
            entrypoints: [join(SRC_DIR, "main.js")],
            target: "browser",
            format: format,
            minify: minify,
            outdir: join(OUT_DIR, format, lang),
            naming: `bundle${minify ? ".min" : ""}.js`,
            plugins: plugins,
            // globalName は効かないことが分かったが、将来のアップデートのために残しておく
            globalName: "Typer"
        });
    });

    const results = await Promise.all(builds);

    let successCount = 0;
    results.forEach((res, i) => {
        const conf = configs[i];
        const label = `[${conf.lang} | ${conf.format} | minify:${conf.minify}]`;
        
        if (!res.success) {
            console.error(`❌ エラー ${label}:`, ...res.logs);
        } else {
            console.log(`✅ 生成完了 ${label}: ${res.outputs[0].path}`);
            successCount++;
        }
    });

    console.log(`\n✨ ビルド終了。 ${successCount}/${configs.length} 個のタスクが成功しました。`);
}

run().catch(console.error);

