# API, Next.js, Apollo, GraphQL, Prisma, React, Auth

Репозиторий для изучения создания API в связке Next.js, Apollo, GraphQL, Prisma, React, Type Script для тестирования работы с БД и защиты от выполнения функций на клиенте от не авторизированных пользователей. JavaScript функция не выполняется без авторизации, а если JavaScript код как то миновали то есть защита и на стороне сервера.

Для демонстрации используется логин `admin` и пароль `password`. Так будут получены токены. Загрузка информации о блоке не требует авторизации, а для изменения требует.

Прилагается карта знаний [learn_api_graphql_apollo_prisma_next_auth.graphml](learn_api_graphql_apollo_prisma_next_auth.graphml) (в состоянии "как есть") которую можно открыть программой **yWorks yEd**.

[Другой обучающий пример — GitHub](https://github.com/nakaakist/next-ts-prisma-graphql-example)

## Запуск и локальная разработка

1. Создана папка `learn_api_graphql_apollo_prisma_next_auth` в корневой директории пользователя для храниения БД.
2. Запущен Docker Desktop и выполнена команда `bun dev:docker` для поднятия PostgreSQL БД в контейнере. Нужно время перед выполнением следующей команды, иначе сервер базы данных может быть не доступен.
3. Выполнена команда `bun dev:db` для первоначальной миграции БД, то есть создания таблиц по схеме, а также генерация ORM Prisma.
4. Выполнена команда `bun dev` для запуска приложения на `http://localhost:3000/`, а по `http://localhost:3000/api/graphql` будет доступен Sandbox Apollo Server.


## API и использование

Предполагается использование Postman (или Sandbox Apollo Server) для запросов.

Нужно использовать метод POST к `http://localhost:3000/api/graphql`.

### Создание блоков

Сначала создадим несколько блоков несколькими запросами такого вида. Тут заполняется только контент, связи будут установлены позже.

```graphql
mutation {
  addBlock(content: "Блок 1") {
    id
    content
    from {
      id
      content
    }
    to {
      id
      content
    }
  }
}
```

### Получение блоков

Посмотрим все блоки которые у нас получились. Запомним идентификаторы для установления связей.

```graphql
query {
    blocks {
        id
        content
        from {
            id
        }
        to {
            id
        }
    }
}
```

### Добавление связей

Графовая БД такая как GraphQL имеет собственные функции связи по идентификатору, по этому часть функционала реализовывать не нужно. Так же поведение отличается от релеационных БД и собственного связывания, результат может быть не ожиданным, но логичным, так работает GraphQL.

Добавим несколько связей запросом такого вида. То есть **от** какого блока **к** какому.

```graphql
mutation {
    addToBlockTo(id: "6c68210c-555e-4b87-98a9-3575eb674d40", toId: "d7790ff5-fd58-4260-97cb-453def581bb7") {
        id
        content
        to {
            id
            content
        }
    }
}
```

### Изменение связей и основной способ использования приложения

Эта возможность и реализована в интерфейсе. Для изменения используется "GraphQL query" и "GraphQL variables"

Запрос
```graphql
mutation ($id: ID!, $content: String!) {
    updateBlockContent(id: $id, content: $content) {
        id
        content
    }
}
```

Переменные
```json
{
    "id": "6c68210c-555e-4b87-98a9-3575eb674d40",
    "content": "Блок 1. Добавленный контент"
}
```

- В интерфейсе можно попробовать ввести идентификатор блока запросить его контент. Он должен успешно появиться в поле ввода контента.
- Затем попытаться его изменить без авторизации. Сделать это не получится. Тоже самое будет через Postman если нет токена. И так же случиться с отдельной защищённой страницей (оранжевая кнопка-ссылка).
- После авторизации функция сработает и/или будет ответ от сервера и изменение будет успешным. Так же можно будет перейти на секретную страницу

## Баги

- Вместо приложения показывается ошибка с `useReducer`. Нужно перезапустить приложение из консоли, что бы работало. Возможно это особенности новой версии Node.js. Возможно это связано с опцией Turbopack при команде `next dev --turbopack` с ней ошибка возникает чаще.

## Настройки Next.js при создании приложения

- `bunx create-next-app@latest . --use-bun`
  - √ Would you like to use TypeScript? — Yes
  - √ Would you like to use ESLint? — Yes
  - √ Would you like to use Tailwind CSS? — Yes
  - √ Would you like to use `src/` directory? — Yes
  - √ Would you like to use App Router? (recommended) — Yes
  - √ Would you like to customize the default import alias (@/\*)? — No
- `bunx @next/codemod@canary upgrade latest`
  - √ Do you prefer to stay on React 18? Since you're using both pages/ and app/, we recommend upgrading React to use a consistent version throughout your app — No
  - √ Enable Turbopack for next dev? — Yes
  - √ The following codemods are recommended for your upgrade. Select the ones to apply — `(v15.0.0-canary.171) next-async-request-api`
  - √ Would you like to run the React 19 upgrade codemod? — Yes
  - √ Would you like to run the React 19 Types upgrade codemod? — Yes
  - √ Is your app deployed to Vercel? (Required to apply the selected codemod) — Yes