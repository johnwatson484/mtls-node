import https from 'https'
import fs from 'fs'
import Wreck from '@hapi/wreck'

const clientCert = fs.readFileSync('../certificates/client.crt')
const clientKey = fs.readFileSync('../certificates/client-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const agent = new https.Agent({
  cert: clientCert,
  key: clientKey,
  ca: rootCA,
  rejectUnauthorized: true
})

const { payload } = await Wreck.get('https://localhost:3000', {
  agents: { https: agent },
  json: true
})

console.log(payload)
