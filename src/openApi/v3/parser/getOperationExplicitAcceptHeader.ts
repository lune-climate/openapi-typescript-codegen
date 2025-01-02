import type { OperationParameter } from '../../../client/interfaces/OperationParameter';

export const getOperationExplicitAcceptHeader = (operationParameters: OperationParameter[]): string | null => {
    const header = operationParameters.find(operationParameter => {
        return operationParameter.in === 'header' && operationParameter.name.toLowerCase() === 'accept';
    });
    return header ? header.name : null;
};
