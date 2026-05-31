#!/usr/bin/env bash
# Re-baixa as 16 fotos que vieram com o placeholder do LoremFlickr
# (queries multi-keyword muito específicas resultaram em "no match").
# Usa termos mais amplos.

set -euo pipefail

OUT_DIR="$(dirname "$0")/../public/produtos"
PLACEHOLDER_MD5="f54fe22c85ac25a570a863550f32e2d5"

declare -A FALLBACKS=(
  [p01]="couscous"
  [p03]="breakfast"
  [p05]="porridge"
  [p06]="crepe"
  [p08]="wrap"
  [p09]="shrimp"
  [p11]="crepe"
  [p14]="beef"
  [p15]="couscous"
  [p19]="cake"
  [p20]="cake"
  [p22]="cake"
  [p23]="candy"
  [p26]="juice"
  [p30]="brunch"
  [p34]="feast"
)

BASE_URL="https://loremflickr.com/600/600"

for ID in $(printf '%s\n' "${!FALLBACKS[@]}" | sort); do
  KEY="${FALLBACKS[$ID]}"
  OUT="$OUT_DIR/$ID.jpg"
  echo "  -> $ID  [$KEY]"
  # Tenta até 3 vezes pegando uma foto diferente do placeholder
  for tentativa in 1 2 3; do
    curl -sL --retry 2 --max-time 20 -o "$OUT" "$BASE_URL/$KEY"
    MD5=$(md5sum "$OUT" | cut -d' ' -f1)
    if [ "$MD5" != "$PLACEHOLDER_MD5" ]; then
      echo "     OK ($(stat -c%s "$OUT") bytes)"
      break
    fi
    echo "     placeholder ainda, tentativa $tentativa/3"
  done
done

echo "Verificando duplicados restantes..."
md5sum "$OUT_DIR"/*.jpg | grep "$PLACEHOLDER_MD5" || echo "Sem placeholders!"
