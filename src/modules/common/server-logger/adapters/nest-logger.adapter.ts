import { Injectable, LoggerService } from '@nestjs/common';

import { ServerLogger } from '../server-logger.service';

const NEST_CALLER = 'Nest';

/** Routes framework logs through the same pipeline. Pass to `app.useLogger()`. */
@Injectable()
export class ServerLoggerNestAdapter implements LoggerService {
    public constructor(private readonly logger: ServerLogger) {}

    public log(message: unknown, context?: string) {
        this.logger.info(String(message), { caller: context || NEST_CALLER });
    }

    public error(message: unknown, stack?: string, context?: string) {
        this.logger.error(String(message), stack, { caller: context || NEST_CALLER });
    }

    public fatal(message: unknown, context?: string) {
        this.logger.error(String(message), undefined, { caller: context || NEST_CALLER });
    }

    public warn(message: unknown, context?: string) {
        this.logger.warn(String(message), { caller: context || NEST_CALLER });
    }

    public debug(message: unknown, context?: string) {
        this.logger.debug(String(message), { caller: context || NEST_CALLER });
    }

    public verbose(message: unknown, context?: string) {
        this.logger.verbose(String(message), { caller: context || NEST_CALLER });
    }
}
