---
id: getting-started
title: Getting started
---

[![Build Status](https://img.shields.io/travis/kfsoftware/hlf-operator/main.svg?label=E2E%20testing)](https://travis-ci.org/kfsoftware/hlf-operator)

# Hyperledger Fabric Asset Transfer Network

## Overview

This project builds a complete Hyperledger Fabric network that enables **asset creation, transfer, and tracking** using a REST API interface. It leverages Docker and Kubernetes for orchestration and deployment, React for the frontend interface, and Node.js with Express for the backend API server. Chaincode is used to handle on-chain logic for asset operations.

> 🔧 This repository also contains a `prerequisite/` folder which includes all steps for deploying Hyperledger Fabric locally, and a demonstration video + Lens IDE snapshot showing the running pods and system status.

---

## 🧩 Features

- Hyperledger Fabric network with 2 organizations (peer, CA, orderer)
- Chaincode with support for:
  - Creating assets
  - Transferring ownership
  - Querying assets
  - Viewing asset history
- REST API to interact with chaincode
- Kubernetes deployment with Helm & HLF Operator
- Istio ingress routing and TLS setup
- Complete local deployment instructions
- React frontend to interact with assets
- Lens IDE visualization and demo video attached

---

## 👨‍💻 Tech Stack

- **Blockchain Layer:** Hyperledger Fabric
- **Chaincode Language:** Go
- **Orchestration:** Kubernetes, Helm, Docker
- **Backend:** Node.js, Express.js
- **Frontend:** React
- **Ingress Routing:** Istio
- **Tools:** Kubectl HLF plugin, Krew, Lens IDE

---

## 🏗️ Core Requirements

### 1. Hyperledger Fabric Network
- Set up a **2-organization network** using Docker Compose and Helm
- Deploy:
  - Certificate Authorities (CA)
  - Peer nodes
  - Orderer nodes
- Create a **channel** (`demo`) for asset transactions

### 2. Chaincode Development
Chaincode includes the following core functions:
- `CreateAsset`: Create an asset with `ID`, `Owner`, `Value`, `Description`
- `TransferAsset`: Change ownership of an asset
- `QueryAsset`: Get asset details by ID
- `GetAssetHistory`: View transaction history of a specific asset

### 3. REST API Server
A RESTful API built using Express.js with the following endpoints:
```http
POST   /api/assets                  # Create new asset
PUT    /api/assets/:id/transfer     # Transfer asset to new owner
GET    /api/assets/:id              # Fetch asset details by ID
GET    /api/assets/:id/history      # Get asset's transaction history


🚀 Getting Started
Prerequisites
Ensure you have the following installed:

Docker

Kubernetes (v1.15+)

Kubectl

Helm

Istio

Fabric CA client

YQ (for YAML editing)

Krew (to install HLF plugin)

1. Install Istio
bash
Copy code
kubectl apply -f ./hack/istio-operator/crds/*
helm template ./hack/istio-operator/ \
  --set hub=docker.io/istio \
  --set tag=1.8.0 \
  --set operatorNamespace=istio-operator \
  --set watchedNamespaces=istio-system | kubectl apply -f -

kubectl create ns istio-system
kubectl apply -n istio-system -f ./hack/istio-operator.yaml
2. Install the HLF Operator
bash
Copy code
helm repo add kfs https://kfsoftware.github.io/hlf-helm-charts --force-update
helm install hlf-operator --version=1.5.0 kfs/hlf-operator
3. Install Kubectl HLF Plugin
bash
Copy code
kubectl krew install hlf
kubectl krew upgrade hlf
📦 Deploying the Fabric Network
Set Peer and Orderer Versions
bash
Copy code
export PEER_IMAGE=hyperledger/fabric-peer
export PEER_VERSION=2.4.3
export ORDERER_IMAGE=hyperledger/fabric-orderer
export ORDERER_VERSION=2.4.3
Deploy CAs
bash
Copy code
kubectl hlf ca create --storage-class=standard --capacity=2Gi --name=org1-ca \
    --enroll-id=enroll --enroll-pw=enrollpw
kubectl wait --timeout=180s --for=condition=Running fabriccas.hlf.kungfusoftware.es --all
kubectl hlf ca register --name=org1-ca --user=peer --secret=peerpw --type=peer \
    --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP
Deploy Peer
bash
Copy code
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=standard --enroll-id=peer --mspid=Org1MSP \
    --enroll-pw=peerpw --capacity=5Gi --name=org1-peer0 --ca-name=org1-ca.default
kubectl wait --timeout=180s --for=condition=Running fabricpeers.hlf.kungfusoftware.es --all
Deploy Orderer CA and Node
bash
Copy code
kubectl hlf ca create --storage-class=standard --capacity=2Gi --name=ord-ca \
    --enroll-id=enroll --enroll-pw=enrollpw
kubectl wait --timeout=180s --for=condition=Running fabriccas.hlf.kungfusoftware.es --all
kubectl hlf ca register --name=ord-ca --user=orderer --secret=ordererpw --type=orderer \
    --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP

kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=standard --enroll-id=orderer --mspid=OrdererMSP --enroll-pw=ordererpw \
    --capacity=2Gi --name=ord-node1 --ca-name=ord-ca.default
kubectl wait --timeout=180s --for=condition=Running fabricorderernodes.hlf.kungfusoftware.es --all
🔗 Create Channel and Join Network
Channel Generation
bash
Copy code
kubectl hlf channel generate --output=demo.block --name=demo --organizations Org1MSP --ordererOrganizations OrdererMSP
Enroll Admins and Join
bash
Copy code
kubectl hlf ca register --name=ord-ca --user=admin --secret=adminpw --type=admin --enroll-id=enroll --enroll-secret=enrollpw --mspid=OrdererMSP
kubectl hlf ca enroll --name=ord-ca --user=admin --secret=adminpw --mspid=OrdererMSP --ca-name=tlsca --output=admin-tls-ordservice.yaml
kubectl hlf ordnode join --block=demo.block --name=ord-node1 --namespace=default --identity=admin-tls-ordservice.yaml

kubectl hlf ca register --name=org1-ca --user=admin --secret=adminpw --type=admin --enroll-id=enroll --enroll-secret=enrollpw --mspid Org1MSP
kubectl hlf ca enroll --name=org1-ca --user=admin --secret=adminpw --mspid Org1MSP --ca-name ca --output peer-org1.yaml
kubectl hlf inspect --output org1.yaml -o Org1MSP -o OrdererMSP
kubectl hlf utils adduser --userPath=peer-org1.yaml --config=org1.yaml --username=admin --mspid=Org1MSP
Join Channel
bash
Copy code
kubectl hlf channel join --name=demo --config=org1.yaml --user=admin -p=org1-peer0.default
🔧 Deploy and Interact with Chaincode
Package and Install Chaincode
bash
Copy code
export CHAINCODE_NAME=asset
export CHAINCODE_LABEL=asset

cat << EOF > metadata.json
{
    "type": "ccaas",
    "label": "$CHAINCODE_LABEL"
}
EOF

cat << EOF > connection.json
{
  "address": "$CHAINCODE_NAME:7052",
  "dial_timeout": "10s",
  "tls_required": false
}
EOF

tar cfz code.tar.gz connection.json
tar cfz asset-transfer-basic-external.tgz metadata.json code.tar.gz
export PACKAGE_ID=$(kubectl hlf chaincode calculatepackageid --path=asset-transfer-basic-external.tgz --language=node --label=$CHAINCODE_LABEL)

kubectl hlf chaincode install --path=./asset-transfer-basic-external.tgz --config=org1.yaml \
    --language=golang --label=$CHAINCODE_LABEL --user=admin --peer=org1-peer0.default
Sync External Chaincode
bash
Copy code
kubectl hlf externalchaincode sync --image=kfsoftware/chaincode-external:latest \
    --name=$CHAINCODE_NAME --namespace=default --package-id=$PACKAGE_ID --tls-required=false --replicas=1
Approve and Commit Chaincode
bash
Copy code
export SEQUENCE=1
export VERSION="1.0"

kubectl hlf chaincode approveformyorg --config=org1.yaml --user=admin --peer=org1-peer0.default \
    --package-id=$PACKAGE_ID --version="$VERSION" --sequence="$SEQUENCE" --name=asset \
    --policy="OR('Org1MSP.member')" --channel=demo

kubectl hlf chaincode commit --config=org1.yaml --user=admin --mspid=Org1MSP \
    --version="$VERSION" --sequence="$SEQUENCE" --name=asset \
    --policy="OR('Org1MSP.member')" --channel=demo
Invoke & Query Chaincode
bash
Copy code
kubectl hlf chaincode invoke --config=org1.yaml --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo --fcn=initLedger -a '[]'

kubectl hlf chaincode query --config=org1.yaml --user=admin --peer=org1-peer0.default \
    --chaincode=asset --channel=demo --fcn=GetAllAssets -a '[]'
🧹 Cleanup
bash
Copy code
kubectl delete fabricorderernodes.hlf.kungfusoftware.es --all-namespaces --all
kubectl delete fabricpeers.hlf.kungfusoftware.es --all-namespaces --all
kubectl delete fabriccas.hlf.kungfusoftware.es --all-namespaces --all
🧪 Troubleshooting
If chaincode installation fails with an external builder error, try using Kind instead of Minikube for local clusters.

📸 Demo
📁 Prerequisite Folder: Contains all setup scripts and guides

📽️ Demo Video: [Attached video demonstrates full asset lifecycle]

📷 Lens IDE Image: Shows all running pods and components

