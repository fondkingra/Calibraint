const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function getGateway() {
  try {
    console.log('[fabric.js] Loading network config...');
    const ccpPath = path.resolve(__dirname, 'networkConfig.yaml');
    const ccp = yaml.load(fs.readFileSync(ccpPath, 'utf8'));
    console.log('[fabric.js] Network config loaded.');

    console.log('[fabric.js] Reading Admin certificate and private key...');
    const cert = fs.readFileSync(path.resolve(__dirname, 'admincerts/admin-cert.pem')).toString();
    const key = fs.readFileSync(path.resolve(__dirname, 'adminkeystore/admin-key.pem')).toString();
    console.log('[fabric.js] Admin certificate and key loaded.');

    // Get the first org name and MSP ID from connection profile
    const orgName = Object.keys(ccp.organizations)[0];
    const mspId = ccp.organizations[orgName].mspid || ccp.organizations[orgName].mspId;
    console.log(`[fabric.js] Using MSP ID: ${mspId}`);

    // Create identity object with admin cert and key
    const identity = {
      credentials: {
        certificate: cert,
        privateKey: key,
      },
      mspId: 'Org2MSP',
      type: 'X.509',
    };

    console.log('[fabric.js] Creating in-memory wallet and adding admin identity...');
    const wallet = await Wallets.newInMemoryWallet();
    await wallet.put('adminUser', identity);
    console.log('[fabric.js] Admin identity added to wallet.');

    console.log('[fabric.js] Connecting to gateway with admin identity...');
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'adminUser',
      discovery: { enabled: false, asLocalhost: true }, // set enabled:true if you want discovery
    });
    console.log('[fabric.js] Gateway connected.');

    return gateway;
  } catch (error) {
    console.error('[fabric.js] Error in getGateway:', error);
    throw error;
  }
}

module.exports = { getGateway };
