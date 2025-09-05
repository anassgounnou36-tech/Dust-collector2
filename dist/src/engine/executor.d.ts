import type { ClaimBundle, ChainClient, TxResult } from '../types/common.js';
export declare function execute(bundle: ClaimBundle, clients: Map<string, ChainClient>): Promise<TxResult>;
export declare function executeSequential(bundles: ClaimBundle[], clients: Map<string, ChainClient>): Promise<TxResult[]>;
export declare function executeBatch(bundles: ClaimBundle[], clients: Map<string, ChainClient>, batchSize?: number): Promise<TxResult[]>;
export declare function aggregateExecutionResults(results: TxResult[]): {
    successCount: number;
    failureCount: number;
    totalClaimedUsd: number;
    totalGasUsd: number;
    netUsd: number;
    successRate: number;
};
//# sourceMappingURL=executor.d.ts.map