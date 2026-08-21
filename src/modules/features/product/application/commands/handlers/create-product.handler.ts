import { CommandHandler } from '@nestjs/cqrs';

import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { ProductId } from '@modules/features/product/types/ids/product-id';

import { CreateProductCommand } from '../create-product.command';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements TypedCommandHandler<CreateProductCommand> {
    public constructor() {}

    public async execute(command: CreateProductCommand): Promise<ProductId> {
        const { payload: _payload } = command.props;
        return new ProductId('1234-5678-91011');
    }
}
