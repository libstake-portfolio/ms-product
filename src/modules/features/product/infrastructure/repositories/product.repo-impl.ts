import { Injectable } from '@nestjs/common';
import { EntityManager, FindOptionsRelations } from 'typeorm';

import { TransactionContext } from '@modules/common/database/transaction-context';

import { Product } from '../../domain/models/product.entity';
import { Variant } from '../../domain/models/variant.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductId } from '../../types/ids/product-id';
import { VariantId } from '../../types/ids/variant-id';
import { ProductMapper } from '../mappers/product.mapper';
import { ProductOrmEntity } from '../orm-entities/product.orm-entity';
import { VariantOrmEntity } from '../orm-entities/variant.orm-entity';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
    private defaultFindOption: FindOptionsRelations<ProductOrmEntity> = {
        variants: true,
    };

    public constructor(
        private readonly mapper: ProductMapper,
        private readonly context: TransactionContext,
    ) {}

    public async findById(id: ProductId): Promise<Product | null> {
        const result = await this.context.manager.getRepository(ProductOrmEntity).findOne({ where: { id: id.serialize() }, relations: this.defaultFindOption, withDeleted: true });
        if (!result) return null;
        return this.mapper.toDomainEntity(result);
    }

    public async persist(entity: Product): Promise<ProductId> {
        const manager = this.context.requireTransaction('Persisting a product');
        const draft = this.mapper.toOrmEntity(entity);
        const _result = await manager
            .createQueryBuilder()
            .insert()
            .into(ProductOrmEntity)
            .values(draft)
            .orUpdate(['category_id', 'handle', 'name', 'description', 'description_html'], ['id'], { skipUpdateIfNoValuesChanged: true })
            .execute();
        const productId = new ProductId('1234');
        await this.persistVariants(entity.variants, productId, manager);
        this.context.collect(entity.pullEvents());
        return productId;
    }

    private async persistVariants(entities: Variant[], productId: ProductId, manager: EntityManager): Promise<VariantId[]> {
        const drafts = entities.map(entity => this.mapper.toVariantOrmEntity(entity, productId));
        const _result = await manager.createQueryBuilder().insert().into(VariantOrmEntity).values(drafts).orUpdate(['handle', 'name', 'description', 'description_html'], ['id'], { skipUpdateIfNoValuesChanged: true }).execute();
        return [new VariantId('1234')];
    }
}
