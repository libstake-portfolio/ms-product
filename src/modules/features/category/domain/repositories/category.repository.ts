import { CategoryId } from '../../types/ids/category-id';
import { Category } from '../models/category.entity';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export abstract class CategoryRepository {
    public abstract findById(id: CategoryId): Promise<Category | null>;
    // A null parent asks for the categories that sit at the top.
    public abstract findChildren(parentId: CategoryId | null): Promise<Category[]>;

    /**
     * Everything below the given category, nearest generation first.
     *
     * The order lets a caller respell a subtree in one pass: a parent is always seen before its children.
     */
    public abstract findDescendants(id: CategoryId): Promise<Category[]>;
    public abstract persist(entity: Category): Promise<CategoryId>;
}
