# Guia de Testes — Fluxo Completo da API

Este documento detalha como testar **todos os endpoints** de autenticação, cadastro, empresa e recuperação de senha da Repurchase API.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Setup do Ambiente](#2-setup-do-ambiente)
3. [Testando via GraphQL Playground](#3-testando-via-graphql-playground)
   - 3.1 [Registrar Usuário](#31-registrar-usuário)
   - 3.2 [Login](#32-login)
   - 3.3 [Consultar Usuário Autenticado (me)](#33-consultar-usuário-autenticado-me)
   - 3.4 [Criar Empresa](#34-criar-empresa)
   - 3.5 [Upload de Logo da Empresa](#35-upload-de-logo-da-empresa)
   - 3.6 [Solicitar Recuperação de Senha](#36-solicitar-recuperação-de-senha)
   - 3.7 [Redefinir Senha](#37-redefinir-senha)
   - 3.8 [Login com Google](#38-login-com-google)
4. [Testando via cURL](#4-testando-via-curl)
5. [Testando Upload de Logo via cURL](#5-testando-upload-de-logo-via-curl)
6. [Cenários de Erro Esperados](#6-cenários-de-erro-esperados)
7. [Fluxo Completo E2E (Passo a Passo)](#7-fluxo-completo-e2e-passo-a-passo)
8. [Testes Unitários](#8-testes-unitários)
9. [Dicas de Debug](#9-dicas-de-debug)

---

## 1. Pré-requisitos

- **Node.js** 20.x
- **PostgreSQL** rodando localmente (ou via Docker)
- **Redis** rodando localmente (para filas Bull)
- **Mailtrap** ou **Ethereal** para capturar e-mails de teste (ou qualquer SMTP de dev)
- **yarn** instalado

---

## 2. Setup do Ambiente

### 2.1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd repurchase-api
yarn
```

### 2.2. Configurar variáveis de ambiente

Copie o `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
# Database — ajuste para seu PostgreSQL local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/repurchase_db"

# JWT — defina uma chave forte
JWT_SECRET="minha-chave-secreta-super-forte-123"

# SMTP — use Mailtrap (https://mailtrap.io) para testes
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="seu_user_mailtrap"
SMTP_PASS="sua_senha_mailtrap"

# Upload
UPLOAD_MAX_SIZE=2097152

# Google OAuth — obtenha em https://console.cloud.google.com
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
```

> **Dica:** Crie uma conta gratuita no [Mailtrap](https://mailtrap.io) para visualizar os e-mails de recuperação de senha sem precisar de um servidor SMTP real.

### 2.3. Rodar as migrations

```bash
yarn prisma:migrate
```

Quando solicitado, dê um nome à migration, ex: `init_auth_company_password_reset`.

### 2.4. Gerar Prisma Client

```bash
yarn prisma:generate
```

### 2.5. Iniciar o servidor

```bash
yarn dev:server
```

O servidor estará disponível em:

- **GraphQL Playground:** http://localhost:4000/graphql
- **Health Check:** http://localhost:4000/health

---

## 3. Testando via GraphQL Playground

Acesse http://localhost:4000/graphql no navegador. O Playground permite executar queries e mutations interativamente.

---

### 3.1. Registrar Usuário

**Mutation:**

```graphql
mutation RegisterUser {
  registerUser(
    input: {
      first_name: "João"
      last_name: "Silva"
      email: "joao@teste.com"
      phone: "11999998888"
      password: "Senha@123"
    }
  ) {
    token
    user {
      id
      firstName
      lastName
      email
      phone
      companyId
    }
  }
}
```

**Resposta esperada:**

```json
{
  "data": {
    "registerUser": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": "uuid-gerado",
        "firstName": "João",
        "lastName": "Silva",
        "email": "joao@teste.com",
        "phone": "11999998888",
        "companyId": null
      }
    }
  }
}
```

> **Importante:** Copie o `token` retornado — você vai precisar dele nas próximas requisições autenticadas.

---

### 3.2. Login

**Mutation:**

```graphql
mutation LoginUser {
  loginUser(input: { email: "joao@teste.com", password: "Senha@123" }) {
    token
    user {
      id
      firstName
      lastName
      email
      phone
      companyId
    }
  }
}
```

**Resposta esperada:**

```json
{
  "data": {
    "loginUser": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": "uuid-do-usuario",
        "firstName": "João",
        "lastName": "Silva",
        "email": "joao@teste.com",
        "phone": "11999998888",
        "companyId": null
      }
    }
  }
}
```

---

### 3.3. Consultar Usuário Autenticado (me)

Para rotas autenticadas, configure os **HTTP Headers** no Playground (painel inferior esquerdo):

```json
{
  "Authorization": "Bearer SEU_TOKEN_AQUI"
}
```

**Query:**

```graphql
query Me {
  me {
    id
    firstName
    lastName
    email
    phone
    companyId
  }
}
```

**Resposta esperada:**

```json
{
  "data": {
    "me": {
      "id": "uuid-do-usuario",
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao@teste.com",
      "phone": "11999998888",
      "companyId": null
    }
  }
}
```

---

### 3.4. Criar Empresa

> Requer autenticação — configure o header `Authorization` como na seção anterior.

**Mutation:**

```graphql
mutation CreateCompany {
  createCompany(
    input: {
      name: "Restaurante do João"
      cnpj: "12345678000199"
      phone: "11988887777"
      segment: "restaurant"
      address: {
        cep: "01001000"
        street: "Praça da Sé"
        number: "100"
        neighborhood: "Sé"
        city: "São Paulo"
        state: "SP"
      }
    }
  ) {
    id
    name
    cnpj
    phone
    segment
    logoUrl
    address {
      cep
      street
      number
      neighborhood
      city
      state
    }
  }
}
```

**Resposta esperada:**

```json
{
  "data": {
    "createCompany": {
      "id": "uuid-da-empresa",
      "name": "Restaurante do João",
      "cnpj": "12345678000199",
      "phone": "11988887777",
      "segment": "restaurant",
      "logoUrl": null,
      "address": {
        "cep": "01001000",
        "street": "Praça da Sé",
        "number": "100",
        "neighborhood": "Sé",
        "city": "São Paulo",
        "state": "SP"
      }
    }
  }
}
```

Após criar a empresa, faça a query `me` novamente — o campo `companyId` agora terá o ID da empresa.

---

### 3.5. Upload de Logo da Empresa

O upload de arquivo via GraphQL usa o padrão **multipart request** e **não funciona diretamente pelo Playground**. Veja a seção [5. Testando Upload via cURL](#5-testando-upload-de-logo-via-curl).

---

### 3.6. Solicitar Recuperação de Senha

**Mutation:**

```graphql
mutation RequestPasswordReset {
  requestPasswordReset(email: "joao@teste.com") {
    success
    message
  }
}
```

**Resposta esperada (sempre):**

```json
{
  "data": {
    "requestPasswordReset": {
      "success": true,
      "message": "Se o e-mail estiver cadastrado, você receberá o código."
    }
  }
}
```

> **Onde encontrar o código:**
>
> - Se configurou o **Mailtrap**, acesse sua inbox no Mailtrap e veja o e-mail com o código de 6 dígitos
> - Se não configurou SMTP, consulte diretamente no banco de dados:

```sql
SELECT token, "expiresAt", used
FROM password_reset_tokens
WHERE "userId" = 'UUID_DO_USUARIO'
ORDER BY "createdAt" DESC
LIMIT 1;
```

Ou via Prisma Studio:

```bash
yarn prisma:studio
```

Navegue até a tabela `PasswordResetToken` e encontre o código.

---

### 3.7. Redefinir Senha

Use o código de 6 dígitos obtido na etapa anterior:

**Mutation:**

```graphql
mutation ResetPassword {
  resetPassword(input: { token: "123456", new_password: "NovaSenha@456" }) {
    success
    message
  }
}
```

**Resposta esperada (sucesso):**

```json
{
  "data": {
    "resetPassword": {
      "success": true,
      "message": "Senha redefinida com sucesso."
    }
  }
}
```

Agora teste o login com a nova senha:

```graphql
mutation LoginComNovaSenha {
  loginUser(input: { email: "joao@teste.com", password: "NovaSenha@456" }) {
    token
    user {
      id
      email
    }
  }
}
```

---

### 3.8. Login com Google

O fluxo utiliza **Google Identity** — o frontend obtém um `idToken` via Google SDK e o envia para a mutation.

**Como obter um idToken para teste:**

1. No [Google Cloud Console](https://console.cloud.google.com) crie um projeto e ative a API "Google Identity"
2. Em **Credenciais**, crie um **ID do cliente OAuth 2.0** (tipo: Aplicativo da Web)
3. Adicione `http://localhost:4000` como origem autorizada
4. Copie o **Client ID** e coloque em `GOOGLE_CLIENT_ID` no `.env`
5. Use o [token generator de teste do Google](https://developers.google.com/identity/gsi/web/tools/configurator) ou um frontend que chame `google.accounts.id.initialize()`

**Mutation:**

```graphql
mutation GoogleSignIn {
  googleSignIn(id_token: "SEU_GOOGLE_ID_TOKEN_AQUI") {
    token
    user {
      id
      firstName
      lastName
      email
      phone
      googleId
      companyId
    }
  }
}
```

**Resposta esperada (novo usuário):**

```json
{
  "data": {
    "googleSignIn": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": "uuid-gerado",
        "firstName": "João",
        "lastName": "Silva",
        "email": "joao@gmail.com",
        "phone": null,
        "googleId": "google-sub-id",
        "companyId": null
      }
    }
  }
}
```

> **Comportamento:**
>
> - Se o `googleId` já existe no banco → autentica o usuário existente
> - Se o `email` já existe (conta criada via e-mail/senha) → vincula o Google à conta existente
> - Se nenhum dos dois → cria uma nova conta automaticamente
> - Usuários criados via Google **não têm senha** — o login por e-mail/senha retornará `"Esta conta usa login via Google"`

---

## 4. Testando via cURL

Se preferir testar via terminal/Postman:

### Registrar

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { registerUser(input: { first_name: \\"João\\", last_name: \\"Silva\\", email: \\"joao@teste.com\\", phone: \\"11999998888\\", password: \\"Senha@123\\" }) { token user { id firstName lastName email } } }"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { loginUser(input: { email: \"joao@teste.com\", password: \"Senha@123\" }) { token user { id email } } }"
  }'
```

### Me (autenticada)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "query": "query { me { id firstName lastName email phone companyId } }"
  }'
```

### Criar Empresa (autenticada)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "query": "mutation { createCompany(input: { name: \"Restaurante do João\", cnpj: \"12345678000199\", phone: \"11988887777\", segment: \"restaurant\", address: { cep: \"01001000\", street: \"Praça da Sé\", number: \"100\", neighborhood: \"Sé\", city: \"São Paulo\", state: \"SP\" } }) { id name cnpj segment address { cep street city state } } }"
  }'
```

### Solicitar Reset de Senha

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { requestPasswordReset(email: \"joao@teste.com\") { success message } }"
  }'
```

### Redefinir Senha

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { resetPassword(input: { token: \\"123456\\", new_password: \\"NovaSenha@456\\" }) { success message } }"
  }'
```

### Google Sign-In

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { googleSignIn(id_token: \\"SEU_GOOGLE_ID_TOKEN\\") { token user { id firstName lastName email googleId companyId } } }"
  }'
```

---

## 5. Testando Upload de Logo via cURL

O upload de imagem usa **GraphQL multipart request** (spec: [graphql-multipart-request-spec](https://github.com/jaydenseric/graphql-multipart-request-spec)).

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F operations='{ "query": "mutation UploadLogo($company_id: String!, $file: Upload!) { uploadCompanyLogo(company_id: $company_id, file: $file) { id name logoUrl } }", "variables": { "company_id": "UUID_DA_EMPRESA", "file": null } }' \
  -F map='{ "0": ["variables.file"] }' \
  -F 0=@/caminho/para/logo.png
```

**Substitua:**

- `SEU_TOKEN_AQUI` → token JWT do login
- `UUID_DA_EMPRESA` → ID da empresa retornado pelo `createCompany`
- `/caminho/para/logo.png` → caminho de uma imagem PNG, JPG ou SVG de até 2MB

**Resposta esperada:**

```json
{
  "data": {
    "uploadCompanyLogo": {
      "id": "uuid-da-empresa",
      "name": "Restaurante do João",
      "logoUrl": "/uploads/logos/uuid-gerado.png"
    }
  }
}
```

**Verificar a imagem:** Acesse no navegador:

```
http://localhost:4000/uploads/logos/uuid-gerado.png
```

---

## 6. Cenários de Erro Esperados

Teste esses cenários para validar que os erros estão corretos:

### Registro

| Cenário           | Input                                | Erro Esperado                                              |
| ----------------- | ------------------------------------ | ---------------------------------------------------------- |
| Email duplicado   | Registrar com mesmo email duas vezes | `"Este e-mail já está cadastrado."`                        |
| Senha curta       | `password: "123"`                    | `"A senha deve ter no mínimo 8 caracteres."`               |
| Telefone inválido | `phone: "123"`                       | `"Telefone inválido. Informe 10 ou 11 dígitos numéricos."` |
| Nome vazio        | `firstName: ""`                      | `"Nome e sobrenome são obrigatórios."`                     |

### Login

| Cenário          | Input                      | Erro Esperado              |
| ---------------- | -------------------------- | -------------------------- |
| Email não existe | `email: "naoexiste@x.com"` | `"Credenciais inválidas."` |
| Senha errada     | Senha incorreta            | `"Credenciais inválidas."` |

### Criar Empresa

| Cenário           | Input                    | Erro Esperado                                            |
| ----------------- | ------------------------ | -------------------------------------------------------- |
| CNPJ duplicado    | Mesmo CNPJ duas vezes    | `"Este CNPJ já está cadastrado."`                        |
| CNPJ inválido     | `cnpj: "123"`            | `"CNPJ deve conter exatamente 14 dígitos."`              |
| Segmento inválido | `segment: "padaria"`     | `"Segmento inválido. Use 'restaurant' ou 'e-commerce'."` |
| CEP inválido      | `cep: "123"`             | `"CEP deve conter exatamente 8 dígitos."`                |
| Estado inválido   | `state: "São Paulo"`     | `"Estado deve ser a sigla UF com 2 caracteres."`         |
| Sem token         | Sem header Authorization | `"Não autorizado."`                                      |

### Upload de Logo

| Cenário               | Input                     | Erro Esperado                              |
| --------------------- | ------------------------- | ------------------------------------------ |
| Arquivo > 2MB         | Imagem grande             | `"O arquivo deve ter no máximo 2MB."`      |
| Formato inválido      | Arquivo .pdf              | `"Formato inválido. Use PNG, JPG ou SVG."` |
| Empresa de outro user | companyId de outra pessoa | `"Não autorizado."`                        |

### Reset de Senha

| Cenário              | Input                    | Erro Esperado                                |
| -------------------- | ------------------------ | -------------------------------------------- |
| Código errado        | `token: "000000"`        | `"Código inválido ou expirado."`             |
| Código já usado      | Usar mesmo código 2x     | `"Código inválido ou expirado."`             |
| Código expirado      | Código com mais de 15min | `"Código inválido ou expirado."`             |
| Senha curta no reset | `newPassword: "123"`     | `"A senha deve ter no mínimo 8 caracteres."` |

### Google Sign-In

| Cenário                       | Input                        | Erro Esperado                          |
| ----------------------------- | ---------------------------- | -------------------------------------- |
| Token inválido                | `idToken: "token_falso"`     | `"Token Google inválido ou expirado."` |
| GOOGLE_CLIENT_ID não definido | Sem variável de ambiente     | `"Google OAuth não está configurado."` |
| Login e-mail em conta Google  | Tentar senha em conta Google | `"Esta conta usa login via Google."`   |

**Exemplo — testar email duplicado:**

```graphql
# Execute registerUser 2x com o mesmo email
mutation {
  registerUser(
    input: {
      firstName: "Test"
      lastName: "Duplicado"
      email: "duplicado@teste.com"
      phone: "11999999999"
      password: "Senha@123"
    }
  ) {
    token
  }
}
# Na segunda execução, o erro será:
# "Este e-mail já está cadastrado."
```

---

## 7. Fluxo Completo E2E (Passo a Passo)

Siga esta ordem para testar o fluxo inteiro de ponta a ponta:

```
┌──────────────────────────────────────────────────────────┐
│  1. registerUser      → Obtém token JWT + dados do user  │
│  2. me                → Valida autenticação (companyId=null) │
│  3. createCompany     → Cria empresa vinculada ao user   │
│  4. me                → Agora companyId está preenchido   │
│  5. uploadCompanyLogo → Faz upload (via cURL)            │
│  6. loginUser         → Testa login com credenciais      │
│  7. requestPasswordReset → Solicita código por email     │
│  8. (ver código no Mailtrap ou banco)                    │
│  9. resetPassword     → Redefine a senha                 │
│ 10. loginUser         → Login com a NOVA senha           │
│ 11. loginUser         → Login com a ANTIGA senha (erro!) │
│ 12. googleSignIn      → Cria/autentica via Google OAuth  │
└──────────────────────────────────────────────────────────┘
```

### Passo 1 — Registrar

```graphql
mutation {
  registerUser(
    input: {
      first_name: "Maria"
      last_name: "Oliveira"
      email: "maria@teste.com"
      phone: "21988776655"
      password: "MinhaSenh@1"
    }
  ) {
    token
    user {
      id
      firstName
      email
      companyId
    }
  }
}
```

Anote: `token` e `user.id`

### Passo 2 — Me (sem empresa)

Headers: `Authorization: Bearer <token>`

```graphql
query {
  me {
    id
    firstName
    lastName
    email
    companyId
  }
}
```

Confirme que `companyId` é `null`.

### Passo 3 — Criar empresa

```graphql
mutation {
  createCompany(
    input: {
      name: "Café da Maria"
      cnpj: "98765432000188"
      phone: "21977665544"
      segment: "restaurant"
      address: {
        cep: "20040020"
        street: "Av. Rio Branco"
        number: "50"
        neighborhood: "Centro"
        city: "Rio de Janeiro"
        state: "RJ"
      }
    }
  ) {
    id
    name
    cnpj
    segment
    logoUrl
    address {
      cep
      street
      number
      neighborhood
      city
      state
    }
  }
}
```

Anote: `id` da empresa

### Passo 4 — Me (com empresa)

```graphql
query {
  me {
    id
    firstName
    email
    companyId
  }
}
```

Agora `companyId` deve ter o UUID da empresa.

### Passo 5 — Upload de logo (via cURL)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -F operations='{ "query": "mutation($cid: String!, $f: Upload!) { uploadCompanyLogo(company_id: $cid, file: $f) { id logoUrl } }", "variables": { "cid": "COMPANY_ID_AQUI", "f": null } }' \
  -F map='{ "0": ["variables.f"] }' \
  -F 0=@logo.png
```

### Passo 6 — Login

```graphql
mutation {
  loginUser(input: { email: "maria@teste.com", password: "MinhaSenh@1" }) {
    token
    user {
      id
      email
      companyId
    }
  }
}
```

### Passo 7 — Solicitar reset

```graphql
mutation {
  requestPasswordReset(email: "maria@teste.com") {
    success
    message
  }
}
```

### Passo 8 — Obter código

Opção A: Mailtrap inbox
Opção B: Prisma Studio (`yarn prisma:studio`) → tabela `password_reset_tokens`
Opção C: SQL direto:

```sql
SELECT token FROM password_reset_tokens
WHERE "userId" = 'USER_ID' AND used = false
ORDER BY "createdAt" DESC LIMIT 1;
```

### Passo 9 — Redefinir senha

```graphql
mutation {
  resetPassword(
    input: { token: "CODIGO_6_DIGITOS", new_password: "NovaSenha@2" }
  ) {
    success
    message
  }
}
```

### Passo 10 — Login com nova senha (sucesso)

```graphql
mutation {
  loginUser(input: { email: "maria@teste.com", password: "NovaSenha@2" }) {
    token
    user {
      id
      email
    }
  }
}
```

### Passo 11 — Login com senha antiga (erro)

```graphql
mutation {
  loginUser(input: { email: "maria@teste.com", password: "MinhaSenh@1" }) {
    token
  }
}
# Erro: "Credenciais inválidas."
```

### Passo 12 — Google Sign-In (novo usuário)

Obtenha um `idToken` real via Google SDK (ou use o [configurador de teste](https://developers.google.com/identity/gsi/web/tools/configurator)) e envie:

```graphql
mutation {
  googleSignIn(id_token: "SEU_ID_TOKEN_GOOGLE") {
    token
    user {
      id
      firstName
      lastName
      email
      googleId
      companyId
    }
  }
}
```

Uma nova conta será criada automaticamente com os dados do perfil Google. Execute novamente com o mesmo token — o mesmo usuário será retornado (não cria duplicata).

---

## 8. Testes Unitários

Para rodar os testes unitários existentes:

```bash
yarn test
```

Os testes estão em `__test__/unit/users/` e cobrem:

- Registro de usuário com sucesso
- Impedir registro com email duplicado
- Impedir registro com senha curta

Para rodar com coverage:

```bash
yarn test:coverage
```

---

## 9. Dicas de Debug

### Ver queries SQL do Prisma

O Prisma já está configurado para logar queries em ambiente de desenvolvimento. Confira o terminal onde o servidor está rodando.

### Prisma Studio (GUI do banco)

```bash
yarn prisma:studio
```

Abre uma interface web (geralmente em http://localhost:5555) onde você pode inspecionar e editar dados diretamente nas tabelas `users`, `companies` e `password_reset_tokens`.

### Resetar banco de dados

Se precisar limpar tudo e recomeçar:

```bash
yarn prisma:reset
```

> **Atenção:** Isso apaga todos os dados e recria as tabelas.

### Verificar token JWT

Você pode decodificar qualquer token JWT em https://jwt.io — cole o token e veja o payload `{ userId: "..." }`.

### Logs de erro no terminal

Erros GraphQL são logados no terminal do servidor com `console.error("GraphQL Error:", error)`. Se algo não funcionar, verifique os logs.

### Problemas comuns

| Problema                              | Solução                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `"Não autorizado."`                   | Verifique se o header `Authorization: Bearer <token>` está correto                        |
| `Cannot reach database`               | Verifique se o PostgreSQL está rodando e a `DATABASE_URL` está correta                    |
| E-mail não chega                      | Verifique as credenciais SMTP no `.env`. Use Mailtrap para testes                         |
| `Upload` não funciona no Playground   | Use cURL — o Playground não suporta multipart uploads                                     |
| Erro `minimatch` no build             | Erro pré-existente em tipos. Não afeta o runtime (`yarn dev:server` funciona normalmente) |
| `"Token Google inválido"`             | Verifique se `GOOGLE_CLIENT_ID` no `.env` é o mesmo do projeto Google Cloud               |
| `"Google OAuth não está configurado"` | `GOOGLE_CLIENT_ID` está ausente ou vazio no `.env`                                        |
