import type { Client } from '../../client/interfaces/Client';
import type { OpenApi } from './interfaces/OpenApi';
import { getModels } from './parser/getModels';
import { getServer } from './parser/getServer';
import { getServices } from './parser/getServices';
import { getServiceVersion } from './parser/getServiceVersion';

/**
 * Parse the OpenAPI specification to a Client model that contains
 * all the models, services and schema's we should output.
 * @param apiVersions All API calendar versions that are available at this point in time.
 * @param openApi The OpenAPI spec  that we have loaded from disk.
 */
export const parse = (apiVersions: string[], openApi: OpenApi): Client => {
    const version = getServiceVersion(openApi.info.version);
    const server = getServer(openApi);
    const models = getModels(openApi);
    const services = getServices(apiVersions, openApi);

    return { version, server, models, services };
};
