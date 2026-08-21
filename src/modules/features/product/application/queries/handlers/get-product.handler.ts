import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { TypedQueryHandler } from '@modules/common/server-cqrs/types/typed-query-handler';
import { Product } from '@modules/features/product/domain/models/product.entity';
import { PRODUCT_REPOSITORY, ProductRepository } from '@modules/features/product/domain/repositories/product.repository';

import { GetProductQuery } from '../get-product.query';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements TypedQueryHandler<GetProductQuery> {
    public constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly products: ProductRepository,
    ) {}

    // Reading needs no boundary, so none is opened here.
    public async execute(query: GetProductQuery): Promise<Product | null> {
        return this.products.findById(query.props.conditions.id);
    }
}
