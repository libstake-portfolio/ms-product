import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { OptionValueOrmEntity } from '@modules/features/option/infrastructure/orm-entities/option-value.orm-entity';
import { OptionOrmEntity } from '@modules/features/option/infrastructure/orm-entities/option.orm-entity';

import { ProductOrmEntity } from './product.orm-entity';

export interface VariantOrmEntityProps {
    id: string;
    productId: string;
    handle: string;
    name: string;
    description: string;
    descriptionHtml: string;
    optionId: string;
    optionValueId: string;
}

@Entity({ name: 'variants' })
export class VariantOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_variants' })
    public id: string;

    @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_variants_product_id' })
    @ManyToOne(() => ProductOrmEntity, product => product.variants, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    public product?: ProductOrmEntity;
    @Index('ix_variants_product_id')
    @Column({ name: 'product_id' })
    public productId: string;

    @Index('ix_variants_handle')
    @Column({ name: 'handle', type: 'text', nullable: false })
    public handle: string;

    @Index('ix_variants_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @Column({ name: 'description', type: 'text', nullable: false, default: '' })
    public description: string;

    @Column({ name: 'description_html', type: 'text', nullable: false, default: '' })
    public descriptionHtml: string;

    @JoinColumn({ name: 'option_id', foreignKeyConstraintName: 'fk_variants_option_id' })
    @ManyToOne(() => OptionOrmEntity, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
    public option?: OptionOrmEntity;
    @Index('ix_variants_option_id')
    @Column({ name: 'option_id' })
    public optionId: string;

    @JoinColumn({ name: 'option_value_id', foreignKeyConstraintName: 'fk_variants_option_value_id' })
    @ManyToOne(() => OptionValueOrmEntity, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
    public optionValue?: OptionValueOrmEntity;
    @Index('ix_variants_option_value_id')
    @Column({ name: 'option_value_id' })
    public optionValueId: string;

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: VariantOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.productId = props.productId;
        this.handle = props.handle;
        this.name = props.name;
        this.description = props.description;
        this.descriptionHtml = props.descriptionHtml;
        this.optionId = props.optionId;
        this.optionValueId = props.optionValueId;
    }
}
