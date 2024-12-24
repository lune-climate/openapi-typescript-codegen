import type { OperationResponse } from '../../../client/interfaces/OperationResponse';

export const getOperationImplicitAcceptHeader = (operationResponses: OperationResponse[]): string | null => {
    const operationResponse = operationResponses.find(operationResponses => {
        return operationResponses.in === 'response';
    });
    if (operationResponse) {
        return operationResponse.mediaType;
    }
    return null;
};
