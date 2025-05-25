// src/components/FabricInterface.jsx
import React, { useState } from 'react';
import axios from 'axios';

const FabricInterface = () => {
  const [apiResponse, setApiResponse] = useState('');
  const [assetData, setAssetData] = useState({
    id: 'asset1',
    color: 'blue',
    size: 10,
    owner: 'John',
    appraisedValue: 1000
  });
  const [transferData, setTransferData] = useState({
    id: 'asset1',
    newOwner: 'Bob'
  });
  const [privateData, setPrivateData] = useState({
    collection: 'collectionName',
    key: 'privateKey1'
  });

  const BASE_URL = 'http://localhost:3000/api';

  const callApi = async (method, endpoint, data = null) => {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: { 'Content-Type': 'application/json' }
      };
      if (data) config.data = data;
      
      const response = await axios(config);
      setApiResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      setApiResponse(`Error: ${errorMessage}`);
      console.error('API Error:', error);
    }
  };

  // Handlers that match your exact backend endpoints
  const handleAssetApiCall = (method, endpoint) => {
    if (method === 'GET' || method === 'DELETE') {
      callApi(method, `${endpoint}/${assetData.id}`);
    } else {
      callApi(method, endpoint, assetData);
    }
  };

  const handleTransfer = () => {
    callApi('POST', '/transfer', transferData);
  };

  const handlePrivateApiCall = (method, endpoint) => {
    if (method === 'GET' || method === 'DELETE') {
      callApi(method, `${endpoint}/${privateData.collection}/${privateData.key}`);
    } else {
      callApi(method, endpoint, privateData);
    }
  };

  return (
    <div className="fabric-interface">
      <h1>Fabric Network Interface</h1>
      
      {/* Asset Operations */}
      <div className="section">
        <h2>Asset Management</h2>
        <div className="form-group">
          <input name="id" value={assetData.id} onChange={(e) => setAssetData({...assetData, id: e.target.value})} placeholder="ID" />
          <input name="color" value={assetData.color} onChange={(e) => setAssetData({...assetData, color: e.target.value})} placeholder="Color" />
          <input type="number" name="size" value={assetData.size} onChange={(e) => setAssetData({...assetData, size: parseInt(e.target.value)})} placeholder="Size" />
          <input name="owner" value={assetData.owner} onChange={(e) => setAssetData({...assetData, owner: e.target.value})} placeholder="Owner" />
          <input type="number" name="appraisedValue" value={assetData.appraisedValue} onChange={(e) => setAssetData({...assetData, appraisedValue: parseInt(e.target.value)})} placeholder="Appraised Value" />
        </div>
        <div className="button-group">
          <button onClick={() => handleAssetApiCall('POST', '/asset')}>Create Asset</button>
          <button onClick={() => handleAssetApiCall('GET', '/asset')}>Read Asset</button>
          <button onClick={() => handleAssetApiCall('PUT', '/asset')}>Update Asset</button>
          <button onClick={() => handleAssetApiCall('DELETE', '/asset')}>Delete Asset</button>
        </div>
      </div>

      {/* Transfer Operation */}
      <div className="section">
        <h2>Asset Transfer</h2>
        <div className="form-group">
          <input name="id" value={transferData.id} onChange={(e) => setTransferData({...transferData, id: e.target.value})} placeholder="Asset ID" />
          <input name="newOwner" value={transferData.newOwner} onChange={(e) => setTransferData({...transferData, newOwner: e.target.value})} placeholder="New Owner" />
        </div>
        <button onClick={handleTransfer}>Transfer Asset</button>
      </div>

      {/* Private Data Operations */}
      <div className="section">
        <h2>Private Data</h2>
        <div className="form-group">
          <input name="collection" value={privateData.collection} onChange={(e) => setPrivateData({...privateData, collection: e.target.value})} placeholder="Collection" />
          <input name="key" value={privateData.key} onChange={(e) => setPrivateData({...privateData, key: e.target.value})} placeholder="Key" />
        </div>
        <div className="button-group">
          <button onClick={() => handlePrivateApiCall('POST', '/private')}>Put Private Data</button>
          <button onClick={() => handlePrivateApiCall('GET', '/private')}>Get Private Data</button>
          <button onClick={() => handlePrivateApiCall('DELETE', '/private')}>Delete Private Data</button>
          <button onClick={() => callApi('DELETE', `/private/purge/${privateData.collection}/${privateData.key}`)}>Purge Private Data</button>
        </div>
      </div>

      {/* Query All Assets */}
      <div className="section">
        <h2>Query All Assets</h2>
        <button onClick={() => callApi('GET', '/query')}>Get All Assets</button>
      </div>

      {/* API Response */}
      <div className="response-section">
        <h2>API Response</h2>
        <pre>{apiResponse}</pre>
      </div>
    </div>
  );
};

export default FabricInterface;