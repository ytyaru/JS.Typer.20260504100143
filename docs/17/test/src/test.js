import { readdirSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * テストの実行マトリックスを管理し、適切な環境でテストを起動する司令塔クラス
 */
class TestOrchestrator {
    constructor() {
        this.projectRoot = resolve(import.meta.dir, "..");
        this.i18nSrcDir = join(this.projectRoot, "src/js/util/i18n");
        this.distDir = join(this.projectRoot, "dist/browser");
        this.testJsDir = join(this.projectRoot, "test/js");

        this.validFormats = ["esm", "iife"];
        this.validLangs = this.#getAvailableLanguages();
    }

    /**
     * 実行メイン処理
     */
    run() {
        try {
            const bundleMatrix = this.#getBundleMatrix(process.argv[2]);
            const testPattern = this.#getTestPattern(process.argv[3]);

            this.#executeMatrix(bundleMatrix, testPattern);
        } catch (error) {
            console.error(`❌ エラー: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * 言語ファイルをスキャンして利用可能な言語リストを返す
     */
    #getAvailableLanguages() {
        return readdirSync(this.i18nSrcDir)
            .filter(file => file.endsWith(".js") && file !== "index.js")
            .map(file => basename(file, ".js"));
    }

    /**
     * 第1引数からテスト対象となるビルド成果物のマトリックスを生成する
     */
    #getBundleMatrix(specArg) {
        if (!specArg || specArg === "all") {
            return {
                formats: this.validFormats,
                langs: this.validLangs,
                minifieds: [false, true]
            };
        }

        const parts = specArg.split("/");
        if (parts.length !== 3) {
            throw new Error(`ビルド指定の形式が不正です。期待: "format/lang/[min]" (例: "esm/ja/"), 実際: "${specArg}"`);
        }

        const [format, lang, min] = parts;

        if (!this.validFormats.includes(format)) throw new Error(`不正な形式 (format) です: ${format}`);
        if (!this.validLangs.includes(lang)) throw new Error(`不正な言語 (lang) です: ${lang}`);
        if (min !== "" && min !== "min") throw new Error(`不正な圧縮指定 (minify) です。"" または "min" を指定してください: ${min}`);

        return {
            formats: [format],
            langs: [lang],
            minifieds: [min === "min"]
        };
    }

    /**
     * 第2引数から実行するテストファイルのパターンを生成する
     * Bunが「フィルター」ではなく「パス」として認識するよう、必ず "./" で始まるようにする
     */
    #getTestPattern(pathArg) {
        if (!pathArg || pathArg === "all") {
            return "./js/**/*.js";
        }

        const fullPath = join(this.testJsDir, pathArg);
        if (!existsSync(fullPath)) {
            throw new Error(`テストファイルが見つかりません: ${fullPath}`);
        }

        // path.join は先頭の "./" を消してしまうことがあるため、明示的に付与する
        const relativePath = join("js", pathArg);
        return `./${relativePath}`;
    }

    /**
     * 生成されたマトリックスに基づいてテストを順次実行する
     */
     /*
    #executeMatrix(matrix, testPattern) {
        console.log(`🌍 利用可能な言語: ${this.validLangs.join(", ")}`);

        for (const format of matrix.formats) {
            for (const lang of matrix.langs) {
                for (const isMin of matrix.minifieds) {
                    const fileName = `bundle${isMin ? ".min" : ""}.js`;
                    const bundlePath = join(this.distDir, format, lang, fileName);

                    if (!existsSync(bundlePath)) {
                        console.warn(`⚠️  スキップ: ファイルが存在しません: ${bundlePath}`);
                        continue;
                    }

                    this.#runBunTest(bundlePath, lang, testPattern, isMin);
                }
            }
        }
        console.log(`\n✅ すべてのテスト実行が完了しました。`);
    }
    */
    #executeMatrix(langs, testPattern) {
        console.log(`🌍 利用可能な言語: ${langs.join(", ")}`);

        for (const lang of langs) {
            console.log(`\n🧪 テスト実行中: [${lang}] -> ${testPattern}`);

            // 成果物(dist)は見ず、常に src/js をテスト対象とする
            // i18n の差し替えは setup.js プラグインが担当する
            const result = spawnSync("bun", ["test", "--coverage", "--preload", "./setup.js", testPattern], {
                cwd: import.meta.dir,
                stdio: "inherit",
                env: {
                    ...process.env,
                    TEST_LANG: lang
                }
            });

            if (result.status !== 0) {
                console.error(`\n❌ テスト失敗: [${lang}]`);
                process.exit(1);
            }
        }
        console.log(`\n✅ すべてのテストが完了しました。`);
    }
    /**
     * 個別のテストプロセスを起動する
     */
    #runBunTest(bundlePath, lang, testPattern, isMin) {
        const minLabel = isMin ? "圧縮(min)" : "非圧縮";
        const format = bundlePath.includes("/esm/") ? "esm" : "iife";
        
        console.log(`\n🧪 テスト実行中: [${lang}] [${format}] [${minLabel}] -> ${testPattern}`);

        const result = spawnSync("bun", ["test", "--coverage", "--preload", "./setup.js", testPattern], {
            cwd: import.meta.dir,
            stdio: "inherit",
            env: {
                ...process.env,
                TEST_LANG: lang,
                TEST_BUNDLE_PATH: bundlePath
            }
        });

        if (result.status !== 0) {
            console.error(`\n❌ テスト失敗: [${lang}/${format}/${minLabel}]`);
            process.exit(1);
        }
    }
}

new TestOrchestrator().run();

