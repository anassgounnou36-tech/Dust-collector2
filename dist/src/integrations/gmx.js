"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GMX_CONTRACTS = exports.gmxIntegration = void 0;
const env_js_1 = require("../config/env.js");
exports.gmxIntegration = {
    key: 'gmx',
    chain: 'avalanche',
    async discoverWallets() {
        if (env_js_1.env.enableSyntheticGmx) {
            // Synthetic mode: return test wallets with GMX-like data
            console.log('GMX: Using synthetic mode for wallet discovery');
            return [
                { value: '0x1111111111111111111111111111111111111111', chain: 'avalanche' },
                { value: '0x2222222222222222222222222222222222222222', chain: 'avalanche' },
                { value: '0x3333333333333333333333333333333333333333', chain: 'avalanche' },
            ];
        }
        // TODO: Implement real GMX wallet discovery
        // This would involve querying:
        // - GMX token stakers
        // - GLP holders
        // - Fee reward recipients
        // - Escrowed GMX holders
        console.log('GMX: Real discovery not implemented yet');
        return [];
    },
    async getPendingRewards(wallets) {
        if (env_js_1.env.enableSyntheticGmx) {
            // Synthetic mode: return mock GMX rewards
            console.log(`GMX: Using synthetic mode for reward scanning (${wallets.length} wallets)`);
            const mockRewards = [];
            const now = new Date();
            for (const wallet of wallets) {
                // Mock staked GMX rewards (WETH)
                mockRewards.push({
                    id: `gmx-staking-${wallet.value}`,
                    wallet,
                    protocol: 'gmx',
                    token: { value: exports.GMX_CONTRACTS.WETH, chain: 'avalanche' },
                    amountWei: '1250000000000000000', // 1.25 WETH
                    amountUsd: 3.75, // ~$3000 * 1.25
                    claimTo: wallet,
                    discoveredAt: now,
                    estGasLimit: 180000
                });
                // Mock GLP fee rewards (AVAX)
                mockRewards.push({
                    id: `gmx-glp-fees-${wallet.value}`,
                    wallet,
                    protocol: 'gmx',
                    token: { value: exports.GMX_CONTRACTS.WAVAX, chain: 'avalanche' },
                    amountWei: '5500000000000000000', // 5.5 AVAX
                    amountUsd: 2.20, // ~$40 * 5.5
                    claimTo: wallet,
                    discoveredAt: now,
                    estGasLimit: 160000
                });
            }
            return mockRewards;
        }
        // TODO: Implement real GMX reward scanning
        // This would involve:
        // - Checking staked GMX rewards (ETH/AVAX)
        // - GLP fee rewards
        // - Escrowed GMX vesting
        // - Multiplier points
        console.log(`GMX: Real reward scanning not implemented for ${wallets.length} wallets`);
        return [];
    },
    async buildBundle(rewards) {
        if (env_js_1.env.enableSyntheticGmx) {
            // Synthetic mode: create mock bundles
            console.log(`GMX: Using synthetic mode for bundle building (${rewards.length} rewards)`);
            if (rewards.length === 0)
                return [];
            const bundle = {
                id: `gmx-bundle-${Date.now()}`,
                chain: 'avalanche',
                protocol: 'gmx',
                claimTo: rewards[0].claimTo,
                items: rewards,
                totalUsd: rewards.reduce((sum, r) => sum + r.amountUsd, 0),
                estGasUsd: 0.25, // Mock gas estimate
                netUsd: rewards.reduce((sum, r) => sum + r.amountUsd, 0) - 0.25
            };
            return [bundle];
        }
        // TODO: Implement GMX-specific bundling logic
        console.log(`GMX: Real bundle building not implemented for ${rewards.length} rewards`);
        return [];
    }
};
// GMX contract addresses on Avalanche (for future implementation)
exports.GMX_CONTRACTS = {
    // Core contracts
    GMX_TOKEN: '0x62edc0692BD897D2295872a9FFCac5425011c661',
    GLP_TOKEN: '0x01234567890123456789012345678901234567890', // TODO: Get real address
    // Staking contracts
    STAKED_GMX: '0x2bD10f8E93B3669b6d42E74eEedC65dd8D6dC0c4',
    STAKED_GLP: '0x9e295B5B976a184B14aD8cd72413aD846C299660',
    // Reward contracts
    FEE_GLP_TRACKER: '0x4e971a87900b931fF39d1Aad67697F49835400b6',
    FEE_GMX_TRACKER: '0xd2D1162512F927a7e282Ef43a362659E4F2a728F',
    // Reward tokens
    WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
};
//# sourceMappingURL=gmx.js.map