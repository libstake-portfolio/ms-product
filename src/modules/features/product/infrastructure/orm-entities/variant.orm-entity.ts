import { Entity, PrimaryColumn } from 'typeorm';

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
    @PrimaryColumn('uuid', { name: 'id' })
    public id: string;

    public productId: string;

    public product?: ProductOrmEntity;

    public handle: string;

    public name: string;

    public description: string;

    public descriptionHtml: string;

    public optionId: string;

    public option?: OptionOrmEntity;

    public optionValueId: string;

    public optionValue?: OptionValueOrmEntity;

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
