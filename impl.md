# Prompt para Implementação do Backend — Autenticação, Cadastro e Recuperação de Senha

## Contexto

Estou construindo o backend de um CRM de recompra para food-service. O frontend está em **Next.js 14+ (App Router)** com **Apollo Client v4** consumindo uma API **GraphQL**.

O backend usa **GraphQL**, **TypeScript** e **Prisma**. A autenticação é via **JWT sem expiração**.

O frontend já possui as seguintes telas implementadas e prontas para consumir a API:

- **Login** (email + senha)
- **Registro de usuário** (nome, sobrenome, email, telefone, senha)
- **Configuração da empresa** (nome, CNPJ, telefone/WhatsApp, segmento, endereço completo, logo)
- **Recuperar senha** (solicitar código por e-mail → verificar código → nova senha)

---

## 1. Schema Prisma (Models)

Implemente os seguintes models no schema do Prisma:

```prisma
model User {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  email     String   @unique
  phone     String
  password  String   // Hash com bcrypt
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])

  passwordResetTokens PasswordResetToken[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Company {
  id       String  @id @default(uuid())
  name     String
  cnpj     String  @unique
  phone    String
  segment  String  // "restaurant" | "e-commerce"
  logoUrl  String? // Path relativo da imagem salva no servidor (ex: "/uploads/logos/uuid.png")

  // Endereço
  cep          String
  street       String
  number       String
  neighborhood String
  city         String
  state        String

  users User[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique // Código de 6 dígitos numéricos
  used      Boolean  @default(false)
  expiresAt DateTime // Expira em 15 minutos
  createdAt DateTime @default(now())
}
```

---

## 2. Schema GraphQL — Types & Inputs

```graphql
# ========================
# TYPES
# ========================

type User {
  id: String!
  firstName: String!
  lastName: String!
  email: String!
  phone: String!
  companyId: String
}

type AuthPayload {
  token: String!
  user: User!
}

type Company {
  id: String!
  name: String!
  cnpj: String!
  phone: String!
  segment: String!
  logoUrl: String
  address: Address!
}

type Address {
  cep: String!
  street: String!
  number: String!
  neighborhood: String!
  city: String!
  state: String!
}

type MutationResponse {
  success: Boolean!
  message: String!
}

# ========================
# INPUTS
# ========================

input RegisterUserInput {
  firstName: String!
  lastName: String!
  email: String!
  phone: String! # Apenas dígitos, 10 ou 11 caracteres
  password: String! # Mínimo 8 caracteres
}

input LoginUserInput {
  email: String!
  password: String!
}

input CreateCompanyInput {
  name: String!
  cnpj: String! # Apenas 14 dígitos numéricos (sem formatação)
  phone: String! # Apenas dígitos, 10 ou 11 caracteres
  segment: String! # "restaurant" | "e-commerce"
  address: AddressInput!
}

input AddressInput {
  cep: String! # 8 dígitos numéricos
  street: String!
  number: String!
  neighborhood: String!
  city: String!
  state: String! # Sigla UF (2 caracteres)
}

input ResetPasswordInput {
  token: String! # Código de 6 dígitos que o usuário recebeu por email
  newPassword: String! # Mínimo 8 caracteres
}
```

---

## 3. Queries & Mutations

```graphql
type Query {
  # Retorna o usuário autenticado (requer JWT no header Authorization)
  me: User!
}

type Mutation {
  # ---- Autenticação ----

  # Registrar novo usuário. Retorna JWT + dados do usuário.
  # Validações:
  #   - Email único
  #   - Senha mínimo 8 caracteres com padrão forte
  #   - Hashear senha com bcrypt (salt rounds: 10)
  registerUser(input: RegisterUserInput!): AuthPayload!

  # Login. Retorna JWT + dados do usuário (incluindo companyId se houver).
  # Validações:
  #   - Verificar se email existe (retornar erro "Credenciais inválidas.")
  #   - Verificar senha com bcrypt.compare
  #   - JWT nunca expira: sign sem campo 'expiresIn'
  loginUser(input: LoginUserInput!): AuthPayload!

  # ---- Empresa ----

  # Criar a empresa vinculada ao usuário autenticado.
  # Requer JWT no header (rota autenticada).
  # Validações:
  #   - CNPJ único (retornar erro "Este CNPJ já está cadastrado.")
  #   - Atualizar o campo companyId do User autenticado com o id da Company criada
  createCompany(input: CreateCompanyInput!): Company!

  # Upload do logo da empresa. Salvar a imagem no sistema de arquivos do servidor.
  # Rota autenticada.
  # Detalhes do upload na seção 5 abaixo.
  uploadCompanyLogo(companyId: String!, file: Upload!): Company!

  # ---- Recuperação de Senha ----

  # Solicitar reset de senha. Gera um código de 6 dígitos e envia por e-mail.
  # Validações:
  #   - Verificar se email existe no banco
  #   - Se não existir, retornar success: true mesmo assim (segurança: não revelar se email existe)
  #   - Invalidar tokens anteriores do mesmo usuário (marcar como used=true)
  #   - Gerar código de 6 dígitos aleatório (apenas numéricos)
  #   - Salvar na tabela PasswordResetToken com expiresAt = now + 15 minutos
  #   - Enviar e-mail com o código (ver seção 6)
  requestPasswordReset(email: String!): MutationResponse!

  # Redefinir a senha usando o código recebido.
  # Validações:
  #   - Verificar se o token existe, não foi usado e não expirou
  #   - Hashear a nova senha com bcrypt
  #   - Atualizar a senha do usuário
  #   - Marcar o token como used=true
  #   - Retornar sucesso ou erro apropriado
  resetPassword(input: ResetPasswordInput!): MutationResponse!
}
```

