import { AnyId } from '@common/base/any-id';

export class ProductId extends AnyId<'ProductId'> {
    public constructor(value: string) {
        super(value);
    }
}
