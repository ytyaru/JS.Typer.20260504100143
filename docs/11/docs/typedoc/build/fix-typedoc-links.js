import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function fixTypedocLinks() {
    const srcDir = "src/js";
    const glob = new Glob("**/*.js");
    const classToModuleMap = {};

    console.log("1. クラスの配置を自動解析中...");
    for (const file of glob.scanSync(srcDir)) {
        const content = await readFile(join(srcDir, file), "utf8");
        const moduleName = file.replace(/\.js$/, "").replace(/\\/g, "/");
        const classRegex = /export\s+class\s+([a-zA-Z0-9_]+)/g;
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            classToModuleMap[match[1]] = `${moduleName}.${match[1]}`;
        }
    }

    console.log("2. リンク修正とソース表示タグの精密挿入を実行中...");
    for (const file of glob.scanSync(srcDir)) {
        const filePath = join(srcDir, file);
        const content = await readFile(filePath, "utf8");

        // A. リンクの修正（住所付き {@link part/module.ClassName} に統一）
        const linkRegex = /(@throws|@see)\s+\{?([^}]+)\}?/g;
        let updatedContent = content.replace(linkRegex, (match, tag, inner) => {
            let cleanName = inner.replace(/@link/g, '').replace(/!/g, '').trim();
            if (cleanName === 'this') return `${tag} {this}`;
            const fullName = classToModuleMap[cleanName] || cleanName;
            return `${tag} {@link ${fullName}}`;
        });

        // B. {@inlineSource} タグの精密挿入
        // 以下のいずれかを含む JSDoc ブロックは「ソースコードの実体がない」ため除外する
        // @type, @protected, @private, @property, @typedef
        updatedContent = updatedContent.replace(/\/\*\*([\s\S]*?)\*\/\s*(?=(export\s+class|static\s+|constructor|get\s+|[a-zA-Z0-9_]+\s*\())/g, (match, p1) => {
            if (/@(type|protected|private|property|typedef)/.test(p1)) return match;
            if (p1.includes('@inlineSource')) return match;

            const content = p1.replace(/\s*\*?\s*$/, '');
            return `/**${content}\n     * {@inlineSource}\n     */\n    `;
        });

        if (content !== updatedContent) {
            await writeFile(filePath, updatedContent);
            console.log(`   修正: ${file}`);
        }
    }
    console.log("すべての修正が完了しました。");
}

fixTypedocLinks().catch(console.error);
