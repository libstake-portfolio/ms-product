import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

export interface CategoryOrmEntityProps {
    id: string;
    parentId: string | null;
    name: string;
    fullName: string;
}

@Entity({ name: 'categories' })
export class CategoryOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_categories' })
    public id: string;

    @JoinColumn({ name: 'parent_id', foreignKeyConstraintName: 'fk_categories_parent_id' })
    @ManyToOne(() => CategoryOrmEntity, category => category.children, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    public parent?: CategoryOrmEntity | null;
    @Index('ix_categories_parent_id')
    @Column({ name: 'parent_id', nullable: true })
    public parentId: string | null;

    @Index('ix_categories_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @Column({ name: 'full_name', type: 'text', nullable: false })
    public fullName: string;

    @OneToMany(() => CategoryOrmEntity, category => category.parent)
    public children?: CategoryOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: CategoryOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.parentId = props.parentId;
        this.name = props.name;
        this.fullName = props.fullName;
    }
}
