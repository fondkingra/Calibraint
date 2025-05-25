const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const channelName = process.env.CHANNEL_NAME || 'channel';
const chaincodeName = process.env.CHAINCODE_NAME || 'cc-go';
const mspId = process.env.ORG_MSPID || 'Org1MSP';
const peerEndpoint = process.env.PEER_ENDPOINT || 'peer1-org1.localho.st:443';

// Helper: Connect to Fabric Network
async function connectNetwork() {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    const connectionProfile = JSON.parse(fs.readFileSync('/app/config/connection.json', 'utf8'));
    
    const gateway = new Gateway();
    await gateway.connect(connectionProfile, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: false }
    });
    
    return gateway;
}

// API Endpoints
app.get('/assets', async (req, res) => {
    try {
        const gateway = await connectNetwork();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        
        const result = await contract.evaluateTransaction('GetAllAssets');
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/assets/:id', async (req, res) => {
    try {
        const gateway = await connectNetwork();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        
        const result = await contract.evaluateTransaction('ReadAsset', req.params.id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/assets', async (req, res) => {
    try {
        const { id, color, size, owner, appraisedValue } = req.body;
        const gateway = await connectNetwork();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        
        await contract.submitTransaction(
            'CreateAsset', 
            id, 
            color, 
            size.toString(), 
            owner, 
            appraisedValue.toString()
        );
        res.status(201).json({ message: 'Asset created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/assets/:id', async (req, res) => {
    try {
        const { color, size, owner, appraisedValue } = req.body;
        const gateway = await connectNetwork();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        
        await contract.submitTransaction(
            'UpdateAsset', 
            req.params.id, 
            color, 
            size.toString(), 
            owner, 
            appraisedValue.toString()
        );
        res.json({ message: 'Asset updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/assets/:id', async (req, res) => {
    try {
        const gateway = await connectNetwork();
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        
        await contract.submitTransaction('DeleteAsset', req.params.id);
        res.json({ message: 'Asset deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('REST API running on port 3000'));