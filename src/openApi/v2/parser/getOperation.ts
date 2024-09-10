import { Model } from '../../../client/interfaces/Model';
import type { Operation } from '../../../client/interfaces/Operation';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import { getOperationErrors } from './getOperationErrors';
import { getOperationName } from './getOperationName';
import { getOperationParameters } from './getOperationParameters';
import { getOperationResponseHeader } from './getOperationResponseHeader';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResults } from './getOperationResults';
import { getServiceName } from './getServiceName';
import { sortByRequired } from './sortByRequired';

export const getOperation = (
    openApi: OpenApi,
    url: string,
    method: string,
    tag: string,
    op: OpenApiOperation,
    pathParams: OperationParameters
): Operation => {
    const serviceName = getServiceName(tag);
    const operationName = getOperationName(url, method, op.operationId);

    // Create a new operation object for this method.
    const operation: Operation = {
        service: serviceName,
        name: operationName,
        summary: op.summary || null,
        description: op.description || null,
        deprecated: op.deprecated === true,
        method: method.toUpperCase(),
        path: url,
        parameters: [...pathParams.parameters],
        parametersPath: [...pathParams.parametersPath],
        parametersQuery: [...pathParams.parametersQuery],
        parametersForm: [...pathParams.parametersForm],
        parametersHeader: [...pathParams.parametersHeader],
        parametersCookie: [...pathParams.parametersCookie],
        parametersBody: pathParams.parametersBody,
        imports: [],
        errors: [],
        results: [],
        responseHeader: null,
    };

    // Parse the operation parameters (path, query, body, etc).
    if (op.parameters) {
        const parameters = getOperationParameters(openApi, op.parameters);

        // We want to treat query parameters as a single object with all the parameters inside. This
        // allows for better and more concise usage (named parameters). For that, extract them from
        // the parameters, create a fake operation for them and addem them individually as single object
        const queryParams = parameters.parameters.filter(p => p.in === 'query');
        if (queryParams.length !== 0) {
            const queryParamsObject: OperationParameter = {
                in: 'query',
                export: 'interface',
                prop: 'queryParams',
                name: 'queryParams',
                type: 'any',
                base: 'any',
                template: null,
                link: null,
                description: null,
                default: undefined,
                isDefinition: false,
                isReadOnly: false,
                isRequired: !!queryParams.find(p => p.isRequired),
                isNullable: !!!queryParams.find(p => !p.isNullable),
                imports: [],
                enum: [],
                enums: [],
                properties: queryParams,
                mediaType: null,
            };

            operation.parameters.push(queryParamsObject);
        }

        const newParams = parameters.parameters.filter(p => p.in !== 'query');
        operation.imports.push(...parameters.imports);
        operation.parameters.push(...newParams);
        operation.parametersPath.push(...parameters.parametersPath);
        operation.parametersQuery.push(...parameters.parametersQuery);
        operation.parametersForm.push(...parameters.parametersForm);
        operation.parametersHeader.push(...parameters.parametersHeader);
        operation.parametersCookie.push(...parameters.parametersCookie);
        operation.parametersBody = parameters.parametersBody;
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(openApi, op.responses);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);

        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }

    operation.parameters = operation.parameters.sort(sortByRequired);
    // Add an options object parameter for options on the methods themselves. Currently allow an account
    // override that can use `Lune-Account` header to override target account on a per endpoint basis.
    operation.parameters.push({
        in: 'query',
        export: 'interface',
        prop: 'options',
        name: 'options',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: 'Additional operation options',
        default: undefined,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [
            {
                export: 'generic',
                name: 'accountId',
                type: 'string',
                base: 'string',
                template: null,
                link: null,
                description: 'Account Id to be used to perform the API call',
                default: undefined,
                isDefinition: false,
                isReadOnly: false,
                isRequired: false,
                isNullable: false,
                imports: [],
                enum: [],
                enums: [],
                properties: [],
            } as Model,
        ],
        mediaType: null,
    });

    return operation;
};
