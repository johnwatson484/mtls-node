import fs from 'fs'
import tunnel from 'tunnel'
import Wreck from '@hapi/wreck'

const clientCert = fs.readFileSync('../certificates/client.crt')
const clientKey = fs.readFileSync('../certificates/client-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const agent = tunnel.httpsOverHttps({
  proxy: {
    host: 'localhost',
    port: 3001,
    cert: clientCert,
    key: clientKey,
    ca: rootCA,
  },
  cert: clientCert,
  key: clientKey,
  ca: rootCA,
})
const { payload } = await Wreck.get('https://localhost:3000', {
  agent,
  json: true
})

console.log(payload)
