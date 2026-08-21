import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';

import { CategoryTree } from '../../services/category-tree.service';
import { RenameCategoryCommand } from '../rename-category.command';

@CommandHandler(RenameCategoryCommand)
export class RenameCategoryHandler implements TypedCommandHandler<RenameCategoryCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
        private readonly tree: CategoryTree,
    ) {}

    public async execute(command: RenameCategoryCommand): Promise<void> {
        const { id } = command.props.conditions;
        const { name } = command.props.payload;

        // The branch below reads through this name, so respelling it belongs to the same boundary.
        await this.transaction.run(async () => {
            const category = await this.tree.requireById(id);
            await this.tree.requireNameFree(category.parentId, name, id);

            const descendants = await this.tree.findDescendants(id);
            category.rename(name);
            await this.categories.persist(category);
            await this.tree.respellBranch(category, descendants);
        });
    }
}
