import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { OptionOrmEntity } from '@modules/features/option/infrastructure/orm-entities/option.orm-entity';

import { ProductOrmEntity } from './product.orm-entity';

export interface ProductOptionOrmEntityProps {
    productId: string;
    optionId: string;
    position: number;
}

// The pair it points at is its identity, so no surrogate key is declared.
@Entity({ name: 'product_options' })
export class ProductOptionOrmEntity {
    @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_product_options_product_id' })
    @ManyToOne(() => ProductOrmEntity, product => product.options, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    public product?: ProductOrmEntity;
    @PrimaryColumn('uuid', { name: 'product_id', primaryKeyConstraintName: 'pk_product_options' })
    public productId: string;

    @JoinColumn({ name: 'option_id', foreignKeyConstraintName: 'fk_product_options_option_id' })
    @ManyToOne(() => OptionOrmEntity, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
    public option?: OptionOrmEntity;
    @Index('ix_product_options_option_id')
    @PrimaryColumn('uuid', { name: 'option_id', primaryKeyConstraintName: 'pk_product_options' })
    public optionId: string;

    @Column({ name: 'position', type: 'int', nullable: false })
    public position: number;

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: ProductOptionOrmEntityProps) {
        if (!props) return;
        this.productId = props.productId;
        this.optionId = props.optionId;
        this.position = props.position;
    }
}
