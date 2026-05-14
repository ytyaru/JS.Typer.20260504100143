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

    /*
    run() {
        const mode = process.argv[2];
        const remainingArgs = process.argv.slice(3);

        try {
            this.#validateMode(mode);
            this.#delegate(mode, remainingArgs);
        } catch (error) {
            console.error(`❌ 起動エラー: ${error.message}`);
            this.#printUsage();
            process.exit(1);
        }
    }
    */
    run() {
        const mode = process.argv[2];
        const remainingArgs = process.argv.slice(3);

        try {
            // 修正：引数がない、または "all" の場合は両モードを順次実行
            if (!mode || mode === "all") {
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
  ./test.sh src <build_spec> <test_path>
  ./test.sh dist <build_spec>

例:
  ./test.sh src esm/ja/ part/error
  ./test.sh dist esm/ja/min
        `);
    }
}

new TestDispatcher().run();

