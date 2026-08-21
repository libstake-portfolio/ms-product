import { Column, DeleteDateColumn, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';

import { OptionValueOrmEntity } from './option-value.orm-entity';

export interface OptionOrmEntityProps {
    id: string;
    name: string;
    archivedAt: Date | null;
    deletedAt: Date | null;
}

@Entity({ name: 'options' })
export class OptionOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_options' })
    public id: string;

    @Index('ix_options_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
    public archivedAt: Date | null;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    public deletedAt: Date | null;

    @OneToMany(() => OptionValueOrmEntity, value => value.option)
    public values?: OptionValueOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: OptionOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.name = props.name;
        this.archivedAt = props.archivedAt;
        this.deletedAt = props.deletedAt;
    }
}
