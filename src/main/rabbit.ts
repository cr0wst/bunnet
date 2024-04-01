import { Connection, Exchange, Queue } from '@common/types'
import { AMQPChannel, AMQPClient } from '@cloudamqp/amqp-client'
import { ulid } from 'ulid'
import axios from 'axios'

import { MessageStore } from './messageStore'
import { isValidJson } from '../common/utils'

const messageStore = new MessageStore()

export class RabbitConnection {
  private client: AMQPClient
  private channel: AMQPChannel | null = null
  private queues: Queue[] = []
  private exchanges: Exchange[] = []

  constructor(private connection: Connection) {
    this.client = new AMQPClient(
      `${connection.useSsl ? 'amqps' : 'amqp'}://${connection.username}:${connection.password}@${connection.url}:${connection.port}${connection.vhost}`
    )
  }

  public getConnection() {
    return this.connection
  }

  public async connect() {
    const connection = await this.client.connect()
    this.channel = await connection.channel()
  }

  public async disconnect() {
    if (!this.channel) {
      throw new Error('Channel not connected')
    }
    await this.client.close()
  }

  public async listExchanges() {
    // Attempt to use the RabbitMQ Management Plugin to list exchanges.
    // If this fails, we'll have to require the user specify them.

    const url = `${this.connection.useSsl ? 'https' : 'http'}://${this.connection.url}:${this.connection.managementPort}/api/exchanges`
    const response = await axios.get(url, {
      auth: {
        username: this.connection.username,
        password: this.connection.password
      }
    })

    // this.exchanges might already have exchanges, so we need to merge some of them.
    // But, we want to re-create the list of exchanges from the response.
    this.exchanges = response.data
      .filter((exchange: any) => {
        return exchange.internal === false && exchange.name !== ''
      })
      .map((exchange: any) => {
        return {
          name: exchange.name,
          connectionId: this.connection.id,
          // Look up the hidden state from the existing exchanges
          hidden: this.exchanges.find((e) => e.name === exchange.name)?.hidden || false
        }
      })

    return this.exchanges
  }

  public async createQueue({ id, name, exchange, bindOptions }) {
    const queueConfig = {
      id: id || ulid(),
      name,
      exchange,
      bindOptions
    }
    if (!this.channel) {
      throw new Error('Channel not connected')
    }

    const queue = await this.channel.queue(`bunnet-${queueConfig.id}`, {
      exclusive: true,
      autoDelete: true
    })
    await queue.bind(exchange, bindOptions.routingKey || '', bindOptions.arguments)

    this.queues.push(queueConfig)

    await queue.subscribe({ noAck: true }, (message) => {
      const incoming = {
        timestamp: message.properties.timestamp || new Date(),
        queueId: queueConfig.id,
        headers: message.properties.headers,
        body: isValidJson(message.bodyString() || '')
          ? JSON.parse(message.bodyString() || '{}')
          : message.bodyString()
      }

      messageStore.push(incoming)
    })

    return queueConfig
  }

  public async deleteQueue(queue: Queue) {
    const queueToDelete = this.queues.find((q) => q.id === queue.id)
    if (!queueToDelete) {
      throw new Error('Queue not found')
    }
    await this.channel?.queueDelete(`bunnet-${queueToDelete.id}`)
    this.queues = this.queues.filter((q) => q.id !== queue.id)
  }

  public async loadState(state: { queues: Queue[], exchanges: Exchange[] }) {
    for (const queue of state.queues) {
      await this.createQueue(queue)
    }

    this.exchanges = state.exchanges || []

    return this.getState()
  }

  public hideExchange(exchange: Exchange) {
    const existingExchange = this.exchanges.find((e) => e.name === exchange.name)
    if (!existingExchange) {
      throw new Error('Exchange not found')
    }
    existingExchange.hidden = true
  }

  public unhideExchange(exchange: Exchange) {
    const existingExchange = this.exchanges.find((e) => e.name === exchange.name)
    if (!existingExchange) {
      throw new Error('Exchange not found')
    }
    existingExchange.hidden = false
  }

  public async publish(message: any) {
    if (!this.channel) {
      throw new Error('Channel not connected')
    }

    const properties = (message.headers) ? { headers: message.headers } : {}
    await this.channel.basicPublish(message.exchange, message.routingKey || '', message.body, properties)
  }

  public getState() {
    return {
      queues: this.queues,
      exchanges: this.exchanges
    }
  }
}

