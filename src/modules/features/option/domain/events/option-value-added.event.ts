import { OptionValueBaseEvent, OptionValueBaseEventProps } from './base/option-value.base-event';

export interface OptionValueAddedEventProps extends OptionValueBaseEventProps {
    name: string;
}

export class OptionValueAddedEvent extends OptionValueBaseEvent<OptionValueAddedEventProps> {
    public constructor(props: OptionValueAddedEventProps) {
        super(props);
    }
}
