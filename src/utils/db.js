import log from 'loglevel'
import { connect, connection } from 'mongoose'
import { MONGODB_CONNECTION_URL, MONGOOSE_CONFIG } from '../config'

try {
  connect(MONGODB_CONNECTION_URL, MONGOOSE_CONFIG)
} catch (err) {
  log.error(err)
} finally {
  connection.on('connected', () => {
    log.info('Mongoose connected to MongoDB server!')
  })
}
