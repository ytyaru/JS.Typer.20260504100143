#!/usr/bin/env bash
# verify_truth.sh

# 1. 検証用ファイルの作成
echo "import { test, expect } from 'bun:test'; test('ok', () => expect(1).toBe(1));" > pass_no_suffix.js
echo "import { test, expect } from 'bun:test'; test('ok', () => expect(1).toBe(1));" > pass_with_suffix.test.js
echo "import { test, expect } from 'bun:test'; test('ng', () => expect(1).toBe(2));" > fail_no_suffix.js
echo "const a = 1;" > empty_no_test_block.js

run_check() {
    local label=$1
    local cmd=$2
    echo "--------------------------------------------------"
    echo "🔍 検証: $label"
    echo "💻 実行: $cmd"
    # 出力を隠さず、そのまま出す
    $cmd
    local code=$?
    echo "🚩 終了コード (Exit Code): $code"
    echo "--------------------------------------------------"
    echo ""
}

echo "=== Bun Test 終了コード挙動 最終調査 ==="
echo "環境: $(bun --version)"

# ケース1: .test なし + 成功するテスト
run_check "サフィックスなし・成功" "bun test ./pass_no_suffix.js"

# ケース2: .test あり + 成功するテスト
run_check "サフィックスあり・成功" "bun test ./pass_with_suffix.test.js"

# ケース3: .test なし + 失敗するテスト
run_check "サフィックスなし・失敗" "bun test ./fail_no_suffix.js"

# ケース4: .test なし + test()ブロックなし (0 pass)
run_check "テストブロックなし" "bun test ./empty_no_test_block.js"

# ケース5: 存在しないファイル
run_check "ファイル不在" "bun test ./non_existent_file.js"

# 後片付け
rm pass_no_suffix.js pass_with_suffix.test.js fail_no_suffix.js empty_no_test_block.js

