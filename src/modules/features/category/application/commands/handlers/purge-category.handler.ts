import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';

import { CategoryHasChildrenException } from '../../errors/category-has-children.exception';
import { CategoryTree } from '../../services/category-tree.service';
import { PurgeCategoryCommand } from '../purge-category.command';

@CommandHandler(PurgeCategoryCommand)
export class PurgeCategoryHandler implements TypedCommandHandler<PurgeCategoryCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
        private readonly tree: CategoryTree,
    ) {}

    // Unlike archiving, this happens one leaf at a time: each category waits until whoever pointed at it let go.
    public async execute(command: PurgeCategoryCommand): Promise<void> {
        const { id } = command.props.conditions;

        await this.transaction.run(async () => {
            const category = await this.tree.requireById(id);
            const children = await this.categories.findChildren(id);
            if (children.length > 0) throw new CategoryHasChildrenException(id.serialize());

            category.purge();
            await this.categories.persist(category);
        });
    }
}
