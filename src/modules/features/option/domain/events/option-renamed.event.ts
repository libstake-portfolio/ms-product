import { OptionBaseEvent, OptionBaseEventProps } from './base/option.base-event';

export interface OptionRenamedEventProps extends OptionBaseEventProps {
    name: string;
    previousName: string;
}

export class OptionRenamedEvent extends OptionBaseEvent<OptionRenamedEventProps> {
    public constructor(props: OptionRenamedEventProps) {
        super(props);
    }
}
