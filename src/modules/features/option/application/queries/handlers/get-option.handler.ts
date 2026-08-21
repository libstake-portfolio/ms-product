import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';

import { TypedQueryHandler } from '@modules/common/server-cqrs/types/typed-query-handler';
import { Option } from '@modules/features/option/domain/models/option.entity';
import { OPTION_REPOSITORY, OptionRepository } from '@modules/features/option/domain/repositories/option.repository';

import { GetOptionQuery } from '../get-option.query';

@QueryHandler(GetOptionQuery)
export class GetOptionHandler implements TypedQueryHandler<GetOptionQuery> {
    public constructor(
        @Inject(OPTION_REPOSITORY)
        private readonly options: OptionRepository,
    ) {}

    public async execute(query: GetOptionQuery): Promise<Option | null> {
        return this.options.findById(query.props.conditions.id);
    }
}
