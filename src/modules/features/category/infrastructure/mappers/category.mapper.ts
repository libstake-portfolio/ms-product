import { Category } from '../../domain/models/category.entity';
import { CategoryId } from '../../types/ids/category-id';
import { CategoryOrmEntity } from '../orm-entities/category.orm-entity';

export class CategoryMapper {
    public toDomainEntity(ormEntity: CategoryOrmEntity): Category {
        return Category.reconstitute({
            id: new CategoryId(ormEntity.id),
            parentId: ormEntity.parentId ? new CategoryId(ormEntity.parentId) : null,
            name: ormEntity.name,
            fullName: ormEntity.fullName,
            archivedAt: ormEntity.archivedAt,
            deletedAt: ormEntity.deletedAt,
        });
    }

    public toOrmEntity(entity: Category): CategoryOrmEntity {
        return new CategoryOrmEntity({
            id: entity.id.serialize(),
            parentId: entity.parentId?.serialize() ?? null,
            name: entity.name,
            fullName: entity.fullName,
            archivedAt: entity.archivedAt,
            deletedAt: entity.deletedAt,
        });
    }
}
