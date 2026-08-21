import { AsyncLocalStorage } from 'node:async_hooks';

import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { DomainEvent } from '@common/base/domain-event';
import { TransactionRequiredException } from '@common/errors/transaction-required.exception';

import { DOMAIN_EVENT_PUBLISHER, DomainEventPublisher } from './domain-event-publisher.port';
import { TransactionRunner } from './transaction-runner.port';

interface TransactionScope {
    manager: EntityManager;
    events: DomainEvent[];
}

@Injectable()
export class TransactionContext implements TransactionRunner {
    private readonly storage = new AsyncLocalStorage<TransactionScope>();

    public constructor(
        private readonly dataSource: DataSource,
        @Inject(DOMAIN_EVENT_PUBLISHER)
        private readonly publisher: DomainEventPublisher,
    ) {}

    // The manager of the running transaction, or the default one when none is running.
    public get manager(): EntityManager {
        return this.storage.getStore()?.manager ?? this.dataSource.manager;
    }

    /**
     * Returns the manager of the running transaction, refusing to fall back to the default one.
     *
     * Writes go through here so that a caller who forgot the boundary fails loudly instead of
     * committing on its own.
     */
    public requireTransaction(operation: string): EntityManager {
        return this.requireScope(operation).manager;
    }

    /**
     * Holds events until the transaction that produced them commits.
     */
    public collect(events: DomainEvent[]): void {
        this.requireScope('Collecting domain events').events.push(...events);
    }

    /**
     * Runs the callback in a transaction, joining the surrounding one when there already is one.
     * Events collected along the way are published once the outermost transaction has committed.
     *
     * ! - Binds a manager to everything the callback awaits, so repositories called inside write
     *     to that transaction without being handed anything.
     */
    public async run<T>(fn: () => Promise<T>): Promise<T> {
        // A second transaction would take its own connection and wait on locks the outer one holds.
        if (this.storage.getStore()) return fn();

        const events: DomainEvent[] = [];
        const result = await this.dataSource.transaction(manager => this.storage.run({ manager, events }, fn));

        // The single place events leave the boundary, and the only place able to see all of them at once.
        await this.publisher.publishAll(events);

        return result;
    }

    private requireScope(operation: string): TransactionScope {
        const scope = this.storage.getStore();
        if (!scope) throw new TransactionRequiredException(operation);

        return scope;
    }
}
