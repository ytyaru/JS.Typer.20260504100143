import { readdirSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * テスト実行を管理するオーケストレータークラス
 */
class TestOrchestrator {
    constructor() {
        this.projectRoot = resolve(import.meta.dir, "..");
        this.i18nSrcDir = join(this.projectRoot, "src/js/util/i18n");
        this.distDir = join(this.projectRoot, "dist/browser/esm");
        this.testJsDir = join(this.projectRoot, "test/js");
    }

    /**
     * 言語リストをファイルシステムから動的に取得する（index.jsは除外）
     */
    getLanguages() {
        return readdirSync(this.i18nSrcDir)
            .filter(file => file.endsWith(".js") && file !== "index.js")
            .map(file => basename(file, ".js"));
    }

    /**
     * テストを実行する
     */
    run() {
        const langs = this.getLanguages();
        const targets = ["bundle.js", "bundle.min.js"];

        console.log(`🌍 検出された言語: ${langs.join(", ")}`);

        for (const lang of langs) {
            for (const target of targets) {
                const bundlePath = join(this.distDir, lang, target);
                
                console.log(`\n--------------------------------------------------`);
                console.log(`🧪 テスト開始: ${lang} | ${target}`);
                console.log(`📦 パス: ${bundlePath}`);
                console.log(`--------------------------------------------------`);

                // 環境変数を設定して bun test を同期実行
                const result = spawnSync("bun", ["test", "./js"], {
                    cwd: import.meta.dir,
                    stdio: "inherit",
                    env: {
                        ...process.env,
                        TEST_BUNDLE_PATH: bundlePath,
                        TEST_LANG: lang
                    }
                });

                if (result.status !== 0) {
                    console.error(`\n❌ テスト失敗: ${lang} | ${target}`);
                    process.exit(1);
                }
            }
        }

        console.log(`\n✅ すべての組み合わせでテストが成功しました。`);
    }
}

new TestOrchestrator().run();

