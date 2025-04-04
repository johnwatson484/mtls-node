import fs from 'fs'
import tls from 'tls'

const clientCert = fs.readFileSync('../certificates/client.crt')
const clientKey = fs.readFileSync('../certificates/client-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const tlsOptions = {
  cert: clientCert,
  key: clientKey,
  ca: rootCA,
  rejectUnauthorized: true,
  servername: 'localhost'
}

// First establish TLS connection to proxy
console.log('Connecting to proxy...')
const proxySocket = tls.connect({
  host: 'localhost',
  port: 3001,
  ...tlsOptions
})

proxySocket.on('secureConnect', () => {
  console.log('Proxy TLS connection established')

  // Send CONNECT request
  const connectMsg = [
    'CONNECT localhost:3000 HTTP/1.1',
    'Host: localhost:3000',
    'User-Agent: curl/7.81.0',
    'Proxy-Connection: Keep-Alive',
    '',
    ''
  ].join('\r\n')

  proxySocket.write(connectMsg)
})

let buffer = ''
proxySocket.on('data', (data) => {
  buffer += data.toString()

  if (buffer.includes('\r\n\r\n')) {
    if (buffer.includes('200 Connection Established')) {
      console.log('CONNECT tunnel established')

      // Create TLS connection to target through the proxy tunnel
      const targetSocket = tls.connect({
        ...tlsOptions,
        socket: proxySocket,
        servername: 'localhost'
      }, () => {
        console.log('Target TLS connection established')

        // Send HTTP request
        const request = [
          'GET / HTTP/1.1',
          'Host: localhost:3000',
          'User-Agent: curl/7.81.0',
          'Accept: */*',
          '',
          ''
        ].join('\r\n')

        targetSocket.write(request)
      })

      targetSocket.on('data', (data) => {
        console.log('Response:', data.toString())
      })

      targetSocket.on('error', (err) => {
        console.error('Target socket error:', err)
      })

      targetSocket.on('end', () => {
        console.log('Target connection ended')
        proxySocket.end()
      })
    } else {
      console.error('Proxy error:', buffer)
      proxySocket.end()
    }
    buffer = ''
  }
})

proxySocket.on('error', (err) => {
  console.error('Proxy socket error:', err)
})

proxySocket.on('end', () => {
  console.log('Proxy connection ended')
})
