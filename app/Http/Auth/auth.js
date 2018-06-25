'use strict';

const { env, eventEmitter } = require('../../dependencies.js');
const { authorizedUser } = require('../../repositories.js');
const AuthService = require('./AuthService');

const auth = new AuthService(authorizedUser, {
  authentication: {
    type: 'mongo',
    mongo: {
      encryptPass: env.get('AUTH_MONGO_ENCRYPTPASS', true),
      passwordRegex: env.get('AUTH_MONGO_PASSWORDREGEX', '^(?=.*\d)(?=.*[a-zA-Z]).{6,}$'),
      passwordErrorNotice: env.get('AUTH_MONGO_PASSWORDERR_NOTICE', 'Password troppo debole'),
      onPasswordResetRequest: (email, token) => eventEmitter.emit('user.passwordForgot', { email, token }),
      onUserSignup: (userdata) => eventEmitter.emit('user.signup', userdata),
    },
  },
  token: {
    ttl: env.get('TOKEN_TTL', '24h'),
    jwt: {
      algorithm: env.get('TOKEN_JWT_ALG', 'HS256'),
      secret: env.get('TOKEN_JWT_SECRET'),
      cert: env.get('TOKEN_JWT_CERT')
    }
  }
});

module.exports = { auth }