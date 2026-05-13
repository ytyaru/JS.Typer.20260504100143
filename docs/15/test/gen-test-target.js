import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const SRC_FILE = join(PROJECT_ROOT, "src/js/part/core.js");
const OUT_FILE = join(PROJECT_ROOT, "test/js/part/core.test-target.js");

async function generate() {
    const content = await readFile(SRC_FILE, "utf8");

    // 1. 抽出パターンの定義
    // 境界(\b)から始まり、'class'キーワード、空白、そして[A-Z_]で始まる'Specifier'で終わる名前を抽出
    const classDefPattern = /\bclass\s+([A-Z_][a-zA-Z0-9_]*Specifier)\b/g;
    
    // 2. 既エクスポートパターンの定義
    // 'export class' として定義されているものを特定
    const exportDefPattern = /\bexport\s+class\s+([A-Z_][a-zA-Z0-9_]*Specifier)\b/g;

    // 3. すべてのクラス定義名を抽出
    const allClassNames = new Set();
    let match;
    while ((match = classDefPattern.exec(content)) !== null) {
        allClassNames.add(match[1]);
    }

    // 4. すでに export されているクラス名を取得
    const exportedClassNames = new Set();
    let expMatch;
    while ((expMatch = exportDefPattern.exec(content)) !== null) {
        exportedClassNames.add(expMatch[1]);
    }

    // 5. 内部クラス（定義はあるが export されていないもの）を特定
    const internalClasses = [...allClassNames].filter(name => !exportedClassNames.has(name));

    if (internalClasses.length === 0) {
        console.log("ℹ️  抽出対象の内部クラスは見つかりませんでした。");
    } else {
        console.log(`🔍 抽出された内部クラス: ${internalClasses.join(", ")}`);
    }

    // 6. ファイル末尾に追記するエクスポート文の作成
    const exportBlock = `
// --- テスト専用のエクスポート（自動生成） ---
export { ${internalClasses.join(", ")} };
`;

    // 7. インポートパスの修正と結合
    let updatedContent = content + exportBlock;
    updatedContent = updatedContent.replace(
        /from\s+['"]\.\.\/util\/i18n\/index\.js['"]/g,
        "from '../../../src/js/util/i18n/index.js'"
    );
    updatedContent = updatedContent.replace(
        /from\s+['"]\.\/error\.js['"]/g,
        "from '../../../src/js/part/error.js'"
    );

    await mkdir(dirname(OUT_FILE), { recursive: true });
    await writeFile(OUT_FILE, updatedContent);
    console.log(`✅ テスト専用ターゲットを生成しました: ${OUT_FILE}`);
}

generate().catch(console.error);
