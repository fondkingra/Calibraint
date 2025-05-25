'use strict';

const { Contract } = require('fabric-contract-api');
const { TextEncoder, TextDecoder } = require('util');
const encoder = new TextEncoder();
const decoder = new TextDecoder();

class AssetChaincode extends Contract {
    
    // ============== INITIALIZATION ==============
    async Init(ctx) {
        console.log('Chaincode initialized');
        // Initialize with some sample assets if needed
        const assets = [
            {
                ID: 'asset1',
                owner: 'Org1Admin',
                value: 5000,
                description: 'Laptop',
                lastUpdated: new Date().toISOString()
            },
            {
                ID: 'asset2',
                owner: 'Org2Admin',
                value: 3000,
                description: 'Server',
                lastUpdated: new Date().toISOString()
            }
        ];

        for (const asset of assets) {
            await this.CreateAsset(
                ctx,
                asset.ID,
                asset.owner,
                asset.value.toString(),
                asset.description
            );
        }
    }

    // ============== CORE FUNCTIONS ==============

    /**
     * Create a new asset
     * @param {Context} ctx - The transaction context
     * @param {String} id - Asset ID
     * @param {String} owner - Initial owner
     * @param {String} value - Asset value
     * @param {String} description - Asset description
     */
    async CreateAsset(ctx, id, owner, value, description) {
        if (await this._assetExists(ctx, id)) {
            throw new Error(`Asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            owner: owner,
            value: parseInt(value),
            description: description,
            lastUpdated: new Date().toISOString()
        };

        await ctx.stub.putState(
            id, 
            encoder.encode(JSON.stringify(asset))
        );

        // Add creation to history
        await this._recordTransaction(
            ctx, 
            id,
            'CREATE',
            owner,
            null,
            value
        );

        return JSON.stringify(asset);
    }

    /**
     * Transfer asset ownership
     * @param {Context} ctx - The transaction context
     * @param {String} id - Asset ID
     * @param {String} newOwner - New owner
     */
    async TransferAsset(ctx, id, newOwner) {
        const asset = await this._getAsset(ctx, id);
        const oldOwner = asset.owner;

        asset.owner = newOwner;
        asset.lastUpdated = new Date().toISOString();

        await ctx.stub.putState(
            id, 
            encoder.encode(JSON.stringify(asset))
        );

        // Add transfer to history
        await this._recordTransaction(
            ctx, 
            id,
            'TRANSFER',
            newOwner,
            oldOwner,
            asset.value.toString()
        );

        return JSON.stringify(asset);
    }

    /**
     * Query asset by ID
     * @param {Context} ctx - The transaction context
     * @param {String} id - Asset ID
     */
    async QueryAsset(ctx, id) {
        return JSON.stringify(await this._getAsset(ctx, id));
    }

    /**
     * Get complete transaction history for an asset
     * @param {Context} ctx - The transaction context
     * @param {String} id - Asset ID
     */
    async GetAssetHistory(ctx, id) {
        if (!await this._assetExists(ctx, id)) {
            throw new Error(`Asset ${id} does not exist`);
        }

        const historyKey = `HISTORY-${id}`;
        const historyBytes = await ctx.stub.getState(historyKey);
        
        if (!historyBytes || historyBytes.length === 0) {
            return JSON.stringify([]);
        }

        return decoder.decode(historyBytes);
    }

    // ============== PRIVATE HELPER FUNCTIONS ==============

    async _assetExists(ctx, id) {
        const assetBytes = await ctx.stub.getState(id);
        return assetBytes && assetBytes.length > 0;
    }

    async _getAsset(ctx, id) {
        const assetBytes = await ctx.stub.getState(id);
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`Asset ${id} does not exist`);
        }
        return JSON.parse(decoder.decode(assetBytes));
    }

    async _recordTransaction(ctx, assetId, txType, newOwner, oldOwner, value) {
        const historyKey = `HISTORY-${assetId}`;
        let history = [];

        // Get existing history if any
        const existingHistory = await ctx.stub.getState(historyKey);
        if (existingHistory && existingHistory.length > 0) {
            history = JSON.parse(decoder.decode(existingHistory));
        }

        // Add new transaction
        history.push({
            txId: ctx.stub.getTxID(),
            timestamp: new Date().toISOString(),
            type: txType,
            assetId: assetId,
            newOwner: newOwner,
            oldOwner: oldOwner,
            value: parseInt(value)
        });

        // Save updated history
        await ctx.stub.putState(
            historyKey,
            encoder.encode(JSON.stringify(history))
        );
    }
}

module.exports = AssetChaincode;