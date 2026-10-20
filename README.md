# Academia Foster de Engenharia

**Engenharia civil descomplicada.** App instalável (PWA) com 16 disciplinas. Cada uma tem teoria em linguagem simples, exemplo resolvido, simulador com memorial de cálculo e quiz. Inclui um simulado geral e a Bancada SIG de topografia.

Funciona no celular e no computador, pode ser instalado na tela inicial e continua funcionando sem internet depois da primeira visita.

## O que tem

| Área | Disciplinas |
|---|---|
| Estruturas | Resistência dos Materiais · Isostática · Concreto Armado · Lajes · Pilares |
| Geotecnia | Fundações e Solos · Estacas · Muros de Arrimo |
| Hidráulica e Instalações | Hidráulica · Águas Pluviais · Esgoto Sanitário · Instalações Elétricas |
| Construção e Gestão | Materiais e Traço · Orçamento de Obras · Planejamento de Obras |
| Topografia | Topografia com Bancada SIG (curvas de nível, perfil, corte e aterro, memorial descritivo, mapa de fundo OpenStreetMap) |

## Estrutura

```
index.html              página principal
manifest.webmanifest    dados de instalação (nome, ícones, cores)
sw.js                   service worker: guarda o app no aparelho para uso offline
js/conta.js             login do aluno e sincronização com o Supabase
css/app.css             visual (tema claro e escuro)
js/calc.js              todos os cálculos de engenharia (sem tela, testáveis)
js/catalogo.js          lista das disciplinas, áreas e quizzes
js/core.js              navegação, quiz, simulado, carregamento sob demanda, instalação e atualização
js/sig.js               Bancada SIG: conversão UTM, triangulação, curvas, volumes, mapa
js/modulos/*.js         uma disciplina por arquivo, baixada só quando o aluno abre
icons/                  ícones do app
testes/                 testes automáticos
ferramentas/empacotar.py  gera a versão em arquivo único (dist/academia-foster.html)
```

## Testar no computador

O service worker não funciona abrindo o arquivo direto (file://). Use um servidor local:

```
python3 -m http.server 8000
```

e abra http://localhost:8000

## Publicar no GitHub Pages

1. Entre no GitHub com a conta **FosterFcs** e crie um repositório público chamado, por exemplo, `academia-foster`.
2. Na página do repositório, clique em **Add file → Upload files** e arraste **todo o conteúdo desta pasta** (não a pasta em si). Confirme com **Commit changes**.
3. Vá em **Settings → Pages**. Em **Source**, escolha **Deploy from a branch**, depois a branch **main** e a pasta **/ (root)**. Clique em **Save**.
4. Em um ou dois minutos, o app estará em `https://fosterfcs.github.io/academia-foster/`.
5. Abra esse endereço no celular. No Android aparece **Instalar app**; no iPhone, use **Compartilhar → Adicionar à Tela de Início**.

## Publicar uma atualização

1. Altere os arquivos.
2. **Aumente a versão em `sw.js`** (por exemplo, de `af-1.0.0` para `af-1.0.1`). Sem isso, os aparelhos continuam com a versão antiga guardada.
3. Envie os arquivos para o GitHub. Quem estiver com o app aberto vê o aviso **Nova versão disponível · Atualizar agora**.

## Adicionar uma disciplina

1. Crie `js/modulos/<id>.js` seguindo o modelo de outra disciplina (`Academia.modulo('<id>',{teoria,exemplo,sim})`).
2. Inclua a entrada em `js/catalogo.js` (código, nome, títulos e quiz) e o `<id>` na área certa em `AREAS`.
3. Se a disciplina tiver cálculos novos, coloque as funções em `js/calc.js` e escreva os testes em `testes/`.
4. Rode os testes e aumente a versão em `sw.js`. O service worker passa a guardar o arquivo novo automaticamente.

## Testes

```
pip install playwright pillow
python3 -m playwright install chromium
sh testes/rodar-todos.sh
```

Os testes cobrem os cálculos (comparados com cálculo à mão, com a biblioteca de referência PROJ para a conversão UTM e com um modelo de fibras para os pilares), a interface de todas as disciplinas no computador e no celular, a Bancada SIG com cliques reais no mapa, o funcionamento offline, a atualização de versão, os downloads e a posição do mapa de fundo.

## Mapa de fundo

A Bancada SIG usa os mapas do OpenStreetMap, com a atribuição exigida na tela. O servidor público do OpenStreetMap serve para uso leve. Se o app ganhar muitos usuários, troque `TILE_URL` em `js/sig.js` pelo endereço de um provedor de mapas (MapTiler, Stadia Maps, Thunderforest ou outro) com chave própria.

## Conta do aluno (Supabase)

O app funciona sem conta. Com conta, o progresso dos quizzes, o histórico de simulados e o projeto da Bancada SIG ficam guardados na nuvem e aparecem em qualquer aparelho.

- Projeto Supabase: **foster-calc**, tabela `acad_dados` (uma linha por aluno e por tipo de dado).
- Segurança: cada aluno só lê e altera as próprias linhas (RLS). Visitantes sem login não acessam a tabela.
- A conta é a mesma dos outros apps Foster. Todo cadastro novo nesse projeto ganha o teste de 7 dias do Foster Calc.
- Funciona offline: as alterações ficam no aparelho e sobem quando a internet volta.
- `js/conta.js` fala direto com a API do Supabase, sem biblioteca extra.
- `testes/seguranca-banco.sql`: cole no SQL Editor do Supabase para conferir que um aluno não acessa os dados de outro (o teste desfaz tudo no final).

### Configuração no painel do Supabase (uma vez)

1. **Authentication → URL Configuration → Redirect URLs**: adicione `https://fosterfcs.github.io/academia-foster/**`. Sem isso, os links de confirmação e de nova senha abrem o site principal (Site URL) em vez da Academia.
2. **Authentication → Providers → Email**: mantenha **Confirm email** ligado.
3. **Authentication → Emails**: os modelos de e-mail são os mesmos para todos os apps do projeto. Prefira um texto neutro, com a marca Foster, que sirva para o Foster Calc e para a Academia.
4. Se o plano permitir, ligue a proteção contra senhas vazadas (**Leaked password protection**).

## Aviso técnico

Conteúdo didático. Os simuladores seguem as normas ABNT citadas em cada disciplina, mas não substituem projeto assinado por profissional habilitado. Confira as tabelas com a edição vigente de cada norma antes de uso profissional.

Foster Engenharia & Construção · comercial@fosterconstrucoes.com.br
