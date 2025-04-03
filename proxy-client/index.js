import fs from 'fs'
import Wreck from '@hapi/wreck'
import { HttpsProxyAgent } from 'https-proxy-agent'

const clientCert = fs.readFileSync('../certificates/client.crt')
const clientKey = fs.readFileSync('../certificates/client-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const proxyAgent = new HttpsProxyAgent('https://localhost:3001', {
  cert: clientCert,
  key: clientKey,
  ca: rootCA,
  rejectUnauthorized: true,
  secureProxy: true

})

const { payload } = await Wreck.get('https://localhost:3000', {
  agent: proxyAgent,
  json: true
})

console.log(payload)
