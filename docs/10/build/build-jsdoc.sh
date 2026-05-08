#!/bin/bash

# スクリプトのディレクトリからプロジェクトルートを取得
PROJECT_ROOT=$(cd $(dirname "$0")/.. && pwd)
cd "$PROJECT_ROOT"

echo "TypeDocでモダンなドキュメントを生成中..."

# TypeDocの実行
bun x typedoc --options build/typedoc.json

if [ $? -eq 0 ]; then
    echo "成功: ドキュメントが docs/jsdoc に生成されました。"
    echo "ブラウザで docs/jsdoc/index.html を開いてください。"
else
    echo "失敗: ドキュメント生成中にエラーが発生しました。"
    exit 1
fi
