import { Entity, PrimaryColumn } from 'typeorm';

import { OptionValueOrmEntity } from './option-value.orm-entity';

export interface OptionOrmEntityProps {
    id: string;
    name: string;
}

@Entity({ name: 'options' })
export class OptionOrmEntity {
    @PrimaryColumn('uuid', { name: 'id' })
    public id: string;

    public name: string;

    public optionValues?: OptionValueOrmEntity[];

    // Hydrating a row instantiates without arguments, so the props are optional.
    public constructor(props?: OptionOrmEntityProps) {
        if (!props) return;
        this.id = props.id;
        this.name = props.name;
    }
}
