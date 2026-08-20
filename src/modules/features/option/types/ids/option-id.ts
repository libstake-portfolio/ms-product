import { AnyId } from '@common/base/any-id';

export class OptionId extends AnyId<'OptionId'> {
    public constructor(value: string) {
        super(value);
    }
}
