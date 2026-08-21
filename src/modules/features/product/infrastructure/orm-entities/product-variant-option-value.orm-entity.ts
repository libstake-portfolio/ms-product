import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { OptionValueOrmEntity } from '@modules/features/option/infrastructure/orm-entities/option-value.orm-entity';
import { OptionOrmEntity } from '@modules/features/option/infrastructure/orm-entities/option.orm-entity';

import { ProductVariantOrmEntity } from './product-variant.orm-entity';

export interface ProductVariantOptionValueOrmEntityProps {
    productVariantId: string;
    optionId: string;
    optionValueId: string;
}

// The key spans the variant and the option, so one variant answers a given option only once.
@Entity({ name: 'product_variant_option_values' })
export class ProductVariantOptionValueOrmEntity {
    @JoinColumn({ name: 'product_variant_id', foreignKeyConstraintName: 'fk_product_variant_option_values_product_variant_id' })
    @ManyToOne(() => ProductVariantOrmEntity, productVariant => productVariant.optionValues, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    public productVariant?: ProductVariantOrmEntity;
    @PrimaryColumn('uuid', { name: 'product_variant_id', primaryKeyConstraintName: 'pk_product_variant_option_values' })
    public productVariantId: string;

    @JoinColumn({ name: 'option_id', foreignKeyConstraintName: 'fk_product_variant_option_values_option_id' })
    @ManyToOne(() => OptionOrmEntity, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
    public option?: OptionOrmEntity;
    @Index('ix_product_variant_option_values_option_id')
    @PrimaryColumn('uuid', { name: 'option_id', primaryKeyConstraintName: 'pk_product_variant_option_values' })
    public optionId: string;

    @JoinColumn({ name: 'option_value_id', foreignKeyConstraintName: 'fk_product_variant_option_values_option_value_id' })
    @ManyToOne(() => OptionValueOrmEntity, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
    public optionValue?: OptionValueOrmEntity;
    @Index('ix_product_variant_option_values_option_value_id')
    @Column({ name: 'option_value_id' })
    public optionValueId: string;

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: ProductVariantOptionValueOrmEntityProps) {
        if (!props) return;
        this.productVariantId = props.productVariantId;
        this.optionId = props.optionId;
        this.optionValueId = props.optionValueId;
    }
}
