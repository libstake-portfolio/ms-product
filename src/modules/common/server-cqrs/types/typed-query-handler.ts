import { TypedQuery } from './typed-query';

type QueryResult<T> = T extends TypedQuery<infer R> ? R : never;

/**
 * Handler contract binding the return type to the query it handles.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TypedQueryHandler<T extends TypedQuery<any>> {
    execute(query: T): Promise<QueryResult<T>>;
}
