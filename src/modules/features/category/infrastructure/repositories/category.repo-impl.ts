import { Injectable } from '@nestjs/common';
import { In, IsNull } from 'typeorm';

import { TransactionContext } from '@modules/common/database/transaction-context';

import { Category } from '../../domain/models/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryId } from '../../types/ids/category-id';
import { CategoryMapper } from '../mappers/category.mapper';
import { CategoryOrmEntity } from '../orm-entities/category.orm-entity';

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
    public constructor(
        private readonly mapper: CategoryMapper,
        private readonly context: TransactionContext,
    ) {}

    public async findById(id: CategoryId): Promise<Category | null> {
        const result = await this.context.manager.getRepository(CategoryOrmEntity).findOne({ where: { id: id.serialize() } });
        if (!result) return null;
        return this.mapper.toDomainEntity(result);
    }

    public async findChildren(parentId: CategoryId | null): Promise<Category[]> {
        const results = await this.context.manager.getRepository(CategoryOrmEntity).find({ where: { parentId: parentId === null ? IsNull() : parentId.serialize() } });
        return results.map(result => this.mapper.toDomainEntity(result));
    }

    public async findDescendants(id: CategoryId): Promise<Category[]> {
        const repository = this.context.manager.getRepository(CategoryOrmEntity);
        const collected: CategoryOrmEntity[] = [];
        // Two moves that never saw each other can leave a loop behind, and walking one would not end.
        const visited = new Set<string>([id.serialize()]);
        let generation = [id.serialize()];

        while (generation.length > 0) {
            const rows = await repository.find({ where: { parentId: In(generation) } });
            const unseen = rows.filter(row => !visited.has(row.id));
            unseen.forEach(row => visited.add(row.id));

            collected.push(...unseen);
            generation = unseen.map(row => row.id);
        }

        return collected.map(row => this.mapper.toDomainEntity(row));
    }

    public async persist(entity: Category): Promise<CategoryId> {
        const manager = this.context.requireTransaction('Persisting a category');
        const draft = this.mapper.toOrmEntity(entity);

        await manager.createQueryBuilder().insert().into(CategoryOrmEntity).values(draft).orUpdate(['parent_id', 'name', 'full_name', 'archived_at', 'deleted_at'], ['id'], { skipUpdateIfNoValuesChanged: true }).execute();

        this.context.collect(entity.pullEvents());
        return entity.id;
    }
}
