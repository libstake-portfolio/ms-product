import { EventBus } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { AnyId } from '@common/base/any-id';
import { DomainEvent } from '@common/base/domain-event';
import { TransactionRequiredException } from '@common/errors/transaction-required.exception';
import { NestEventBusPublisher } from '@modules/common/server-cqrs/nest-event-bus-publisher';

import { TransactionContext } from './transaction-context';

class ThingId extends AnyId<'ThingId'> {}

class ThingHappened extends DomainEvent {
    public constructor(thingId: ThingId) {
        super(thingId);
    }
}

const defaultManager = { name: 'default' } as unknown as EntityManager;
const boundaryManager = { name: 'boundary' } as unknown as EntityManager;

describe('TransactionContext', () => {
    let openedBoundaries: number;
    let published: DomainEvent[][];
    let context: TransactionContext;

    beforeEach(() => {
        openedBoundaries = 0;
        published = [];

        // Stands in for the real thing by doing what it does: hand a manager over, and let a rejection through.
        const dataSource = {
            manager: defaultManager,
            transaction: async (runInTransaction: (manager: EntityManager) => Promise<unknown>) => {
                openedBoundaries += 1;
                return runInTransaction(boundaryManager);
            },
        } as unknown as DataSource;

        const eventBus = { publishAll: async (events: DomainEvent[]) => void published.push(events) } as unknown as EventBus;
        context = new TransactionContext(dataSource, new NestEventBusPublisher(eventBus));
    });

    describe('outside a boundary', () => {
        it('reads through the default manager', () => {
            expect(context.manager).toBe(defaultManager);
        });

        it('refuses a write', () => {
            expect(() => context.requireTransaction('Writing something')).toThrow(TransactionRequiredException);
        });

        it('refuses to take events', () => {
            expect(() => context.collect([new ThingHappened(new ThingId('thing-1'))])).toThrow(TransactionRequiredException);
        });
    });

    describe('inside a boundary', () => {
        it('binds the manager to everything the callback awaits', async () => {
            await context.run(async () => {
                expect(context.manager).toBe(boundaryManager);
                expect(context.requireTransaction('Writing something')).toBe(boundaryManager);
            });
        });

        it('holds events back until the boundary closes', async () => {
            const event = new ThingHappened(new ThingId('thing-1'));

            await context.run(async () => {
                context.collect([event]);
                expect(published).toHaveLength(0);
            });

            expect(published).toEqual([[event]]);
        });

        it('lets nothing out when the boundary fails', async () => {
            const failing = context.run(async () => {
                context.collect([new ThingHappened(new ThingId('thing-1'))]);
                throw new Error('write failed');
            });

            await expect(failing).rejects.toThrow('write failed');
            expect(published).toHaveLength(0);
        });

        it('joins the surrounding boundary instead of opening another', async () => {
            const outer = new ThingHappened(new ThingId('thing-1'));
            const inner = new ThingHappened(new ThingId('thing-2'));

            await context.run(async () => {
                context.collect([outer]);
                await context.run(async () => {
                    expect(context.manager).toBe(boundaryManager);
                    context.collect([inner]);
                });
                expect(published).toHaveLength(0);
            });

            expect(openedBoundaries).toBe(1);
            expect(published).toEqual([[outer, inner]]);
        });

        it('stays quiet when the boundary produced no events', async () => {
            await context.run(async () => undefined);

            expect(published).toHaveLength(0);
        });

        it('returns what the callback returned', async () => {
            await expect(context.run(async () => 'done')).resolves.toBe('done');
        });
    });
});
