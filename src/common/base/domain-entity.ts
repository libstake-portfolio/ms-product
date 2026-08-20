export abstract class DomainEntity {
    public abstract copy(): DomainEntity;
    public abstract isIdentical(other: DomainEntity): boolean;
    // public abstract checksum(): string;
}
