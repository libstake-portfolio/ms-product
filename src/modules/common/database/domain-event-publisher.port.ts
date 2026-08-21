import { DomainEvent } from '@common/base/domain-event';

export const DOMAIN_EVENT_PUBLISHER = Symbol('DOMAIN_EVENT_PUBLISHER');

/**
 * Takes the events a committed transaction produced and sends them on their way.
 */
export abstract class DomainEventPublisher {
    public abstract publishAll(events: DomainEvent[]): Promise<void>;
}
