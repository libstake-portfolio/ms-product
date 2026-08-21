import { AnyId } from '@common/base/any-id';

export class ProductVariantId extends AnyId<'ProductVariantId'> {
    public constructor(value: string) {
        super(value);
    }
}
