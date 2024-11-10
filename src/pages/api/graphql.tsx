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


const resolvers = {
  Query: {
    hello: () => 'world',
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