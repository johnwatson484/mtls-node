import fs from 'fs'
import httpProxy from 'http-proxy'

const proxyCert = fs.readFileSync('../certificates/proxy.crt')
const proxyKey = fs.readFileSync('../certificates/proxy-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 3000
  },
  ssl: {
    key: proxyKey,
    cert: proxyCert,
    ca: rootCA
  },
  secure: true
}).listen(3001)
