# Gestao de Fornecedores no Centro Admin

## Visao geral

O Centro Admin fica em `#/admin` dentro do Portal do Fornecedor. A aba **Fornecedores** usa a API real diretamente quando `USE_MOCK = false`.

Base de API obrigatoria no frontend:

`https://aip.autozap.log.br`

Endpoint final de fornecedores:

`https://aip.autozap.log.br/admin/suppliers`

`localhost:3000` e apenas o servidor estatico local para abrir o portal durante desenvolvimento. Ele nao deve ser a origem das chamadas admin. Em GitHub Pages, o frontend tambem chamara a API real diretamente.

Para diagnosticar erros de API sem expor token, execute no navegador:

`localStorage.setItem("DEBUG_API", "1")`

Depois recarregue a pagina. As mensagens de erro passam a mostrar endpoint, URL e status HTTP, sem imprimir `Authorization`.

## Autenticacao do frontend

O token de login e salvo em uma chave unica:

`autozap_token`

Para compatibilidade com sessoes antigas, o frontend ainda le as chaves legadas `autozap_supplier_token`, `token`, `authToken`, `accessToken` e `autozapToken`. Ao encontrar uma dessas chaves, migra o valor para `autozap_token`.

Todas as rotas protegidas chamadas pelo helper central enviam:

`Authorization: Bearer <token>`

Rotas protegidas no frontend:

- `/admin/*`
- `/supplier/*`
- `/app/bootstrap`

Ao fazer logout, a sessao local e as chaves de token antigas sao removidas.

O fluxo operacional e:

1. O dono negocia com o fornecedor por WhatsApp/celular.
2. O admin acessa o Centro Admin.
3. O admin cria o fornecedor e define uma senha temporaria.
4. O sistema cria o usuario `supplier` e o supplier vinculado no backend.
5. O admin envia email e senha temporaria ao fornecedor por canal seguro.
6. O fornecedor acessa o Portal do Fornecedor com esse login.

## Criar fornecedor

Na aba **Fornecedores**, clique em **Novo fornecedor** e preencha:

- Nome da empresa
- Nome do responsavel
- Email de login
- Senha temporaria
- Telefone
- Cidade
- Estado
- CNPJ opcional
- Chave Pix opcional
- Status
- Verificado
- Quota mensal AutoBook
- Visivel no AutoZap Start

Apos salvar, o sistema mostra:

`Fornecedor criado com sucesso. Envie o email e a senha temporaria ao fornecedor por canal seguro.`

A senha nao e exibida novamente e nao e salva no navegador.

## Editar fornecedor

Use **Editar** na tabela de fornecedores para alterar dados comerciais, status, verificacao, quota e visibilidade no AutoZap Start.

Essa rota nao altera senha.

## Redefinir senha

Use **Redefinir senha** na tabela. Informe a nova senha e envie ao fornecedor por canal seguro.

O backend deve salvar apenas o hash PBKDF2 ja padronizado no Core Server V1. A resposta nao deve conter senha nem hash.

## Bloquear e reativar

Use **Bloquear** para impedir operacao do fornecedor e/ou usuario vinculado.

Use **Ativar** para liberar novamente.

O backend deve garantir que fornecedor bloqueado nao consiga operar se essa regra ja existir no Core Server V1.

## Arquivar fornecedor

Use **Arquivar** quando o fornecedor deve sair da operacao.

Antes de arquivar, o Centro Admin confirma:

`Tem certeza que deseja arquivar este fornecedor? Ele nao conseguira mais acessar o Portal.`

A acao chama:

`DELETE /admin/suppliers/:id`

Essa exclusao e soft delete. O backend deve marcar `supplier.status = deleted` e `user.status = deleted`, sem apagar fisicamente historico, produtos, campanhas ou registros financeiros.

Resumo operacional:

- **Bloquear**: impede temporariamente.
- **Ativar**: reativa fornecedor bloqueado ou pendente.
- **Arquivar**: remove da operacao e impede login; nao e hard delete.

## Acesso do fornecedor

O fornecedor entra pela tela de login do Portal do Fornecedor usando:

- email cadastrado no Centro Admin
- senha temporaria ou senha redefinida

Apos login, o portal chama:

- `GET /supplier/me`
- `GET /supplier/products`

## Produtos no AutoZap Start

Depois que o fornecedor cria um produto no Portal:

1. O portal envia para `POST /supplier/products`.
2. O produto fica vinculado ao supplier autenticado.
3. O produto deve aparecer em `/start/suppliers/:id/products` conforme regras de status/visibilidade do backend.

## Requisitos de seguranca do backend

- Apenas admin acessa `/admin/*`.
- Supplier e client nao acessam rotas admin.
- Email de usuario deve ser unico.
- Senha minima: 8 ou 10 caracteres, conforme padrao final do Core Server.
- Senha nunca deve ser salva em texto claro.
- Respostas nunca devem retornar senha, hash, salt, token ou segredo.
- Logs nao devem imprimir senha, token ou hash.
