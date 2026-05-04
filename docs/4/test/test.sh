#!/usr/bin/env bash
set -Ceu
THIS="$(realpath "${BASH_SOURCE:-0}")"; HERE="$(dirname "$THIS")"; PARENT="$(dirname "$HERE")"; THIS_NAME="$(basename "$THIS")"; APP_ROOT="$PARENT";
cd "$HERE";
bun test ./typer.ja.js ./typer.en.js
