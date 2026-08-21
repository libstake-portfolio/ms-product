import { ProductId } from '../../types/ids/product-id';
import { Product } from '../models/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
export abstract class ProductRepository {
    public abstract findById(id: ProductId): Promise<Product | null>;
    public abstract persist(entity: Product): Promise<ProductId>;
}
