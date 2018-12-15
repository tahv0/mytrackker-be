import "reflect-metadata";
import { createConnection } from "typeorm";
import { createServer } from "./api/app";
const config = require('../ormconfig.json');

const connectionConfig = Object.assign(config, {
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  type: process.env.DB_TYPE
});

createConnection(connectionConfig)
  .then(async connection => {
    const { app, server } = await createServer();
    app.listen({ port: process.env.API_PORT || 4000 }, () =>
      console.log(
        `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
      )
    );
  })
  .catch(error => console.log(error));
