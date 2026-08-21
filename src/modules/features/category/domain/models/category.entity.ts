import { v7 } from 'uuid';

import { AggregateRootEntity } from '@common/base/aggregate-root-entity';

import { CategoryId } from '../../types/ids/category-id';
import { ArchivedCategoryNotEditableException } from '../errors/archived-category-not-editable.exception';
import { CategoryAlreadyPurgedException } from '../errors/category-already-purged.exception';
import { CategoryNameSeparatorException } from '../errors/category-name-separator.exception';
import { CategoryNotArchivedException } from '../errors/category-not-archived.exception';
import { CategoryArchivedEvent } from '../events/category-archived.event';
import { CategoryCreatedEvent } from '../events/category-created.event';
import { CategoryMovedEvent } from '../events/category-moved.event';
import { CategoryPathChangedEvent } from '../events/category-path-changed.event';
import { CategoryPurgedEvent } from '../events/category-purged.event';
import { CategoryRenamedEvent } from '../events/category-renamed.event';

// What joins the ancestor names into the full name. A name may not contain it.
const PATH_SEPARATOR = ' > ';

export interface CategoryProps {
    id: CategoryId;

    parentId: CategoryId | null;

    name: string;
    fullName: string;

    archivedAt: Date | null;
    deletedAt: Date | null;
}

// Where a category sits. Only the layer that can load both ends knows this, so it is passed in.
export interface CategoryPlacement {
    id: CategoryId;
    fullName: string;
}

export interface CreateCategoryProps {
    parent: CategoryPlacement | null;
    name: string;
}

/**
 * A single node of the classification tree.
 *
 * Children are not held here. The depth of the tree is not fixed, so keeping them would make one
 * load arbitrarily large; a child points at its parent and walking the tree is a reading concern.
 */
export class Category extends AggregateRootEntity {
    public readonly id: CategoryId;

    protected _parentId: CategoryId | null;

    protected _name: string;
    protected _fullName: string;

    protected _archivedAt: Date | null;
    protected _deletedAt: Date | null;

    protected constructor({ id, parentId, name, fullName, archivedAt, deletedAt }: CategoryProps) {
        super();
        this.id = id;
        this._parentId = parentId;
        this._name = name;
        this._fullName = fullName;
        this._archivedAt = archivedAt;
        this._deletedAt = deletedAt;
    }

    public static create({ parent, name }: CreateCategoryProps): Category {
        Category.requireNameWithoutSeparator(name);

        const id = new CategoryId(v7());
        const category = new Category({
            id,
            parentId: parent?.id ?? null,
            name,
            fullName: Category.composeFullName(parent?.fullName ?? null, name),
            archivedAt: null,
            deletedAt: null,
        });
        category.record(new CategoryCreatedEvent({ categoryId: id, parentId: category.parentId, name, fullName: category.fullName }));

        return category;
    }

    // Rebuilds an already-persisted entity as-is, without validating and without recording anything.
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

    public get archivedAt(): Date | null {
        return this._archivedAt;
    }

    public get deletedAt(): Date | null {
        return this._deletedAt;
    }

    public rename(name: string): void {
        this.requireEditable();
        Category.requireNameWithoutSeparator(name);
        if (this._name === name) return;

        const previousName = this._name;
        const previousFullName = this._fullName;
        const parentFullName = this.parentFullName();

        this._name = name;
        this._fullName = Category.composeFullName(parentFullName, name);
        this.record(new CategoryRenamedEvent({ categoryId: this.id, name, previousName, fullName: this._fullName, previousFullName }));
    }

    public moveTo(parent: CategoryPlacement | null): void {
        this.requireEditable();

        const parentId = parent?.id ?? null;
        const previousParentId = this._parentId;
        const unchanged = previousParentId === null ? parentId === null : parentId !== null && previousParentId.equals(parentId);
        if (unchanged) return;

        const previousFullName = this._fullName;
        this._parentId = parentId;
        this._fullName = Category.composeFullName(parent?.fullName ?? null, this._name);
        this.record(new CategoryMovedEvent({ categoryId: this.id, parentId, previousParentId, fullName: this._fullName, previousFullName }));
    }

    /**
     * Respells the place of a category whose own name and parent did not change.
     *
     * Used on descendants after an ancestor was renamed or moved.
     */
    public refreshPath(parentFullName: string): void {
        this.requireNotPurged();

        const fullName = Category.composeFullName(parentFullName, this._name);
        if (this._fullName === fullName) return;

        const previousFullName = this._fullName;
        this._fullName = fullName;
        this.record(new CategoryPathChangedEvent({ categoryId: this.id, fullName, previousFullName }));
    }

    public archive(): void {
        this.requireNotPurged();
        if (this._archivedAt !== null) return;

        this._archivedAt = new Date();
        this.record(new CategoryArchivedEvent({ categoryId: this.id }));
    }

    public purge(): void {
        this.requireNotPurged();
        if (this._archivedAt === null) throw new CategoryNotArchivedException(this.id.serialize());

        this._deletedAt = new Date();
        this.record(new CategoryPurgedEvent({ categoryId: this.id }));
    }

    public copy(): Category {
        return new Category({
            id: this.id.copy(),
            parentId: this._parentId?.copy() ?? null,
            name: this._name,
            fullName: this._fullName,
            archivedAt: this._archivedAt ? new Date(this._archivedAt) : null,
            deletedAt: this._deletedAt ? new Date(this._deletedAt) : null,
        });
    }

    public isIdentical(other: Category): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }

    private static composeFullName(parentFullName: string | null, name: string): string {
        return parentFullName === null ? name : `${parentFullName}${PATH_SEPARATOR}${name}`;
    }

    private static requireNameWithoutSeparator(name: string): void {
        if (name.includes(PATH_SEPARATOR)) throw new CategoryNameSeparatorException(PATH_SEPARATOR);
    }

    // The full name always ends with the separator and this name, so trimming that suffix leaves the parent's.
    private parentFullName(): string | null {
        if (this._parentId === null) return null;
        return this._fullName.slice(0, -(PATH_SEPARATOR.length + this._name.length));
    }

    private requireNotPurged(): void {
        if (this._deletedAt !== null) throw new CategoryAlreadyPurgedException(this.id.serialize());
    }

    private requireEditable(): void {
        this.requireNotPurged();
        if (this._archivedAt !== null) throw new ArchivedCategoryNotEditableException(this.id.serialize());
    }
}
