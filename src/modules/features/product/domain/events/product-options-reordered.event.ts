import { OptionId } from '@modules/features/option/types/ids/option-id';

import { ProductBaseEvent, ProductBaseEventProps } from './base/product.base-event';

// The whole order travels, not the moved element, so a listener never has to reconstruct it.
export interface ProductOptionsReorderedEventProps extends ProductBaseEventProps {
    optionIds: OptionId[];
}

export class ProductOptionsReorderedEvent extends ProductBaseEvent<ProductOptionsReorderedEventProps> {
    public constructor(props: ProductOptionsReorderedEventProps) {
        super(props);
    }
}
