import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { join } from 'node:path';
import { addResolversToSchema } from '@graphql-tools/schema'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Определяем перменную __dirname так как её нет в текущем контексте
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = [
  { id: "1", content: "Блок 1", to: ["2"]},
  { id: "4", content: "Блок 4" },
  { id: "2", content: "Блок 2", from: ["1", "4"], to: ["3"] },
  { id: "3", content: "Блок 3", from: ["2"], to: ["1"] },
]

const resolvers = {
  Query: {
    hello: () => 'world',
    blocks: () => db,
    block: (_: any, args: any) => db.find(block => args.id == block.id),
  },
  Block: {
    from: (parent: any) => db.filter(block => parent.from?.includes(block.id)),
    to: (parent: any) => db.filter(block => parent.to?.includes(block.id)),
  }
}

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