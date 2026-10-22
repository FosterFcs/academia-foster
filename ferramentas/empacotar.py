#!/usr/bin/env python3
"""Gera dist/academia-foster.html: o app inteiro num arquivo só (sem service worker).
Uso: python3 ferramentas/empacotar.py
Serve para enviar o app como arquivo único ou publicar como página do Claude."""
import os,re,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ler=lambda p:open(os.path.join(R,p),encoding='utf-8').read()
idx=ler('index.html')
corpo=idx.split('<!-- CORPO -->')[1].split('<!-- /CORPO -->')[0].strip()
fontes=re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]+>',idx).group(0)
cat=ler('js/catalogo.js');ids=re.findall(r"\{id:'(\w+)'",cat.split('const CATALOGO=')[1])
partes=['window.EMBUTIDO=true;',ler('js/calc.js'),cat,ler('js/core.js'),ler('js/conta.js'),ler('js/certificado.js'),ler('js/sig.js')]+[ler(f'js/modulos/{i}.js') for i in ids]+['iniciar();']
js='\n'.join(partes)
if '</script' in js.lower():sys.exit('Erro: o código contém "</script>", que quebraria o arquivo único.')
saida=f"""<title>Academia Foster de Engenharia</title>
<meta name="claude:viewport-fit-sides" content="cover">
{fontes}
<style>
{ler('css/app.css')}
</style>
{corpo}
<script>
{js}
</script>
"""
os.makedirs(os.path.join(R,'dist'),exist_ok=True)
open(os.path.join(R,'dist','academia-foster.html'),'w',encoding='utf-8').write(saida)
print(f'dist/academia-foster.html gerado: {len(saida.encode())//1024} KB, {len(ids)} disciplinas')
