import { AnyId } from '@common/base/any-id';

export class OptionValueId extends AnyId<'OptionValueId'> {
    public constructor(value: string) {
        super(value);
    }
}
