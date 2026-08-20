import { Entity, PrimaryColumn } from 'typeorm';

import { VariantOrmEntity } from './variant.orm-entity';

export interface ProductOrmEntityProps {
    id: string;
    categoryId: string;
    handle: string;
    name: string;
    description: string;
    descriptionHtml: string;
}

@Entity({ name: 'products' })
export class ProductOrmEntity {
    @PrimaryColumn('uuid', { name: 'id' })
    public id: string;

    public categoryId: string;

    public handle: string;

    public name: string;

    public description: string;

    public descriptionHtml: string;

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
