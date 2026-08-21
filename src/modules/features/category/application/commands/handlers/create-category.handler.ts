import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

import { TRANSACTION_RUNNER, TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { TypedCommandHandler } from '@modules/common/server-cqrs/types/typed-command-handler';
import { Category } from '@modules/features/category/domain/models/category.entity';
import { CATEGORY_REPOSITORY, CategoryRepository } from '@modules/features/category/domain/repositories/category.repository';
import { CategoryId } from '@modules/features/category/types/ids/category-id';

import { CategoryTree } from '../../services/category-tree.service';
import { CreateCategoryCommand } from '../create-category.command';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements TypedCommandHandler<CreateCategoryCommand> {
    public constructor(
        @Inject(TRANSACTION_RUNNER)
        private readonly transaction: TransactionRunner,
        @Inject(CATEGORY_REPOSITORY)
        private readonly categories: CategoryRepository,
        private readonly tree: CategoryTree,
    ) {}

    public async execute(command: CreateCategoryCommand): Promise<CategoryId> {
        const { parentId, name } = command.props.payload;

        return this.transaction.run(async () => {
            const parent = parentId === null ? null : await this.tree.requireById(parentId);
            await this.tree.requireNameFree(parentId, name, null);

            const category = Category.create({ parent: parent && { id: parent.id, fullName: parent.fullName }, name });
            return this.categories.persist(category);
        });
    }
}
