#!/bin/bash
PROJECT_ROOT=$(cd $(dirname "$0")/../../.. && pwd)
cd "$PROJECT_ROOT"

echo "1/2: ドキュメントリンクの自動修正を実行中..."
bun docs/typedoc/build/fix-typedoc-links.js

echo "2/2: TypeDoc でドキュメントを生成中..."
bun x typedoc --options docs/typedoc/build/typedoc.json

if [ $? -eq 0 ]; then
    echo "成功: ドキュメントが docs/typedoc/files に生成されました。"
else
    echo "失敗: ドキュメント生成中にエラーが発生しました。"
    exit 1
fi
