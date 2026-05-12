#!/usr/bin/env bash
set -Ceu
# スクリプトの場所を基準にディレクトリ移動
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE:-0}")" && pwd)"
cd "$THIS_DIR"

# すべての引数を test.js に引き渡す
bun run ./test.js "$@"

