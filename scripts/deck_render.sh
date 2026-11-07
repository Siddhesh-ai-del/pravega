#!/usr/bin/env bash
# deck_render.sh — Stage-2 render loop for make-ppts decks.
# Renders the deck to PDF + per-slide PNGs for visual inspection, and can
# diff against a previous verified render set (cheap proof nothing moved).
#
# usage: deck_render.sh <deck.pptx> [outdir] [prevdir]
#   outdir   default: preview
#   prevdir  optional: previous verified renders to cmp against
set -euo pipefail

DECK=${1:?usage: deck_render.sh <deck.pptx> [outdir] [prevdir]}
OUT=${2:-preview}
PREV=${3:-}

for cmd in soffice pdftoppm; do
  command -v "$cmd" >/dev/null || { echo "FAIL: $cmd not installed" >&2; exit 1; }
done

base=$(basename "$DECK" .pptx)
mkdir -p "$OUT"
rm -f "$OUT/$base.pdf" "$OUT"/slide-*.png

# Isolated profile dir so rendering works even while the user has LO open.
soffice --headless -env:UserInstallation=file:///tmp/lo_deck_render \
  --convert-to pdf --outdir "$OUT" "$DECK" >/dev/null
pdftoppm -png -r 110 "$OUT/$base.pdf" "$OUT/slide"

if [[ -n "$PREV" && -d "$PREV" ]]; then
  changed=0
  for f in "$OUT"/slide-*.png; do
    name=$(basename "$f")
    if [[ -f "$PREV/$name" ]]; then
      cmp -s "$f" "$PREV/$name" || { echo "CHANGED: $name"; changed=1; }
    else
      echo "NEW: $name"; changed=1
    fi
  done
  [[ $changed -eq 0 ]] && echo "IDENTICAL: no slide render changed vs $PREV"
fi

count=$(ls "$OUT"/slide-*.png | wc -l)
echo "OK: rendered $count slides to $OUT/ — now INSPECT EVERY SLIDE"
