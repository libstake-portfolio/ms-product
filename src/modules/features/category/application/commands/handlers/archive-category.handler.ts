import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';

import { CategoryTree } from '../../services/category-tree.service';
import { ArchiveCategoryCommand } from '../archive-category.command';

@CommandHandler(ArchiveCategoryCommand)
export class ArchiveCategoryHandler implements TypedCommandHandler<ArchiveCategoryCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
        private readonly tree: CategoryTree,
    ) {}

    /**
     * Marks a whole branch for teardown.
     *
     * Everything below goes with it: a branch on its way out cannot leave live categories hanging
     * off a parent that no longer classifies anything.
     */
    public async execute(command: ArchiveCategoryCommand): Promise<void> {
        const { id } = command.props.conditions;

        await this.transaction.run(async () => {
            const category = await this.tree.requireById(id);
            const descendants = await this.tree.findDescendants(id);

            category.archive();
            await this.categories.persist(category);

            for (const descendant of descendants) {
                descendant.archive();
                await this.categories.persist(descendant);
            }
        });
    }
}
