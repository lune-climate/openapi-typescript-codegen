import type { OperationParameter } from '../../../client/interfaces/OperationParameter';

export const getOperationExplicitAcceptHeader = (operationParameters: OperationParameter[]): string | null => {
    const header = operationParameters.find(operationParameter => {
        return operationParameter.in === 'header' && operationParameter.name.toLowerCase() === 'accept';
    });
    if (header) {
        return header.name;
    }
    return null;
};
