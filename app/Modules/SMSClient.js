'use strict';

var TeleSignSDK = require('telesignsdk');

class SMSClient {

  constructor(options) {

    this.options = Object.assign({
      pretend: true,
      customerId: null,
      apiKey: null,
      restEndpoint: 'https://rest-api.telesign.com',
      timeout: 10 * 1000
    }, options);

    this.client = new TeleSignSDK(
      options.customerId,
      options.apiKey,
      options.restEndpoint,
      options.timeout
    );
  }


  send(phoneNumber, message, messageType = 'ARN') {

    return this.options.pretend ?

    new Promise((resolve, reject) => {
      resolve({
        reference_id: null,
        external_id: null,
        status: {code: 290, description: 'No SMS sent... pretending!'}
      });
    })

    : new Promise((resolve, reject) => {
      this.client.sms.message((err, response) => {
        if (err || response.code != 290 ) {
          let error = err || response;
          reject(error);
        }
        resolve(response);
      }, phoneNumber, message, messageType);
    });

  }


}

module.exports = SMSClient;