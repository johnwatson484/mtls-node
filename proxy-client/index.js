import fs from 'fs'
import tunnel from 'tunnel'
import Wreck from '@hapi/wreck'
import http from 'http'

const clientCert = fs.readFileSync('../certificates/client.crt')
const clientKey = fs.readFileSync('../certificates/client-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const tunnelingAgent = tunnel.httpsOverHttps({
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

const wreck = Wreck.defaults({
  agents: {
    http: new http.Agent(),
    https: tunnelingAgent,
    httpsAllowUnauthorized: new http.Agent()
  }
})

const { payload } = await wreck.get('https://localhost:3000', {
  json: true
})

console.log(payload)
