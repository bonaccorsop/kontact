'use strict';

const { Observable } = require('rx');
const BaseController = require('./BaseController');

module.exports = class LoginController extends BaseController {

  constructor() {
    super();

    // List users
    this.router.post('/v1/login', (req, resp, next) => {
      this.auth.authentication$(req.body.username, req.body.password)
        .subscribe(token => { resp.status(201).send(token) }, err => { next(err); });
    });

    this.router.post('/v1/signup', (req, resp, next) => {
      this.auth.signup$(req.body)
        .subscribe(user => { resp.status(201).send({ data: user }) }, err => { next(err); });
    });

    this.router.post('/v1/forgot-password', (req, resp, next) => {
      // ONLY IF AUTHTYPE IS NOT LDAP
      this.auth.generatePasswordResetToken$(req.body.username)
        .subscribe(na => { resp.status(201).send({ msg: 'done' }) }, err => { next(err); });

    });

    this.router.patch('/v1/reset-password', (req, resp, next) => {
      this.auth.setPassword$(req.body.token, req.body.password)
        .subscribe(user => { resp.status(200).send({ data: user }) }, err => { next(err); });
    });

  }
}