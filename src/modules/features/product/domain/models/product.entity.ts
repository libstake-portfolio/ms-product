import { DomainEntity } from '@common/base/domain-entity';
import { removeHtmlTags, sanitizeHtml } from '@common/utils/html';
import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { ProductId } from '../../types/ids/product-id';

import { Variant } from './variant.entity';

export interface ProductProps {
    id: ProductId;

    categoryId: CategoryId | null;

    handle: string;
    name: string;
    description: string;
    descriptionHtml: string;

    variants: Variant[];
}

export class Product extends DomainEntity {
    public readonly id: ProductId;

    protected _categoryId: CategoryId | null;

    protected _handle: string;
    protected _name: string;
    protected _description: string;
    protected _descriptionHtml: string;

    protected _variants: Variant[];

    protected constructor({ id, categoryId, handle, name, description, descriptionHtml, variants }: ProductProps) {
        super();
        this.id = id;
        this._categoryId = categoryId;
        this._handle = handle;
        this._name = name;
        this._description = description;
        this._descriptionHtml = descriptionHtml;
        this._variants = variants;
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: ProductProps): Product {
        return new Product(props);
    }

    public get categoryId(): CategoryId | null {
        return this._categoryId;
    }

    public get handle(): string {
        return this._handle;
    }

    public get name(): string {
        return this._name;
    }

    public get description(): string {
        return this._description;
    }

    public get descriptionHtml(): string {
        return this._descriptionHtml;
    }

    public get variants(): Variant[] {
        return [...this._variants];
    }

    public set categoryId(categoryId: CategoryId | null) {
        this._categoryId = categoryId;
    }

    public set handle(handle: string) {
        this._handle = handle;
    }

    public set name(name: string) {
        this._name = name;
    }

    public set descriptionHtml(descriptionHtml: string) {
        this._descriptionHtml = sanitizeHtml(descriptionHtml);
        this._description = removeHtmlTags(this._descriptionHtml);
    }

    public copy(): Product {
        return new Product({
            id: this.id.copy(),
            categoryId: this._categoryId?.copy() ?? null,
            handle: this._handle,
            name: this._name,
            description: this._description,
            descriptionHtml: this._descriptionHtml,
            variants: this._variants.map(variant => variant.copy()),
        });
    }

    public isIdentical(other: Product): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }
}
