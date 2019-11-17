import { createServer, mountServer } from "@arkecosystem/core-http-utils";
import { notFound } from "@hapi/boom";
import { Statistic } from "./entities";

export const startServer = async config => {
    const server = await createServer({
        host: config.host,
        port: config.port,
    });

    // Statistics
    server.route({
        method: "GET",
        path: "/stat/{name}",
        async handler(request, h) {
            const stats = await Statistic.findOne({ name: request.params.name });
            if (stats) {
                return stats.value;
            } else {
                return notFound();
            }
        },
    });

    return mountServer("nOS Storage Server", server);
};
