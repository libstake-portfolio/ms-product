import { QueryHandler } from '@nestjs/cqrs';

import { TypedQueryHandler } from '@modules/common/server-cqrs/types/typed-query-handler';
import { Product } from '@modules/features/product/domain/models/product.entity';

import { GetProductQuery } from '../get-product.query';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements TypedQueryHandler<GetProductQuery> {
    public constructor() {}

    public async execute(query: GetProductQuery): Promise<Product | null> {
        const { conditions: _conditions } = query.props;
        return null;
    }
}
