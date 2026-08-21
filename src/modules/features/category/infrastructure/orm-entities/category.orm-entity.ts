import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Unique } from 'typeorm';

export interface CategoryOrmEntityProps {
    id: string;
    parentId: string | null;
    name: string;
    fullName: string;
    archivedAt: Date | null;
    deletedAt: Date | null;
}

@Entity({ name: 'categories' })
@Unique('uq_categories_parent_id_name', ['parentId', 'name'])
export class CategoryOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_categories' })
    public id: string;

    @JoinColumn({ name: 'parent_id', foreignKeyConstraintName: 'fk_categories_parent_id' })
    @ManyToOne(() => CategoryOrmEntity, category => category.children, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    public parent?: CategoryOrmEntity | null;
    @Column({ name: 'parent_id', nullable: true })
    public parentId: string | null;

    @Index('ix_categories_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @Index('ix_categories_full_name')
    @Column({ name: 'full_name', type: 'text', nullable: false })
    public fullName: string;

    @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
    public archivedAt: Date | null;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    public deletedAt: Date | null;

    @OneToMany(() => CategoryOrmEntity, category => category.parent)
    public children?: CategoryOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: CategoryOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.parentId = props.parentId;
        this.name = props.name;
        this.fullName = props.fullName;
        this.archivedAt = props.archivedAt;
        this.deletedAt = props.deletedAt;
    }
}
