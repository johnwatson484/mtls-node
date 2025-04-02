#!/usr/bin/env sh

# Navigate to the project root directory
set -e
projectRoot="$(cd "$(dirname "$0")/.." && pwd)"
cd "${projectRoot}"

# Create certificates directory
mkdir -p certificates

# Generate RootCA
openssl genpkey -algorithm RSA -out ./certificates/rootCA-private-key.pem
openssl req -new -key ./certificates/rootCA-private-key.pem -out ./certificates/rootCA.csr -subj "/CN=root"
openssl x509 -req -days 3650 -in ./certificates/rootCA.csr -signkey ./certificates/rootCA-private-key.pem -out ./certificates/rootCA.crt
