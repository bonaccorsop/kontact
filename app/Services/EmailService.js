'use strict';

const { Observable } = require('rx');
const fs = require('fs');
const Mustache = require('mustache');
const BaseService = require('./BaseService');

const TEMPLATES_PATH = './app/email-templates';


module.exports = class EmailService extends BaseService
{
  constructor(options = {}, emailclient, userRepository) {
    super(options);
    this.userRepository = userRepository;
    this.emailclient = emailclient;
  }

  renderTemplate$(tplName, data) {
    return Observable.create(obs => {
      fs.readFile(TEMPLATES_PATH + '/' + tplName + '.mustache', (err, content) => {
        err ? obs.onError(err) : obs.onNext(content) && obs.onCompleted();
      })
    })
    .map(template => Mustache.render(template.toString(), data));
  }

  sendEmail$(to, subject, body) {
    return Observable.fromPromise(this.emailclient.send(to, subject, body));
  }


  sendResetPasswordEmail$(email, token) {
    let resetUrl = this.options.publicUrl + '/reset-password?token=' + token;
    //console.log('EMAIL DA INVIARE sendResetPasswordEmail', { email, token, resetUrl });
    return this.sendEmail$(email, 'Servizio Mensa: Password Dimenticata', resetUrl);
  }

  sendSignupEmail$(userdata) {

    console.log('EMAIL DA INVIARE sendSignupEmail');

    let loginUrl = this.options.publicUrl + '/login';
    let name = `${userdata.firstname} ${userdata.lastname}`;

    return Observable.of(1);

    return this.sendEmail$(email, 'Servizio Mensa: Benvenuto!', `
      Benvenuto ${name}! <br/>
      <p>Puoi accedere al servizio di ordinazione Mensa in qualsiasi momento al seguente indirizzo:
      <a href="${loginUrl}">${loginUrl}</a></p>
      <p>Buon appetito!</p>
    `);
  }


}