'use strict';

const LdapAuth = require('ldapauth-fork-plus');
const RxObservable = require('rx').Observable;

const { logger } = require('../../../dependencies');

module.exports = class LDAPAuthenticator
{
  constructor(options, onSuccess$) {

    this.options = Object.assign({
      url: null,
      adminDn: null,
      adminPassword: null,
      searchBase: null,
      searchFilter: null,
      fieldNames: { email: null, firstname: null, lastname: null, fullName: null }
    }, options);

    this.onSuccess$ = onSuccess$ ? onSuccess$ : data => RxObservable.of(data);

    this.options = {
      url: this.options.url,
      adminDn: this.options.adminDn,
      adminPassword: this.options.adminPassword,
      searchBase: this.options.searchBase,
      searchFilter: this.options.searchFilter,
      searchAttributes: Object.keys(this.options.fieldNames).map((k) => this.options.fieldNames[k]),
      fieldNames: this.options.fieldNames,
      reconnect: true
    };

  }

  auth$(username, password) {

    let client = new LdapAuth(this.options);

    return RxObservable.create(obs$ => {
      client.authenticate(username, password, (err, user) => {

        err ? obs$.onError(err)
          : client.close(err => err ? obs$.onError(err)
            : (obs$.onNext(user) && obs$.onCompleted()))
      });
    })

    .do(user => logger.debug(user))

    .map(user => ({
      username: user[this.options.fieldNames.email],
      firstname: user[this.options.fieldNames.firstname],
      lastname: user[this.options.fieldNames.lastname],
      fullname: user[this.options.fieldNames.fullname],
    }))

    .flatMap(this.onSuccess$);
  }

  generatePasswordResetToken$(username) {
    return Observable.throw(new Error('Operazione non permessa con LDAP'));
  }

  setPassword$(resetToken, newPassword) {
    return Observable.throw(new Error('Operazione non permessa con LDAP'));
  }

  signup$(data) {
    return Observable.throw(new Error('Operazione non permessa con LDAP'));
  }
}