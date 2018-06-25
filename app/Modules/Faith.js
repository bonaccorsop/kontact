'use strict';

const { bus } = require('servicebus');

module.exports = class Faith
{
  constructor(options = {}) {

    this.options = Object.assign({
      connection: '',
      queue: '',
    }, options)

    this.client = bus({ url: this.options.connection, enableConfirms: true, assertQueuesOnFirstSend: false });
  }

  listen(callback) {
    let queue = this.options.queue;
    this.client.listen(queue, {}, callback);
  }


}
