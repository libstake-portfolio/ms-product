import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseShutdownService {
    public constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    public async onModuleDestroy(): Promise<void> {
        await this.cleanUp();
    }

    public async onApplicationShutdown(_signal: string) {
        await this.cleanUp();
    }

    private async cleanUp() {
        // TODO - Implement database connection & transaction cleanup logic here
    }
}
