#!/usr/bin/env bash
run_test() {
    echo "--- Testing $1 ---"
    bun test "$1" > /dev/null 2>&1
    echo "Exit Code: $?"
}

run_test "./verify_pass.js"
run_test "./verify_fail.js"
run_test "./verify_error.js"
run_test "./non_existent.js" # ファイル不在

