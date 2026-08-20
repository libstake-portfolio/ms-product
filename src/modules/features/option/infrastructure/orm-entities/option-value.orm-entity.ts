import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';

import { OptionOrmEntity } from './option.orm-entity';

export interface OptionValueOrmEntityProps {
    id: string;
    optionId: string;
    name: string;
}

@Entity({ name: 'option_values' })
@Unique('uq_option_values_option_id_name', ['optionId', 'name'])
export class OptionValueOrmEntity {
    @PrimaryColumn('uuid', { name: 'id', primaryKeyConstraintName: 'pk_option_values' })
    public id: string;

    @JoinColumn({ name: 'option_id', foreignKeyConstraintName: 'fk_option_values_option_id' })
    @ManyToOne(() => OptionOrmEntity, option => option.optionValues, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    public option?: OptionOrmEntity;
    @Column({ name: 'option_id' })
    public optionId: string;

    @Index('ix_option_values_name')
    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: OptionValueOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.optionId = props.optionId;
        this.name = props.name;
    }
}
