import { Glob } from "bun"; // 冒頭に追加
import { readdirSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * 原本（src/js）に対するテスト実行を管理するクラス
 */
class SrcTestOrchestrator {
    constructor() {
        this.srcDir = import.meta.dir; // test/src
        this.projectRoot = resolve(this.srcDir, "../..");
        this.i18nSrcDir = join(this.projectRoot, "src/js/util/i18n");
        this.testJsDir = join(this.srcDir, "js");

        this.validFormats = ["esm", "iife"];
        this.validLangs = this.#getAvailableLanguages();
    }

    /**
     * 実行メイン処理
     */
    run() {
        try {
            // 1. 引数の解析
            const spec = this.#parseBundleSpec(process.argv[2]);
            const testPattern = this.#parseTestPath(process.argv[3]);

            // 2. プリプロセス: テスト専用ターゲット（core.test-target.js）の生成
            this.#generateTestTarget();

            // 3. マトリックス実行
            this.#executeMatrix(spec, testPattern);
        } catch (error) {
            console.error(`❌ [src] 設定エラー: ${error.message}`);
            process.exit(1);
        }
    }

    #getAvailableLanguages() {
        return readdirSync(this.i18nSrcDir)
            .filter(file => file.endsWith(".js") && file !== "index.js")
            .map(file => basename(file, ".js"));
    }

    #parseBundleSpec(specArg) {
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
        if (min !== "" && min !== "min") throw new Error(`不正な圧縮指定です: ${min}`);

        return {
            formats: [format],
            langs: [lang],
            minifieds: [min === "min"]
        };
    }
    #parseTestPath(pathArg) {
        if (!pathArg || pathArg === "all") {
            // 修正：命名規則外のファイルをパスとして明示的に指定するため、ファイルリストを生成
            const glob = new Glob("js/**/*.js");
            return Array.from(glob.scanSync({ cwd: this.srcDir }))
                .filter(file => !file.endsWith(".test-target.js"))
                .map(file => `./${file}`);
        }

        const fullPath = join(this.testJsDir, pathArg);
        if (!existsSync(fullPath)) {
            throw new Error(`テストファイルが見つかりません: ${fullPath}`);
        }

        return `./${join("js", pathArg)}`;
    }

    #generateTestTarget() {
        console.log("🛠️  テスト専用ターゲットを生成中...");
        const result = spawnSync("bun", ["run", "./gen-test-target.js"], {
            cwd: this.srcDir,
            stdio: "inherit"
        });

        if (result.status !== 0) {
            throw new Error("テスト専用ターゲットの生成に失敗しました。");
        }
    }

    #executeMatrix(spec, testPattern) {
        console.log(`🌍 テスト対象言語: ${spec.langs.join(", ")}`);

        for (const format of spec.formats) {
            for (const lang of spec.langs) {
                for (const isMin of spec.minifieds) {
                    this.#runBunTest(format, lang, isMin, testPattern);
                }
            }
        }
        console.log(`\n✅ [src] すべてのテスト工程が完了しました。`);
    }

    #runBunTest(format, lang, isMin, testPattern) {
        const minLabel = isMin ? "圧縮(min)" : "非圧縮";
        console.log(`\n🧪 実行: [${lang}] [${format}] [${minLabel}] -> ${testPattern}`);

        // --preload ./setup.js により、メモリ上で i18n を差し替える
        const targets = Array.isArray(testPattern) ? testPattern : [testPattern];
        const result = spawnSync("bun", ["test", "--preload", "./setup.js", ...targets], {
            cwd: this.srcDir,
            stdio: "inherit",
            env: {
                ...process.env,
                TEST_LANG: lang,
                // srcテストでも、必要に応じて成果物との比較ができるようパスを渡しておく
                TEST_BUNDLE_PATH: `../../dist/browser/${format}/${lang}/bundle${isMin ? ".min" : ""}.js`
            }
        });

        if (result.status !== 0) {
            console.error(`\n❌ テスト失敗: [${lang}/${format}/${minLabel}]`);
            process.exit(1);
        }
    }
}

new SrcTestOrchestrator().run();

