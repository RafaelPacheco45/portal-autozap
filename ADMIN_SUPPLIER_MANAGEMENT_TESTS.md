# Testes de Gestao Admin de Fornecedores

## Testes obrigatorios

1. Admin loga no Portal e e redirecionado para `#/admin`.
2. Usuario sem role admin nao acessa `GET /admin/suppliers`.
3. Admin abre a aba **Fornecedores** e lista fornecedores reais.
4. Admin cria fornecedor novo com email unico e senha temporaria.
5. A resposta de criacao nao retorna senha.
6. A resposta de criacao nao retorna hash, salt ou token.
7. Criar fornecedor com email duplicado retorna erro amigavel.
8. Admin redefine senha do fornecedor.
9. Fornecedor loga no Portal com a nova senha.
10. `GET /supplier/me` retorna o supplier vinculado ao usuario logado.
11. `GET /supplier/products` funciona para esse supplier.
12. Fornecedor cria produto em `POST /supplier/products`.
13. Produto aparece em `/start/suppliers/:id/products`.
14. Admin bloqueia fornecedor.
15. Fornecedor bloqueado nao consegue operar, se essa regra ja existir no backend.
16. Admin reativa fornecedor.
17. Fornecedor reativado consegue acessar e operar novamente.

## Testes de frontend

1. Com `USE_MOCK = false`, o admin nao exibe fornecedores demo.
2. Com `USE_MOCK = false`, as abas sem rota real nao exibem estatisticas fake.
3. O formulario **Novo fornecedor** exige email e senha temporaria.
4. A senha temporaria nao aparece em toast, tabela, modal ou `localStorage`.
5. O modal de reset limpa o campo de senha apos sucesso.
6. Erros da API aparecem como toast sem expor segredo.

## Comandos locais

```bash
node --check script.js
node --check server.js
```

## Validacoes de API

Usar token admin sem imprimir token completo:

```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" https://aip.autozap.log.br/admin/suppliers
```

Usar token supplier sem imprimir token completo:

```bash
curl -H "Authorization: Bearer <SUPPLIER_TOKEN>" https://aip.autozap.log.br/supplier/me
```

Nao colar senhas, tokens ou hashes em relatorios.
