import { TypedCommand } from '@modules/common/server-cqrs/types/typed-command';

import { OptionId } from '../../types/ids/option-id';

export interface CreateOptionCommandProps {
    payload: {
        name: string;
    };
}

export class CreateOptionCommand extends TypedCommand<OptionId> {
    public readonly props: CreateOptionCommandProps;

    public constructor(props: CreateOptionCommandProps) {
        super();
        this.props = props;
    }
}
