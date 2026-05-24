# Deploy no GitHub Pages

Este diretorio contem o Portal do Fornecedor AutoZap em formato estatico. A versao de producao roda diretamente no navegador e chama a API real.

## Arquivos de producao

Publicar estes arquivos no GitHub Pages:

- `index.html`
- `styles.css`
- `script.js`
- `autozap-logo.png`
- `banner.png`
- `.nojekyll`

Arquivos de documentacao podem ficar no repositorio:

- `README.md`
- `DEPLOY_GITHUB_PAGES.md`
- `GITHUB_PAGES_READY.md`
- `ADMIN_CENTER_AUDIT.md`
- `ADMIN_SUPPLIER_MANAGEMENT.md`
- `ADMIN_SUPPLIER_MANAGEMENT_TESTS.md`

## Arquivos somente para desenvolvimento local

Se existirem no repositorio, estes arquivos nao sao necessarios para o GitHub Pages:

- `server.js`
- `start-portal.ps1`
- `start-portal.bat`

Eles servem apenas para abrir o portal localmente. Em producao, o GitHub Pages entrega os arquivos estaticos e o navegador chama a API real diretamente.

## API de producao

O frontend usa:

`https://aip.autozap.log.br`

Nao altere `API_BASE_URL` em `script.js`.

## Dominios recomendados

- `portal.autozap.log.br`: Portal do Fornecedor.
- `admin.autozap.log.br`: Central Admin.
- `aip.autozap.log.br`: API real.
- `partner.autozap.log.br`: site publico de apresentacao, nao este portal.

## Como publicar

1. Crie um repositorio no GitHub para este portal.
2. Suba os arquivos do projeto para a branch principal.
3. No GitHub, acesse `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione a branch principal e a pasta raiz `/`.
6. Salve.
7. Configure o dominio customizado desejado, preferencialmente `portal.autozap.log.br`.
8. No DNS, aponte o dominio para GitHub Pages conforme a documentacao do GitHub.
9. Confirme que a API permite CORS para o dominio publicado.

## Validacao apos deploy

1. Abrir `#/login`.
2. Fazer login como supplier real.
3. Confirmar `GET /supplier/me`.
4. Confirmar `GET /supplier/products`.
5. Fazer login como admin real.
6. Abrir `#/admin`.
7. Confirmar `GET /admin/suppliers`.

Para diagnostico sem expor token:

`localStorage.setItem("DEBUG_API", "1")`

O debug mostra endpoint, URL, status, `hasToken` e role. Nao imprime token nem `Authorization`.
