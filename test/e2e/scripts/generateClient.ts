import { generate as __generate } from '../../../';

export const generateClient = async (
    dir: string,
    version: string,
    client: 'fetch' | 'xhr' | 'node' | 'axios' | 'angular',
    useOptions: boolean = false,
    useUnionTypes: boolean = false,
    clientName?: string
) => {
    await __generate({
        input: `./test/spec/${version}.json`,
        output: `./test/e2e/generated/${dir}/`,
        apiVersion: '2024-08-08',
        httpClient: client,
        useOptions,
        useUnionTypes,
        clientName,
    });
};
