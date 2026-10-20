"""Utilitários dos testes de interface.
Modo servidor (padrão): sobe um servidor local na pasta do app e testa a versão PWA, com service worker.
Modo arquivo (--arquivo): testa dist/academia-foster.html, a versão de arquivo único."""
import os,sys,threading,functools,http.server,socketserver
RAIZ=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
    def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def servir(pasta=RAIZ,porta=0):
    h=functools.partial(_Silencioso,directory=pasta);s=socketserver.ThreadingTCPServer(('127.0.0.1',porta),h);s.daemon_threads=True
    threading.Thread(target=s.serve_forever,daemon=True).start();return s,f'http://127.0.0.1:{s.server_address[1]}/'
def endereco():
    if '--arquivo' in sys.argv:
        html=open(os.path.join(RAIZ,'dist','academia-foster.html'),encoding='utf-8').read()
        p=os.path.join(RAIZ,'dist','_teste.html')
        open(p,'w',encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+html+'</body></html>')
        return None,'file://'+p
    return servir()
def ignorar(msg):
    return any(k in msg for k in ['ERR_','Failed to load resource','fonts.g'])
def esperar(pg):
    pg.wait_for_function("typeof st!=='undefined'&&(['inicio','sim','conta'].includes(st.mod)||(modById(st.mod)&&modById(st.mod).carregado))")
    pg.wait_for_timeout(30)
