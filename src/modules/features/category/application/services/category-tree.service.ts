import { Inject, Injectable } from '@nestjs/common';

import { Category } from '@modules/features/category/domain/models/category.entity';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';
import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { CategoryCycleException } from '../errors/category-cycle.exception';
import { CategoryNotFoundException } from '../errors/category-not-found.exception';
import { DuplicateSiblingCategoryNameException } from '../errors/duplicate-sibling-category-name.exception';

/**
 * The rules that need more than one category to be answered.
 *
 * A single category knows its own name and where it points, but not whether that spot is taken,
 * whether a move would fold the tree onto itself, or how the branch below it should now read.
 */
@Injectable()
export class CategoryTree {
    public constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
    ) {}

    public async requireById(id: CategoryId): Promise<Category> {
        const category = await this.categories.findById(id);
        if (!category) throw new CategoryNotFoundException(id.serialize());

        return category;
    }

    public async requireNameFree(parentId: CategoryId | null, name: string, excluding: CategoryId | null): Promise<void> {
        const siblings = await this.categories.findChildren(parentId);
        const taken = siblings.some(sibling => sibling.name === name && !(excluding !== null && sibling.id.equals(excluding)));
        if (taken) throw new DuplicateSiblingCategoryNameException(name);
    }

    public requireOutsideOwnBranch(category: Category, parent: Category, descendants: Category[]): void {
        const wouldFold = parent.id.equals(category.id) || descendants.some(descendant => descendant.id.equals(parent.id));
        if (wouldFold) throw new CategoryCycleException(category.id.serialize());
    }

    /**
     * Rewrites the full name of everything below a category that just moved or was renamed.
     *
     * ! - Saves each descendant it touches, so they are already written when this returns.
     */
    public async respellBranch(root: Category, descendants: Category[]): Promise<void> {
        // Descendants arrive nearest generation first, so a parent's new name is always known before its children are read.
        const fullNameById = new Map<string, string>([[root.id.serialize(), root.fullName]]);

        for (const descendant of descendants) {
            const parentFullName = fullNameById.get(descendant.parentId!.serialize())!;
            descendant.refreshPath(parentFullName);
            fullNameById.set(descendant.id.serialize(), descendant.fullName);

            await this.categories.persist(descendant);
        }
    }

    public findDescendants(id: CategoryId): Promise<Category[]> {
        return this.categories.findDescendants(id);
    }
}
