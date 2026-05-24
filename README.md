# Portal do Fornecedor AutoZap

Portal estatico para fornecedores e administradores do AutoZap.

## Producao

O portal roda em GitHub Pages como site estatico. Ele nao depende de Node, `server.js` ou proxy local em producao.

API usada:

`https://aip.autozap.log.br`

Nao coloque segredos, senhas, tokens fixos, chaves privadas ou configuracoes sensiveis no frontend.

## Rotas principais

- `#/login`: login do fornecedor ou admin.
- `#/select`: painel inicial do fornecedor.
- `#/admin`: Central Admin.

## Funcionalidades

Fornecedor:

- Login real via API.
- Perfil em `/supplier/me`.
- Produtos em `/supplier/products`.
- Criacao, edicao e remocao de produtos.

Admin:

- Login real via API.
- Gestao de fornecedores em `/admin/suppliers`.
- Criacao de fornecedor.
- Edicao de dados comerciais.
- Reset de senha.
- Bloqueio, ativacao e arquivamento.

## Desenvolvimento local

Opcao simples: abrir `index.html` no navegador.

Opcao com servidor local:

```bash
node server.js
```

Depois abrir:

`http://localhost:3000`

O servidor local e apenas conveniencia de desenvolvimento. O GitHub Pages nao usa `server.js`.

## Deploy

Veja [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md).

## Diagnostico

Para ativar debug seguro de chamadas de API:

```js
localStorage.setItem("DEBUG_API", "1")
```

O debug nao imprime token nem `Authorization`.
