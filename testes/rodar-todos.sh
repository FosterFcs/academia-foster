#!/bin/sh
# Roda todos os testes. Precisa de Node e de Python com Playwright:
#   pip install playwright pillow && python3 -m playwright install chromium
cd "$(dirname "$0")/.." || exit 1
set -e
node testes/calculos.test.js
node testes/onda2.test.js
node testes/geografico.test.js
node testes/onda3.test.js
python3 ferramentas/empacotar.py
python3 testes/interface.py
python3 testes/bancada_sig.py
python3 testes/pwa.py
python3 testes/conta.py
python3 testes/interface.py --arquivo
python3 testes/bancada_sig.py --arquivo
echo "Tudo certo."
