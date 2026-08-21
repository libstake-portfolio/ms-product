import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';

import { CategoryTree } from '../../services/category-tree.service';
import { MoveCategoryCommand } from '../move-category.command';

@CommandHandler(MoveCategoryCommand)
export class MoveCategoryHandler implements TypedCommandHandler<MoveCategoryCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
        private readonly tree: CategoryTree,
    ) {}

    public async execute(command: MoveCategoryCommand): Promise<void> {
        const { id } = command.props.conditions;
        const { parentId } = command.props.payload;

        await this.transaction.run(async () => {
            const category = await this.tree.requireById(id);
            const descendants = await this.tree.findDescendants(id);

            const parent = parentId === null ? null : await this.tree.requireById(parentId);
            if (parent) this.tree.requireOutsideOwnBranch(category, parent, descendants);
            await this.tree.requireNameFree(parentId, category.name, id);

            category.moveTo(parent && { id: parent.id, fullName: parent.fullName });
            await this.categories.persist(category);
            await this.tree.respellBranch(category, descendants);
        });
    }
}
