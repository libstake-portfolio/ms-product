import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { TypedCommand } from './types/typed-command';

/**
 * Command bus that resolves to the type the command declares.
 */
@Injectable()
export class TypedCommandBus {
    public constructor(private readonly commandBus: CommandBus) {}

    public execute<TResult>(command: TypedCommand<TResult>): Promise<TResult> {
        return this.commandBus.execute(command);
    }
}
