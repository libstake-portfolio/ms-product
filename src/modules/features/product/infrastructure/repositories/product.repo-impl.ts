import { Injectable } from '@nestjs/common';
import { EntityManager, FindOptionsRelations } from 'typeorm';

import { TransactionContext } from '@modules/common/database/transaction-context';

import { Product } from '../../domain/models/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductId } from '../../types/ids/product-id';
import { ProductMapper } from '../mappers/product.mapper';
import { ProductOptionOrmEntity } from '../orm-entities/product-option.orm-entity';
import { ProductVariantOptionValueOrmEntity } from '../orm-entities/product-variant-option-value.orm-entity';
import { ProductVariantOrmEntity } from '../orm-entities/product-variant.orm-entity';
import { ProductOrmEntity } from '../orm-entities/product.orm-entity';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
    // Everything the aggregate needs to be rebuilt. Mapping refuses to run on a partial graph.
    private readonly defaultRelations: FindOptionsRelations<ProductOrmEntity> = {
        options: true,
        variants: { optionValues: true },
    };

    public constructor(
        private readonly mapper: ProductMapper,
        private readonly context: TransactionContext,
    ) {}

    public async findById(id: ProductId): Promise<Product | null> {
        const result = await this.context.manager.getRepository(ProductOrmEntity).findOne({ where: { id: id.serialize() }, relations: this.defaultRelations });
        if (!result) return null;
        return this.mapper.toDomainEntity(result);
    }

    /**
     * Writes the root, then its children, then their selections, removing whatever the aggregate no longer holds.
     *
     * ! - Drains the events the aggregate recorded into the surrounding transaction, so the aggregate has none left afterwards.
     */
    public async persist(entity: Product): Promise<ProductId> {
        const manager = this.context.requireTransaction('Persisting a product');

        await this.persistRoot(entity, manager);
        await this.persistOptions(entity, manager);
        await this.persistVariants(entity, manager);
        await this.persistVariantOptionValues(entity, manager);

        this.context.collect(entity.pullEvents());
        return entity.id;
    }

    private async persistRoot(entity: Product, manager: EntityManager): Promise<void> {
        const draft = this.mapper.toOrmEntity(entity);
        await manager
            .createQueryBuilder()
            .insert()
            .into(ProductOrmEntity)
            .values(draft)
            .orUpdate(['category_id', 'handle', 'name', 'description', 'description_html', 'archived_at', 'deleted_at'], ['id'], { skipUpdateIfNoValuesChanged: true })
            .execute();
    }

    private async persistOptions(entity: Product, manager: EntityManager): Promise<void> {
        const drafts = entity.options.map(option => this.mapper.toOptionOrmEntity(option, entity.id));
        if (drafts.length > 0) {
            await manager.createQueryBuilder().insert().into(ProductOptionOrmEntity).values(drafts).orUpdate(['position'], ['product_id', 'option_id'], { skipUpdateIfNoValuesChanged: true }).execute();
        }

        const keptOptionIds = entity.options.map(option => option.optionId.serialize());
        const removal = manager.createQueryBuilder().delete().from(ProductOptionOrmEntity).where('product_id = :productId', { productId: entity.id.serialize() });
        if (keptOptionIds.length > 0) removal.andWhere('option_id NOT IN (:...keptOptionIds)', { keptOptionIds });
        await removal.execute();
    }

    private async persistVariants(entity: Product, manager: EntityManager): Promise<void> {
        const drafts = entity.variants.map(variant => this.mapper.toVariantOrmEntity(variant, entity.id));
        if (drafts.length > 0) {
            await manager.createQueryBuilder().insert().into(ProductVariantOrmEntity).values(drafts).orUpdate(['handle', 'name'], ['id'], { skipUpdateIfNoValuesChanged: true }).execute();
        }

        const keptVariantIds = entity.variants.map(variant => variant.id.serialize());
        const removal = manager.createQueryBuilder().delete().from(ProductVariantOrmEntity).where('product_id = :productId', { productId: entity.id.serialize() });
        if (keptVariantIds.length > 0) removal.andWhere('id NOT IN (:...keptVariantIds)', { keptVariantIds });
        await removal.execute();
    }

    /**
     * Replaces the selections of every surviving variant.
     *
     * A variant's option combination cannot change once the variant exists, so there is nothing here worth
     * diffing; selections of variants that were just removed are gone with their parent row.
     */
    private async persistVariantOptionValues(entity: Product, manager: EntityManager): Promise<void> {
        const variantIds = entity.variants.map(variant => variant.id.serialize());
        if (variantIds.length === 0) return;

        await manager.createQueryBuilder().delete().from(ProductVariantOptionValueOrmEntity).where('product_variant_id IN (:...variantIds)', { variantIds }).execute();

        const drafts = entity.variants.flatMap(variant => variant.optionValues.map(optionValue => this.mapper.toVariantOptionValueOrmEntity(optionValue, variant.id)));
        if (drafts.length === 0) return;

        await manager.createQueryBuilder().insert().into(ProductVariantOptionValueOrmEntity).values(drafts).execute();
    }
}
