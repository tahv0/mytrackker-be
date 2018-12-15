import { BatteryLevelResolver } from "./../entity/BatteryLevel";
import { PositionResolver } from "./../entity/Position";
import * as express from "express";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";

export async function createServer() {
  // Construct a schema, using GraphQL schema language
  const schema = await buildSchema({
    resolvers: [BatteryLevelResolver, PositionResolver],
    validate: false
  });

  const server = new ApolloServer({ schema });

  const app = express();
  server.applyMiddleware({ app });
  return { app, server };
}
