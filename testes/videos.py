# Testa a aba Vídeo-aula (várias aulas, professor parceiro, complementares, em breve, ir para o quiz)
# e a página professor.html. Uso: python3 testes/videos.py [--arquivo]
import re,os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comum import endereco,ignorar,esperar
from playwright.sync_api import sync_playwright
srv,URL=endereco();arquivo='--arquivo' in sys.argv
fails=[];checks=0
def ok(c,m):
    global checks;checks+=1
    if not c: fails.append(m)
EXTRA="VIDEOS.rm=[{id:'AAAAAAAAAAA',titulo:'Aula 1 · Reações'},{id:'BBBBBBBBBBB',titulo:'Aula 2 · Momento',prof:'Eng. Teste <b>x</b>'}];COMPLEMENTARES.rm=[{id:'CCCCCCCCCCC',titulo:'Extra',canal:'Canal <i>Y</i>'},{id:'DDDDDDDDDDD',titulo:'Sem canal'}];delete VIDEOS.pi;"
with sync_playwright() as p:
    b=p.chromium.launch()
    for w in (1280,390):
        pg=b.new_page(viewport={'width':w,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and not ignorar(m.text) and errs.append(m.text))
        pg.route(re.compile(r'fonts\.(googleapis|gstatic)|youtube'),lambda r:r.abort())
        pg.add_init_script("window.__extra=1")
        pg.goto(URL);esperar(pg)
        pg.evaluate(EXTRA+"st.mod='inicio';render()")
        tela=pg.inner_text('#main')
        ok(re.search(r'\d+ com vídeo-aula',tela,re.I),f'{w}: contador de vídeo-aulas no início')
        ok(pg.locator('.card-mod[data-m="rm"] .tag-video').count()==1,f'{w}: selo de vídeo no card RM')
        ok(pg.locator('.card-mod[data-m="pi"] .tag-video').count()==0,f'{w}: card sem vídeo sem selo')
        pg.click('.card-mod[data-m="rm"]');esperar(pg);pg.click('.tab[data-k="video"]')
        ok(pg.locator('#painel [data-aula]').count()==2,f'{w}: dois botões de aula')
        ok('embed/AAAAAAAAAAA' in pg.get_attribute('#painel iframe','src'),f'{w}: aula 1 por padrão')
        pg.click('#painel [data-aula="1"]')
        ok('embed/BBBBBBBBBBB' in pg.get_attribute('#painel iframe','src'),f'{w}: troca para aula 2')
        ok(pg.locator('#painel .video-nota b').first.inner_text()=='Eng. Teste <b>x</b>',f'{w}: nome do professor escapado')
        ok(pg.locator('#painel .video-comp li').count()==1,f'{w}: complementar sem canal é ignorado')
        ok('Canal <i>Y</i>' in pg.inner_text('#painel .video-comp'),f'{w}: canal escapado')
        ok('sub_confirmation=1' in pg.get_attribute('#painel .yt-inscrever','href'),f'{w}: botão inscrever')
        ok(pg.locator('#painel a[href="professor.html"]').count()==1,f'{w}: link professor parceiro')
        pg.click('#irQuiz');ok(pg.get_attribute('.tab[data-k="quiz"]','aria-selected')=='true',f'{w}: botão leva ao quiz')
        pg.evaluate("st.mod='pi';st.tab='video';render()");esperar(pg);pg.evaluate("st.tab='video';render()")
        t=pg.inner_text('#painel');ok('em breve' in t.lower(),f'{w}: aviso em breve')
        href=pg.get_attribute('#painel a[href*="wa.me"]','href') or ''
        ok('5524992096103' in href and 'Pilares' in __import__('urllib.parse').parse.unquote(href),f'{w}: quero ser avisado com nome da disciplina')
        ok(not errs,f'{w}: erros no console {errs[:3]}')
        if not arquivo:
            pg.goto(URL+'professor.html')
            ok('Seja professor parceiro' in pg.inner_text('h1'),f'{w}: página professor')
            ok(pg.locator('a.zap[href*="wa.me/5524992096103"]').count()==1,f'{w}: botão WhatsApp professor')
            ok(not re.search(r'CREA/SP\s*\d',pg.inner_text('body')),f'{w}: sem número do CREA')
            ok(pg.locator('meta[property="og:image"]').count()==1,f'{w}: prévia de compartilhamento')
        pg.close()
    b.close()
if fails:print('\n'.join(fails));print(f'{len(fails)} de {checks} falharam');sys.exit(1)
print(f'videos{" (arquivo)" if arquivo else ""}: {checks} verificações ok')
