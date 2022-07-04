import { Model } from '../../../client/interfaces/Model';
import type { OperationParameter } from '../../../client/interfaces/OperationParameter';

export const sortByRequired = (a: OperationParameter, b: OperationParameter): number => {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue) return -1;
    if (bNeedsValue && !aNeedsValue) return 1;
    return 0;
};

export const sortModelByRequired = (a: Model, b: Model): number => {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue) return -1;
    if (bNeedsValue && !aNeedsValue) return 1;
    return 0;
};
