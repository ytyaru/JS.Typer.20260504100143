#!/usr/bin/env bash
set -Ceu
# スクリプトの場所を基準にディレクトリ移動
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE:-0}")" && pwd)"
cd "$THIS_DIR"

#bun test --coverage ./a.test.js
bun test --coverage ./A.js ./B.js

echo "Exit Code: $?"
