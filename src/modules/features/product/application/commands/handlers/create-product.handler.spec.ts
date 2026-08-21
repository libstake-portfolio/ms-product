import { TransactionRunner } from '@modules/common/database/transaction-runner.port';
import { CategoryId } from '@modules/features/category/types/ids/category-id';
import { ProductCreatedEvent } from '@modules/features/product/domain/events/product-created.event';
import { Product } from '@modules/features/product/domain/models/product.entity';
import { ProductRepository } from '@modules/features/product/domain/repositories/product.repository';

import { CreateProductCommand } from '../create-product.command';

import { CreateProductHandler } from './create-product.handler';

const aCommand = () =>
    new CreateProductCommand({
        payload: { categoryId: new CategoryId('category-1'), handle: 'tee', name: 'Tee', descriptionHtml: '<p>soft</p>' },
    });

describe('CreateProductHandler', () => {
    let openBoundaries: number;
    let persistedWithin: boolean;
    let persisted: Product[];
    let handler: CreateProductHandler;

    beforeEach(() => {
        openBoundaries = 0;
        persistedWithin = false;
        persisted = [];

        const transaction: TransactionRunner = {
            run: async <T>(fn: () => Promise<T>): Promise<T> => {
                openBoundaries += 1;
                try {
                    return await fn();
                } finally {
                    openBoundaries -= 1;
                }
            },
        };

        const products: ProductRepository = {
            findById: async () => null,
            persist: async product => {
                persistedWithin = openBoundaries > 0;
                persisted.push(product);
                return product.id;
            },
        };

        handler = new CreateProductHandler(transaction, products);
    });

    it('answers with the identifier the aggregate issued', async () => {
        const id = await handler.execute(aCommand());

        expect(persisted).toHaveLength(1);
        expect(id.equals(persisted[0].id)).toBe(true);
    });

    it('saves within a boundary', async () => {
        await handler.execute(aCommand());

        expect(persistedWithin).toBe(true);
    });

    it('builds the product from the payload', async () => {
        await handler.execute(aCommand());

        const [product] = persisted;
        expect(product.handle).toBe('tee');
        expect(product.name).toBe('Tee');
        expect(product.description).toBe('soft');
        expect(product.categoryId?.serialize()).toBe('category-1');
        expect(product.options).toHaveLength(0);
        expect(product.variants).toHaveLength(0);
    });

    it('leaves the recorded fact for the repository to hand on', async () => {
        await handler.execute(aCommand());

        expect(persisted[0].pullEvents()[0]).toBeInstanceOf(ProductCreatedEvent);
    });
});
