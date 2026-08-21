import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { TypedQuery } from './types/typed-query';

/**
 * Query bus that resolves to the type the query declares.
 */
@Injectable()
export class TypedQueryBus {
    public constructor(private readonly queryBus: QueryBus) {}

    public execute<TResult>(query: TypedQuery<TResult>): Promise<TResult> {
        return this.queryBus.execute(query);
    }
}
