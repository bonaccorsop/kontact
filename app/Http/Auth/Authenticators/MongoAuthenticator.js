'use strict';

const { isEmpty } = require('lodash');
const { Observable } = require('rx');
const md5 = require('md5');
const { capitalizeWords } = require('../../../Utils/String');

const UserAlreayExistsError = require('../Errors/UserAlreayExistsError');
const WeakPasswordError = require('../Errors/WeakPasswordError');
const InvalidResetTokenError = require('../Errors/InvalidResetTokenError');
const InvalidSignupPassphraseError = require('../Errors/InvalidSignupPassphraseError');

module.exports = class MongoAuthenticator
{
  constructor(options = {}, userRepository) {
    this.userRepository = userRepository;

    this.options = Object.assign({
      activeByDefault: false,
      encryptPass: true,
      signupPassphrase: null,
      passwordRegex: '',
      passwordErrorNotice: 'Invalid password',
      onPasswordResetRequest: (username, token) => {},
      onUserSignup: (userdata) => {},
    }, options);
  }

  auth$(username, password) {
    username = username.toLowerCase();
    return this.userRepository.findByCredentials$(username, this._encryptPassword(password));
  }

  generatePasswordResetToken$(username) {
    return this.userRepository.resolve$(username)

      .flatMap(userDoc => Observable.if(
        () => userDoc,
        Observable.of(userDoc),
        Observable.throw(new Error('Invalid user specifyed'))
      ))
      .flatMap(userDoc => {
        let token = this._generateResetToken();
        userDoc.resetToken = token;
        return Observable.defer(() => userDoc.save())
          .map(na => token);
      })
      .map((token) => {
        this.options.onPasswordResetRequest(username, token);
        return 1;
      })
  }

  setPassword$(resetToken, newPassword) {
    return this.userRepository.first$({ resetToken })
      .flatMap(userDoc => Observable.if(
        () => userDoc && resetToken != null,
        Observable.of(userDoc),
        Observable.throw(new InvalidResetTokenError())
      ))

      //check password weakness
      .flatMap((userDoc) => Observable.if(
        () => this._checkPassword(newPassword),
        Observable.of(userDoc),
        Observable.throw(new WeakPasswordError(this.options.passwordErrorNotice))
      ))

      .flatMap(userDoc => {
        userDoc.password = this._encryptPassword(newPassword);
        userDoc.resetToken = null;
        return Observable.defer(() => userDoc.save())
          .map(na => userDoc)
      })
  }


  setThrustPassword$(username, newPassword) {
    return this.userRepository.resolve$(username)

      .flatMap(userDoc => Observable.if(
        () => userDoc,
        Observable.of(userDoc),
        Observable.throw(new Error('Invalid user specifyed'))
      ))

      //check password weakness
      .flatMap((userDoc) => Observable.if(
        () => this._checkPassword(newPassword),
        Observable.of(userDoc),
        Observable.throw(new WeakPasswordError(this.options.passwordErrorNotice))
      ))

      .flatMap(userDoc => {
        userDoc.password = this._encryptPassword(newPassword);
        userDoc.resetToken = null;
        return Observable.defer(() => userDoc.save())
          .map(na => userDoc)
      })
  }

  validateSignupPassphrase$(phassphrase) {
    return Observable.of(this.options.signupPassphrase == phassphrase);
  }

  signup$(data) {

    let email = data.email.trim().toLowerCase();

    return this.userRepository.getByUsername$(email)


      //check if email is already used by another user
      .flatMap(userDoc => Observable.if(
        () => userDoc,
        Observable.throw(new UserAlreayExistsError(`Email ${email} già in uso da un altro utente`)),
        Observable.of(data)
      ))

      //check password weakness
      .flatMap(() => Observable.if(
        () => this._checkPassword(data.password),
        Observable.of(data),
        Observable.throw(new WeakPasswordError(this.options.passwordErrorNotice))
      ))

      //check if passphrase is matched (if application requires it)
      .flatMap(data => Observable.if(
        () => isEmpty(this.options.signupPassphrase) || this.options.signupPassphrase === data.passphrase,
        Observable.of(data),
        Observable.throw(new InvalidSignupPassphraseError(`Codice azienda invalido`))
      ))

      .flatMap(na => this.userRepository.store$({
        email,
        firstname: capitalizeWords(data.firstname.trim()),
        lastname: capitalizeWords(data.lastname.trim()),
        password: this._encryptPassword(data.password),
      }))

      .map(userDoc => {
        this.options.onUserSignup(userDoc);
        return userDoc;
      });
  }

  _checkPassword(password) {
    return this.options.passwordRegex ? (new RegExp(this.options.passwordRegex)).test(password) : true;
  }

  _encryptPassword(password) {
    return this.options.encryptPass ? md5(password) : password;
  }

  _generateResetToken() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}