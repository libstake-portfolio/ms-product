import { TypedQuery } from '@modules/common/server-cqrs/types/typed-query';

import { Option } from '../../domain/models/option.entity';
import { OptionId } from '../../types/ids/option-id';

export interface GetOptionQueryProps {
    conditions: {
        id: OptionId;
    };
}

export class GetOptionQuery extends TypedQuery<Option | null> {
    public readonly props: GetOptionQueryProps;

    public constructor(props: GetOptionQueryProps) {
        super();
        this.props = props;
    }
}
