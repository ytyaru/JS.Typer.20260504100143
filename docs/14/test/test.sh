#!/usr/bin/env bash
set -Ceu
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE:-0}")" && pwd)"
cd "$THIS_DIR"

# 引数があればそのファイルのみ、なければ全テストを実行
TARGET="${1:-js/**/*.js}"
# 言語指定（第2引数、デフォルト ja）
export TEST_LANG="${2:-ja}"

echo "🧪 Testing Typer (Lang: $TEST_LANG, Target: $TARGET)..."

# --preload で setup.js を読み込み、プラグインを有効化して実行
bun test --preload ./setup.js "$TARGET"

