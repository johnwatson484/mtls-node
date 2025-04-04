import tls from 'tls'
import net from 'net'
import fs from 'fs'

const proxyCert = fs.readFileSync('../certificates/proxy.crt')
const proxyKey = fs.readFileSync('../certificates/proxy-private-key.pem')
const rootCA = fs.readFileSync('../certificates/rootCA.crt')

const tlsOptions = {
  key: proxyKey,
  cert: proxyCert,
  ca: [rootCA],
  requestCert: true,
  rejectUnauthorized: true
}

const server = tls.createServer(tlsOptions, (clientSocket) => {
  console.log('Client connected to proxy')
  let buffer = ''

  clientSocket.on('data', (data) => {
    buffer += data.toString()
    console.log('Received data:', buffer)

    if (buffer.includes('\r\n\r\n')) {
      const connectRegex = /CONNECT ([^:]+):(\d+) HTTP\/1\.1/
      const connectMatch = connectRegex.exec(buffer)

      if (connectMatch) {
        const [, host, port] = connectMatch
        console.log(`Valid CONNECT request for ${host}:${port}`)

        const targetSocket = net.connect({
          host,
          port: parseInt(port, 10)
        })

        targetSocket.on('connect', () => {
          console.log('Connected to target server')

          // Send response with explicit content-length
          const response = [
            'HTTP/1.1 200 Connection Established',
            'Connection: keep-alive',
            'Content-Length: 0',
            '',
            ''
          ].join('\r\n')

          clientSocket.write(response, (err) => {
            if (err) {
              console.error('Error sending response:', err)
              return
            }
            console.log('Sent response:', response)

            targetSocket.pipe(clientSocket)
            clientSocket.pipe(targetSocket)
            console.log('Established bidirectional tunnel')
          })
        })

        targetSocket.on('error', (err) => {
          console.error('Target Socket Error:', err)
          clientSocket.end()
        })

        // Remove the data handler after CONNECT
        clientSocket.removeAllListeners('data')
      } else {
        console.error('Invalid CONNECT request')
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
      }
    }
  })

  clientSocket.on('error', (err) => {
    console.error('Client Socket Error:', err)
  })
})

server.on('tlsClientError', (err) => {
  console.error('TLS Client Error:', err)
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`)
})
