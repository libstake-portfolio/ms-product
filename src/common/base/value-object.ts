export abstract class ValueObject<Self, Serializable> {
    public abstract equals(other: Self): boolean;
    public abstract copy(): Self;
    public abstract serialize(): Serializable;
}
