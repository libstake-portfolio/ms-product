import { Global, Module } from '@nestjs/common';

import { TransactionContext } from './transaction-context';
import { TRANSACTION_RUNNER } from './transaction-runner.port';

@Global()
@Module({
    // One instance behind two surfaces: repositories read the manager, use cases open the boundary.
    providers: [TransactionContext, { provide: TRANSACTION_RUNNER, useExisting: TransactionContext }],
    exports: [TransactionContext, TRANSACTION_RUNNER],
})
export class TransactionModule {}
