import { TypedQuery } from '@modules/common/server-cqrs/types/typed-query';
import { ProductId } from '@modules/features/product/types/ids/product-id';

import { Product } from '../../domain/models/product.entity';

export interface GetProductQueryProps {
    conditions: {
        id: ProductId;
    };
}

export class GetProductQuery extends TypedQuery<Product | null> {
    public readonly props: GetProductQueryProps;

    public constructor(props: GetProductQueryProps) {
        super();
        this.props = props;
    }
}
