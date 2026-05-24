# Checklist GitHub Pages

Data: 2026-05-24

## Arquivos prontos para deploy

- `index.html`
- `styles.css`
- `script.js`
- `autozap-logo.png`
- `banner.png`
- `.nojekyll`

## API confirmada

`script.js` mantem:

`API_BASE_URL = "https://aip.autozap.log.br"`

O portal nao depende de `server.js` em producao.

## Rotas do portal

- `#/login`
- `#/select`
- `#/admin`

## Endpoints usados

Fornecedor:

- `POST /auth/login`
- `GET /supplier/me`
- `GET /supplier/products`
- `POST /supplier/products`
- `PUT /supplier/products/:id`
- `DELETE /supplier/products/:id`

Admin:

- `GET /admin/suppliers`
- `POST /admin/suppliers`
- `PUT /admin/suppliers/:id`
- `POST /admin/suppliers/:id/reset-password`
- `POST /admin/suppliers/:id/block`
- `POST /admin/suppliers/:id/activate`
- `DELETE /admin/suppliers/:id`

## Verificacoes feitas

- Site carrega arquivos estaticos diretamente por `index.html`.
- `API_BASE_URL` aponta para a API real.
- `USE_MOCK = false` em producao.
- Dados mockados ficam isolados atras de `USE_MOCK`.
- Token e salvo em `autozap_token`.
- `DEBUG_API` nao imprime token nem `Authorization`.

## Pendencias antes de publicar

- Criar repositorio GitHub, se ainda nao existir.
- Configurar GitHub Pages para publicar a branch principal pela raiz `/`.
- Configurar DNS do dominio desejado.
- Confirmar CORS da API para o dominio publicado.

## Instrucao para subir no GitHub

```bash
git init
git add .
git commit -m "Prepare supplier portal for GitHub Pages"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```
