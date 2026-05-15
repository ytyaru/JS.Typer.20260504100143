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
        // 追加: 最後に表示するために引数を保持
        const specArg = process.argv[2] || "all";
        const pathArg = process.argv[3] || "all";

        try {
            // 1. 引数の解析
            const spec = this.#parseBundleSpec(process.argv[2]);
            const testPattern = this.#parseTestPath(process.argv[3]);

            // 2. プリプロセス: テスト専用ターゲット（core.test-target.js）の生成
            this.#generateTestTarget();

            // 3. マトリックス実行
            this.#executeMatrix(spec, testPattern, specArg, pathArg);
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
            // js ディレクトリ以下を再帰的にスキャン
            const glob = new Glob("**/*.js");
            const jsDir = join(this.srcDir, "js");
            
            const files = Array.from(glob.scanSync(jsDir))
                .filter(file => {
                    // util/i18n などのデータファイルを除外
                    if (file.includes("util/i18n/")) return false;
                    // 自動生成ファイルを除外
                    if (file.endsWith(".test-target.js")) return false;
                    return true;
                })
                .map(file => `./js/${file}`); // test/src からの相対パスに整形
            
            if (files.length === 0) {
                throw new Error(`テストファイルが見つかりませんでした。検索ディレクトリ: ${jsDir}`);
            }
            return files;
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

    #executeMatrix(spec, testPattern, specArg, pathArg) {
        console.log(`🌍 テスト対象言語: ${spec.langs.join(", ")}`);

        for (const format of spec.formats) {
            for (const lang of spec.langs) {
                for (const isMin of spec.minifieds) {
                    this.#runBunTest(format, lang, isMin, testPattern);
                }
            }
        }
        console.log(`\n✅ [src] テスト工程が完了しました。 [指定: ${specArg}, ${pathArg}]`);
    }

    #runBunTest(format, lang, isMin, testPattern) {
        const minLabel = isMin ? "圧縮(min)" : "非圧縮";
        const patternLabel = Array.isArray(testPattern) ? "全ファイル" : testPattern;
        
        console.log(`\n🧪 実行: [${lang}] [${format}] [${minLabel}] -> ${patternLabel}`);

        const targets = Array.isArray(testPattern) ? testPattern : [testPattern];
        const result = spawnSync("bun", ["test", "--preload", "./setup.js", ...targets], {
            cwd: this.srcDir,
            stdio: "inherit",
            env: {
                ...process.env,
                TEST_LANG: lang
            }
        });

        if (result.status !== 0) {
            console.error(`\n❌ テスト失敗: [${lang}/${format}/${minLabel}]`);
            process.exit(1);
        }
    }
}

new SrcTestOrchestrator().run();

