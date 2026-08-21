import { DomainEntity } from './domain-entity';
import { DomainEvent } from './domain-event';

export abstract class AggregateRootEntity extends DomainEntity {
    private readonly events: DomainEvent[] = [];

    // Records what happened without deciding when or how it leaves the process.
    protected record(event: DomainEvent): void {
        this.events.push(event);
    }

    /**
     * Hands over everything recorded so far.
     *
     * ! - Empties the buffer, so a second call returns nothing and the events cannot be handed over twice.
     */
    public pullEvents(): DomainEvent[] {
        return this.events.splice(0, this.events.length);
    }
}
