# mtls-node

mTLS example using using Node.js.

## Prerequisites

- Node.js >= 22

## Getting Started

This example demonstrates how to set up mutual TLS (mTLS) authentication in a Node.js application. The example includes a client and a server, both of which are configured to use mTLS.

### Generate certificates

To generate the necessary certificates for mTLS, you can use the `generate-certs.sh` script provided in this repository. 

This script will create a root CA, server certificate, and client certificate.

These certificates will be added to the `certificates` directory.

```bash
./scripts/generate-certs.sh
```

### Install dependencies

```bash
# Install dependencies for server
cd server
npm install

# Install dependencies for client
cd ../client
npm install
```

### Start the server

```bash
node server
```

### Start the client

```bash
node client
```

### Test the connection

Once both the server and client are running, you should see a successful connection message in the client console.
