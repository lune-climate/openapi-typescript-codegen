import { getMappedType } from './getMappedType';

describe('getMappedType', () => {
    it('should map types to the basics', () => {
        expect(getMappedType('file')).toEqual({ type: 'binary', isPrimitive: true });
        expect(getMappedType('string')).toEqual({ type: 'string', isPrimitive: true });
        expect(getMappedType('date')).toEqual({ type: 'string', isPrimitive: true });
        expect(getMappedType('date-time')).toEqual({ type: 'string', isPrimitive: true });
        expect(getMappedType('float')).toEqual({ type: 'number', isPrimitive: true });
        expect(getMappedType('double')).toEqual({ type: 'number', isPrimitive: true });
        expect(getMappedType('short')).toEqual({ type: 'number', isPrimitive: true });
        expect(getMappedType('int')).toEqual({ type: 'number', isPrimitive: true });
        expect(getMappedType('boolean')).toEqual({ type: 'boolean', isPrimitive: true });
        expect(getMappedType('any')).toEqual({ type: 'any', isPrimitive: true });
        expect(getMappedType('object')).toEqual({ type: 'any', isPrimitive: true });
        expect(getMappedType('void')).toEqual({ type: 'void', isPrimitive: true });
        expect(getMappedType('null')).toEqual({ type: 'null', isPrimitive: true });
        expect(getMappedType('unknown')).toEqual(undefined);
        expect(getMappedType('')).toEqual(undefined);
    });
});
