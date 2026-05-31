#!/usr/bin/env bash
# Baixa fotos reais (Flickr via LoremFlickr) pros 34 produtos do cardápio.
# Roda uma vez. Fotos ficam versionadas em public/produtos/.
# Reroda apenas se quiser trocar fotos.

set -euo pipefail

OUT_DIR="$(dirname "$0")/../public/produtos"
mkdir -p "$OUT_DIR"

declare -A PRODUTOS=(
  [p01]="cuscuz,couscous,corn"
  [p02]="tapioca,brazilian"
  [p03]="cuscuz,egg,breakfast"
  [p04]="pao,queijo,bread,cheese"
  [p05]="porridge,corn,sweet"
  [p06]="tapioca,beef,cheese"
  [p07]="tapioca,cheese"
  [p08]="tapioca,chicken,cream"
  [p09]="tapioca,shrimp,seafood"
  [p10]="tapioca,tomato,vegetarian"
  [p11]="crepe,banana,cinnamon"
  [p12]="guava,cheese,goiabada"
  [p13]="crepe,chocolate,banana"
  [p14]="cuscuz,beef,rustic"
  [p15]="couscous,salad,brazilian"
  [p16]="couscous,cod,fish"
  [p17]="couscous,chicken,homemade"
  [p18]="tapioca,coconut,dessert"
  [p19]="cake,roll,guava"
  [p20]="cassava,cake,brazilian"
  [p21]="cake,traditional,coconut"
  [p22]="corn,cake,golden"
  [p23]="peanut,brittle,cake"
  [p24]="coffee,cup,black"
  [p25]="juice,tropical,yellow"
  [p26]="juice,red,acerola"
  [p27]="juice,tropical,glass"
  [p28]="coconut,water,green"
  [p29]="tea,lemon,iced"
  [p30]="breakfast,brazilian,combo"
  [p31]="porridge,white,sweet"
  [p32]="tamale,corn,husk"
  [p33]="peanut,brittle,candy"
  [p34]="brazilian,feast,table"
)

BASE_URL="https://loremflickr.com/600/600"

for ID in $(printf '%s\n' "${!PRODUTOS[@]}" | sort); do
  KEYWORDS="${PRODUTOS[$ID]}"
  OUT="$OUT_DIR/$ID.jpg"
  URL="$BASE_URL/$KEYWORDS"
  echo "  -> $ID  [$KEYWORDS]"
  curl -sL --retry 2 --max-time 20 -o "$OUT" "$URL"
  SIZE=$(stat -c%s "$OUT" 2>/dev/null || stat -f%z "$OUT")
  if [ "$SIZE" -lt 2000 ]; then
    echo "     AVISO: arquivo pequeno ($SIZE bytes). Pode estar quebrado."
  fi
done

echo "Pronto. $(ls "$OUT_DIR" | wc -l) arquivos em public/produtos/"
