'use strict';

const nodemailer = require('nodemailer');

module.exports = class EmailClient {
  constructor(options, templates) {

    this.options = Object.assign({
      pretend: false,
      host: '',
      port: 465,
      secure: true,
      defaultSender: '',
      logger: console,
      auth: Object.assign({
        user: null,
        pass: null,
      }, options.auth)
    }, options);

    this.transporter = nodemailer.createTransport(options);
  }

  send(to, subject, message, sender = null) {

    let payload = {
      from: sender ? sender : this.options.defaultSender,
      to,  // string comma sep or array
      subject, // unicode string
      text: message, // unicode string
      html: message // html body
    };

    return new Promise((resolve, reject) => {

      if (this.options.pretend) {
        logger.info('Prentending email', payload);
        resolve(payload);
      } else {
        this.transporter.sendMail(payload, (error, info) => {
          error ? reject(error) : resolve(info);
        });
      }
    })

  }

}