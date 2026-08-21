import { TypedCommand } from './typed-command';

type CommandResult<T> = T extends TypedCommand<infer R> ? R : never;

/**
 * Handler contract binding the return type to the command it handles.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TypedCommandHandler<T extends TypedCommand<any>> {
    execute(command: T): Promise<CommandResult<T>>;
}
