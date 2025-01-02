import type { OperationResponse } from '../../../client/interfaces/OperationResponse';

export const getOperationImplicitAcceptHeader = (operationResponses: OperationResponse[]): string | null => {
    const operationResponse = operationResponses.find(operationResponses => {
        return operationResponses.in === 'response';
    });
    return operationResponse ? operationResponse.mediaType : null;
};
