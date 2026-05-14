import { readdirSync, existsSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * ビルド成果物（dist/）に対するテスト実行を管理するクラス
 */
class DistTestOrchestrator {
    constructor() {
        this.distTestDir = import.meta.dir; // test/dist
        this.projectRoot = resolve(this.distTestDir, "../..");
        this.distRootDir = join(this.projectRoot, "dist/browser");
        this.testJsDir = join(this.distTestDir, "js");

        this.validFormats = ["esm", "iife"];
    }

    /**
     * 実行メイン処理
     */
    run() {
        try {
            // 1. 引数の解析
            const spec = this.#parseBundleSpec(process.argv[2]);
            const testPattern = this.#parseTestPath(process.argv[3]);

            // 2. マトリックス実行
            this.#executeMatrix(spec, testPattern);
        } catch (error) {
            console.error(`❌ [dist] 設定エラー: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * 第1引数 (format/lang/[min]) を解析し、実行マトリックスを返す
     */
    #parseBundleSpec(specArg) {
        if (!specArg || specArg === "all") {
            // distディレクトリをスキャンして存在する言語を特定
            const langs = new Set();
            for (const format of this.validFormats) {
                const formatDir = join(this.distRootDir, format);
                if (existsSync(formatDir)) {
                    readdirSync(formatDir).forEach(d => langs.add(d));
                }
            }
            return {
                formats: this.validFormats,
                langs: Array.from(langs),
                minifieds: [false, true]
            };
        }

        const parts = specArg.split("/");
        if (parts.length !== 3) {
            throw new Error(`ビルド指定の形式が不正です。期待: "format/lang/[min]" (例: "esm/ja/"), 実際: "${specArg}"`);
        }

        const [format, lang, min] = parts;
        if (!this.validFormats.includes(format)) throw new Error(`不正な形式 (format) です: ${format}`);
        // 言語の存在確認は物理ディレクトリで行う
        if (min !== "" && min !== "min") throw new Error(`不正な圧縮指定です: ${min}`);

        return {
            formats: [format],
            langs: [lang],
            minifieds: [min === "min"]
        };
    }

    /**
     * 第2引数 (テストファイルパス) を解析
     */

    #parseTestPath(pathArg) {
        // 成果物テストは基本的に main.js (公開API) のみを対象とする
        if (!pathArg || pathArg === "all") {
            return ["./js/main.js"];
        }

        const fullPath = join(this.distTestDir, pathArg);
        if (!existsSync(fullPath)) {
            throw new Error(`テストファイルが見つかりません: ${fullPath}`);
        }

        return `./${join("js", pathArg)}`;
    }

    /**
     * マトリックスに基づいてテストを順次実行
     */
    #executeMatrix(spec, testPattern) {
        for (const format of spec.formats) {
            for (const lang of spec.langs) {
                for (const isMin of spec.minifieds) {
                    const fileName = `bundle${isMin ? ".min" : ""}.js`;
                    const bundlePath = join(this.distRootDir, format, lang, fileName);

                    if (!existsSync(bundlePath)) {
                        continue; // 物理ファイルがない組み合わせはスキップ
                    }

                    this.#runSingleTest(format, lang, isMin, bundlePath, testPattern);
                }
            }
        }
        console.log(`\n✅ [dist] すべてのテスト工程が完了しました。`);
    }

    /**
     * 1つの成果物に対して bun test を起動
     */
    #runSingleTest(format, lang, isMin, bundlePath, testPattern) {
        const minLabel = isMin ? "圧縮(min)" : "非圧縮";
        console.log(`\n🧪 成果物検証: [${lang}] [${format}] [${minLabel}] -> ${bundlePath}`);

        // 成果物テストでは --preload ./setup.js は行わない
        const targets = Array.isArray(testPattern) ? testPattern : [testPattern];
        const result = spawnSync("bun", ["test", ...targets], {
            cwd: this.distTestDir,
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

new DistTestOrchestrator().run();

