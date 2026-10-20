# Teste da Bancada SIG com cliques reais no mapa. Uso: python3 testes/bancada_sig.py [--arquivo]
import re,os,sys,json,math
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comum import endereco,ignorar,esperar
from playwright.sync_api import sync_playwright
srv,URL=endereco()
fails=[];checks=0
def ok(c,m):
    global checks;checks+=1
    if not c: fails.append(m)
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,scheme in [(1280,'light'),(390,'dark')]:
        pg=b.new_page(viewport={'width':w,'height':1000},color_scheme=scheme)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and not ignorar(m.text) and errs.append(m.text))
        pg.route(re.compile(r'fonts\.'),lambda r:r.abort())
        pg.goto(URL);esperar(pg)
        pg.evaluate("st.mod='tp';st.tab='teoria';render()");esperar(pg);pg.wait_for_selector('.tab[data-k="sig"]')
        ok(pg.query_selector('.tab[data-k="sig"]') is not None,f'{w}: aba Bancada SIG')
        pg.click('.tab[data-k="sig"]');pg.wait_for_selector('#sigMap')
        ok(pg.query_selector('#sigMap') is not None,f'{w}: canvas')
        ok(len(pg.query_selector_all('#sigSub tbody tr'))==48+5,f'{w}: tabela 48 pontos + 5 vértices')
        ok(pg.evaluate("SIG.tris.length")>60,f'{w}: TIN gerado')
        ok(pg.evaluate("SIG.cur.segs.length")>50,f'{w}: curvas geradas')
        pg.locator('#sigMap').scroll_into_view_if_needed()
        box=pg.locator('#sigMap').bounding_box()
        def scr(E,N):
            pg.locator('#sigMap').scroll_into_view_if_needed();bx=pg.locator('#sigMap').bounding_box()
            x,y=pg.evaluate(f"SIG.tela({E},{N})");return bx['x']+x,bx['y']+y
        def click_world(E,N):
            x,y=scr(E,N);pg.mouse.click(x,y)
        for k in ['grade','tin','curvas','pontos','rotulos','lote','cortes']:
            pg.click(f'#sigL_{k}');pg.click(f'#sigL_{k}')
        # medir
        pg.click('[data-f="med"]')
        P=pg.evaluate("SIG.p.pts")
        a,c=P[9],P[30]
        click_world(a['E'],a['N']);click_world(c['E'],c['N'])
        info=pg.inner_text('#sigInfo');d=math.hypot(c['E']-a['E'],c['N']-a['N'])
        m=re.search(r'Distância ([\d.,]+) m',info);ok(m is not None,f'{w}: medida exibida: {info}')
        if m: ok(abs(float(m.group(1).replace('.','').replace(',','.'))-d)<0.6/pg.evaluate('SIG.view.s')+0.02,f'{w}: distância correta {m.group(1)} vs {d:.2f}')
        ok('Azimute' in info and 'Desnível' in info,f'{w}: azimute e desnível')
        # zoom e pan
        s0=pg.evaluate('SIG.view.s');cx,cy=scr(313280,7402200)
        pg.mouse.move(cx,cy);pg.mouse.wheel(0,-300);ok(pg.evaluate('SIG.view.s')>s0,f'{w}: zoom com roda')
        pg.click('#sigZout');pg.click('#sigFit')
        pg.click('[data-f="nav"]');c0=pg.evaluate('SIG.view.cx');cx,cy=scr(313280,7402200)
        pg.mouse.move(cx,cy);pg.mouse.down();pg.mouse.move(cx+80,cy+30,steps=5);pg.mouse.up()
        ok(abs(pg.evaluate('SIG.view.cx')-c0)>1,f'{w}: arrastar move o mapa')
        pg.click('#sigFit');box=pg.locator('#sigMap').bounding_box()
        # selecionar ponto
        click_world(P[10]['E'],P[10]['N']);ok(P[10]['nome'] in pg.inner_text('#sigInfo'),f'{w}: selecionar ponto')
        # desenhar lote de 4 vértices
        E0,N0=313250,7402180
        pg.click('[data-f="lote"]')
        for x,y in [(10,10),(45,8),(48,32),(12,35)]: click_world(E0+x,N0+y)
        ok('Área' in pg.inner_text('#sigInfo'),f'{w}: área parcial')
        click_world(E0+10,N0+10)
        L=pg.evaluate('SIG.p.lote');ok(len(L)==4,f'{w}: lote com 4 vértices ({len(L)})')
        ok(pg.evaluate('GEO.areaAss(SIG.p.lote)')<0,f'{w}: lote em sentido horário')
        exp=abs(0.5*((10*8-45*10)+(45*32-48*8)+(48*35-12*32)+(12*10-10*35)))
        ok(abs(abs(pg.evaluate('GEO.areaAss(SIG.p.lote)'))-exp)<exp*0.02,f'{w}: área do lote desenhado')
        # memorial
        pg.click('[data-s="memorial"]');pg.fill('#sigCf_0','Rua Teste')
        memo=pg.inner_text('#sigMemo');ok('V4' in memo and 'ponto inicial' in memo and 'Rua Teste' in memo and 'SIRGAS 2000' in memo,f'{w}: memorial')
        # volume
        pg.click('[data-s="volume"]');t=pg.inner_text('#sigVolRes')
        ok('NaN' not in t and 'm³' in t,f'{w}: volume calculado')
        zeq=pg.evaluate('SIG.g.zEq');r=pg.evaluate(f'GEO.cortaterro(SIG.g,{zeq})');ok(abs(r['corte']-r['aterro'])<0.01*max(1,r['corte']),f'{w}: equilíbrio compensa')
        pg.fill('#sigZp','700');ok(pg.evaluate('GEO.cortaterro(SIG.g,700).aterro')==0 and 'Sobra' in pg.inner_text('#sigVolRes'),f'{w}: platô baixo só corte')
        pg.click('#sigEq');pg.check('#sigShowCut');ok(pg.evaluate('SIG.camadas.cortes'),f'{w}: mapa de corte ligado')
        # perfil
        pg.click('[data-f="prf"]');click_world(E0+2,N0+20);click_world(E0+58,N0+22)
        ok(pg.query_selector('#sigSub svg') is not None and 'Comprimento' in pg.inner_text('#sigSub'),f'{w}: perfil desenhado')
        ok('NaN' not in pg.inner_text('#sigSub'),f'{w}: perfil sem NaN')
        # novo ponto
        n0=len(pg.evaluate('SIG.p.pts'));pg.click('[data-f="pto"]');click_world(E0+20,N0+20)
        ok(len(pg.evaluate('SIG.p.pts'))==n0+1,f'{w}: novo ponto interpolado')
        pg.fill('#sigCota','750');click_world(E0+30,N0+28)
        ok(pg.evaluate('SIG.p.pts[SIG.p.pts.length-1].z')==750,f'{w}: novo ponto com cota digitada')
        # exportar / roundtrip
        pg.click('[data-s="io"]');gj=json.loads(pg.input_value('#sigOut'))
        np_=len(pg.evaluate('SIG.p.pts'));ok(len(gj['features'])==np_+1,f'{w}: geojson features')
        orig=pg.evaluate('SIG.p.pts.map(p=>[p.E,p.N,p.z])')
        pg.click('[data-x="kml"]');kml=pg.input_value('#sigOut');ok(pg.evaluate("t=>new DOMParser().parseFromString(t,'application/xml').getElementsByTagName('parsererror').length===0",kml),f'{w}: KML válido')
        pg.fill('#sigPaste',kml);pg.click('#sigImp');ok('Importado' in pg.inner_text('#sigImpMsg'),f'{w}: importa KML')
        back=pg.evaluate('SIG.p.pts.map(p=>[p.E,p.N,p.z])');err=max(max(abs(a[0]-b_[0]),abs(a[1]-b_[1])) for a,b_ in zip(orig,back)) if len(back)==len(orig) else 99
        ok(err<0.002,f'{w}: ida e volta KML sem erro ({err:.4f} m)');ok(len(pg.evaluate('SIG.p.lote'))==4,f'{w}: lote volta do KML')
        pg.fill('#sigPaste',json.dumps(gj));pg.click('#sigImp');back=pg.evaluate('SIG.p.pts.map(p=>[p.E,p.N])')
        err=max(max(abs(a[0]-b_[0]),abs(a[1]-b_[1])) for a,b_ in zip(orig,back));ok(err<0.002,f'{w}: ida e volta GeoJSON ({err:.4f} m)')
        pg.click('[data-x="csv"]');ok(pg.input_value('#sigOut').startswith('ponto;E;N;cota'),f'{w}: CSV')
        pg.set_input_files('#sigFile',os.path.join(os.path.dirname(os.path.abspath(__file__)),'levantamento-exemplo.csv'));pg.wait_for_function("document.getElementById('sigImpMsg').textContent.includes('Importado')")
        ok('5 ponto' in pg.inner_text('#sigImpMsg') and 'zona 23S' in pg.inner_text('#sigImpMsg'),f'{w}: CSV lat/lon: '+pg.inner_text('#sigImpMsg'))
        ok(abs(pg.evaluate('SIG.p.pts[0].E')-303957)<300,f'{w}: CSV convertido para UTM')
        pg.fill('#sigPaste','bobagem sem formato');pg.click('#sigImp');ok('Não' in pg.inner_text('#sigImpMsg'),f'{w}: erro amigável')
        # conversor
        pg.click('[data-s="conv"]');ok('Zona 23S' in pg.inner_text('#cvOut1'),f'{w}: conversor')
        pg.fill('#cvLat','-23.44');pg.fill('#cvLon','-46.92');ok('303.853,740' in pg.inner_text('#cvOut1'),f'{w}: conversor bate com referência: '+pg.inner_text('#cvOut1'))
        # persistência
        pg.reload();esperar(pg);pg.evaluate("st.mod='tp';st.tab='sig';render()");esperar(pg);pg.wait_for_selector('#sigMap');ok(len(pg.evaluate('SIG.p.pts'))==5,f'{w}: projeto salvo após recarregar')
        pg.click('#sigEx');ok(len(pg.evaluate('SIG.p.pts'))==48,f'{w}: restaurar exemplo')
        pg.click('#sigClr');ok(len(pg.evaluate('SIG.p.pts'))==48,f'{w}: limpar pede confirmação');pg.click('#sigClr');ok(len(pg.evaluate('SIG.p.pts'))==0,f'{w}: limpar')
        pg.click('[data-s="volume"]');pg.click('[data-s="perfil"]');pg.click('[data-s="memorial"]');pg.click('[data-s="tabela"]')
        pg.click('#sigEx');pg.click('#sigFit')
        ok(pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),f'{w}: sem rolagem horizontal')
        pg.check('#sigL_tin');pg.click('[data-s="volume"]');pg.check('#sigShowCut')
        pg.click('[data-f="prf"]');box=pg.locator('#sigMap').bounding_box();click_world(E0+2,N0+20);click_world(E0+58,N0+22)
        ok(not errs,f'{w} erros JS: {errs[:3]}')
        pg.close()
    b.close()
print(f'{checks-len(fails)}/{checks} verificações da Bancada SIG passaram')
for f in fails: print('FAIL',f)
sys.exit(1 if fails else 0)
