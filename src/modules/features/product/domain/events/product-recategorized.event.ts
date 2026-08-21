import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

// Both ends are optional: the first assignment has no previous, and clearing has no current.
export interface ProductRecategorizedEventProps extends ProductBaseEventProps {
    categoryId: CategoryId | null;
    previousCategoryId: CategoryId | null;
}

export class ProductRecategorizedEvent extends ProductBaseEvent<ProductRecategorizedEventProps> {
    public constructor(props: ProductRecategorizedEventProps) {
        super(props);
    }
}
