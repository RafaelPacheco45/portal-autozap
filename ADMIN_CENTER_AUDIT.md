# Auditoria do Centro Admin AutoZap

Data: 2026-05-24

## 1. Arquivos do admin encontrados

- `script.js`: contem o Portal do Fornecedor e o Centro Admin no mesmo frontend SPA. A rota interna do admin e `#/admin`.
- `styles.css`: estilos compartilhados do portal e do admin.
- `server.js`: servidor local estatico e proxy para a API real `https://aip.autozap.log.br`.
- `index.html`: shell HTML do frontend.

Nao foi encontrado neste workspace:

- `backend.js`
- `backend/server.js`
- `db.json`
- pasta de backend do Core Server V1

Conclusao: o backend de producao nao esta neste diretorio. As alteracoes de backend e `db.json` nao foram executadas aqui para evitar mexer no lugar errado.

## 2. Dados fake/mock/localStorage encontrados

Encontrados em `script.js`:

- `USE_MOCK`
- `defaultProducts`
- `defaultPosts`
- `defaultSuppliers`
- `defaultHelpRequests`
- `localStorage` para produtos, posts, fornecedores e solicitacoes

Antes da limpeza, o Centro Admin em producao inicializava esses dados mockados e mostrava estatisticas como "Base simulada".

Estado apos ajuste:

- `USE_MOCK = false` continua como padrao de producao.
- Em producao, listas administrativas iniciam vazias e sao carregadas da API real.
- Dados demo ficam isolados atras de `USE_MOCK`.
- Senhas mock fixas foram removidas da tela e da validacao.
- Abas sem rota real conectada nao exibem numeros ou tabelas fake.

## 3. Rotas admin existentes no frontend/proxy

O frontend agora chama:

- `GET /admin/suppliers`
- `POST /admin/suppliers`
- `PUT /admin/suppliers/:id`
- `POST /admin/suppliers/:id/reset-password`
- `POST /admin/suppliers/:id/block`
- `POST /admin/suppliers/:id/activate`

O frontend agora monta as URLs admin diretamente com:

`https://aip.autozap.log.br/admin/suppliers`

O proxy local `server.js` pode encaminhar rotas durante desenvolvimento, mas o frontend nao depende dele para chamadas admin em producao ou no GitHub Pages.

O proxy local `server.js` encaminha:

- `/auth/*`
- `/supplier/*`
- `/admin/*`
- `/start/*`

## 4. Rotas que faltam validar no backend real

Como o Core Server V1 nao esta neste workspace, estas rotas precisam ser confirmadas no backend real:

- `GET /admin/suppliers`
- `POST /admin/suppliers`
- `PUT /admin/suppliers/:id`
- `POST /admin/suppliers/:id/reset-password`
- `POST /admin/suppliers/:id/block`
- `POST /admin/suppliers/:id/activate`

Tambem faltam rotas reais para substituir as abas antigas:

- campanhas AutoBook administrativas
- produtos globais do AutoZap Start no admin
- solicitacoes administrativas

## 5. O que pode ser zerado com seguranca

No frontend de producao:

- estatisticas inventadas
- tabelas de fornecedores demo
- campanhas demo
- produtos demo no admin
- solicitacoes demo
- persistencia de admin em `localStorage`

Esses dados foram isolados em `USE_MOCK`.

## 6. O que nao deve ser apagado

- Conta admin real.
- Usuarios reais no backend.
- Suppliers reais ou de teste ainda uteis.
- Estrutura do `db.json`.
- Configuracoes do servidor.
- Segredos de JWT, OpenAI, Mercado Pago ou API.
- Endpoints antigos.

Nenhum desses itens foi alterado neste workspace.

## 7. Plano seguro de alteracao

1. Manter `USE_MOCK = false` em producao.
2. Carregar o Centro Admin somente por rotas reais `/admin/*`.
3. Criar fornecedores pelo Admin usando `POST /admin/suppliers`.
4. Nunca exibir senha depois de salvar.
5. Nunca armazenar senha temporaria no navegador.
6. Redefinir senha somente por `POST /admin/suppliers/:id/reset-password`.
7. Bloquear e ativar usando rotas dedicadas.
8. Validar no backend que apenas `role: admin` acessa `/admin/*`.
9. Validar no backend que hash/senha nunca aparecem nas respostas.
10. Antes de alterar backend ou `db.json`, criar backup do arquivo real de producao.
