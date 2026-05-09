import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function fixTypedocLinks() {
    const srcDir = "src/js";
    const glob = new Glob("**/*.js");
    const classToModuleMap = {};

    // 1. クラス配置の解析（昨日成功したロジック）
    for (const file of glob.scanSync(srcDir)) {
        const content = await readFile(join(srcDir, file), "utf8");
        const moduleName = file.replace(/\.js$/, "").replace(/\\/g, "/");
        const classRegex = /export\s+class\s+([a-zA-Z0-9_]+)/g;
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            classToModuleMap[match[1]] = `${moduleName}.${match[1]}`;
        }
    }

    // 2. ゴミ掃除とリンク修正
    for (const file of glob.scanSync(srcDir)) {
        const filePath = join(srcDir, file);
        const content = await readFile(filePath, "utf8");

        // A. 私が混入させたゴミ（{@inlineSource} と Markdownブロック）を完全に削除
        let cleaned = content
            .replace(/\s*\*?\s*\{@inlineSource.*?\}/g, '') // インラインタグ削除
            .replace(/\n\s*\* \n\s*\* \*\*Source Code\*\*[\s\S]*?```[\s\S]*?```/g, ''); // Markdownブロック削除

        // B. リンクの修正（昨日成功した住所付き形式）
        const linkRegex = /(@throws|@see)\s+\{?([^}]+)\}?/g;
        cleaned = cleaned.replace(linkRegex, (match, tag, inner) => {
            let cleanName = inner.replace(/@link/g, '').replace(/!/g, '').trim();
            if (cleanName === 'this') return `${tag} {this}`;
            
            // メソッド参照（Typer.is等）を考慮して分割
            const parts = cleanName.split('.');
            const baseName = parts[0];
            const resolvedBase = classToModuleMap[baseName];

            if (resolvedBase) {
                parts[0] = resolvedBase;
                return `${tag} {@link ${parts.join('.')}}`;
            }
            return `${tag} {@link ${cleanName}}`;
        });

        if (content !== cleaned) {
            await writeFile(filePath, cleaned);
            console.log(`修復完了: ${file}`);
        }
    }
}

fixTypedocLinks().catch(console.error);

