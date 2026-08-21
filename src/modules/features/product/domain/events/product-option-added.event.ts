import { OptionId } from '@modules/features/option/types/ids/option-id';

import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductOptionAddedEventProps extends ProductBaseEventProps {
    optionId: OptionId;
    position: number;
}

export class ProductOptionAddedEvent extends ProductBaseEvent<ProductOptionAddedEventProps> {
    public constructor(props: ProductOptionAddedEventProps) {
        super(props);
    }
}
