import { Entity, PrimaryColumn, Unique } from 'typeorm';

import { OptionOrmEntity } from './option.orm-entity';

export interface OptionValueOrmEntityProps {
    id: string;
    optionId: string;
    name: string;
}

@Entity({ name: 'option_values' })
@Unique(['optionId', 'name'])
export class OptionValueOrmEntity {
    @PrimaryColumn('uuid', { name: 'id' })
    public id: string;

    public optionId: string;

    public option?: OptionOrmEntity;

    public name: string;

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: OptionValueOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.optionId = props.optionId;
        this.name = props.name;
    }
}
