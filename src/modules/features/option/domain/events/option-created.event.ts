import { OptionBaseEvent, OptionBaseEventProps } from './base/option.base-event';

export interface OptionCreatedEventProps extends OptionBaseEventProps {
    name: string;
}

export class OptionCreatedEvent extends OptionBaseEvent<OptionCreatedEventProps> {
    public constructor(props: OptionCreatedEventProps) {
        super(props);
    }
}
