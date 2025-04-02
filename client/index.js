import Wreck from '@hapi/wreck'

const { payload } = await Wreck.get('http://localhost:3000', { json: true })

console.log(payload)
