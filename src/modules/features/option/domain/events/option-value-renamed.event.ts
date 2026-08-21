import { OptionValueBaseEvent, OptionValueBaseEventProps } from './base/option-value.base-event';

export interface OptionValueRenamedEventProps extends OptionValueBaseEventProps {
    name: string;
    previousName: string;
}

export class OptionValueRenamedEvent extends OptionValueBaseEvent<OptionValueRenamedEventProps> {
    public constructor(props: OptionValueRenamedEventProps) {
        super(props);
    }
}
