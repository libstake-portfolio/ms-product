import { AnyId } from '@common/base/any-id';

export class VariantId extends AnyId<'VariantId'> {
    public constructor(value: string) {
        super(value);
    }
}
