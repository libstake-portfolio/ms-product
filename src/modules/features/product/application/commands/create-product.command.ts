import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { ProductId } from '../../types/ids/product-id';

export interface CreateProductCommandProps {
    payload: {
        name: string;
        descriptionHtml: string;
    };
}

export class CreateProductCommand extends TypedCommand<ProductId> {
    public readonly props: CreateProductCommandProps;

    public constructor(props: CreateProductCommandProps) {
        super();
        this.props = props;
    }
}
