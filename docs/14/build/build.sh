#!/usr/bin/env bash
set -Ceu
THIS="$(realpath "${BASH_SOURCE:-0}")"; HERE="$(dirname "$THIS")"; PARENT="$(dirname "$HERE")";
cd "$HERE"

# 1. ライブラリ本体のビルド
echo "🚀 Building Typer library..."
bun run ./build.js

# 2. ドキュメントのビルド（任意で有効化）
echo "📖 Generating documentation..."
"../docs/typedoc/build/build.sh"
