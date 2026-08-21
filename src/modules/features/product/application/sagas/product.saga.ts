import { Injectable } from '@nestjs/common';

import { TypedCommandBus } from '@modules/common/server-cqrs/typed-command-bus';
import { TypedQueryBus } from '@modules/common/server-cqrs/typed-query-bus';

@Injectable()
export class ProductSaga {
    public constructor(
        private readonly commandBus: TypedCommandBus,
        private readonly queryBus: TypedQueryBus,
    ) {}
}
