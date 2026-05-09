#!/usr/bin/env bash
THIS="$(realpath "${BASH_SOURCE:-0}")"; HERE="$(dirname "$THIS")"; PARENT="$(dirname "$HERE")"; THIS_NAME="$(basename "$THIS")"; APP_ROOT="$PARENT";
MKPJ="$HERE/mkpj.py";
PJTX="$HERE/pj.txt";
cd "$PARENT";
python "$MKPJ" "$PJTX"
