import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { Option } from '@modules/features/option/domain/models/option.entity';
import { OPTION_REPOSITORY, OptionRepository } from '@modules/features/option/domain/repositories/option.repository';
import { OptionId } from '@modules/features/option/types/ids/option-id';

import { CreateOptionCommand } from '../create-option.command';

@CommandHandler(CreateOptionCommand)
export class CreateOptionHandler implements TypedCommandHandler<CreateOptionCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(OPTION_REPOSITORY)
        private readonly options: OptionRepository,
    ) {}

    public async execute(command: CreateOptionCommand): Promise<OptionId> {
        const { name } = command.props.payload;

        return this.transaction.run(async () => {
            const option = Option.create({ name });
            return this.options.persist(option);
        });
    }
}
