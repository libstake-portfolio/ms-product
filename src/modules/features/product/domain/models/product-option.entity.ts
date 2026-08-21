import { DomainEntity } from '@common/base/domain-entity';
import { OptionId } from '@modules/features/option/types/ids/option-id';

export interface ProductOptionProps {
    optionId: OptionId;
    position: number;
}

// An option the product answers. Its identity within the product is the option it points at.
export class ProductOption extends DomainEntity {
    public readonly optionId: OptionId;

    protected _position: number;

    protected constructor({ optionId, position }: ProductOptionProps) {
        super();
        this.optionId = optionId;
        this._position = position;
    }

    public static create(props: ProductOptionProps): ProductOption {
        return new ProductOption(props);
    }

    // Rebuilds an already-persisted entity as-is, without validating.
    public static reconstitute(props: ProductOptionProps): ProductOption {
        return new ProductOption(props);
    }

    public get position(): number {
        return this._position;
    }

    // Only the root moves an option, because only the root can see the order as a whole.
    public reposition(position: number): void {
        this._position = position;
    }

    public copy(): ProductOption {
        return new ProductOption({
            optionId: this.optionId.copy(),
            position: this._position,
        });
    }

    public isIdentical(other: ProductOption): boolean {
        if (!other) return false;
        return this.optionId.equals(other.optionId);
    }
}
