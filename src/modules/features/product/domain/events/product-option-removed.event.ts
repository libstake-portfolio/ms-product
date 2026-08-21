import { OptionId } from '@modules/features/option/types/ids/option-id';

import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

export interface ProductOptionRemovedEventProps extends ProductBaseEventProps {
    optionId: OptionId;
}

export class ProductOptionRemovedEvent extends ProductBaseEvent<ProductOptionRemovedEventProps> {
    public constructor(props: ProductOptionRemovedEventProps) {
        super(props);
    }
}
