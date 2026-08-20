import { Entity, PrimaryColumn } from 'typeorm';

export interface CategoryOrmEntityProps {
    id: string;
    parentId: string | null;
    name: string;
    fullName: string;
}

@Entity({ name: 'categories' })
export class CategoryOrmEntity {
    @PrimaryColumn('uuid', { name: 'id' })
    public id: string;

    public parentId: string | null;

    public parent?: CategoryOrmEntity | null;

    public name: string;

    public fullName: string;

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
