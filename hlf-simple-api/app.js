const express = require('express');
const bodyParser = require('body-parser');
const { getGateway } = require('./fabric');
const cors = require('cors');


const app = express();
app.use(bodyParser.json());
app.use(cors());


const CHANNEL_NAME = 'channel';  // your channel name
const CHAINCODE_NAME = 'cc-go'; // your chaincode name

app.get('/api/query', async (req, res) => {
  console.log('[app.js] /api/query called');
  try {
    const gateway = await getGateway();
    console.log('[app.js] Gateway obtained');

    const network = await gateway.getNetwork(CHANNEL_NAME);
    console.log('[app.js] Network obtained:', CHANNEL_NAME);

    const contract = network.getContract(CHAINCODE_NAME);
    console.log('[app.js] Contract obtained:', CHAINCODE_NAME);

    const result = await contract.evaluateTransaction('GetAllAssets');
    console.log('[app.js] Chaincode query successful');

    await gateway.disconnect();
    console.log('[app.js] Gateway disconnected');

    res.json(JSON.parse(result.toString()));
  } catch (error) {
    console.error('[app.js] Query failed:', error);
    res.status(500).json({ error: error.message });
  }
});


// Example POST endpoint to invoke a transaction
app.post('/api/invoke', async (req, res) => {
  console.log('[app.js] /api/invoke called with body:', req.body);
  const { fcn, args } = req.body;  // expect { fcn: "functionName", args: ["arg1", "arg2", ...] }

  if (!fcn || !args) {
    return res.status(400).json({ error: 'Function name (fcn) and arguments (args) are required' });
  }

  try {
    const gateway = await getGateway();
    console.log('[app.js] Gateway obtained');

    const network = await gateway.getNetwork(CHANNEL_NAME);
    console.log('[app.js] Network obtained:', CHANNEL_NAME);

    const contract = network.getContract(CHAINCODE_NAME);
    console.log('[app.js] Contract obtained:', CHAINCODE_NAME);

    console.log(`[app.js] Submitting transaction ${fcn} with args: ${args}`);
    const result = await contract.submitTransaction(fcn, ...args);
    console.log('[app.js] Transaction submitted successfully');

    await gateway.disconnect();
    console.log('[app.js] Gateway disconnected');

    res.json({ message: 'Transaction submitted', result: result.toString() });
  } catch (error) {
    console.error('[app.js] Invoke failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// READ asset
app.get('/api/asset/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    const result = await contract.evaluateTransaction('ReadAsset', id);
    await gateway.disconnect();

    res.json(JSON.parse(result.toString()));
  } catch (error) {
    console.error('[ReadAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE asset
app.post('/api/asset', async (req, res) => {
  const { id, color, size, owner, appraisedValue } = req.body;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    await contract.submitTransaction('CreateAsset', id, color, size.toString(), owner, appraisedValue.toString());
    await gateway.disconnect();

    res.json({ message: 'Asset created successfully' });
  } catch (error) {
    console.error('[CreateAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE asset
app.put('/api/asset', async (req, res) => {
  const { id, color, size, owner, appraisedValue } = req.body;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    await contract.submitTransaction('UpdateAsset', id, color, size.toString(), owner, appraisedValue.toString());
    await gateway.disconnect();

    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    console.error('[UpdateAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE asset
app.delete('/api/asset/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    await contract.submitTransaction('DeleteAsset', id);
    await gateway.disconnect();

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('[DeleteAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// TRANSFER asset
app.post('/api/transfer', async (req, res) => {
  const { id, newOwner } = req.body;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    const result = await contract.submitTransaction('TransferAsset', id, newOwner);
    await gateway.disconnect();

    res.json({ message: `Asset transferred to ${newOwner}`, previousOwner: result.toString() });
  } catch (error) {
    console.error('[TransferAsset] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT private data
app.post('/api/private', async (req, res) => {
  const { collection, key } = req.body;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    const result = await contract.submitTransaction('PutPrivateData', collection, key);
    await gateway.disconnect();

    res.json({ message: result.toString() });
  } catch (error) {
    console.error('[PutPrivateData] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET private data
app.get('/api/private/:collection/:key', async (req, res) => {
  const { collection, key } = req.params;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    const result = await contract.evaluateTransaction('GetPrivateData', collection, key);
    await gateway.disconnect();

    res.json({ data: result.toString() });
  } catch (error) {
    console.error('[GetPrivateData] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE private data
app.delete('/api/private/:collection/:key', async (req, res) => {
  const { collection, key } = req.params;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    await contract.submitTransaction('DelPrivateData', collection, key);
    await gateway.disconnect();

    res.json({ message: 'Private data deleted' });
  } catch (error) {
    console.error('[DelPrivateData] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PURGE private data
app.delete('/api/private/purge/:collection/:key', async (req, res) => {
  const { collection, key } = req.params;
  try {
    const gateway = await getGateway();
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    await contract.submitTransaction('PurgePrivateData', collection, key);
    await gateway.disconnect();

    res.json({ message: 'Private data purged' });
  } catch (error) {
    console.error('[PurgePrivateData] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history/:id
app.get('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await contract.evaluateTransaction('GetAssetHistory', id);
    res.json(JSON.parse(result.toString()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Fabric REST API listening on port ${PORT}`);
});
