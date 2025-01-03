import { Model } from '../../../client/interfaces/Model';
import type { Operation } from '../../../client/interfaces/Operation';
import { OperationParameter } from '../../../client/interfaces/OperationParameter';
import type { OperationParameters } from '../../../client/interfaces/OperationParameters';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiOperation } from '../interfaces/OpenApiOperation';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { getOperationErrors } from './getOperationErrors';
import { getOperationExplicitAcceptHeader } from './getOperationExplicitAcceptHeader';
import { getOperationImplicitAcceptHeader } from './getOperationImplicitAcceptHeader';
import { getOperationName } from './getOperationName';
import { getOperationParameters } from './getOperationParameters';
import { getOperationRequestBody } from './getOperationRequestBody';
import { getOperationResponseHeader } from './getOperationResponseHeader';
import { getOperationResponses } from './getOperationResponses';
import { getOperationResponseType } from './getOperationResponseType';
import { getOperationResults } from './getOperationResults';
import { getRef } from './getRef';
import { getServiceName } from './getServiceName';
import { sortByRequired, sortModelByRequired } from './sortByRequired';

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
        responseType: null,
    };

    // We want to treat query parameters and body request as a single object with all the parameters
    // inside. This allows for better and more concise usage (named parameters) for our clients. We are
    // aware this makes names between query an request parameters cannot be duplicate, which is a
    // possibility. However, we currently don't have this case and agreed on avoiding in the future
    // for the sake of improving our clients interface. Extract the query params and the request body
    // (if it exists) and join them accordingly in a new dataParameter object.
    const dataParameter: OperationParameter = {
        // value here is actually ignore, we just need to provide a valid one
        in: 'query',
        export: 'interface',
        prop: 'data',
        name: 'data',
        type: 'any',
        base: 'any',
        template: null,
        link: null,
        description: 'Request data',
        default: undefined,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
        mediaType: null,
    };

    // Parse the operation parameters (path, body, etc). Query parameters are not included here
    const parameters = op.parameters ? getOperationParameters(openApi, op.parameters) : undefined;
    if (parameters) {
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

    if (op.requestBody) {
        const requestBodyDef = getRef<OpenApiRequestBody>(openApi, op.requestBody);
        const requestBody = getOperationRequestBody(openApi, requestBodyDef);
        operation.imports.push(...requestBody.imports);
        operation.parametersBody = requestBody;
        dataParameter.properties.push(...requestBody.properties);
        if (requestBody.export === 'array') {
            // if the requestBody is an array, there are no properties to showcase. We instead want to
            // use the whole model as the parameter
            dataParameter.properties.push(requestBody);
        } else if (requestBody.export === 'one-of' || requestBody.export === 'all-of') {
            // if the requestBody is a one-of/all-of, the properties cannot be used since they have no
            // names. Instead we want to use the whole model as the parameter.
            dataParameter.properties = [requestBody];
        }
        dataParameter.isRequired = requestBody.isRequired ? true : dataParameter.isRequired;
    }

    // Add query parameters after path and body parameters are processed.
    if (parameters) {
        const queryParams = parameters.parameters.filter(p => p.in === 'query');
        if (queryParams.length !== 0) {
            dataParameter.properties.push(...queryParams);
            dataParameter.isRequired = !!queryParams.find(p => p.isRequired) ? true : dataParameter.isRequired;
        }
    }

    // Parse the operation responses.
    if (op.responses) {
        const operationResponses = getOperationResponses(openApi, op.responses);
        const operationResults = getOperationResults(operationResponses);
        operation.errors = getOperationErrors(operationResponses);
        operation.responseHeader = getOperationResponseHeader(operationResults);
        operation.responseType = getOperationResponseType(operationResults);

        // Add 'Accept' header, if not set
        const explicitAcceptHeader = parameters ? getOperationExplicitAcceptHeader(parameters.parametersHeader) : null;
        if (!explicitAcceptHeader) {
            // if `explicitAcceptHeader` exists, there's no need to add it
            const acceptHeader = getOperationImplicitAcceptHeader(operationResults);
            if (acceptHeader) {
                const acceptHeaderOperationParameter: OperationParameter = {
                    in: 'header',
                    prop: 'Accept',
                    export: 'interface',
                    name: `'${acceptHeader}'`,
                    type: 'any',
                    base: 'any',
                    template: null,
                    link: null,
                    description: null,
                    isDefinition: false,
                    isReadOnly: false,
                    isRequired: true,
                    isNullable: false,
                    imports: [],
                    enum: [],
                    enums: [],
                    properties: [],
                    mediaType: null,
                };
                operation.parametersHeader.push(acceptHeaderOperationParameter);
            }
        }

        operationResults.forEach(operationResult => {
            operation.results.push(operationResult);
            operation.imports.push(...operationResult.imports);
        });
    }

    if (dataParameter.properties.length !== 0) {
        operation.parameters.push(dataParameter);
        dataParameter.properties = dataParameter.properties.sort(sortModelByRequired);
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
