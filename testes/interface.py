# Teste de interface de todas as disciplinas. Uso: python3 testes/interface.py [--arquivo]
import re,os,sys
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
        pg=b.new_page(viewport={'width':w,'height':900},color_scheme=scheme)
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and not ignorar(m.text) and errs.append(m.text))
        pg.route(re.compile(r'fonts\.(googleapis|gstatic)'),lambda r:r.abort())
        pg.set_default_timeout(10000);pg.goto(URL);esperar(pg)
        def go(m):
            esperar(pg);loc=pg.locator(f'#trilha [data-m="{m}"]')
            if not loc.is_visible():
                pg.locator(f'#trilha details:has([data-m="{m}"]) summary').click()
            loc.click();esperar(pg)
        ok('O que você quer aprender' in pg.inner_text('#main'),f'{w}: tela inicial')
        ok(len(pg.query_selector_all('#main .card-mod'))==20,f'{w}: 20 cards na tela inicial')
        pg.click('#main .card-mod[data-m="lj"]');ok('LJ-09' in pg.inner_text('.mod-head'),f'{w}: card abre módulo')
        mods=pg.eval_on_selector_all('#trilha [data-m]','e=>e.map(x=>x.dataset.m)')
        ok(len(mods)==22,f'{w}: 22 itens na trilha ({len(mods)})')
        for m in mods:
            if m in('sim','inicio'): continue
            go(m)
            for tab in ['teoria','exemplo','sim','obra','quiz']:
                pg.click(f'.tab[data-k="{tab}"]')
                ok(len(pg.inner_text('#painel'))>200,f'{w} {m}/{tab} vazio')
                if tab=='exemplo':
                    chips=pg.query_selector_all('#painel [data-ex]')
                    ok(len(chips)==3,f'{w} {m}: 3 exemplos ({len(chips)})')
                    vistos=set()
                    for k in range(len(chips)):
                        pg.click(f'#painel [data-ex="{k}"]');tx=pg.inner_text('#painel .lista')
                        ok(len(tx)>200 and 'NaN' not in tx and 'undefined' not in tx,f'{w} {m}: exemplo {k+1} vazio')
                        vistos.add(tx[:80])
                    ok(len(vistos)==len(chips),f'{w} {m}: exemplos repetidos')
                    pg.click('#painel [data-ex="0"]')
                if tab=='obra':
                    ok(len(pg.query_selector_all('#painel .conceito.erro'))>=4,f'{w} {m}: erros comuns')
                    nck=len(pg.query_selector_all('#painel .checklist input'))
                    ok(nck>=6,f'{w} {m}: checklist ({nck})')
                    pg.click('#painel .checklist input >> nth=0')
                    ok(pg.is_checked('#painel .checklist input >> nth=0') and f'1 de {nck}' in pg.inner_text('#painel'),f'{w} {m}: marcar checklist')
                if tab=='sim':
                  ncalc=max(1,len(pg.query_selector_all('#painel .calc-op')))
                  if m in('ca','lj','pi','eg','mc','or','is','ac','gt','pl','tp','ap'): ok(ncalc==2,f'{w} {m}: calculadora extra ({ncalc})')
                  for kc in range(ncalc):
                    if ncalc>1: pg.click(f'#painel [data-calc="{kc}"]');ok(pg.get_attribute(f'#painel [data-calc="{kc}"]','aria-selected')=='true',f'{w} {m}: calc {kc} ativa')
                    ok(pg.query_selector('#draw svg') is not None or m=='ca',f'{w} {m}: sem desenho')
                    mem=pg.inner_text('#memorial');ok(len(mem)>50 and 'NaN' not in mem and 'Infinity' not in mem,f'{w} {m}: memorial inválido')
                    ok('NaN' not in pg.inner_text('#tiles'),f'{w} {m}: NaN nos resultados')
                    # mexer em todos os sliders: mínimo e máximo
                    for rid in pg.eval_on_selector_all('.ctrl input[type=range]','e=>e.map(x=>x.id)'):
                        for v in ['min','max']:
                            pg.eval_on_selector('#'+rid,f'e=>{{e.value=e.{v};e.dispatchEvent(new Event("input",{{bubbles:true}}))}}')
                            t=pg.inner_text('#tiles')+pg.inner_text('#memorial')
                            ok('NaN' not in t and 'Infinity' not in t,f'{w} {m}: NaN com {rid}={v}')
                    for sid in pg.eval_on_selector_all('.ctrl select','e=>e.map(x=>x.id)'):
                        n=pg.eval_on_selector('#'+sid,'e=>e.options.length')
                        for i in range(n):
                            pg.eval_on_selector('#'+sid,f'e=>{{e.selectedIndex={i};e.dispatchEvent(new Event("input",{{bubbles:true}}))}}')
                            ok('NaN' not in pg.inner_text('#memorial'),f'{w} {m}: NaN com {sid}[{i}]')
                    for chip in pg.query_selector_all('.chip'): chip.click()
                    ok('NaN' not in pg.inner_text('#memorial'),f'{w} {m}: NaN após atalhos')
                  if ncalc>1: pg.click('#painel [data-calc="0"]')
                if tab=='quiz':
                    nq=len(pg.query_selector_all('#ql .q'));ok(nq==15,f'{w} {m}: 15 questões ({nq})')
                    for i in range(nq):
                        pg.click(f'#ql .q:nth-child({i+1}) .op >> nth=0')
                    ok(pg.query_selector_all('#ql .expl:not([hidden])').__len__()==nq,f'{w} {m}: explicações')
                    ok('Resultado' in pg.inner_text('#placar'),f'{w} {m}: placar final')
            ok(pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),f'{w} {m}: rolagem horizontal')
        # simulado
        go('sim');ok(len(pg.query_selector_all('#sl .q'))==10,f'{w}: 10 questões no simulado')
        for i in range(10): pg.click(f'#sl .q:nth-child({i+1}) .op >> nth=1')
        ok('Nota final' in pg.inner_text('#splac'),f'{w}: nota final simulado')
        # persistência
        pg.reload();esperar(pg);go('rm')
        ok('✓' in pg.inner_text('#trilha'),f'{w}: progresso salvo após recarregar')
        pg.click('.tab[data-k="obra"]');ok(pg.is_checked('#painel .checklist input >> nth=0'),f'{w}: checklist salvo após recarregar')
        pg.click('#ckLimpar');ok(not pg.is_checked('#painel .checklist input >> nth=0'),f'{w}: limpar checklist')
        # topografia: editar e adicionar vértice
        go('tp');pg.click('.tab[data-k="sim"]');pg.click('#tpEx')
        ok('660,00 m²' in pg.inner_text('#tiles'),f'{w}: área trapézio na interface')
        pg.click('#tpAdd');ok(len(pg.query_selector_all('#tpBody tr'))==5,f'{w}: adicionar vértice')
        pg.fill('#tpE1','');ok('NaN' not in pg.inner_text('#memorial'),f'{w}: entrada inválida')
        # orçamento
        go('or');pg.click('.tab[data-k="sim"]');ok('11.767,50' in pg.inner_text('#tiles'),f'{w}: total orçamento exemplo')
        pg.fill('#orP0','4');ok('11.767,50' not in pg.inner_text('#tiles'),f'{w}: orçamento recalcula')
        # exemplos batem com simulador (valores iniciais)
        go('ca');pg.click('.tab[data-k="sim"]');ok('4 φ 16' in pg.inner_text('#tiles'),f'{w}: CA exemplo 4φ16')
        go('gt');pg.click('.tab[data-k="sim"]');ok('1,80 × 2,00' in pg.inner_text('#tiles'),f'{w}: sapata exemplo')
        go('hd');pg.click('.tab[data-k="sim"]');ok('1,49 m' in pg.inner_text('#tiles'),f'{w}: hidráulica exemplo')
        go('mc');pg.click('.tab[data-k="sim"]');ok('8 sacos' in pg.inner_text('#tiles'),f'{w}: traço exemplo')
        go('is');pg.click('.tab[data-k="sim"]');ok('-9,75' in pg.inner_text('#tiles'),f'{w}: balanço exemplo')
        go('rm');pg.click('.tab[data-k="sim"]');pg.eval_on_selector('#inP','e=>{e.value=0;e.dispatchEvent(new Event("input",{bubbles:true}))}');ok('37,50' in pg.inner_text('#tiles'),f'{w}: viga exemplo')
        go('lj');pg.click('.tab[data-k="sim"]');ok('6,00 kN/m' in pg.inner_text('#tiles') and '5,00 kN/m' in pg.inner_text('#tiles'),f'{w}: laje exemplo')
        go('ma');pg.click('.tab[data-k="sim"]');ok('3,27' in pg.inner_text('#tiles') and '1,62' in pg.inner_text('#tiles'),f'{w}: muro exemplo')
        go('ap');pg.click('.tab[data-k="sim"]');ok('137,50 L/min' in pg.inner_text('#tiles'),f'{w}: pluvial exemplo')
        go('pl');pg.click('.tab[data-k="sim"]');ok('84 dias' in pg.inner_text('#tiles') and 'A → B → C → D → F → G → I' in pg.inner_text('#tiles'),f'{w}: cpm exemplo')
        pg.fill('#plD4','13');ok('85 dias' in pg.inner_text('#tiles'),f'{w}: cpm recalcula')
        pg.fill('#plP0','I');ok('ciclo' in pg.inner_text('#tiles'),f'{w}: ciclo na interface')
        pg.click('#plReset');pg.click('#plAdd');ok(len(pg.query_selector_all('#plBody tr'))==10 and 'NaN' not in pg.inner_text('#memorial'),f'{w}: adicionar atividade')
        go('et');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok('400 kN' in t and '475 kN' in t and '3 estacas' in t,f'{w}: estaca exemplo '+t)
        pg.fill('#etN9','40');ok(pg.inner_text('#tiles')!=t,f'{w}: estaca recalcula ao editar SPT')
        pg.click('#etAdd');ok(len(pg.query_selector_all('#etBody tr'))==13 and pg.get_attribute('#etL','max')=='13',f'{w}: estaca +1 metro')
        pg.select_option('#etT','helice');ok('NaN' not in pg.inner_text('#memorial'),f'{w}: estaca hélice')
        go('pi');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok('8 φ 16' in t and '12,84' in t,f'{w}: pilar exemplo '+t)
        pg.eval_on_selector('#piN','e=>{e.value=4000;e.dispatchEvent(new Event("input",{bubbles:true}))}');ok('Aumente' in pg.inner_text('#tiles'),f'{w}: pilar sobrecarregado avisa')
        go('eg');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok(t.count('DN 150')==2 and '576' in t,f'{w}: esgoto exemplo '+t)
        go('el');pg.click('.tab[data-k="sim"]')
        ok(pg.inner_text('#elCs4')=='6 mm²' and pg.inner_text('#elCd4')=='25 A',f'{w}: chuveiro com 3 circuitos agrupados: 6 mm²')
        ok(pg.inner_text('#elCs3')=='4 mm²' and pg.inner_text('#elCd3')=='20 A',f'{w}: agrupamento leva a 4 mm²')
        ok(pg.inner_text('#elRq1')=='4' and pg.inner_text('#elRv1')=='1900 VA',f'{w}: cozinha 4 TUG 1900 VA')
        ok(pg.inner_text('#elTv')=='5400 VA' and pg.inner_text('#elTi')=='880 VA',f'{w}: totais previsão')
        pg.eval_on_selector('#elG','e=>{e.value=1;e.dispatchEvent(new Event("input",{bubbles:true}))}');ok(pg.inner_text('#elCs4')=='4 mm²' and pg.inner_text('#elCd4')=='25 A',f'{w}: chuveiro sozinho no eletroduto: 4 mm² 25 A (exemplo)')
        pg.eval_on_selector('#elG','e=>{e.value=3;e.dispatchEvent(new Event("input",{bubbles:true}))}')
        pg.click('#elCA');pg.click('#elRA');ok(len(pg.query_selector_all('#elC tr'))==6,f'{w}: + circuito')
        pg.fill('#elCP5','30000');ok('não atende' in pg.inner_text('#elC'),f'{w}: circuito impossível sinalizado')
        go('ac');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok('não atende' in t.lower() and 'FLT' in t,f'{w}: aço sem travamento falha por FLT '+t)
        pg.eval_on_selector('#acB','e=>{e.value=2;e.dispatchEvent(new Event("input",{bubbles:true}))}');pg.select_option('#acC','1');t=pg.inner_text('#tiles');ok('114,4' in t and 'Perfil atende' in t,f'{w}: aço travado a cada 2 m '+t)
        go('md');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok('7,5 / 12,0' in t and '8,5 / 15,0' in t and 'Peça atende' in t,f'{w}: madeira exemplo '+t)
        pg.select_option('#mdC','Conífera C20');ok('não atende' in pg.inner_text('#tiles').lower(),f'{w}: conífera C20 não passa na flecha')
        go('rs');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok('3.200 L' in t and '8.560 L' in t and '10.000 L' in t and 'DN 20' in t,f'{w}: reservatório exemplo '+t)
        pg.select_option('#rsB','0');ok('—' in pg.inner_text('#tiles') and 'NaN' not in pg.inner_text('#memorial'),f'{w}: reservatório sem bomba')
        go('pv');pg.click('.tab[data-k="sim"]');t=pg.inner_text('#tiles');ok('17 / 28 cm' in t and '50,0 cm' in t,f'{w}: pavimento exemplo '+t)
        pg.select_option('#pvM','v');ok(pg.is_visible('#pvV') and 'NaN' not in pg.inner_text('#memorial'),f'{w}: N pelo tráfego')
        pg.eval_on_selector('#pvR','e=>{e.value=12;e.dispatchEvent(new Event("input",{bubbles:true}))}');ok('Reforço' in pg.inner_text('#draw') and 'NaN' not in pg.inner_text('#memorial'),f'{w}: pavimento com reforço')
        go('inicio');ok('✓' in pg.inner_text('#main'),f'{w}: progresso na tela inicial')
        ok(not errs,f'{w} erros JS: {errs[:3]}')
        pg.close()
    b.close()
print(f'{checks-len(fails)}/{checks} verificações de interface passaram')
sys.exit(1 if fails else 0)
for f in fails[:30]: print('FAIL',f)
