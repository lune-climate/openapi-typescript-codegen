import type { OperationResponse } from '../../../client/interfaces/OperationResponse';

export const getOperationResponseType = (
    operationResponses: OperationResponse[]
): 'arraybuffer' | 'document' | 'json' | 'text' | 'stream' | 'blob' | null => {
    const operationResponse = operationResponses.find(operationResponses => {
        return operationResponses.in === 'response';
    });
    if (operationResponse) {
        return operationResponse.format === 'binary' ? 'blob' : null; // Other cases: not implemented
    }
    return null;
};
