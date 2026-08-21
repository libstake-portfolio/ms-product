import { IQuery } from '@nestjs/cqrs';

import { BaseMessage, BaseMessageProps } from '@common/base/base-message';

/**
 * Query carrying the type its handler resolves to.
 */
export abstract class TypedQuery<TResult> extends BaseMessage implements IQuery {
    // Compile-time only. Without it the result type has nowhere to live and cannot be inferred at the bus.
    declare public readonly _resultType?: TResult;

    public constructor(props?: BaseMessageProps) {
        super(props);
    }
}
