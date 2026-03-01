# REPURCHASE API - Copilot Instructions

## 📁 Arquitetura do Projeto

Este projeto segue a arquitetura **Domain-Driven Design (DDD)** com TypeScript, GraphQL e padrões específicos de desenvolvimento.

### Estrutura de Pastas

```
src/
├── @types/           # Extensões de tipos TypeScript
├── config/           # Configurações (auth, etc)
├── modules/          # Domínios da aplicação (users, products, etc)
│   └── [domain]/
│       ├── dtos/                    # Data Transfer Objects
│       ├── repositories/            # Interfaces dos repositórios
│       ├── services/                # Lógica de negócio
│       └── infra/
│           ├── prisma/
│           │   ├── entities/        # Entidades GraphQL (type-graphql)
│           │   └── repositories/    # Implementações dos repositórios (Prisma)
│           ├── http/graphql/
│           │   ├── resolvers/       # Resolvers GraphQL
│           │   ├── inputs/          # InputTypes GraphQL
│           │   ├── scalars/         # ObjectTypes de resposta
│           │   └── context/         # Contextos tipados
│           └── middlewares/         # Middlewares do módulo
└── shared/           # Código compartilhado
    ├── container/    # Injeção de dependências (tsyringe)
    ├── database/     # Conexões (Prisma, Redis)
    ├── errors/       # Classes de erro
    ├── infra/http/   # Express app e GraphQL utils
    └── utils/        # Funções utilitárias
prisma/
└── schema.prisma     # Schema do banco de dados (Prisma)
```

## 🔧 Padrões de Código

### Services (Obrigatório)

Todos os services DEVEM seguir este padrão:

```typescript
import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import IUsersRepository from "../repositories/IUsersRepository";

interface IRequestDTO {
  user_id: string;
}

@injectable()
export default class GetUserByIdService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({ user_id }: IRequestDTO): Promise<User> {
    const user = await this.usersRepository.findById(user_id);
    if (!user) {
      throw new AppError("User not found");
    }
    return user;
  }
}
```

**Regras:**

- ✅ Usar `@injectable()` do tsyringe
- ✅ Injetar repositórios com `@inject('NomeRepository')`
- ✅ Usar `async/await` (NUNCA `.then()`)
- ✅ Retornar tipos explícitos
- ✅ Interface para parâmetros de entrada
- ❌ Nunca usar `any` como tipo

### Repositórios

**Interface** (`modules/[domain]/repositories/IUsersRepository.ts`):

```typescript
export default interface IUsersRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  create(data: ICreateUserDTO): Promise<User>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}
```

**Implementação** (`modules/[domain]/infra/prisma/repositories/UsersRepository.ts`):

```typescript
import ICreateUserDTO from "@modules/users/dtos/ICreateUserDTO";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import User from "../entities/User";
import prisma from "@shared/database/prisma";

export default class UsersRepository implements IUsersRepository {
  public async findById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ?? undefined;
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ?? undefined;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    return user;
  }

  public async save(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        active: user.active,
      },
    });

    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  public async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
  }
}
```

### Entidades GraphQL (type-graphql)

Entidades usam apenas decorators do type-graphql:

```typescript
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export default class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  password: string; // Campo sem @Field não é exposto no GraphQL

  @Field()
  active: boolean;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
```

### Resolvers GraphQL

```typescript
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { container } from "tsyringe";
import AuthMiddleware from "../middlewares/authMiddleware";
import RateLimiterMiddleware from "../middlewares/rateLimiterMiddleware";

@Resolver()
export default class UserResolver {
  @Query(() => User)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async getUser(
    @Arg("user_id") user_id: string,
    @Ctx() ctx: IUserContext,
  ): Promise<User> {
    const getUserById = container.resolve(GetUserByIdService);
    return getUserById.execute({ user_id });
  }
}
```

**Regras:**

- ✅ Usar `container.resolve()` para injetar services
- ✅ Proteger rotas com `@UseMiddleware(AuthMiddleware, RateLimiterMiddleware)`
- ✅ Parâmetros GraphQL em `snake_case` — **OBRIGATÓRIO para todos os `@Arg()`, campos de `@InputType()` e propriedades de `@ObjectType()` que correspondem a dados do banco ou da mutation**
- ❌ **NUNCA usar camelCase em parâmetros GraphQL** (ex: `newPassword` ❌ → `new_password` ✅, `firstName` ❌ → `first_name` ✅, `idToken` ❌ → `id_token` ✅)

### Container de Injeção

Registrar repositórios em `shared/container/index.ts`:

```typescript
import { container } from "tsyringe";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import UsersRepository from "@modules/users/infra/prisma/repositories/UsersRepository";

container.registerSingleton<IUsersRepository>(
  "UsersRepository",
  UsersRepository,
);
```

## Tratamento de Erros

**GraphQL Errors:**

```typescript
import AppError from "@shared/errors/AppError";
throw new AppError("User not found");
```

**REST Errors:**

```typescript
import RestAppError from "@shared/errors/RestAppError";
throw new RestAppError("Not found", 404);
```

## 📝 Convenções de Nomenclatura

| Item               | Formato               | Exemplo                |
| ------------------ | --------------------- | ---------------------- |
| Arquivos/Pastas    | PascalCase            | `CreateUserService.ts` |
| Interfaces         | I + PascalCase        | `IUsersRepository`     |
| DTOs               | I + PascalCase + DTO  | `ICreateUserDTO`       |
| Inputs GraphQL     | PascalCase + Input    | `CreateUserInput`      |
| Scalars GraphQL    | PascalCase + Response | `AuthResponse`         |
| Parâmetros GraphQL | snake_case            | `user_id`              |
| Variáveis/Funções  | camelCase             | `getUserById`          |
| Constantes         | UPPER_SNAKE           | `MAX_ATTEMPTS`         |

## 🚀 Comandos de Desenvolvimento

```bash
# Instalar dependências
yarn

# Gerar Prisma Client
yarn prisma:generate

# Criar nova migration Prisma
yarn prisma:migrate

# Aplicar migrations em produção
yarn prisma:migrate:deploy

# Resetar banco de dados (desenvolvimento)
yarn prisma:reset

# Abrir Prisma Studio
yarn prisma:studio

# Iniciar servidor dev
yarn dev:server

# Rodar testes
yarn test

# Build
yarn build
```

## 📋 Checklist para Novas Features

1. [ ] Criar DTO em `modules/[domain]/dtos/`
2. [ ] Criar/atualizar interface do repositório
3. [ ] Implementar repositório Prisma
4. [ ] Criar Service com `@injectable()`
5. [ ] Registrar no container (`shared/container/index.ts`)
6. [ ] Criar Input GraphQL
7. [ ] Criar/atualizar Resolver
8. [ ] Adicionar testes unitários
9. [ ] Atualizar schema.prisma se necessário
10. [ ] Rodar migration (`yarn prisma:migrate`)

## 🔐 Autenticação

O projeto usa JWT com chaves RSA. Gerar chaves:

```bash
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key
```

Headers necessários:

- `Authorization: Bearer <access_token>`
- `x-refresh-token: <refresh_token>` (opcional)

## 🗄️ Banco de Dados

- **Prisma**: ORM principal para todas as operações de banco de dados
- **Redis**: Backend para filas (Bull)

## 📚 Stack Tecnológica

- Node.js 20.x
- TypeScript 4.9+
- Apollo Server Express 2.x
- Type-GraphQL 1.x
- Prisma 5.x
- PostgreSQL
- Redis + Bull (Filas)
- TSyringe 4.x
- JWT (jsonwebtoken)
