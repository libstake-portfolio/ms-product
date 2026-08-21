import { v7 } from 'uuid';

import { AggregateRootEntity } from '@common/base/aggregate-root-entity';
import { removeHtmlTags, sanitizeHtml } from '@common/utils/html';
import { CategoryId } from '@modules/features/category/types/ids/category-id';
import { OptionId } from '@modules/features/option/types/ids/option-id';

import { ProductId } from '../../types/ids/product-id';
import { ProductVariantId } from '../../types/ids/product-variant-id';
import { ArchivedProductNotEditableException } from '../errors/archived-product-not-editable.exception';
import { ProductAlreadyPurgedException } from '../errors/product-already-purged.exception';
import { ProductNotArchivedException } from '../errors/product-not-archived.exception';
import { ProductOptionAlreadyDeclaredException } from '../errors/product-option-already-declared.exception';
import { ProductOptionLimitExceededException } from '../errors/product-option-limit-exceeded.exception';
import { ProductOptionNotDeclaredException } from '../errors/product-option-not-declared.exception';
import { ProductOptionsLockedException } from '../errors/product-options-locked.exception';
import { ProductOptionsReorderMismatchException } from '../errors/product-options-reorder-mismatch.exception';
import { ProductVariantCombinationTakenException } from '../errors/product-variant-combination-taken.exception';
import { ProductVariantLimitExceededException } from '../errors/product-variant-limit-exceeded.exception';
import { ProductVariantNotFoundException } from '../errors/product-variant-not-found.exception';
import { ProductVariantOptionMismatchException } from '../errors/product-variant-option-mismatch.exception';
import { ProductArchivedEvent } from '../events/product-archived.event';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductDescriptionRevisedEvent } from '../events/product-description-revised.event';
import { ProductHandleChangedEvent } from '../events/product-handle-changed.event';
import { ProductOptionAddedEvent } from '../events/product-option-added.event';
import { ProductOptionRemovedEvent } from '../events/product-option-removed.event';
import { ProductOptionsReorderedEvent } from '../events/product-options-reordered.event';
import { ProductPurgedEvent } from '../events/product-purged.event';
import { ProductRecategorizedEvent } from '../events/product-recategorized.event';
import { ProductRenamedEvent } from '../events/product-renamed.event';
import { ProductVariantAddedEvent } from '../events/product-variant-added.event';
import { ProductVariantHandleChangedEvent } from '../events/product-variant-handle-changed.event';
import { ProductVariantRemovedEvent } from '../events/product-variant-removed.event';
import { ProductVariantRenamedEvent } from '../events/product-variant-renamed.event';

import { ProductOption } from './product-option.entity';
import { ProductVariantOptionValue } from './product-variant-option-value.value-object';
import { ProductVariant } from './product-variant.entity';

// Caps on how wide one load can get. The aggregate is read and written whole, so its size has to be knowable.
const MAX_OPTIONS = 30;
const MAX_VARIANTS = 30;

export interface ProductProps {
    id: ProductId;

    categoryId: CategoryId | null;

    handle: string;
    name: string;
    description: string;
    descriptionHtml: string;

    archivedAt: Date | null;
    deletedAt: Date | null;

    options: ProductOption[];
    variants: ProductVariant[];
}

export interface CreateProductProps {
    categoryId: CategoryId | null;
    handle: string;
    name: string;
    descriptionHtml: string;
}

export interface AddProductVariantProps {
    handle: string;
    name: string;
    optionValues: ProductVariantOptionValue[];
}

export class Product extends AggregateRootEntity {
    public readonly id: ProductId;

    protected _categoryId: CategoryId | null;

    protected _handle: string;
    protected _name: string;
    protected _description: string;
    protected _descriptionHtml: string;

    protected _archivedAt: Date | null;
    protected _deletedAt: Date | null;

    protected _options: ProductOption[];
    protected _variants: ProductVariant[];

    protected constructor({ id, categoryId, handle, name, description, descriptionHtml, archivedAt, deletedAt, options, variants }: ProductProps) {
        super();
        this.id = id;
        this._categoryId = categoryId;
        this._handle = handle;
        this._name = name;
        this._description = description;
        this._descriptionHtml = descriptionHtml;
        this._archivedAt = archivedAt;
        this._deletedAt = deletedAt;
        this._options = options;
        this._variants = variants;
    }

    // The creating path issues the identifier; the restoring path receives one that already exists.
    public static create({ categoryId, handle, name, descriptionHtml }: CreateProductProps): Product {
        const id = new ProductId(v7());
        const sanitizedHtml = sanitizeHtml(descriptionHtml);
        const product = new Product({
            id,
            categoryId,
            handle,
            name,
            description: removeHtmlTags(sanitizedHtml),
            descriptionHtml: sanitizedHtml,
            archivedAt: null,
            deletedAt: null,
            options: [],
            variants: [],
        });
        product.record(new ProductCreatedEvent({ productId: id, handle, name, categoryId }));

        return product;
    }

