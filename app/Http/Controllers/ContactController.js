'use strict';

const { Observable } = require('rx');
const BaseController = require('./BaseController');

module.exports = class ContactController extends BaseController {

  constructor(contactService) {
    super();

    this.router.post('/v1/upsert/email/:email', this.authMid(), (req, resp, next) => {
      contactService.upsertByEmail$(req.params.email, req.body)
        .subscribe(data => { resp.status(201).send(data) }, err => { next(err); });
    });

    this.router.get('/v1/:email', this.authMid(), (req, resp, next) => {
      contactService.get$(req.params.email)
        .subscribe(data => { resp.status(200).send(data) }, err => { next(err); });
    });

    this.router.delete('/v1/:email', this.authMid(), (req, resp, next) => {
      contactService.delete$(req.params.email)
        .subscribe(data => { resp.status(204).send() }, err => { next(err); });
    });

  }
}