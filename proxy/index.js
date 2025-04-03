import fs from 'fs'
import https from 'https'
import httpProxy from 'http-proxy'

const proxyCert = fs.readFileSync('../certificates/proxy.crt')
const proxyKey = fs.readFileSync('../certificates/proxy-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const agent = new https.Agent({
  ca: rootCA
})

const proxy = httpProxy.createServer({
  target: 'https://localhost:3000',
  ssl: {
    key: proxyKey,
    cert: proxyCert,
    ca: rootCA,
  },
  secure: true,
  changeOrigin: true,
  agent
})

proxy.on('error', (err) => {
  console.error('Proxy error:', err)
})

proxy.listen(3001, () => {
  console.log('Proxy server listening on port 3001')
})
