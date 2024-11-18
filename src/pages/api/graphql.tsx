import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { join } from 'node:path'
import { addResolversToSchema } from '@graphql-tools/schema'
import { PrismaClient, Block } from '@prisma/client'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Определяем перменную __dirname так как её нет в текущем контексте
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    hello: () => 'world',
    // Получение всех блоков
    blocks: async (): Promise<Block[]> => {
      return await prisma.block.findMany({
        include: {
          from: true,
          to: true,
        },
      });
    },
    // Получение конкретного блока по ID
    block: async (_: undefined, { id }: { id: string }): Promise<Block | null> => {
      return await prisma.block.findUnique({
        where: { id },
        include: {
          from: true,
          to: true,
        },
      });
    },
  },
  Mutation: {
    // Добавление нового блока
    addBlock: async (_: undefined, { content }: { content: string }): Promise<Block> => {
      return await prisma.block.create({
        data: { content },
      });
    },
    // Обновление контента блока
    updateBlockContent: async (_: undefined, { id, content }: { id: string; content: string }): Promise<Block> => {
      return await prisma.block.update({
        where: { id },
        data: { content },
      });
    },
    // Добавление связи в `from`
    addToBlockFrom: async (_: undefined, { id, fromId }: { id: string; fromId: string }): Promise<Block> => {
      return await prisma.block.update({
        where: { id },
        data: {
          from: {
            connect: { id: fromId },
          },
        },
        include: {
          from: true,
          to: true,
        },
      });
    },
    // Добавление связи в `to`
    addToBlockTo: async (_: undefined, { id, toId }: { id: string; toId: string }): Promise<Block> => {
      return await prisma.block.update({
        where: { id },
        data: {
          to: {
            connect: { id: toId },
          },
        },
        include: {
          from: true,
          to: true,
        },
      });
    },
    // Удаление связи из `from`
    removeFromBlockFrom: async (_: undefined, { id, fromId }: { id: string; fromId: string }): Promise<Block> => {
      return await prisma.block.update({
        where: { id },
        data: {
          from: {
            disconnect: { id: fromId },
          },
        },
        include: {
          from: true,
          to: true,
        },
      });
    },
    // Удаление связи из `to`
    removeFromBlockTo: async (_: undefined, { id, toId }: { id: string; toId: string }): Promise<Block> => {
      return await prisma.block.update({
        where: { id },
        data: {
          to: {
            disconnect: { id: toId },
          },
        },
        include: {
          from: true,
          to: true,
        },
      });
    },
  },
  Block: {
    from: async (parent: Block): Promise<Block[]> =>
      await prisma.block.findMany({
        where: {
          to: {
            some: { id: parent.id },
          },
        },
      }),
    to: async (parent: Block): Promise<Block[]> =>
      await prisma.block.findMany({
        where: {
          from: {
            some: { id: parent.id },
          },
        },
      }),
  },
};

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
})

const schemaWithResolvers = addResolversToSchema({
  schema,
  resolvers,
})

const server = new ApolloServer({
  schema: schemaWithResolvers
});

export default startServerAndCreateNextHandler(server);