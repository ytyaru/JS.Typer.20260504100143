#!/usr/bin/env bash
set -Ceu
# スクリプトの場所を基準にディレクトリ移動
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE:-0}")" && pwd)"
cd "$THIS_DIR"

echo "📦 Typerライブラリをビルド中..."
bun run ./build.js

# ドキュメントビルドも自動で行う場合は以下を有効化
# echo "📖 ドキュメントを生成中..."
# "../docs/typedoc/build/build.sh"
