import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { Product } from '@modules/features/product/domain/models/product.entity';
import { PRODUCT_REPOSITORY, ProductRepository } from '@modules/features/product/domain/repositories/product.repository';
import { ProductId } from '@modules/features/product/types/ids/product-id';

import { CreateProductCommand } from '../create-product.command';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements TypedCommandHandler<CreateProductCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(PRODUCT_REPOSITORY)
        private readonly products: ProductRepository,
    ) {}

    public async execute(command: CreateProductCommand): Promise<ProductId> {
        const { payload } = command.props;

        // One use case is one boundary: the row and the facts it produced settle or vanish together.
        return this.transaction.run(async () => {
            const product = Product.create(payload);
            return this.products.persist(product);
        });
    }
}
