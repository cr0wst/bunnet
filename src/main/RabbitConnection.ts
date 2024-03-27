import { Connection, Queue } from '@common/types'
import { AMQPChannel, AMQPClient, AMQPQueue } from '@cloudamqp/amqp-client'
import { ulid } from 'ulid'
import axios from 'axios'

import { webContents } from 'electron'
import * as https from 'https'

export class RabbitConnection {
  private client: AMQPClient
  private channel: AMQPChannel | null = null
  private queues: AMQPQueue[] = []

  constructor(private connection: Connection) {
    this.client = new AMQPClient(
      `${connection.useSsl ? 'amqps' : 'amqp'}://${connection.username}:${connection.password}@${connection.url}:${connection.port}${connection.vhost}`
    )
  }

  public async connect() {
    const connection = await this.client.connect()
    this.channel = await connection.channel()
  }

  public async listExchanges() {
    // Attempt to use the RabbitMQ Management Plugin to list exchanges.
    // If this fails, we'll have to require the user specify them.

    const url = `${this.connection.useSsl ? 'https' : 'http'}://${this.connection.url}:${this.connection.managementPort}/api/exchanges`
    console.log(url)
    const response = await axios.get(url, {
      auth: {
        username: this.connection.username,
        password: this.connection.password
      },
      headers: {
        Accept: 'application/json',
        'Upgrade-Insecure-Requests': '1'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })

    const exchanges = response.data
      .filter((exchange: any) => {
        return exchange.internal === false && exchange.name !== ''
      })
      .map((exchange: any) => {
        return {
          name: exchange.name
        }
      })

    console.log(exchanges)

    return exchanges
  }

  public async createQueue({ name, exchange }) {
    const queueConfig = {
      id: ulid(),
      name,
      exchange
    }
    if (!this.channel) {
      throw new Error('Channel not connected')
    }

    console.log(`Creating queue ${queueConfig.name} (bunnet-${queueConfig.id})`)
    const queue = await this.channel.queue(`bunnet-${queueConfig.id}`, {
      exclusive: true,
      autoDelete: true
    })

    console.log(`Binding queue ${queueConfig.name} to exchange ${queueConfig.exchange}`)
    await queue.bind(exchange)

    this.queues.push(queue)

    await queue.subscribe({ noAck: true }, (message) => {
      console.log(`Received message on queue ${queueConfig.name}: ${message.body}`)
      const incoming = {
        exchange: queueConfig.exchange,
        queue: queueConfig.id,
        headers: message.properties.headers,
        body: this.isValidJson(message.bodyString() || '')
          ? JSON.parse(message.bodyString() || '{}')
          : message.bodyString()
      }

      webContents.getAllWebContents().forEach((wc) => {
        wc.send('rabbit-message-received', incoming)
      })
    })

    return queueConfig
  }

  private isValidJson(str: string) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  public async deleteQueue(queue: Queue) {
    const queueToDelete = this.queues.find((q) => q.name === `bunnet-${queue.id}`)
    if (!queueToDelete) {
      throw new Error('Queue not found')
    }

    console.log(`Deleting queue ${queue.name} (bunnet-${queue.id})`)
    await queueToDelete.delete()
  }
}
