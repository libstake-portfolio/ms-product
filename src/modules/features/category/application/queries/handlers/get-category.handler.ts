import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { TypedQueryHandler } from '@modules/common/server-cqrs/types/typed-query-handler';
import { Category } from '@modules/features/category/domain/models/category.entity';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';

import { GetCategoryQuery } from '../get-category.query';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements TypedQueryHandler<GetCategoryQuery> {
    public constructor(
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
    ) {}

    public async execute(query: GetCategoryQuery): Promise<Category | null> {
        return this.categories.findById(query.props.conditions.id);
    }
}
