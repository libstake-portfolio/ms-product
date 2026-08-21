import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { OPTION_REPOSITORY, OptionRepository } from '@modules/features/option/domain/repositories/option.repository';
import { OptionValueId } from '@modules/features/option/types/ids/option-value-id';

import { OptionNotFoundException } from '../../errors/option-not-found.exception';
import { AddOptionValueCommand } from '../add-option-value.command';

@CommandHandler(AddOptionValueCommand)
export class AddOptionValueHandler implements TypedCommandHandler<AddOptionValueCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(OPTION_REPOSITORY)
        private readonly options: OptionRepository,
    ) {}

    public async execute(command: AddOptionValueCommand): Promise<OptionValueId> {
        const { id } = command.props.conditions;
        const { name } = command.props.payload;

        return this.transaction.run(async () => {
            const option = await this.options.findById(id);
            if (!option) throw new OptionNotFoundException(id.serialize());

            const optionValueId = option.addValue(name);
            await this.options.persist(option);

            return optionValueId;
        });
    }
}
