import { AnyId } from './any-id';
import { BaseMessage, BaseMessageProps } from './base-message';

export abstract class DomainEvent extends BaseMessage {
    // The aggregate root the event happened to. Code outside the domain groups and orders events by it.
    public readonly aggregateId: AnyId<string>;

    protected constructor(aggregateId: AnyId<string>, props?: BaseMessageProps) {
        super(props);
        this.aggregateId = aggregateId;
    }
}
