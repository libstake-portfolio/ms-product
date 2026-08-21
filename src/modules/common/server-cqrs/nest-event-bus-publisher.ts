import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { DomainEvent } from '@common/base/domain-event';
import { DomainEventPublisher } from '@modules/common/database/domain-event-publisher.port';

@Injectable()
export class NestEventBusPublisher implements DomainEventPublisher {
    public constructor(private readonly eventBus: EventBus) {}

    public async publishAll(events: DomainEvent[]): Promise<void> {
        if (events.length === 0) return;

        await this.eventBus.publishAll(events);
    }
}
