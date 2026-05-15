import { Glob } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function cleanupAndFix() {
    const srcDir = "src/js";
    const glob = new Glob("**/*.js");
    const classToModuleMap = {};

    // 1. クラス配置の解析（モジュール名を src/js/ から始める）
    for (const file of glob.scanSync(srcDir)) {
        const content = await readFile(join(srcDir, file), "utf8");
        const moduleName = "src/js/" + file.replace(/\.js$/, "").replace(/\\/g, "/");
        
        const classRegex = /export\s+class\s+([a-zA-Z0-9_]+)/g;
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            classToModuleMap[match[1]] = `${moduleName}.${match[1]}`;
        }
    }

    // 2. 深層洗浄とリンクの再構築
    for (const file of glob.scanSync(srcDir)) {
        const filePath = join(srcDir, file);
        const content = await readFile(filePath, "utf8");

        let cleaned = content
            .replace(/\s*\*?\s*\{@inlineSource.*?\}/g, '')
            .replace(/\n\s*\* \n\s*\* \*\*Source Code\*\*[\s\S]*?```[\s\S]*?```/g, '')
            .replace(/\s*\*?\s*@inlineSource/g, '');

        const linkRegex = /(@throws|@see)\s+\{?([^}]+)\}?/g;
        cleaned = cleaned.replace(linkRegex, (match, tag, inner) => {
            let name = inner.replace(/@link/g, '').replace(/!/g, '').split('|')[0].split(' ').filter(s => s.trim())[0] || '';
            name = name.split('/').pop().split('.').pop().trim();

            if (name === 'this') return `${tag} {this}`;
            
            const fullPath = classToModuleMap[name];
            if (fullPath) {
                // {@link フルパス 表示名} 形式（スペース区切り）
                return `${tag} {@link ${fullPath} ${name}}`;
            }
            return `${tag} {@link ${name}}`;
        });

        if (content !== cleaned) {
            await writeFile(filePath, cleaned);
            console.log(`   修復・整形完了: ${file}`);
        }
    }
}

cleanupAndFix().catch(console.error);
