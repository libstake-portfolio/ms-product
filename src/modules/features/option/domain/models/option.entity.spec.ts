import { OptionId } from '../../types/ids/option-id';
import { OptionValueId } from '../../types/ids/option-value-id';
import { ArchivedOptionNotEditableException } from '../errors/archived-option-not-editable.exception';
import { DuplicateOptionValueNameException } from '../errors/duplicate-option-value-name.exception';
import { OptionAlreadyPurgedException } from '../errors/option-already-purged.exception';
import { OptionNotArchivedException } from '../errors/option-not-archived.exception';
import { OptionValueLimitExceededException } from '../errors/option-value-limit-exceeded.exception';
import { OptionValueNotFoundException } from '../errors/option-value-not-found.exception';
import { OptionArchivedEvent } from '../events/option-archived.event';
import { OptionCreatedEvent } from '../events/option-created.event';
import { OptionPurgedEvent } from '../events/option-purged.event';
import { OptionRenamedEvent } from '../events/option-renamed.event';
import { OptionValueAddedEvent } from '../events/option-value-added.event';
import { OptionValueRemovedEvent } from '../events/option-value-removed.event';
import { OptionValueRenamedEvent } from '../events/option-value-renamed.event';

import { Option } from './option.entity';

const anOption = () => Option.create({ name: 'Colour' });
const drain = (option: Option) => option.pullEvents();

describe('Option', () => {
    describe('creation', () => {
        it('records the fact', () => {
            const option = anOption();

            const [event] = option.pullEvents();
            expect(event).toBeInstanceOf(OptionCreatedEvent);
            expect(event.aggregateId.equals(option.id)).toBe(true);
        });

        it('records nothing when restoring stored state', () => {
            const restored = Option.reconstitute({ id: new OptionId('option-1'), name: 'Colour', archivedAt: null, deletedAt: null, values: [] });

            expect(restored.pullEvents()).toHaveLength(0);
        });
    });

    describe('renaming', () => {
        it('carries the previous name', () => {
            const option = anOption();
            drain(option);

            option.rename('Shade');

            const [event] = option.pullEvents() as OptionRenamedEvent[];
            expect(event).toBeInstanceOf(OptionRenamedEvent);
            expect(event.props).toMatchObject({ name: 'Shade', previousName: 'Colour' });
        });

        it('records nothing when the name did not change', () => {
            const option = anOption();
            drain(option);

            option.rename('Colour');

            expect(option.pullEvents()).toHaveLength(0);
        });
    });

    describe('values', () => {
        it('answers with the identifier it issued', () => {
            const option = anOption();
            drain(option);

            const valueId = option.addValue('Red');

            expect(option.values.map(value => value.name)).toEqual(['Red']);
            const [event] = option.pullEvents() as OptionValueAddedEvent[];
            expect(event).toBeInstanceOf(OptionValueAddedEvent);
            expect(event.props.optionValueId.equals(valueId)).toBe(true);
            expect(event.aggregateId.equals(option.id)).toBe(true);
        });

        it('refuses a name the option already offers', () => {
            const option = anOption();
            option.addValue('Red');

            expect(() => option.addValue('Red')).toThrow(DuplicateOptionValueNameException);
        });

        it('stops at the load-size cap', () => {
            const option = anOption();
            for (let index = 0; index < 100; index += 1) option.addValue(`colour-${index}`);

            expect(() => option.addValue('one-too-many')).toThrow(OptionValueLimitExceededException);
        });

        it('removes by identity and refuses an unknown one', () => {
            const option = anOption();
            const valueId = option.addValue('Red');
            drain(option);

            expect(() => option.removeValue(new OptionValueId('never-issued'))).toThrow(OptionValueNotFoundException);

            option.removeValue(valueId);
            expect(option.values).toHaveLength(0);
            expect(option.pullEvents()[0]).toBeInstanceOf(OptionValueRemovedEvent);
        });

        it('renames a value against the option that owns it', () => {
            const option = anOption();
            const valueId = option.addValue('Red');
            drain(option);

            option.renameValue(valueId, 'Crimson');

            const [event] = option.pullEvents() as OptionValueRenamedEvent[];
            expect(event).toBeInstanceOf(OptionValueRenamedEvent);
            expect(event.props).toMatchObject({ name: 'Crimson', previousName: 'Red' });
            expect(event.aggregateId.equals(option.id)).toBe(true);
        });

        it('refuses a rename onto a name another value holds', () => {
            const option = anOption();
            const valueId = option.addValue('Red');
            option.addValue('Blue');

            expect(() => option.renameValue(valueId, 'Blue')).toThrow(DuplicateOptionValueNameException);
        });

        it('records nothing when a value name did not change', () => {
            const option = anOption();
            const valueId = option.addValue('Red');
            drain(option);

            option.renameValue(valueId, 'Red');

            expect(option.pullEvents()).toHaveLength(0);
        });
    });

    describe('lifecycle', () => {
        it('refuses to purge what was never archived', () => {
            expect(() => anOption().purge()).toThrow(OptionNotArchivedException);
        });

        it('archives before purging', () => {
            const option = anOption();
            drain(option);

            option.archive();
            option.purge();

            const events = option.pullEvents();
            expect(events[0]).toBeInstanceOf(OptionArchivedEvent);
            expect(events[1]).toBeInstanceOf(OptionPurgedEvent);
        });

        it('leaves an archived option open to nothing but purging', () => {
            const option = anOption();
            option.archive();

            expect(() => option.addValue('Red')).toThrow(ArchivedOptionNotEditableException);
        });

        it('refuses every change once purged', () => {
            const option = anOption();
            option.archive();
            option.purge();

            expect(() => option.rename('Shade')).toThrow(OptionAlreadyPurgedException);
        });
    });

    describe('encapsulation', () => {
        it('hands out values the caller cannot use to reach back in', () => {
            const option = anOption();
            option.addValue('Red');
            drain(option);

            option.values[0].rename('Tampered');

            expect(option.values[0].name).toBe('Red');
            expect(option.pullEvents()).toHaveLength(0);
        });
    });
});
