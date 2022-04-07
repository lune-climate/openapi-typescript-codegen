interface MappedType {
    type: string;
    isPrimitive: boolean;
}

const TYPE_MAPPINGS = new Map<string, MappedType>([
    ['file', { type: 'binary', isPrimitive: true }],
    ['any', { type: 'any', isPrimitive: true }],
    ['object', { type: 'any', isPrimitive: true }],
    ['array', { type: 'any[]', isPrimitive: true }],
    ['boolean', { type: 'boolean', isPrimitive: true }],
    ['byte', { type: 'number', isPrimitive: true }],
    ['int', { type: 'number', isPrimitive: true }],
    ['integer', { type: 'number', isPrimitive: true }],
    ['float', { type: 'number', isPrimitive: true }],
    ['double', { type: 'number', isPrimitive: true }],
    ['short', { type: 'number', isPrimitive: true }],
    ['long', { type: 'number', isPrimitive: true }],
    ['number', { type: 'number', isPrimitive: true }],
    ['char', { type: 'string', isPrimitive: true }],
    ['date', { type: 'string', isPrimitive: true }],
    ['date-time', { type: 'string', isPrimitive: true }],
    ['password', { type: 'string', isPrimitive: true }],
    ['string', { type: 'string', isPrimitive: true }],
    ['void', { type: 'void', isPrimitive: true }],
    ['null', { type: 'null', isPrimitive: true }],
]);

const FORMAT_MAPPINGS = new Map<string, MappedType>([
    ['binary', { type: 'binary', isPrimitive: true }],
    ['float', { type: 'number', isPrimitive: true }],
    ['date', { type: 'string', isPrimitive: true }],
    ['date-time', { type: 'string', isPrimitive: true }],
]);

/**
 * Get mapped type for given type to any basic Typescript/Javascript type.
 */
export const getMappedType = (type: string, format?: string): MappedType | undefined => {
    if (format === 'binary') {
        return FORMAT_MAPPINGS.get(format);
    }
    return TYPE_MAPPINGS.get(type);
};