    // Rebuilds an already-persisted entity as-is, without validating and without recording anything.
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

    public get archivedAt(): Date | null {
        return this._archivedAt;
    }

    public get deletedAt(): Date | null {
        return this._deletedAt;
    }

    // Children leave as copies. Handing out the originals would let a caller change them without the root noticing.
    public get options(): ProductOption[] {
        return this._options.map(option => option.copy());
    }

    public get variants(): ProductVariant[] {
        return this._variants.map(variant => variant.copy());
    }

    public rename(name: string): void {
        this.requireEditable();
        if (this._name === name) return;

        const previousName = this._name;
        this._name = name;
        this.record(new ProductRenamedEvent({ productId: this.id, name, previousName }));
    }

    public changeHandle(handle: string): void {
        this.requireEditable();
        if (this._handle === handle) return;

        const previousHandle = this._handle;
        this._handle = handle;
        this.record(new ProductHandleChangedEvent({ productId: this.id, handle, previousHandle }));
    }

    public reviseDescription(descriptionHtml: string): void {
        this.requireEditable();
        const sanitizedHtml = sanitizeHtml(descriptionHtml);
        if (this._descriptionHtml === sanitizedHtml) return;

        this._descriptionHtml = sanitizedHtml;
        this._description = removeHtmlTags(sanitizedHtml);
        this.record(new ProductDescriptionRevisedEvent({ productId: this.id, description: this._description, descriptionHtml: this._descriptionHtml }));
    }

    public recategorize(categoryId: CategoryId | null): void {
        this.requireEditable();
        const previousCategoryId = this._categoryId;
        const unchanged = previousCategoryId === null ? categoryId === null : categoryId !== null && previousCategoryId.equals(categoryId);
        if (unchanged) return;

        this._categoryId = categoryId;
        this.record(new ProductRecategorizedEvent({ productId: this.id, categoryId, previousCategoryId }));
    }

    // Marks the product for teardown while downstream may still be pointing at it.
    public archive(): void {
        this.requireNotPurged();
        if (this._archivedAt !== null) return;

        this._archivedAt = new Date();
        this.record(new ProductArchivedEvent({ productId: this.id }));
    }

    // Ends the product once downstream has had its chance to let go.
    public purge(): void {
        this.requireNotPurged();
        if (this._archivedAt === null) throw new ProductNotArchivedException(this.id.serialize());

        this._deletedAt = new Date();
        this.record(new ProductPurgedEvent({ productId: this.id }));
    }

    public addOption(optionId: OptionId): void {
        this.requireEditable();
        this.requireNoVariants();
        if (this._options.some(option => option.optionId.equals(optionId))) throw new ProductOptionAlreadyDeclaredException(optionId.serialize());
        if (this._options.length >= MAX_OPTIONS) throw new ProductOptionLimitExceededException(MAX_OPTIONS);

        const position = this._options.length;
        this._options.push(ProductOption.create({ optionId, position }));
        this.record(new ProductOptionAddedEvent({ productId: this.id, optionId, position }));
    }

    /**
     * Drops an option from the product.
     *
     * ! - Closing the gap the option left moves the ones after it, which is a second fact and is
     *     recorded as a reorder of its own.
     */
    public removeOption(optionId: OptionId): void {
        this.requireEditable();
        this.requireNoVariants();

        const index = this._options.findIndex(option => option.optionId.equals(optionId));
        if (index < 0) throw new ProductOptionNotDeclaredException(optionId.serialize());

        this._options.splice(index, 1);
        this.record(new ProductOptionRemovedEvent({ productId: this.id, optionId }));
        if (index === this._options.length) return;

        this._options.forEach((option, position) => option.reposition(position));
        this.record(new ProductOptionsReorderedEvent({ productId: this.id, optionIds: this.declaredOptionIds() }));
    }

    public reorderOptions(optionIds: OptionId[]): void {
        this.requireEditable();

        const declared = new Map(this._options.map(option => [option.optionId.serialize(), option]));
        const requested = optionIds.map(optionId => optionId.serialize());
        const listsEveryOptionOnce = requested.length === declared.size && new Set(requested).size === requested.length && requested.every(optionId => declared.has(optionId));
        if (!listsEveryOptionOnce) throw new ProductOptionsReorderMismatchException();
        if (requested.every((optionId, position) => this._options[position].optionId.serialize() === optionId)) return;

        this._options = requested.map((optionId, position) => {
            const option = declared.get(optionId)!;
            option.reposition(position);
            return option;
        });
        this.record(new ProductOptionsReorderedEvent({ productId: this.id, optionIds: this.declaredOptionIds() }));
    }

