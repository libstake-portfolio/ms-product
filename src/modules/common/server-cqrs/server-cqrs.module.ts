import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DOMAIN_EVENT_PUBLISHER } from '@modules/common/database/domain-event-publisher.port';

import { NestEventBusPublisher } from './nest-event-bus-publisher';
import { TypedCommandBus } from './typed-command-bus';
import { TypedQueryBus } from './typed-query-bus';

@Global()
@Module({
    imports: [CqrsModule],
    providers: [TypedQueryBus, TypedCommandBus, { provide: DOMAIN_EVENT_PUBLISHER, useClass: NestEventBusPublisher }],
    exports: [CqrsModule, TypedQueryBus, TypedCommandBus, DOMAIN_EVENT_PUBLISHER],
})
export class ServerCqrsModule {}
