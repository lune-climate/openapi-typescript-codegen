import { resolve } from 'path';

import type { Client } from '../client/interfaces/Client';
import { writeFile } from './fileSystem';
import { Templates } from './registerHandlebarTemplates';
import { sortModelsByName } from './sortModelsByName';
import { sortServicesByName } from './sortServicesByName';
import { getApiVersions } from './versions';

/**
 * Generate our custom Lune client file. This is the main file used to export everything and that defines
 * how to use our client. It re exports all models and services so they become available at the base level.
 * @param client Client object, containing, models, schemas and services
 * @param templates The loaded handlebar templates
 * @param outputPath Directory to write the generated files to
 */
export const writeLuneClient = async (client: Client, templates: Templates, outputPath: string): Promise<void> => {
    const availableVersions = getApiVersions()
        .map(v => `'${v}'`)
        .join(' | ');
    const templateResult = templates.luneClient({
        models: sortModelsByName(client.models),
        services: sortServicesByName(client.services),
        apiVersions: availableVersions,
    });

    await writeFile(resolve(outputPath, 'luneClient.ts'), templateResult);
};
