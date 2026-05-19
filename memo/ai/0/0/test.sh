#!/usr/bin/env bash
set -Ceu
THIS_DIR="$(cd "$(dirname "${BASH_SOURCE:-0}")" && pwd)"
cd "$THIS_DIR"
bun test ./a.test.js

