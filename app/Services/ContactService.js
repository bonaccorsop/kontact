'use strict';

const slugify = require('slugify');
const { Observable } = require('rx');

const BaseService = require('./BaseService');

module.exports = class ContactService extends BaseService
{
  constructor(options = {}, mainRepository) {
    super(options);
    this.mainRepository = mainRepository;
  }

  getContact$(email) {
    return this.mainRepository.findByEmail$(email)
      .flatMap(contactDoc => this.checkIfEntityExistsOrFail$(contactDoc, `No contact found with email ${email}`))
  }

  upsertByEmail$(email, data) {

    delete data.email;

    return this.mainRepository.updateOrCreate$({ email }, Object.assign(data, { email }))
      .flatMap(contactDoc => {
        if (contactDoc.__updated) {
          return this.emitEvent$('contact.updated', contactDoc);
        } else {
          return this.emitEvent$('contact.created', contactDoc);
        }
      })
  }

  delete$(email) {
    return this.getContact$(email)
      .flatMap(contactDoc => Observable.create(obs => { contactDoc.remove(); obs.onNext(contactDoc); obs.onCompleted(); }))
      .flatMap(contactDoc => this.emitEvent$('contact.deleted', contactDoc))
  }


}