import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

const DATABASE_PING_TIMEOUT_MS = 3_000;

@Controller('health')
export class HealthController {
    public constructor(
        private readonly healthCheckService: HealthCheckService,
        private readonly databaseIndicator: TypeOrmHealthIndicator,
    ) {}

    /**
     * Reports whether the process itself is still healthy.
     *
     * Dependencies are deliberately not checked here: a failure is answered by replacing the process,
     * which does nothing for a dependency that is down and turns its outage into a restart loop.
     */
    @Get('live')
    @HealthCheck()
    public checkLiveness(): Promise<HealthCheckResult> {
        return this.healthCheckService.check([]);
    }

    /**
     * Reports whether the process can serve traffic right now.
     *
     * A failure withdraws this instance from routing while leaving it running, so the dependencies
     * a request needs belong here.
     */
    @Get('ready')
    @HealthCheck()
    public checkReadiness(): Promise<HealthCheckResult> {
        return this.healthCheckService.check([() => this.databaseIndicator.pingCheck('database', { timeout: DATABASE_PING_TIMEOUT_MS })]);
    }
}
