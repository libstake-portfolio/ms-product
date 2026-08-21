import { RelationNotLoadedException } from '@common/errors/relation-not-loaded.exception';
import { CategoryId } from '@modules/features/category/types/ids/category-id';
import { OptionId } from '@modules/features/option/types/ids/option-id';
import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

import { ProductOption } from '../../domain/models/product-option.entity';
import { ProductVariantOptionValue } from '../../domain/models/product-variant-option-value.value-object';
import { ProductVariant } from '../../domain/models/product-variant.entity';
import { Product } from '../../domain/models/product.entity';
import { ProductId } from '../../types/ids/product-id';
import { ProductVariantId } from '../../types/ids/product-variant-id';
import { ProductOptionOrmEntity } from '../orm-entities/product-option.orm-entity';
import { ProductVariantOptionValueOrmEntity } from '../orm-entities/product-variant-option-value.orm-entity';
import { ProductVariantOrmEntity } from '../orm-entities/product-variant.orm-entity';
import { ProductOrmEntity } from '../orm-entities/product.orm-entity';

export class ProductMapper {
    public toDomainEntity(ormEntity: ProductOrmEntity): Product {
        if (!ormEntity.options) throw new RelationNotLoadedException(ProductOrmEntity.name, 'options');
        if (!ormEntity.variants) throw new RelationNotLoadedException(ProductOrmEntity.name, 'variants');
        return Product.reconstitute({
            id: new ProductId(ormEntity.id),
            categoryId: ormEntity.categoryId ? new CategoryId(ormEntity.categoryId) : null,
            handle: ormEntity.handle,
            name: ormEntity.name,
            description: ormEntity.description,
            descriptionHtml: ormEntity.descriptionHtml,
            archivedAt: ormEntity.archivedAt,
            deletedAt: ormEntity.deletedAt,
            // Rows come back unordered, so the stored position is what restores the declared order.
            options: [...ormEntity.options].sort((left, right) => left.position - right.position).map(option => this.toOptionDomainEntity(option)),
            variants: ormEntity.variants.map(variant => this.toVariantDomainEntity(variant)),
        });
    }

    public toOrmEntity(entity: Product): ProductOrmEntity {
        return new ProductOrmEntity({
            id: entity.id.serialize(),
            categoryId: entity.categoryId?.serialize() ?? null,
            handle: entity.handle,
            name: entity.name,
            description: entity.description,
            descriptionHtml: entity.descriptionHtml,
            archivedAt: entity.archivedAt,
            deletedAt: entity.deletedAt,
        });
    }

    public toOptionDomainEntity(ormEntity: ProductOptionOrmEntity): ProductOption {
        return ProductOption.reconstitute({
            optionId: new OptionId(ormEntity.optionId),
            position: ormEntity.position,
        });
    }

    public toOptionOrmEntity(entity: ProductOption, productId: ProductId): ProductOptionOrmEntity {
        return new ProductOptionOrmEntity({
            productId: productId.serialize(),
            optionId: entity.optionId.serialize(),
            position: entity.position,
        });
    }

    public toVariantDomainEntity(ormEntity: ProductVariantOrmEntity): ProductVariant {
        if (!ormEntity.optionValues) throw new RelationNotLoadedException(ProductVariantOrmEntity.name, 'optionValues');
        return ProductVariant.reconstitute({
            id: new ProductVariantId(ormEntity.id),
            handle: ormEntity.handle,
            name: ormEntity.name,
            optionValues: ormEntity.optionValues.map(optionValue => this.toVariantOptionValue(optionValue)),
        });
    }

    public toVariantOrmEntity(entity: ProductVariant, productId: ProductId): ProductVariantOrmEntity {
        return new ProductVariantOrmEntity({
            id: entity.id.serialize(),
            productId: productId.serialize(),
            handle: entity.handle,
            name: entity.name,
        });
    }

    public toVariantOptionValue(ormEntity: ProductVariantOptionValueOrmEntity): ProductVariantOptionValue {
        return new ProductVariantOptionValue({
            optionId: new OptionId(ormEntity.optionId),
            optionValueId: new OptionValueId(ormEntity.optionValueId),
        });
    }

    public toVariantOptionValueOrmEntity(entity: ProductVariantOptionValue, productVariantId: ProductVariantId): ProductVariantOptionValueOrmEntity {
        return new ProductVariantOptionValueOrmEntity({
            productVariantId: productVariantId.serialize(),
            optionId: entity.optionId.serialize(),
            optionValueId: entity.optionValueId.serialize(),
        });
    }
}
