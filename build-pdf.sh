#!/usr/bin/env bash
# Builds the public PDF from the base CV, without the phone number.
# Usage: ./build-pdf.sh [path/to/CV_General]
set -euo pipefail

SRC="${1:-../CV/CV_General}"
SITE="$(cd "$(dirname "$0")" && pwd)"
BUILD="$(mktemp -d)"
trap 'rm -rf "$BUILD"' EXIT

# Drop the phone from the header line and point \graphicspath at the source folder.
sed -e 's/ \\myPhone{} \\textbar{}//' \
    -e "s|\\\\graphicspath{.*}|\\\\graphicspath{{$(cd "$SRC" && pwd)/}}|" \
    "$SRC/Jorge_Barbosa_CV.tex" > "$BUILD/Jorge_Barbosa_CV.tex"

if grep -q '\\myPhone{}' "$BUILD/Jorge_Barbosa_CV.tex"; then
    echo "Phone still present in header; check the sed pattern." >&2
    exit 1
fi

(cd "$BUILD" && latexmk -pdf -interaction=nonstopmode -quiet Jorge_Barbosa_CV.tex)
cp "$BUILD/Jorge_Barbosa_CV.pdf" "$SITE/Jorge_Barbosa_CV.pdf"
echo "Wrote $SITE/Jorge_Barbosa_CV.pdf"
