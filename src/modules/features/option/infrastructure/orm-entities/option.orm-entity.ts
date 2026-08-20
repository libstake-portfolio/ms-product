import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';

import { OptionValueOrmEntity } from './option-value.orm-entity';

export interface OptionOrmEntityProps {
    id: string;
    name: string;
}

@Entity({ name: 'options' })
export class OptionOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_options' })
    public id: string;

    @Index('ix_options_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @OneToMany(() => OptionValueOrmEntity, optionValue => optionValue.option)
    public optionValues?: OptionValueOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: OptionOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.name = props.name;
    }
}
