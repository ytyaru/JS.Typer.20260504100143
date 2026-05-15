import { spawnSync } from "node:child_process";
import { join } from "node:path";

/**
 * テスト対象（src/dist）を判定し、サブ・オーケストレーターを起動する
 */
class TestDispatcher {
    constructor() {
        this.testDir = import.meta.dir;
        this.validModes = ["src", "dist"];
    }

    run() {
        const mode = process.argv[2];
        const remainingArgs = process.argv.slice(3);

        // ヘルプ表示の追加
        if (mode === "--help" || mode === "-h") {
            this.#printUsage();
            return;
        }

        try {
            // 修正: 引数がない、または "all" の場合は両モードを順次実行
            if (!mode || mode === "all") {
                console.log("🚀 全モードのテストを開始します...");
                this.#delegate("src", remainingArgs);
                this.#delegate("dist", remainingArgs);
                return;
            }

            this.#validateMode(mode);
            this.#delegate(mode, remainingArgs);
        } catch (error) {
            console.error(`❌ 起動エラー: ${error.message}`);
            this.#printUsage();
            process.exit(1);
        }
    }

    #validateMode(mode) {
        if (!this.validModes.includes(mode)) {
            throw new Error(`テストモードが不正です。"src" または "dist" を指定してください。実際: ${mode}`);
        }
    }

    #delegate(mode, args) {
        const subOrchestrator = join(this.testDir, mode, "test.js");
        
        console.log(`🛠️  モード [${mode}] のテストを開始します...`);

        // test/src/test.js または test/dist/test.js を起動
        const result = spawnSync("bun", ["run", subOrchestrator, ...args], {
            cwd: this.testDir,
            stdio: "inherit"
        });

        if (result.status !== 0) {
            process.exit(1);
        }
    }

    #printUsage() {
        console.log(`
使用法:
  ./test.sh <mode> <build_spec> <test_path>
  ./test.sh --help

引数:
  mode:       "src" (原本テスト) または "dist" (成果物テスト)。省略時は両方。
  build_spec: "format/lang/[min]" (例: "esm/ja/min") または "all"。省略時は全言語・全形式。
  test_path:  "test/js/" 以降のパス (例: "part/error.js") または "all"。省略時は全ファイル。

例:
  ./test.sh src esm/ja/ part/error.js
  ./test.sh dist all
        `);
    }

}

new TestDispatcher().run();

