export const TRANSACTION_RUNNER = Symbol('TRANSACTION_RUNNER');

/**
 * Marks the boundary a set of writes commits or rolls back together.
 */
export abstract class TransactionRunner {
    public abstract run<T>(fn: () => Promise<T>): Promise<T>;
}
