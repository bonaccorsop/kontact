'use strict';

const jwt = require('jsonwebtoken');

module.exports = class JWToken
{
  constructor(options) {
    this.options = Object.assign({
      defaultTTl: '60s',
      algorithm: 'HS256',
      secret: '',
      cert: '',
    }, options);
  }

  generate(data, ttl = null) {
    ttl = ttl ? ttl : this.options.defaultTTl;

    return jwt.sign(
      data,
      this.options.secret || this.options.cert,
      { expiresIn: ttl, algorithm: this.options.algorithm }
    );

    // return new Promise((resolve, reject) => jwt.sign(
    //   data,
    //   this.options.secret || this.options.cert,
    //   { expiresIn: ttl, algorithm: this.options.algorithm },
    //   (err, token) => {
    //     if(err) {
    //       reject(err);
    //     }
    //     resolve(token);
    //   }
    // ));
  }


  validate(token) {

    return new Promise((resolve, reject) => jwt.verify(
      token,
      this.options.secret || this.options.cert,
      { algorithms: [this.options.algorithm] },
      (err, payload) => {
        if (err) {
          reject(err);
        }
        resolve(payload);
      }
    ));
  }
}