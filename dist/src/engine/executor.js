"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
exports.executeSequential = executeSequential;
exports.executeBatch = executeBatch;
exports.aggregateExecutionResults = aggregateExecutionResults;
const logger_js_1 = require("./logger.js");
async function execute(bundle, clients) {
    try {
        const client = clients.get(bundle.chain);
        if (!client) {
            const error = `No client configured for chain: ${bundle.chain}`;
            logger_js_1.logger.error(`Execution failed for bundle ${bundle.id}: ${error}`);
            return {
                success: false,
                error,
                claimedUsd: 0,
                chain: bundle.chain
            };
        }
        logger_js_1.logger.info(`Executing bundle ${bundle.id} with ${bundle.items.length} items worth $${bundle.totalUsd.toFixed(2)}`);
        const result = await client.sendRaw(bundle);
        if (result.success) {
            logger_js_1.logger.bundleExecuted(bundle.id, true, result.txHash);
        }
        else {
            logger_js_1.logger.bundleExecuted(bundle.id, false, undefined, result.error);
        }
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_js_1.logger.error(`Execution error for bundle ${bundle.id}:`, errorMessage);
        return {
            success: false,
            error: `Execution error: ${errorMessage}`,
            claimedUsd: 0,
            chain: bundle.chain
        };
    }
}
async function executeSequential(bundles, clients) {
    const results = [];
    // Execute bundles sequentially to avoid nonce conflicts and better error handling
    for (const bundle of bundles) {
        const result = await execute(bundle, clients);
        results.push(result);
        // Add small delay between executions
        if (bundles.indexOf(bundle) < bundles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return results;
}
async function executeBatch(bundles, clients, batchSize = 3) {
    const results = [];
    // Process bundles in batches to balance speed and reliability
    for (let i = 0; i < bundles.length; i += batchSize) {
        const batch = bundles.slice(i, i + batchSize);
        // Execute batch in parallel
        const batchPromises = batch.map(bundle => execute(bundle, clients));
        const batchResults = await Promise.allSettled(batchPromises);
        for (let j = 0; j < batchResults.length; j++) {
            const result = batchResults[j];
            const bundle = batch[j];
            if (!bundle)
                continue;
            if (result.status === 'fulfilled') {
                results.push(result.value);
            }
            else {
                logger_js_1.logger.error(`Execution promise rejected for bundle ${bundle.id}:`, result.reason);
                results.push({
                    success: false,
                    error: `Promise rejection: ${result.reason}`,
                    claimedUsd: 0,
                    chain: bundle.chain
                });
            }
        }
        // Add delay between batches
        if (i + batchSize < bundles.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    return results;
}
function aggregateExecutionResults(results) {
    let successCount = 0;
    let failureCount = 0;
    let totalClaimedUsd = 0;
    let totalGasUsd = 0;
    for (const result of results) {
        if (result.success) {
            successCount++;
            totalClaimedUsd += result.claimedUsd;
            if (result.gasUsd) {
                totalGasUsd += result.gasUsd;
            }
        }
        else {
            failureCount++;
        }
    }
    const netUsd = totalClaimedUsd - totalGasUsd;
    const successRate = results.length > 0 ? successCount / results.length : 0;
    return {
        successCount,
        failureCount,
        totalClaimedUsd,
        totalGasUsd,
        netUsd,
        successRate
    };
}
//# sourceMappingURL=executor.js.map