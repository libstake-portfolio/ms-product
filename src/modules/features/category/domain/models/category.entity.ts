import { DomainEntity } from '@common/base/domain-entity';

import { CategoryId } from '../../types/ids/category-id';

export interface CategoryProps {
    id: CategoryId;
    parentId: CategoryId | null;

    name: string;
    fullName: string;

    children: Category[];
}

export class Category extends DomainEntity {
    public readonly id: CategoryId;
    protected _parentId: CategoryId | null;

    protected _name: string;
    protected _fullName: string;

    protected _children: Category[];

    protected constructor({ id, parentId, name, fullName, children }: CategoryProps) {
        super();
        this.id = id;
        this._parentId = parentId;
        this._name = name;
        this._fullName = fullName;
        this._children = children;
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: CategoryProps): Category {
        return new Category(props);
    }

    public get parentId(): CategoryId | null {
        return this._parentId;
    }

    public get name(): string {
        return this._name;
    }

    public get fullName(): string {
        return this._fullName;
    }

    public get children(): Category[] {
        return [...this._children];
    }

    public set parentId(parentId: CategoryId | null) {
        this._parentId = parentId;
    }

    public set name(name: string) {
        this._name = name;
    }

    public set fullName(fullName: string) {
        this._fullName = fullName;
    }

    public set children(children: Category[]) {
        this._children = children;
    }

    public copy(): Category {
        return new Category({
            id: this.id.copy(),
            parentId: this._parentId ? this._parentId.copy() : null,
            name: this._name,
            fullName: this._fullName,
            children: this.children.map(child => child.copy()),
        });
    }

    public isIdentical(other: Category): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }
}
