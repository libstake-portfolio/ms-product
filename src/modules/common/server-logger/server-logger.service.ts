import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

/** Underlying logger instance. Internal to the module so the implementation stays swappable. */
export const SERVER_LOGGER_INSTANCE = Symbol('SERVER_LOGGER_INSTANCE');

/** Contract the injected instance has to satisfy. Keeps the implementation off this class. */
export interface LogWriter {
    log(level: string, message: string, meta: LogOption): void;
}

/** Extra fields merged into a log entry. Unknown keys are passed through to the format. */
export interface LogOption {
    namespace?: string;
    [key: string]: unknown;
}

/**
 * Transient-scoped server logger that auto-resolves the caller class name.
 * WARNING: If injected into a REQUEST-scoped service, a new instance will be created per request.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class ServerLogger {
    private readonly caller: string;

    public constructor(
        @Inject(SERVER_LOGGER_INSTANCE)
        private readonly writer: LogWriter,
        @Inject(INQUIRER) parentClass: object,
    ) {
        this.caller = parentClass?.constructor?.name ?? 'Unknown';
    }

    public info(message: string, option?: LogOption) {
        this.writer.log('info', message, { caller: this.caller, ...option });
    }

    public error(message: string, error: unknown, option?: LogOption) {
        this.writer.log('error', message, { caller: this.caller, error, ...option });
    }

    public http(message: string, option?: LogOption) {
        this.writer.log('http', message, { caller: this.caller, ...option });
    }

    public warn(message: string, option?: LogOption) {
        this.writer.log('warn', message, { caller: this.caller, ...option });
    }

    public debug(message: string, option?: LogOption) {
        this.writer.log('debug', message, { caller: this.caller, ...option });
    }

    public verbose(message: string, option?: LogOption) {
        this.writer.log('verbose', message, { caller: this.caller, ...option });
    }

    public silly(message: string, option?: LogOption) {
        this.writer.log('silly', message, { caller: this.caller, ...option });
    }
}
