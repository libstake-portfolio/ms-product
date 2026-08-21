import { TypedQuery } from '@modules/common/server-cqrs/types/typed-query';

import { Category } from '../../domain/models/category.entity';
import { CategoryId } from '../../types/ids/category-id';

export interface GetCategoryQueryProps {
    conditions: {
        id: CategoryId;
    };
}

export class GetCategoryQuery extends TypedQuery<Category | null> {
    public readonly props: GetCategoryQueryProps;

    public constructor(props: GetCategoryQueryProps) {
        super();
        this.props = props;
    }
}
