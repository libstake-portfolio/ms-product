import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { CategoryOrmEntity } from '@modules/features/category/infrastructure/orm-entities/category.orm-entity';

import { VariantOrmEntity } from './variant.orm-entity';

export interface ProductOrmEntityProps {
    id: string;
    categoryId: string | null;
    handle: string;
    name: string;
    description: string;
    descriptionHtml: string;
}

@Entity({ name: 'products' })
export class ProductOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_products' })
    public id: string;

    @JoinColumn({ name: 'category_id', foreignKeyConstraintName: 'fk_products_category_id' })
    @ManyToOne(() => CategoryOrmEntity, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    public category?: CategoryOrmEntity | null;
    @Index('ix_products_category_id')
    @Column({ name: 'category_id', nullable: true })
    public categoryId: string | null;

    @Index('ix_products_handle')
    @Column({ name: 'handle', type: 'text', nullable: false })
    public handle: string;

    @Index('ix_products_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @Column({ name: 'description', type: 'text', nullable: false, default: '' })
    public description: string;

    @Column({ name: 'description_html', type: 'text', nullable: false, default: '' })
    public descriptionHtml: string;

    @OneToMany(() => VariantOrmEntity, variant => variant.product)
    public variants?: VariantOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: ProductOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.categoryId = props.categoryId;
        this.handle = props.handle;
        this.name = props.name;
        this.description = props.description;
        this.descriptionHtml = props.descriptionHtml;
    }
}
