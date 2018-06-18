'use strict';

const { Observable } = require('rx');
const BaseController = require('./BaseController');

module.exports = class ContactController extends BaseController {

  constructor(templateService) {
    super();

    // List users
    this.router.post('/v1', this.authMid(), (req, resp, next) => {
      templateService.create$(req.body)
        .subscribe(data => { resp.status(201).send(data) }, err => { next(err); });
    });

    this.router.put('/v1/:templateName', this.authMid(), (req, resp, next) => {
      templateService.update$(req.params.templateName, req.body)
        .subscribe(data => { resp.status(200).send(data) }, err => { next(err); });
    });

    this.router.delete('/v1/:templateName', this.authMid(), (req, resp, next) => {
      templateService.delete$(req.params.templateName)
        .subscribe(na => { resp.status(204).send() }, err => { next(err); });
    });

  }
}