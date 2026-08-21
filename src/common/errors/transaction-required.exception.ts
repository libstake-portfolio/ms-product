import { InternalServerErrorException } from '@nestjs/common';

/**
 * Raised when a write is attempted outside a transaction.
 */
export class TransactionRequiredException extends InternalServerErrorException {
    public constructor(operation: string) {
        super(`${operation} must run inside a transaction.`);
    }
}
