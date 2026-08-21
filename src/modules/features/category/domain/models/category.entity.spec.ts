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

import { Category, CategoryPlacement } from './category.entity';

const aRoot = () => Category.create({ parent: null, name: 'Apparel' });
const placementOf = (category: Category): CategoryPlacement => ({ id: category.id, fullName: category.fullName });
const drain = (category: Category) => category.pullEvents();

describe('Category', () => {
    describe('creation', () => {
        it('spells a root by its own name', () => {
            const root = aRoot();

            expect(root.fullName).toBe('Apparel');
            expect(root.parentId).toBeNull();
            expect(root.pullEvents()[0]).toBeInstanceOf(CategoryCreatedEvent);
        });

        it('spells a child under its parent', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });

            expect(child.fullName).toBe('Apparel > Tops');
        });

        it('refuses a name carrying the joiner', () => {
            expect(() => Category.create({ parent: null, name: 'Apparel > Tops' })).toThrow(CategoryNameSeparatorException);
        });

        it('records nothing when restoring stored state', () => {
            const restored = Category.reconstitute({
                id: new CategoryId('category-1'),
                parentId: null,
                name: 'Apparel',
                fullName: 'Apparel',
                archivedAt: null,
                deletedAt: null,
            });

            expect(restored.pullEvents()).toHaveLength(0);
        });
    });

    describe('renaming', () => {
        it('respells its own place and carries both spellings', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });
            drain(child);

            child.rename('Shirts');

            expect(child.fullName).toBe('Apparel > Shirts');
            const [event] = child.pullEvents() as CategoryRenamedEvent[];
            expect(event).toBeInstanceOf(CategoryRenamedEvent);
            expect(event.props).toMatchObject({ name: 'Shirts', previousName: 'Tops', fullName: 'Apparel > Shirts', previousFullName: 'Apparel > Tops' });
        });

        it('records nothing when the name did not change', () => {
            const root = aRoot();
            drain(root);

            root.rename('Apparel');

            expect(root.pullEvents()).toHaveLength(0);
        });
    });

    describe('moving', () => {
        it('respells under the new parent', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });
            const outerwear = Category.create({ parent: null, name: 'Outerwear' });
            drain(child);

            child.moveTo(placementOf(outerwear));

            expect(child.fullName).toBe('Outerwear > Tops');
            const [event] = child.pullEvents() as CategoryMovedEvent[];
            expect(event.props.previousFullName).toBe('Apparel > Tops');
            expect(event.props.parentId?.equals(outerwear.id)).toBe(true);
        });

        it('lifts a child to the top', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });
            drain(child);

            child.moveTo(null);

            expect(child.parentId).toBeNull();
            expect(child.fullName).toBe('Tops');
        });

        it('records nothing when the parent did not change', () => {
            const root = aRoot();
            const child = Category.create({ parent: placementOf(root), name: 'Tops' });
            drain(child);

            child.moveTo(placementOf(root));

            expect(child.pullEvents()).toHaveLength(0);
        });
    });

    describe('respelling a branch', () => {
        it('changes only the place, not the name', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });
            drain(child);

            child.refreshPath('Clothing');

            expect(child.name).toBe('Tops');
            expect(child.fullName).toBe('Clothing > Tops');
            const [event] = child.pullEvents() as CategoryPathChangedEvent[];
            expect(event).toBeInstanceOf(CategoryPathChangedEvent);
            expect(event.props.previousFullName).toBe('Apparel > Tops');
        });

        it('records nothing when the spelling came out the same', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });
            drain(child);

            child.refreshPath('Apparel');

            expect(child.pullEvents()).toHaveLength(0);
        });

        it('still applies to an archived branch, whose place changed all the same', () => {
            const child = Category.create({ parent: placementOf(aRoot()), name: 'Tops' });
            child.archive();
            drain(child);

            child.refreshPath('Clothing');

            expect(child.fullName).toBe('Clothing > Tops');
        });
    });

    describe('lifecycle', () => {
        it('refuses to purge what was never archived', () => {
            expect(() => aRoot().purge()).toThrow(CategoryNotArchivedException);
        });

        it('archives before purging', () => {
            const root = aRoot();
            drain(root);

            root.archive();
            root.purge();

            const events = root.pullEvents();
            expect(events[0]).toBeInstanceOf(CategoryArchivedEvent);
            expect(events[1]).toBeInstanceOf(CategoryPurgedEvent);
        });

        it('leaves an archived category open to nothing but purging', () => {
            const root = aRoot();
            root.archive();

            expect(() => root.rename('Clothing')).toThrow(ArchivedCategoryNotEditableException);
            expect(() => root.moveTo(null)).toThrow(ArchivedCategoryNotEditableException);
        });

        it('refuses every change once purged', () => {
            const root = aRoot();
            root.archive();
            root.purge();

            expect(() => root.archive()).toThrow(CategoryAlreadyPurgedException);
            expect(() => root.refreshPath('Clothing')).toThrow(CategoryAlreadyPurgedException);
        });
    });
});
