'use strict';

const AuthenticationError = require('./Errors/AuthenticationError');
const AuthorizationError = require('./Errors/AuthorizationError');
const GenericUserError = require('../../Errors/GenericUserError');

const InvalidUsernameError = require('./Errors/InvalidUsernameError');

const { Observable } = require('rx');
const JWToken = require('./Tokens/JWToken');
const { toLowerCase } = require('../../Utils/String');

const AUTHTYPE_MONGO = 'mongo';
const AUTHTYPE_LDAP = 'ldap';
const TOKENTYPE_JWT = 'jwt';

module.exports = class AuthService
{
  constructor(userRepository, options = {}) {

    options = Object.assign({
      authentication: {
        type: AUTHTYPE_MONGO,
        mongo: {},
        ldap: {}
      },
      token: {
        type: TOKENTYPE_JWT,
        ttl: '60s',
        jwt: {}
      }
    }, options);

    this.userRepository = userRepository;

    if (options.authentication.type === AUTHTYPE_LDAP) {
      const LDAPAuthenticator = require('./Authenticators/LDAPAuthenticator');

      this.authenticator = new LDAPAuthenticator(options.authentication.ldap,
        userData => this.userRepository.findOrCreateByUsername$(Object.assign({
          authType: AUTHTYPE_LDAP
        }, userData))
      );

    } else {
      const MongoAuthenticator = require('./Authenticators/MongoAuthenticator');
      this.authenticator = new MongoAuthenticator(options.authentication.mongo, this.userRepository);
    }

    let opts = Object.assign(options.token.jwt, {
      defaultTTl: options.token.ttl
    });

    this.token = new JWToken(opts);
  }

  authentication$(username, password) {
    return this.authenticator.auth$(username, password)

      .catch(err => {
        return Observable.of(0);
      })

      .flatMap(userDoc => {
        if (userDoc) {
          return this.userRepository.getByUsername$(userDoc.email.toLowerCase())
            .map(userDoc => this.generateAccessToken(userDoc))
        } else {
          return Observable.throw(new AuthenticationError);
        }
      })
  }

  authorization$(token) {
    return Observable.of(token)
      .map(token => token.replace('Bearer', '').trim())
      .flatMap(token => Observable.fromPromise(this.token.validate(token)))
      .catch(err => Observable.throw(new AuthorizationError));
  }

  generateAccessToken(userDoc, ttl = null) {
    return this.token.generate({
      role: userDoc.role,
      username: userDoc.email,
      id: userDoc._id
    }, ttl);
  }

  generatePasswordResetToken$(username) {
    return Observable.of(username)
      .flatMap(username => this.authenticator.generatePasswordResetToken$(username))
      .catch(err => Observable.throw(new InvalidUsernameError));
  }

  setPassword$(resetToken, newPassword) {
    return this.authenticator.setPassword$(resetToken, newPassword)
  }

  setThrustPassword$(username, newPassword) {
    return this.authenticator.setThrustPassword$(username, newPassword)
  }

  signup$(data) {
    return this.authenticator.signup$(data);
  }

  validateSignupPassphrase$(phassphrase) {
    return this.authenticator.validateSignupPassphrase$(phassphrase);
  }


}