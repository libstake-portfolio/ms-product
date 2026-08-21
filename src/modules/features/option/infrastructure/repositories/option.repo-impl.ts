import { Injectable } from '@nestjs/common';
import { EntityManager, FindOptionsRelations } from 'typeorm';

import { TransactionContext } from '@modules/common/database/transaction-context';

import { Option } from '../../domain/models/option.entity';
import { OptionRepository } from '../../domain/repositories/option.repository';
import { OptionId } from '../../types/ids/option-id';
import { OptionMapper } from '../mappers/option.mapper';
import { OptionValueOrmEntity } from '../orm-entities/option-value.orm-entity';
import { OptionOrmEntity } from '../orm-entities/option.orm-entity';

@Injectable()
export class OptionRepositoryImpl implements OptionRepository {
    // Everything the aggregate needs to be rebuilt. Mapping refuses to run on a partial graph.
    private readonly defaultRelations: FindOptionsRelations<OptionOrmEntity> = {
        values: true,
    };

    public constructor(
        private readonly mapper: OptionMapper,
        private readonly context: TransactionContext,
    ) {}

    public async findById(id: OptionId): Promise<Option | null> {
        const result = await this.context.manager.getRepository(OptionOrmEntity).findOne({ where: { id: id.serialize() }, relations: this.defaultRelations });
        if (!result) return null;
        return this.mapper.toDomainEntity(result);
    }

    /**
     * Writes the root and then its values, removing whatever the aggregate no longer holds.
     *
     * ! - Drains the events the aggregate recorded into the surrounding transaction, so the aggregate has none left afterwards.
     */
    public async persist(entity: Option): Promise<OptionId> {
        const manager = this.context.requireTransaction('Persisting an option');

        await this.persistRoot(entity, manager);
        await this.persistValues(entity, manager);

        this.context.collect(entity.pullEvents());
        return entity.id;
    }

    private async persistRoot(entity: Option, manager: EntityManager): Promise<void> {
        const draft = this.mapper.toOrmEntity(entity);
        await manager.createQueryBuilder().insert().into(OptionOrmEntity).values(draft).orUpdate(['name', 'archived_at', 'deleted_at'], ['id'], { skipUpdateIfNoValuesChanged: true }).execute();
    }

    private async persistValues(entity: Option, manager: EntityManager): Promise<void> {
        // Removal runs first: a renamed value can free a name that another one is about to take.
        const keptValueIds = entity.values.map(value => value.id.serialize());
        const removal = manager.createQueryBuilder().delete().from(OptionValueOrmEntity).where('option_id = :optionId', { optionId: entity.id.serialize() });
        if (keptValueIds.length > 0) removal.andWhere('id NOT IN (:...keptValueIds)', { keptValueIds });
        await removal.execute();

        const drafts = entity.values.map(value => this.mapper.toValueOrmEntity(value, entity.id));
        if (drafts.length === 0) return;

        await manager.createQueryBuilder().insert().into(OptionValueOrmEntity).values(drafts).orUpdate(['name'], ['id'], { skipUpdateIfNoValuesChanged: true }).execute();
    }
}