---

## 4. Detalhes da Autenticação JWT

- **Biblioteca**: `jsonwebtoken` (npm)
- **Payload do JWT**: `{ userId: string }`
- **Secret**: Usar variável de ambiente `JWT_SECRET`
- **O JWT NÃO expira** — não passar `expiresIn` no `jwt.sign()`
- **Formato no header**: `Authorization: Bearer <token>`
- **Middleware/Guard**: Criar um middleware que extrai o token do header, decodifica e injeta o `userId` no context do GraphQL resolver. Se o token for inválido, lançar erro `"Não autorizado."`

Exemplo de implementação sugerida:

```typescript
// src/utils/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET); // Sem expiresIn
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

export function getUserIdFromContext(context: any): string {
  if (!context.userId) {
    throw new Error("Não autorizado.");
  }
  return context.userId;
}
```

---

## 5. Upload de Imagens (sem S3 — sistema de arquivos local)

Como estamos na fase inicial de desenvolvimento, **NÃO usar S3**. Salvar as imagens diretamente no file system do servidor.

### Estratégia:

1. **Diretório**: Criar pasta `uploads/logos/` na raiz do projeto backend
2. **Nomear**: Usar UUID como nome do arquivo para evitar conflitos. Ex: `uploads/logos/550e8400-e29b.png`
3. **Servir estáticos**: Configurar o servidor para servir a pasta `uploads/` como estáticos
4. **Salvar no banco**: Armazenar o path relativo no campo `logoUrl`. Ex: `/uploads/logos/550e8400-e29b.png`

### Implementação sugerida:

```typescript
// Para o scalar Upload, usar a lib "graphql-upload"
// npm install graphql-upload @types/graphql-upload

import { createWriteStream, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { v4 as uuid } from "uuid";

const UPLOAD_DIR = join(process.cwd(), "uploads", "logos");

// Criar diretório se não existir
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function saveFile(file: any): Promise<string> {
  const { createReadStream, filename } = await file;
  const ext = filename.split(".").pop();
  const newFilename = `${uuid()}.${ext}`;
  const filePath = join(UPLOAD_DIR, newFilename);

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream();
    const writeStream = createWriteStream(filePath);
    stream.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return `/uploads/logos/${newFilename}`;
}
```

### Configuração do servidor (Express ou similar):

```typescript
// Se estiver usando Express com Apollo Server:
app.use("/uploads", express.static(join(process.cwd(), "uploads")));
```

### Variáveis de ambiente necessárias:

```env
# .env
UPLOAD_MAX_SIZE=2097152  # 2MB em bytes
```

### No frontend, a URL completa da imagem será:

```
http://localhost:4000/uploads/logos/550e8400-e29b.png
```

Configure a variável `NEXT_PUBLIC_API_URL` no frontend para compor a URL completa quando necessário.

---

## 6. Envio de E-mail (Recuperação de Senha)

Para a fase de desenvolvimento, usar o **Nodemailer** com uma das seguintes opções:

### Opção A (Recomendada): Usar Mailtrap ou Ethereal para testes

```bash
npm install nodemailer @types/nodemailer
```

