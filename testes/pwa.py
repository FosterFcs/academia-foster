# Testes dos recursos de PWA: carregamento sob demanda, offline, atualização, manifesto, ícones,
# downloads e georreferenciamento do mapa de fundo. Uso: python3 testes/pwa.py
import os,sys,io,json,math,shutil,tempfile,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comum import RAIZ,servir,esperar,ignorar
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
fails=[];checks=0
def ok(c,m):
    global checks;checks+=1
    if not c: fails.append(m)
tmp=tempfile.mkdtemp();site=os.path.join(tmp,'site')
shutil.copytree(RAIZ,site,ignore=shutil.ignore_patterns('testes','dist','ferramentas','.git'))
srv,URL=servir(site)
V=re.search(r"VERSAO='([^']+)'",open(os.path.join(site,'sw.js'),encoding='utf-8').read()).group(1);V2=V+'-teste'
CACHE="(async()=>{const k=(await caches.keys()).filter(x=>x.startsWith('af-')&&x!=='af-mapas'&&x!=='af-fontes');return k})()"
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- manifesto e ícones
    ctx=b.new_context();pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and not ignorar(m.text) and errs.append(m.text))
    pg.goto(URL);esperar(pg)
    man=pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json())")
    ok(man['display']=='standalone' and man['start_url']=='./' and man['lang']=='pt-BR','manifesto básico')
    for ic in man['icons']:
        r=pg.request.get(URL+ic['src']);ok(r.status==200,'ícone '+ic['src'])
        if r.status==200:
            im=Image.open(io.BytesIO(r.body()));w,h=[int(x) for x in ic['sizes'].split('x')];ok(im.size==(w,h),f"tamanho {ic['src']} {im.size}")
    ok(any(i.get('purpose')=='maskable' for i in man['icons']),'ícone maskable')
    ok(pg.get_attribute('link[rel=manifest]','href')=='manifest.webmanifest','link do manifesto')
    # ---------- service worker e cache
    pg.wait_for_function("navigator.serviceWorker&&navigator.serviceWorker.controller",timeout=15000)
    ks=pg.evaluate(CACHE);ok(ks==[V],'cache da versão: '+str(ks))
    n=pg.evaluate("caches.open('"+V+"').then(c=>c.keys()).then(k=>k.map(r=>new URL(r.url).pathname))")
    ok(sum('/js/modulos/' in x for x in n)==16,'16 disciplinas salvas no aparelho')
    ok(any(x.endswith('/js/sig.js') for x in n) and any(x.endswith('/index.html') for x in n),'núcleo salvo')
    ok(pg.is_hidden('#aviso'),'sem aviso na primeira visita')
    ok(pg.url==URL,'não recarregou sozinho na primeira visita')
    # ---------- carregamento sob demanda
    ok(pg.evaluate("modById('et').carregado")==False and pg.query_selector('script[src*="modulos/et.js"]') is None,'disciplina não carregada antes de abrir')
    pg.evaluate("st.mod='et';st.tab='teoria';render()");esperar(pg)
    ok(pg.evaluate("modById('et').carregado") and pg.query_selector('script[src*="modulos/et.js"]') is not None,'disciplina carregada ao abrir')
    ok(pg.evaluate("typeof SIG")=='undefined','Bancada SIG só carrega com a Topografia')
    # ---------- offline
    ctx.set_offline(True);pg.reload();esperar(pg)
    ok('O que você quer aprender' in pg.inner_text('#main'),'abre sem internet')
    pg.evaluate("st.mod='pi';st.tab='sim';render()");esperar(pg);pg.wait_for_selector('#tiles .res')
    ok('8 φ 16' in pg.inner_text('#tiles'),'disciplina nunca aberta funciona offline')
    pg.evaluate("st.mod='tp';st.tab='sig';render()");esperar(pg);pg.wait_for_selector('#sigMap')
    ok(pg.evaluate("SIG.tris.length")>60,'Bancada SIG offline')
    pg.evaluate("SIG.camadas.osm=true;SIG.draw()");pg.wait_for_timeout(300);ok(pg.evaluate("SIG.tiles.size")>0,'mapa de fundo tenta baixar sem quebrar')
    ctx.set_offline(False)
    # ---------- atualização de versão
    sw=open(os.path.join(site,'sw.js'),encoding='utf-8').read();open(os.path.join(site,'sw.js'),'w',encoding='utf-8').write(sw.replace("VERSAO='"+V+"'","VERSAO='"+V2+"'"))
    pg.evaluate("st.mod='rm';st.tab='teoria';render()");esperar(pg)
    pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>r.update())")
    pg.wait_for_function("!document.getElementById('aviso').hidden&&document.getElementById('aviso').textContent.includes('Nova versão')",timeout=15000);pg.evaluate("window.dispatchEvent(new Event('online'))");ok('Nova versão' in pg.inner_text('#aviso'),'aviso de nova versão')
    ok(pg.evaluate("st.mod")=='rm','não recarregou antes do clique')
    with pg.expect_navigation(timeout=15000):pg.click('#btAtualizar')
    esperar(pg);ks=pg.evaluate(CACHE);ok(ks==[V2],'versão antiga removida: '+str(ks))
    ok(pg.is_hidden('#aviso'),'aviso some depois de atualizar')
    # ---------- downloads
    pg.evaluate("st.mod='tp';st.tab='sig';render()");esperar(pg);pg.wait_for_selector('#sigMap')
    pg.click('[data-s="io"]')
    with pg.expect_download() as d:pg.click('#sigDlO')
    dl=d.value;ok(dl.suggested_filename=='levantamento.geojson','nome do GeoJSON');gj=json.load(open(dl.path(),encoding='utf-8'));ok(len(gj['features'])>=49,'conteúdo do GeoJSON')
    pg.click('[data-x="kml"]')
    with pg.expect_download() as d:pg.click('#sigDlO')
    ok(d.value.suggested_filename=='levantamento.kml' and '<kml' in open(d.value.path(),encoding='utf-8').read(),'download KML')
    pg.click('[data-s="memorial"]')
    with pg.expect_download() as d:pg.click('#sigDlM')
    ok(d.value.suggested_filename=='memorial-descritivo.txt' and 'ponto inicial' in open(d.value.path(),encoding='utf-8').read(),'download do memorial')
    ok(not errs,'erros JS: '+str(errs[:3]))
    ctx.close()
    # ---------- georreferenciamento do mapa de fundo (blocos falsos com um alvo vermelho)
    LAT,LON=-23.44530,-46.91650
    def bloco(rota):
        z,x,y=[int(v) for v in re.search(r'/(\d+)/(\d+)/(\d+)\.png',rota.request.url).groups()];n=2**z
        fx=(LON+180)/360*n;r=math.radians(LAT);fy=(1-math.log(math.tan(r)+1/math.cos(r))/math.pi)/2*n
        im=Image.new('RGBA',(256,256),(0,0,0,0))
        if int(fx)==x and int(fy)==y:
            px,py=(fx-x)*256,(fy-y)*256;ImageDraw.Draw(im).ellipse([px-4,py-4,px+4,py+4],fill=(255,0,0,255))
        bf=io.BytesIO();im.save(bf,'PNG');rota.fulfill(status=200,body=bf.getvalue(),headers={'Content-Type':'image/png','Access-Control-Allow-Origin':'*'})
    for zoom in [1,4]:
        ctx=b.new_context(service_workers='block',viewport={'width':1280,'height':900});pg=ctx.new_page()
        pg.route(re.compile(r'tile\.openstreetmap\.org'),bloco);pg.goto(URL);esperar(pg)
        pg.evaluate("st.mod='tp';st.tab='sig';render()");esperar(pg);pg.wait_for_selector('#sigMap')
        pg.evaluate("Object.keys(SIG.camadas).forEach(k=>SIG.camadas[k]=k==='osm');SIG.view.s*=%d;SIG.draw()"%zoom)
        u=pg.evaluate(f"GEO.direta({LAT},{LON},23)");sx,sy=pg.evaluate(f"SIG.view.cx={u['E']};SIG.view.cy={u['N']};SIG.draw();SIG.tela({u['E']},{u['N']})")
        pg.wait_for_timeout(1500)
        cor=pg.evaluate(f"""(()=>{{const c=document.getElementById('sigMap'),d=devicePixelRatio,x=c.getContext('2d').getImageData(Math.round({sx}*d)-2,Math.round({sy}*d)-2,5,5).data;let r=0;for(let i=0;i<x.length;i+=4)if(x[i]>180&&x[i+1]<120)r++;return r}})()""")
        ok(cor>=12,f'alvo do mapa no lugar certo (zoom ×{zoom}): {cor}/25 pixels vermelhos')
        lon2=LON+0.0003;u2=pg.evaluate(f"GEO.direta({LAT},{lon2},23)");s2=pg.evaluate(f"SIG.tela({u2['E']},{u2['N']})")
        cor2=pg.evaluate(f"""(()=>{{const c=document.getElementById('sigMap'),d=devicePixelRatio,x=c.getContext('2d').getImageData(Math.round({s2[0]}*d)-2,Math.round({s2[1]}*d)-2,5,5).data;let r=0;for(let i=0;i<x.length;i+=4)if(x[i]>180&&x[i+1]<120)r++;return r}})()""")
        ok(cor2==0 or math.hypot(s2[0]-sx,s2[1]-sy)<6,f'fora do alvo não há vermelho (zoom ×{zoom})')
        ctx.close()
    b.close()
print(f'{checks-len(fails)}/{checks} verificações de PWA passaram')
for f in fails:print('FAIL',f)
shutil.rmtree(tmp,ignore_errors=True)
sys.exit(1 if fails else 0)
