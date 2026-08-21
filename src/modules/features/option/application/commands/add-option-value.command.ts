import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';
import { OptionValueId } from '../../types/ids/option-value-id';

export interface AddOptionValueCommandProps {
    conditions: {
        id: OptionId;
    };
    payload: {
        name: string;
    };
}

export class AddOptionValueCommand extends TypedCommand<OptionValueId> {
    public readonly props: AddOptionValueCommandProps;

    public constructor(props: AddOptionValueCommandProps) {
        super();
        this.props = props;
    }
}