```typescript
// src/utils/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  userName: string,
): Promise<void> {
  await transporter.sendMail({
    from: '"Repurchase" <noreply@repurchase.com>',
    to,
    subject: "Código de recuperação de senha - Repurchase",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #E91E63, #FF4081); color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px;">R</div>
          <h2 style="color: #1A1A2E; margin-top: 16px;">Repurchase</h2>
        </div>
        
        <p style="color: #6B7280;">Olá, <strong>${userName}</strong>!</p>
        <p style="color: #6B7280;">Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; padding: 16px 32px; background: #F8F9FC; border-radius: 12px; border: 2px dashed #E5E7EB;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #E91E63;">${code}</span>
          </div>
        </div>
        
        <p style="color: #6B7280; font-size: 14px;">Este código expira em <strong>15 minutos</strong>.</p>
        <p style="color: #9CA3AF; font-size: 12px;">Se você não solicitou esta alteração, ignore este e-mail.</p>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2025 Repurchase. Todos os direitos reservados.</p>
      </div>
    `,
  });
}
```

### Variáveis de ambiente para e-mail:

```env
# .env
SMTP_HOST=sandbox.smtp.mailtrap.io   # Ou smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=seu_user
SMTP_PASS=sua_senha
```

---

## 7. Geração do Código de Recuperação

```typescript
// src/utils/code-generator.ts
export function generateResetCode(): string {
  // Gera um código de 6 dígitos numéricos aleatórios
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

---

## 8. Variáveis de Ambiente Completas (.env)

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/repurchase_local"

# JWT
JWT_SECRET="uma-chave-secreta-forte-aqui"

# SMTP (E-mail)
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="seu_user"
SMTP_PASS="sua_senha"

# Upload
UPLOAD_MAX_SIZE=2097152
```

---

## 9. Validações Obrigatórias nos Resolvers

### registerUser

- `email`: formato válido de email, único no banco
- `password`: mínimo 8 caracteres
- `phone`: apenas dígitos, 10 ou 11 caracteres
- `firstName` e `lastName`: não vazios

### loginUser

- Verificar se email existe
- Comparar senha com bcrypt.compare
- Retornar erro genérico "Credenciais inválidas." para email não encontrado OU senha errada

### createCompany

- Rota autenticada (requer JWT)
- `cnpj`: exatamente 14 dígitos, único no banco
- `segment`: deve ser "restaurant" ou "e-commerce"
- `cep`: exatamente 8 dígitos
- `state`: exatamente 2 caracteres
- Atualizar `user.companyId` após criar a company

### uploadCompanyLogo

- Rota autenticada
- Validar que o `companyId` pertence ao usuário autenticado
- Validar tipo do arquivo (PNG, JPG, SVG)
- Validar tamanho máximo (2MB)
- Salvar no file system e atualizar `company.logoUrl`

### requestPasswordReset

- Se email não existe, retornar `{ success: true, message: "Se o e-mail estiver cadastrado, você receberá o código." }` (não revelar existência do email)
- Invalidar tokens anteriores do mesmo usuário
- Gerar código de 6 dígitos
- Salvar com expiração de 15 minutos
- Enviar e-mail

### resetPassword

- Verificar se token existe e não foi usado
- Verificar se não expirou (`expiresAt > now`)
- Hashear nova senha
- Atualizar senha do User
- Marcar token como `used = true`
- Retornar erro "Código inválido ou expirado." se inválido

---

## 10. Estrutura de Pastas Sugerida para o Backend

```
src/
├── graphql/
│   ├── schema.ts           # Type definitions (SDL)
│   ├── resolvers/
│   │   ├── index.ts        # Merge de resolvers
│   │   ├── auth.resolver.ts    # registerUser, loginUser, me
│   │   ├── company.resolver.ts # createCompany, uploadCompanyLogo
│   │   └── password.resolver.ts # requestPasswordReset, resetPassword
│   └── context.ts          # Tipo e factory do context (com userId)
├── utils/
│   ├── auth.ts             # JWT helpers (generateToken, verifyToken)
│   ├── email.ts            # Nodemailer transporter + sendPasswordResetEmail
│   └── code-generator.ts   # generateResetCode
├── prisma/
│   └── schema.prisma
├── uploads/
│   └── logos/              # Imagens dos logos (gitignore)
├── server.ts               # Setup do Apollo Server + Express
└── .env
```

---

## 11. Checklist de Implementação

1. [ ] Atualizar schema Prisma com os models `User`, `Company`, `PasswordResetToken`
2. [ ] Rodar `prisma migrate dev` para criar as tabelas
3. [ ] Implementar utilitários JWT (`utils/auth.ts`)
4. [ ] Implementar utilitário de e-mail (`utils/email.ts`)
5. [ ] Implementar gerador de código (`utils/code-generator.ts`)
6. [ ] Criar o schema GraphQL com types, inputs, queries e mutations
7. [ ] Implementar resolver `registerUser` com hash bcrypt + geração de JWT
8. [ ] Implementar resolver `loginUser` com verificação bcrypt + JWT
9. [ ] Implementar resolver `me` (query autenticada)
10. [ ] Implementar resolver `createCompany` (autenticado)
11. [ ] Implementar resolver `uploadCompanyLogo` com save local + scalar Upload
12. [ ] Implementar resolver `requestPasswordReset` com envio de e-mail
13. [ ] Implementar resolver `resetPassword`
14. [ ] Configurar servir arquivos estáticos da pasta `uploads/`
15. [ ] Testar todos os fluxos E2E

---

## 12. Respostas de Erro Esperadas pelo Frontend

O frontend trata os erros do GraphQL usando o `message` do erro. Portanto, retornar mensagens claras em português:

| Situação                          | Mensagem de Erro                                       |
| --------------------------------- | ------------------------------------------------------ |
| Email já cadastrado (register)    | "Este e-mail já está cadastrado."                      |
| Credenciais inválidas (login)     | "Credenciais inválidas."                               |
| CNPJ já cadastrado                | "Este CNPJ já está cadastrado."                        |
| Token JWT inválido                | "Não autorizado."                                      |
| Segmento inválido                 | "Segmento inválido. Use 'restaurant' ou 'e-commerce'." |
| Senha muito curta                 | "A senha deve ter no mínimo 8 caracteres."             |
| Código de reset inválido/expirado | "Código inválido ou expirado."                         |
| Arquivo muito grande              | "O arquivo deve ter no máximo 2MB."                    |
| Formato de arquivo inválido       | "Formato inválido. Use PNG, JPG ou SVG."               |
