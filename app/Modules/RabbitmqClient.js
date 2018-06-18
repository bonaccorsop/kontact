'use strict';

//const amqp = require('amqplib/callback_api');

class RabbitmqClient
{
  constructor(host) {
    this.host = host;
    this.connection = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      amqp.connect(this.host, (err, conn) => {
        err ? reject(err) : (resolve(conn), this.connection = conn)
      });
    });
  }

  createChannel() {
    return new Promise((resolve, reject) => {
      this.connection.createChannel((err, ch) => {
        err ? reject(err) : resolve(ch);
      });
    });
  }

  sendToQueue(queue, msg) {

    queue = this._resolveQueue(queue);
    msg = this._resolveOutcomingMessage(msg);

    return this.createChannel()
      .then((ch) => {
        ch.assertQueue(queue.name, queue);
        return ch.sendToQueue(queue.name, msg.body, msg);
      });
  }

  _resolveOutcomingMessage(msg) {

    msg =  Object.assign({
      body: msg.body || msg,
      persistent: true,
      contentType: 'application/json',
      encode: true,
      headers: {}
    }, Object.is(msg) ? msg : {})

    let payload;

    // resolve body
    if (msg.encode) {
      switch (msg.contentType) {
        default:
          payload = JSON.stringify(msg.body);
          break;
      }
    }

    msg.body = Buffer.from(payload);
    return msg;
  }

  _resolveQueue(queue) {
    return Object.assign({
      name: queue.name || queue
    }, Object.is(queue) ? queue : {})
  }

}


module.exports = RabbitmqClient;

