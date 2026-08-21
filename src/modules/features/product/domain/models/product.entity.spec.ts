import { CategoryId } from '@modules/features/category/types/ids/category-id';
import { OptionId } from '@modules/features/option/types/ids/option-id';
import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

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

import { ProductVariantOptionValue } from './product-variant-option-value.value-object';
import { Product } from './product.entity';

const option = (label: string) => new OptionId(`option-${label}`);
const optionValue = (label: string) => new OptionValueId(`option-value-${label}`);
const selection = (optionLabel: string, valueLabel: string) => new ProductVariantOptionValue({ optionId: option(optionLabel), optionValueId: optionValue(valueLabel) });

const aProduct = () => Product.create({ categoryId: null, handle: 'tee', name: 'Tee', descriptionHtml: '<p>soft</p>' });

// Drops the events recorded so far so a later assertion only sees what the call under test produced.
const drain = (product: Product) => product.pullEvents();

describe('Product', () => {
    describe('creation', () => {
        it('records the fact and derives the plain description', () => {
            const product = aProduct();

            expect(product.description).toBe('soft');
            const events = product.pullEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toBeInstanceOf(ProductCreatedEvent);
            expect(events[0].aggregateId.equals(product.id)).toBe(true);
        });

        it('records nothing when restoring stored state', () => {
            const restored = Product.reconstitute({
                id: new ProductId('product-1'),
                categoryId: null,
                handle: 'tee',
                name: 'Tee',
                description: 'soft',
                descriptionHtml: '<p>soft</p>',
                archivedAt: null,
                deletedAt: null,
                options: [],
                variants: [],
            });

            expect(restored.pullEvents()).toHaveLength(0);
        });

        it('hands the recorded events over only once', () => {
            const product = aProduct();

            expect(product.pullEvents()).toHaveLength(1);
            expect(product.pullEvents()).toHaveLength(0);
        });
    });

    describe('describing', () => {
        it('carries the previous name so a listener can tell what changed', () => {
            const product = aProduct();
            drain(product);

            product.rename('Long Sleeve Tee');

            const [event] = product.pullEvents();
            expect(event).toBeInstanceOf(ProductRenamedEvent);
            expect((event as ProductRenamedEvent).props).toMatchObject({ name: 'Long Sleeve Tee', previousName: 'Tee' });
        });

        it('carries the previous handle so links can be redirected', () => {
            const product = aProduct();
            drain(product);

            product.changeHandle('long-sleeve-tee');

            const [event] = product.pullEvents();
            expect(event).toBeInstanceOf(ProductHandleChangedEvent);
            expect((event as ProductHandleChangedEvent).props).toMatchObject({ handle: 'long-sleeve-tee', previousHandle: 'tee' });
        });

        it('re-derives the plain description when the markup changes', () => {
            const product = aProduct();
            drain(product);

            product.reviseDescription('<p>warm</p>');

            expect(product.description).toBe('warm');
            const [event] = product.pullEvents();
            expect(event).toBeInstanceOf(ProductDescriptionRevisedEvent);
        });

        it('treats first assignment and clearing as ends of the same fact', () => {
            const product = aProduct();
            drain(product);

            product.recategorize(new CategoryId('category-1'));
            const [assigned] = product.pullEvents() as ProductRecategorizedEvent[];
            expect(assigned).toBeInstanceOf(ProductRecategorizedEvent);
            expect(assigned.props.previousCategoryId).toBeNull();
            expect(assigned.props.categoryId?.serialize()).toBe('category-1');

            product.recategorize(null);
            const [cleared] = product.pullEvents() as ProductRecategorizedEvent[];
            expect(cleared.props.categoryId).toBeNull();
            expect(cleared.props.previousCategoryId?.serialize()).toBe('category-1');
        });

        it('records nothing when the value did not change', () => {
            const product = aProduct();
            drain(product);

            product.rename('Tee');
            product.changeHandle('tee');
            product.reviseDescription('<p>soft</p>');
            product.recategorize(null);

            expect(product.pullEvents()).toHaveLength(0);
        });
    });

    describe('lifecycle', () => {
        it('refuses to purge what was never archived', () => {
            const product = aProduct();

            expect(() => product.purge()).toThrow(ProductNotArchivedException);
        });

        it('archives before purging', () => {
            const product = aProduct();
            drain(product);

            product.archive();
            product.purge();

            const events = product.pullEvents();
            expect(events[0]).toBeInstanceOf(ProductArchivedEvent);
            expect(events[1]).toBeInstanceOf(ProductPurgedEvent);
            expect(product.archivedAt).not.toBeNull();
            expect(product.deletedAt).not.toBeNull();
        });

        it('leaves an archived product open to nothing but purging', () => {
            const product = aProduct();
            product.archive();

            expect(() => product.rename('Other')).toThrow(ArchivedProductNotEditableException);
        });

        it('refuses every change once purged', () => {
            const product = aProduct();
            product.archive();
            product.purge();

            expect(() => product.archive()).toThrow(ProductAlreadyPurgedException);
            expect(() => product.rename('Other')).toThrow(ProductAlreadyPurgedException);
        });
    });

    describe('options', () => {
        it('appends at the next position', () => {
            const product = aProduct();
            drain(product);

            product.addOption(option('colour'));
            product.addOption(option('size'));

            expect(product.options.map(declared => declared.position)).toEqual([0, 1]);
            const events = product.pullEvents();
            expect(events).toHaveLength(2);
            expect(events[0]).toBeInstanceOf(ProductOptionAddedEvent);
        });

        it('refuses the same option twice', () => {
            const product = aProduct();
            product.addOption(option('colour'));

            expect(() => product.addOption(option('colour'))).toThrow(ProductOptionAlreadyDeclaredException);
        });

        it('stops at the load-size cap', () => {
            const product = aProduct();
            for (let index = 0; index < 30; index += 1) product.addOption(option(`o${index}`));

            expect(() => product.addOption(option('one-too-many'))).toThrow(ProductOptionLimitExceededException);
        });

        it('refuses an option change once variants exist', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addVariant({ handle: 'red', name: 'Red', optionValues: [selection('colour', 'red')] });

            expect(() => product.addOption(option('size'))).toThrow(ProductOptionsLockedException);
            expect(() => product.removeOption(option('colour'))).toThrow(ProductOptionsLockedException);
        });

        it('refuses to remove what was never declared', () => {
            const product = aProduct();

            expect(() => product.removeOption(option('colour'))).toThrow(ProductOptionNotDeclaredException);
        });

        it('records the reorder that closing the gap causes', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addOption(option('size'));
            drain(product);

            product.removeOption(option('colour'));

            expect(product.options.map(declared => declared.position)).toEqual([0]);
            const events = product.pullEvents();
            expect(events[0]).toBeInstanceOf(ProductOptionRemovedEvent);
            expect(events[1]).toBeInstanceOf(ProductOptionsReorderedEvent);
        });

        it('records only the removal when nothing had to move', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addOption(option('size'));
            drain(product);

            product.removeOption(option('size'));

            expect(product.pullEvents()).toHaveLength(1);
        });

        it('refuses a reorder that does not list every option exactly once', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addOption(option('size'));

            expect(() => product.reorderOptions([option('colour')])).toThrow(ProductOptionsReorderMismatchException);
            expect(() => product.reorderOptions([option('colour'), option('colour')])).toThrow(ProductOptionsReorderMismatchException);
            expect(() => product.reorderOptions([option('colour'), option('material')])).toThrow(ProductOptionsReorderMismatchException);
        });

        it('renumbers on reorder and stays silent when the order already matched', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addOption(option('size'));
            drain(product);

            product.reorderOptions([option('colour'), option('size')]);
            expect(product.pullEvents()).toHaveLength(0);

            product.reorderOptions([option('size'), option('colour')]);
            expect(product.options.map(declared => declared.optionId.serialize())).toEqual(['option-size', 'option-colour']);
            expect(product.pullEvents()[0]).toBeInstanceOf(ProductOptionsReorderedEvent);
        });
    });

    describe('variants', () => {
        const withTwoOptions = () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addOption(option('size'));
            drain(product);
            return product;
        };

        it('answers every declared option, in the declared order', () => {
            const product = withTwoOptions();

            product.addVariant({ handle: 'red-l', name: 'Red / L', optionValues: [selection('size', 'l'), selection('colour', 'red')] });

            const [event] = product.pullEvents();
            expect(event).toBeInstanceOf(ProductVariantAddedEvent);
            expect((event as ProductVariantAddedEvent).props.optionValues.map(value => value.optionId.serialize())).toEqual(['option-colour', 'option-size']);
        });

        it('refuses a combination that misses, repeats, or adds an option', () => {
            const product = withTwoOptions();

            expect(() => product.addVariant({ handle: 'red', name: 'Red', optionValues: [selection('colour', 'red')] })).toThrow(ProductVariantOptionMismatchException);
            expect(() => product.addVariant({ handle: 'red', name: 'Red', optionValues: [selection('colour', 'red'), selection('colour', 'blue')] })).toThrow(ProductVariantOptionMismatchException);
            expect(() => product.addVariant({ handle: 'red', name: 'Red', optionValues: [selection('colour', 'red'), selection('size', 'l'), selection('material', 'cotton')] })).toThrow(ProductVariantOptionMismatchException);
        });

        it('refuses a combination another variant already answers', () => {
            const product = withTwoOptions();
            product.addVariant({ handle: 'red-l', name: 'Red / L', optionValues: [selection('colour', 'red'), selection('size', 'l')] });

            expect(() => product.addVariant({ handle: 'red-l-again', name: 'Red / L', optionValues: [selection('size', 'l'), selection('colour', 'red')] })).toThrow(ProductVariantCombinationTakenException);
        });

        it('stops at the load-size cap', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            for (let index = 0; index < 30; index += 1) product.addVariant({ handle: `v${index}`, name: `V${index}`, optionValues: [selection('colour', `c${index}`)] });

            expect(() => product.addVariant({ handle: 'v30', name: 'V30', optionValues: [selection('colour', 'c30')] })).toThrow(ProductVariantLimitExceededException);
        });

        it('removes by identity and refuses an unknown one', () => {
            const product = withTwoOptions();
            const variantId = product.addVariant({ handle: 'red-l', name: 'Red / L', optionValues: [selection('colour', 'red'), selection('size', 'l')] });
            drain(product);

            expect(() => product.removeVariant(new ProductVariantId('never-issued'))).toThrow(ProductVariantNotFoundException);

            product.removeVariant(variantId);
            expect(product.variants).toHaveLength(0);
            expect(product.pullEvents()[0]).toBeInstanceOf(ProductVariantRemovedEvent);
        });

        it('records a child change against the root that owns it', () => {
            const product = withTwoOptions();
            const variantId = product.addVariant({ handle: 'red-l', name: 'Red / L', optionValues: [selection('colour', 'red'), selection('size', 'l')] });
            drain(product);

            product.renameVariant(variantId, 'Crimson / L');
            product.changeVariantHandle(variantId, 'crimson-l');

            const events = product.pullEvents();
            expect(events[0]).toBeInstanceOf(ProductVariantRenamedEvent);
            expect(events[1]).toBeInstanceOf(ProductVariantHandleChangedEvent);
            expect(events.every(event => event.aggregateId.equals(product.id))).toBe(true);
        });

        it('records nothing when a child value did not change', () => {
            const product = withTwoOptions();
            const variantId = product.addVariant({ handle: 'red-l', name: 'Red / L', optionValues: [selection('colour', 'red'), selection('size', 'l')] });
            drain(product);

            product.renameVariant(variantId, 'Red / L');
            product.changeVariantHandle(variantId, 'red-l');

            expect(product.pullEvents()).toHaveLength(0);
        });
    });

    describe('encapsulation', () => {
        it('hands out children the caller cannot use to reach back in', () => {
            const product = aProduct();
            product.addOption(option('colour'));
            product.addVariant({ handle: 'red', name: 'Red', optionValues: [selection('colour', 'red')] });
            drain(product);

            product.variants[0].rename('Tampered');
            product.options[0].reposition(99);

            expect(product.variants[0].name).toBe('Red');
            expect(product.options[0].position).toBe(0);
            expect(product.pullEvents()).toHaveLength(0);
        });
    });
});
