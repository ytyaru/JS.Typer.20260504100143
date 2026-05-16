import { readdirSync, existsSync, statSync } from "node:fs";
import { join, basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * テスト実行結果を蓄積し、最後にサマリーを表示するクラス
 */
class ResultCollector {
    constructor(scriptPath) {
        this.scriptPath = scriptPath;
        this.results = [];
    }

    add(mode, lang, target, success, retryArgs) {
        this.results.push({ mode, lang, target, success, retryArgs });
    }

    print() {
        console.log("\n" + "━".repeat(80));
        console.log("📊 テスト実行結果サマリー");
        console.log("━".repeat(80));

        if (this.results.length === 0) {
            console.log("実行されたテストはありません。");
            return;
        }

        const labels = this.results.map(r => `[${r.mode}] ${r.lang.padEnd(3)} ${r.target}`);
        const maxLen = Math.max(...labels.map(l => l.length));

        this.results.forEach((r, i) => {
            const status = r.success ? "✅ 成功" : "❌ 失敗";
            console.log(`${status} ${labels[i].padEnd(maxLen)}`);
            if (!r.success) {
                console.log(`   👉 再試行: bun ${this.scriptPath} ${r.retryArgs}`);
            }
        });

        console.log("━".repeat(80));
        const fails = this.results.filter(r => !r.success).length;
        if (fails > 0) {
            console.log(`❌ 結果: ${fails} 件の失敗があります。`);
            process.exit(1);
        }
        console.log("✅ 結果: すべてのテストが成功しました。");
    }
}

/**
 * テスト実行の共通基盤
 */
class BaseOrchestrator {
    constructor(testDir, collector) {
        this.testDir = testDir;
        this.collector = collector;
    }

    /**
     * 絶対パスを使用して bun test を実行する（Bunの誤認を防止）
     */
    spawn(mode, lang, targetLabel, env, testFilePath, retryArgs) {
        const absPath = resolve(this.testDir, testFilePath);
        console.log(`🧪 [${mode}] 実行中: [${lang}] -> ${targetLabel}`);

        const result = spawnSync("bun", ["test", "--preload", "./setup.js", absPath], {
            cwd: this.testDir,
            stdio: "inherit",
            env: { ...process.env, ...env }
        });

        this.collector.add(mode, lang, targetLabel, result.status === 0, retryArgs);
    }
}

/**
 * 原本テスト (src) 用
 */
class SrcOrchestrator extends BaseOrchestrator {
    constructor(testDir, collector, validLangs) {
        super(testDir, collector);
        this.validLangs = validLangs;
    }

    execute(langArg, pathArg) {
        let lang = langArg || "all";
        let path = pathArg || "all";

        if (this.validLangs.includes(pathArg)) {
            [lang, path] = [pathArg, langArg || "all"];
        }

        const langs = lang === "all" ? this.validLangs : [lang];
        for (const l of langs) {
            const targets = this.#findFiles(path, l);
            for (const t of targets) {
                const retry = `src ${l} ${t.replace('./js/', '')}`;
                this.spawn("src", l, t, { TEST_LANG: l }, t, retry);
            }
        }
    }

    #findFiles(pathArg, lang) {
        if (pathArg !== "all") return [`./js/${pathArg}`];
        
        const targets = [];
        const jsDir = join(this.testDir, "js");
        
        if (existsSync(join(jsDir, "main.js"))) targets.push("./js/main.js");
        
        const partDir = join(jsDir, "part");
        if (existsSync(partDir)) {
            readdirSync(partDir)
                .filter(f => f.endsWith(".js") && !f.endsWith(".test-target.js"))
                .forEach(f => targets.push(`./js/part/${f}`));
        }

        const i18nFile = `./js/util/i18n/${lang}.js`;
        if (existsSync(join(this.testDir, i18nFile))) targets.push(i18nFile);
        
        return targets;
    }
}

/**
 * 成果物テスト (dist) 用
 */
class DistOrchestrator extends BaseOrchestrator {
    constructor(testDir, collector, distDir, validLangs) {
        super(testDir, collector);
        this.distDir = distDir;
        this.validLangs = validLangs;
    }

    execute(specArg) {
        const specs = this.#parseSpecs(specArg);
        for (const s of specs) {
            const fileName = `bundle${s.min ? ".min" : ""}.js`;
            const bundlePath = join(this.distDir, s.format, s.lang, fileName);
            if (!existsSync(bundlePath)) continue;

            const label = `${s.format}/${s.lang}${s.min ? '/min' : '/'}`;
            const retry = `dist ${label}`;
            this.spawn("dist", s.lang, label, { 
                TEST_LANG: s.lang, 
                TEST_BUNDLE_PATH: bundlePath 
            }, "./js/main.js", retry);
        }
    }

    #parseSpecs(spec) {
        if (!spec || spec === "all") {
            const list = [];
            ["esm", "iife"].forEach(f => this.validLangs.forEach(l => {
                list.push({ format: f, lang: l, min: false }, { format: f, lang: l, min: true });
            }));
            return list;
        }
        const parts = spec.split("/");
        if (parts.length < 2) throw new Error(`dist指定が不正です: ${spec}`);
        return [{ format: parts[0], lang: parts[1], min: parts[2] === "min" }];
    }
}

/**
 * メイン・ディスパッチャ
 */
class MainDispatcher {
    constructor() {
        this.testDir = import.meta.dir;
        this.projectRoot = resolve(this.testDir, "..");
        this.i18nSrcDir = join(this.projectRoot, "src/js/util/i18n");
        this.distDir = join(this.projectRoot, "dist/browser");

        this.validLangs = readdirSync(this.i18nSrcDir)
            .filter(f => f.endsWith(".js") && f !== "index.js")
            .map(f => basename(f, ".js"));

        this.collector = new ResultCollector(process.argv[1]);
        this.src = new SrcOrchestrator(this.testDir, this.collector, this.validLangs);
        this.dist = new DistOrchestrator(this.testDir, this.collector, this.distDir, this.validLangs);
    }

    run() {
        const mode = process.argv[2];
        const arg1 = process.argv[3];
        const arg2 = process.argv[4];

        if (mode === "--help" || mode === "-h") {
            this.#printUsage();
            return;
        }

        try {
            if (!mode || mode === "all") {
                this.src.execute("all", "all");
                this.dist.execute("all");
            } else if (mode === "src") {
                this.src.execute(arg1, arg2);
            } else if (mode === "dist") {
                this.dist.execute(arg1);
            } else {
                throw new Error(`不明なモード: ${mode}`);
            }
            this.collector.print();
        } catch (error) {
            console.error(`❌ 起動エラー: ${error.message}`);
            this.#printUsage();
            process.exit(1);
        }
    }

    #printUsage() {
        console.log(`
使用法:
  ./test.sh <mode> <spec/lang> <path>

引数:
  mode: "src", "dist", または "all" (省略時)
  src時: [lang] [path] (順序不問。例: ja part/core.js)
  dist時: [format/lang/min] (例: esm/ja/min)
        `);
    }
}

new MainDispatcher().run();
