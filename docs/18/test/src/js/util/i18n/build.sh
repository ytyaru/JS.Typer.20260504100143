#!/usr/bin/env bash
set -Ceu
# スクリプトの場所を基準にディレクトリ移動
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE:-0}")" && pwd)"
cd "$THIS_DIR"

# 1. カレントディレクトリ内の .js ファイル（index.js, build.sh 以外）を言語リストとして取得
# ファイル名（ja, en）がそのまま TEST_LANG 環境変数になります
LANGS=($(find . -maxdepth 1 -name "*.js" ! -name "index.js" -exec basename {} .js \;))

if [ ${#LANGS[@]} -eq 0 ]; then
    echo "❌ テスト対象の言語ファイルが見つかりません。"
    exit 1
fi

echo "🌐 i18n 文言一字一句テストを開始します..."

for lang in "${LANGS[@]}"; do
    echo ""
    echo "🧪 実行中: [$lang] -> ./${lang}.js"
    
    # 環境変数を設定し、3つ上の階層にある setup.js をプリロードして実行
    # これにより原本の i18n/index.js が各言語の実体に差し替わります
    export TEST_LANG="$lang"
    bun test --preload "../../../setup.js" "./${lang}.js"
    
    if [ $? -ne 0 ]; then
        echo "❌ テスト失敗: [$lang]"
        exit 1
    fi
done

echo ""
echo "✅ すべての言語で文言テストが成功しました。"

