import { InternalServerErrorException } from '@nestjs/common';

/**
 * Raised when mapping needs a relation that the query did not fetch.
 */
export class RelationNotLoadedException extends InternalServerErrorException {
    public constructor(ormEntityName: string, relationName: string) {
        super(`${ormEntityName}.${relationName} must be loaded before it can be mapped.`);
    }
}
