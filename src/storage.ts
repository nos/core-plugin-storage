import { Container, Logger } from "@arkecosystem/core-interfaces";
import { Managers } from "@arkecosystem/crypto";
import * as path from "path";
// TypeORM imports
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { defaults } from "./defaults";
import { startServer } from "./server";
import { createHandyClient } from "handy-redis";

// Queue
import queue from "queue";
const qp = queue();
qp.concurrency = 1;

// Entities
import { Statistic, Round, Delegate } from "./entities";

// Core plugins


// Queue job plug-in, all functions that write to db should be wrapped in this.
qp.autostart = true;
export const q = async fn => {
    qp.push(fn);
};

let server;

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "storage",
    async register(container: Container.IContainer, options) {
        const network = Managers.configManager.get("network");
        const dbPath = path.resolve(__dirname, `../../storage/databases/${network.name}.sqlite`);

        container.resolvePlugin<Logger.ILogger>("logger").info(`Registering Storage Plug-in.`);
        container.resolvePlugin<Logger.ILogger>("logger").info(`Storage Plug-in Database Path: ${dbPath}`);

        const redis = createHandyClient();
        await redis.flushdb();

        await createConnection({
            type: "sqlite",
            database: dbPath,
            // Import entities to connection
            entities: [Statistic, Round, Delegate],
            synchronize: true,
        });

        server = await startServer({ host: options.host, port: options.port, cors: options.cors });
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info(`Deregistering Storage Plug-in.`);
        await server.stop();
        container.resolvePlugin<Logger.ILogger>("logger").info(`Closed Storage API Server.`);
        await getConnection().close();
        container.resolvePlugin<Logger.ILogger>("logger").info(`Closed Storage Connection.`);
    },
};
