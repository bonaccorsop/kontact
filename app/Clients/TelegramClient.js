'use strict';

const HTTPClient = require('./HTTPClient');

module.exports = class JambonClient extends HTTPClient {

  constructor(options) {
    super();
    this.options = Object.assign({
      chatId: null,
      token: null
    }, options)
  }

  sendMessage(text) {

    let token = this.options.token;
    let chat_id = this.options.chatId;

    let url = `https://api.telegram.org/bot${token}/sendMessage`;

    // POST https://api.telegram.org/bot466789218:AAFhXEAliaOI8V4ZyQfI1UJIzDOZmpNHXX0/sendMessage -d chat_id=2785696 -d text="Hello world"

    return this.performPostJsonRequest(url, { chat_id, text })
      .then(resp => resp.body)
      .then(payload => payload.status === 'ok' ? Promise.resolve(payload) : Promise.reject(payload))
  }




}
