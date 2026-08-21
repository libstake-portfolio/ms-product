import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductCreatedEventProps extends ProductBaseEventProps {
    handle: string;
    name: string;
    categoryId: CategoryId | null;
}

export class ProductCreatedEvent extends ProductBaseEvent<ProductCreatedEventProps> {
    public constructor(props: ProductCreatedEventProps) {
        super(props);
    }
}