    public addVariant({ handle, name, optionValues }: AddProductVariantProps): ProductVariantId {
        this.requireEditable();
        if (this._variants.length >= MAX_VARIANTS) throw new ProductVariantLimitExceededException(MAX_VARIANTS);
        this.requireAnswersEveryOption(optionValues);
        this.requireCombinationFree(optionValues);

        const id = new ProductVariantId(v7());
        const variant = ProductVariant.create({ id, handle, name, optionValues: this.inDeclaredOrder(optionValues) });
        this._variants.push(variant);
        this.record(new ProductVariantAddedEvent({ productId: this.id, productVariantId: id, handle, name, optionValues: variant.optionValues }));

        return id;
    }

    public removeVariant(productVariantId: ProductVariantId): void {
        this.requireEditable();

        const index = this._variants.findIndex(variant => variant.id.equals(productVariantId));
        if (index < 0) throw new ProductVariantNotFoundException(productVariantId.serialize());

        this._variants.splice(index, 1);
        this.record(new ProductVariantRemovedEvent({ productId: this.id, productVariantId }));
    }

    public renameVariant(productVariantId: ProductVariantId, name: string): void {
        this.requireEditable();
        const variant = this.requireVariant(productVariantId);
        if (variant.name === name) return;

        const previousName = variant.name;
        variant.rename(name);
        this.record(new ProductVariantRenamedEvent({ productId: this.id, productVariantId, name, previousName }));
    }

    public changeVariantHandle(productVariantId: ProductVariantId, handle: string): void {
        this.requireEditable();
        const variant = this.requireVariant(productVariantId);
        if (variant.handle === handle) return;

        const previousHandle = variant.handle;
        variant.changeHandle(handle);
        this.record(new ProductVariantHandleChangedEvent({ productId: this.id, productVariantId, handle, previousHandle }));
    }

    public copy(): Product {
        return new Product({
            id: this.id.copy(),
            categoryId: this._categoryId?.copy() ?? null,
            handle: this._handle,
            name: this._name,
            description: this._description,
            descriptionHtml: this._descriptionHtml,
            archivedAt: this._archivedAt ? new Date(this._archivedAt) : null,
            deletedAt: this._deletedAt ? new Date(this._deletedAt) : null,
            options: this._options.map(option => option.copy()),
            variants: this._variants.map(variant => variant.copy()),
        });
    }

    public isIdentical(other: Product): boolean {
        if (!other) return false;
        return this.id.equals(other.id);
    }

    private requireNotPurged(): void {
        if (this._deletedAt !== null) throw new ProductAlreadyPurgedException(this.id.serialize());
    }

    private requireEditable(): void {
        this.requireNotPurged();
        if (this._archivedAt !== null) throw new ArchivedProductNotEditableException(this.id.serialize());
    }

    private requireNoVariants(): void {
        if (this._variants.length > 0) throw new ProductOptionsLockedException(this.id.serialize());
    }

    private requireVariant(productVariantId: ProductVariantId): ProductVariant {
        const variant = this._variants.find(candidate => candidate.id.equals(productVariantId));
        if (!variant) throw new ProductVariantNotFoundException(productVariantId.serialize());

        return variant;
    }

    private requireAnswersEveryOption(optionValues: ProductVariantOptionValue[]): void {
        const answered = new Set(optionValues.map(optionValue => optionValue.optionId.serialize()));
        const coversEveryOptionOnce = answered.size === optionValues.length && answered.size === this._options.length && this._options.every(option => answered.has(option.optionId.serialize()));
        if (!coversEveryOptionOnce) throw new ProductVariantOptionMismatchException();
    }

    private requireCombinationFree(optionValues: ProductVariantOptionValue[]): void {
        const combination = this.combinationOf(optionValues);
        if (this._variants.some(variant => this.combinationOf(variant.optionValues) === combination)) throw new ProductVariantCombinationTakenException();
    }

    private combinationOf(optionValues: ProductVariantOptionValue[]): string {
        return optionValues
            .map(optionValue => `${optionValue.optionId.serialize()}:${optionValue.optionValueId.serialize()}`)
            .sort()
            .join('|');
    }

    private inDeclaredOrder(optionValues: ProductVariantOptionValue[]): ProductVariantOptionValue[] {
        const positionOf = new Map(this._options.map(option => [option.optionId.serialize(), option.position]));
        return [...optionValues].sort((left, right) => positionOf.get(left.optionId.serialize())! - positionOf.get(right.optionId.serialize())!);
    }

    private declaredOptionIds(): OptionId[] {
        return this._options.map(option => option.optionId.copy());
    }
}
