import { ValueObject } from './value-object';

export abstract class AnyId<Brand extends string, T extends string = string> extends ValueObject<AnyId<Brand, T>, T> {
    // Nominal marker. Without a per-subclass literal, ids sharing an underlying type stay mutually assignable.
    declare public readonly _brand: Brand;

    protected readonly _id: T;

    public constructor(public readonly value: T) {
        if (!value) throw new Error(`AnyId value cannot be empty`);
        super();
        this._id = value;
    }

    public get id() {
        return this._id;
    }

    public override toString() {
        return this.serialize();
    }

    public override serialize() {
        return this._id;
    }

    public override equals(other: AnyId<Brand, T>) {
        if (!other) return false;
        // The brand is compile-time only, so ids crossing an untyped boundary need the concrete class compared.
        if (this.constructor !== other.constructor) return false;
        return this._id === other._id;
    }

    public override copy(): this {
        return new (this.constructor as new (value: T) => this)(this._id);
    }
}
