import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { ProductVariantOptionValueOrmEntity } from './product-variant-option-value.orm-entity';
import { ProductOrmEntity } from './product.orm-entity';

export interface ProductVariantOrmEntityProps {
    id: string;
    productId: string;
    handle: string;
    name: string;
}

@Entity({ name: 'product_variants' })
export class ProductVariantOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_product_variants' })
    public id: string;

    @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_product_variants_product_id' })
    @ManyToOne(() => ProductOrmEntity, product => product.variants, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    public product?: ProductOrmEntity;
    @Index('ix_product_variants_product_id')
    @Column({ name: 'product_id' })
    public productId: string;

    @Index('ix_product_variants_handle')
    @Column({ name: 'handle', type: 'text', nullable: false })
    public handle: string;

    @Index('ix_product_variants_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @OneToMany(() => ProductVariantOptionValueOrmEntity, optionValue => optionValue.productVariant)
    public optionValues?: ProductVariantOptionValueOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: ProductVariantOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.productId = props.productId;
        this.handle = props.handle;
        this.name = props.name;
    }
}
