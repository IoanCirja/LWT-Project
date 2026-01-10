import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@as-integrations/express5';
import cors from "cors";

import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js"

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();

async function start() {
  await server.start();

  app.use(cors());
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  app.listen(4000, () => {
    console.log("Server running at http://localhost:4000/graphql");
  });
}

start();