import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { OPTION_REPOSITORY, OptionRepository } from '@modules/features/option/domain/repositories/option.repository';

import { OptionNotFoundException } from '../../errors/option-not-found.exception';
import { RenameOptionCommand } from '../rename-option.command';

@CommandHandler(RenameOptionCommand)
export class RenameOptionHandler implements TypedCommandHandler<RenameOptionCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(OPTION_REPOSITORY)
        private readonly options: OptionRepository,
    ) {}

    public async execute(command: RenameOptionCommand): Promise<void> {
        const { id } = command.props.conditions;
        const { name } = command.props.payload;

        await this.transaction.run(async () => {
            const option = await this.options.findById(id);
            if (!option) throw new OptionNotFoundException(id.serialize());

            option.rename(name);
            await this.options.persist(option);
        });
    }
}
