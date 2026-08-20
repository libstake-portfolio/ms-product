import { RelationNotLoadedException } from '@common/errors/relation-not-loaded.exception';
import { CategoryId } from '@modules/features/category/types/ids/category-id';
import { OptionId } from '@modules/features/option/types/ids/option-id';
import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

import { Product } from '../../domain/models/product.entity';
import { Variant } from '../../domain/models/variant.entity';
import { ProductId } from '../../types/ids/product-id';
import { VariantId } from '../../types/ids/variant-id';
import { ProductOrmEntity } from '../orm-entities/product.orm-entity';
import { VariantOrmEntity } from '../orm-entities/variant.orm-entity';

export class ProductMapper {
    public toDomainEntity(ormEntity: ProductOrmEntity): Product {
        if (!ormEntity.variants) throw new RelationNotLoadedException(ProductOrmEntity.name, 'variants');
        return Product.reconstitute({
            id: new ProductId(ormEntity.id),
            categoryId: new CategoryId(ormEntity.categoryId),
            handle: ormEntity.handle,
            name: ormEntity.name,
            description: ormEntity.description,
            descriptionHtml: ormEntity.descriptionHtml,
            variants: ormEntity.variants.map(variant => this.toVariantDomainEntity(variant)),
        });
    }

    public toOrmEntity(entity: Product): ProductOrmEntity {
        return new ProductOrmEntity({
            id: entity.id.serialize(),
            categoryId: entity.categoryId.serialize(),
            handle: entity.handle,
            name: entity.name,
            description: entity.description,
            descriptionHtml: entity.descriptionHtml,
        });
    }

    public toVariantDomainEntity(ormEntity: VariantOrmEntity): Variant {
        return Variant.reconstitute({
            id: new VariantId(ormEntity.id),
            handle: ormEntity.handle,
            name: ormEntity.name,
            description: ormEntity.description,
            descriptionHtml: ormEntity.descriptionHtml,
            optionId: new OptionId(ormEntity.optionId),
            optionValueId: new OptionValueId(ormEntity.optionValueId),
        });
    }

    public toVariantOrmEntity(entity: Variant, productId: ProductId): VariantOrmEntity {
        return new VariantOrmEntity({
            id: entity.id.serialize(),
            productId: productId.serialize(),
            handle: entity.handle,
            name: entity.name,
            description: entity.description,
            descriptionHtml: entity.descriptionHtml,
            optionId: entity.optionId.serialize(),
            optionValueId: entity.optionValueId.serialize(),
        });
    }
}
