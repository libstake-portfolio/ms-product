import { AnyId } from '@common/base/any-id';

export class CategoryId extends AnyId<'CategoryId'> {
    public constructor(value: string) {
        super(value);
    }
}
