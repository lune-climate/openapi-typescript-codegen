import type { Model } from '../client/interfaces/Model';

export const convertToCamelCase = (modelName: string): string => {
    return modelName.replace(/_(.)/g, function (_match, p1) {
        return p1.toUpperCase();
    });
};
