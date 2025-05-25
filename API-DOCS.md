# Hyperledger Fabric Asset Transfer API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
No authentication required for these endpoints.

---

## Asset Endpoints

### Create Asset
`POST /asset`

**Request:**
```bash
curl -X POST http://localhost:3000/api/asset \
-H "Content-Type: application/json" \
-d '{
  "id": "asset1",
  "color": "blue",
  "size": 10,
  "owner": "John",
  "appraisedValue": 1000
}'

Parameters:

id (string): Unique asset identifier

color (string): Asset color

size (number): Asset size

owner (string): Current owner

appraisedValue (number): Asset value


Response:

json
{
  "message": "Asset created successfully"
}


Get Asset

GET /asset/{id}

Request:
curl -X GET http://localhost:3000/api/asset/asset1

Response:

json
{
  "id": "asset1",
  "color": "blue",
  "size": 10,
  "owner": "John",
  "appraisedValue": 1000
}


Update Asset

PUT /asset

Request:

bash
curl -X PUT http://localhost:3000/api/asset \
-H "Content-Type: application/json" \
-d '{
  "id": "asset1",
  "color": "red",
  "size": 12,
  "owner": "Alice",
  "appraisedValue": 1500
}'
Response:

json
{
  "message": "Asset updated successfully"
}


Delete Asset

DELETE /asset/{id}

Request:

bash
curl -X DELETE http://localhost:3000/api/asset/asset1
Response:

json
{
  "message": "Asset deleted successfully"
}


Transfer Endpoint
Transfer Ownership
POST /transfer

Request:

bash
curl -X POST http://localhost:3000/api/transfer \
-H "Content-Type: application/json" \
-d '{
  "id": "asset1",
  "newOwner": "Bob"
}'
Response:

json
{
  "message": "Asset transferred to Bob"
}
Query Endpoint
Get All Assets
GET /query

Request:

bash
curl -X GET http://localhost:3000/api/query
Response:

json
[
  {
    "id": "asset1",
    "color": "blue",
    "size": 10,
    "owner": "John",
    "appraisedValue": 1000
  },
  {
    "id": "asset2",
    "color": "red",
    "size": 15,
    "owner": "Alice",
    "appraisedValue": 1500
  }
]


Private Data Endpoints

Store Private Data

POST /private

Request:

bash
curl -X POST http://localhost:3000/api/private \
-H "Content-Type: application/json" \
-d '{
  "collection": "collectionName",
  "key": "privateKey1"
}'
Response:

json
{
  "message": "Private data stored successfully"
}


Retrieve Private Data

GET /private/{collection}/{key}


Request:

bash
curl -X GET http://localhost:3000/api/private/collectionName/privateKey1


Delete Private Data

DELETE /private/{collection}/{key}

Request:

bash
curl -X DELETE http://localhost:3000/api/private/collectionName/privateKey1


Purge Private Data

DELETE /private/purge/{collection}/{key}

Request:

bash
curl -X DELETE http://localhost:3000/api/private/purge/collectionName/privateKey1


Error Responses
400 Bad Request:

json
{
  "error": "Missing required parameters"
}

404 Not Found:

json
{
  "error": "Asset not found"
}
500 Server Error:

json
{
  "error": "Internal server error"
}
