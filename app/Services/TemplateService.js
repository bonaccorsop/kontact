'use strict';

const slugify = require('slugify');
const { Observable } = require('rx');

const BaseService = require('./BaseService');

module.exports = class TemplateService extends BaseService
{
  constructor(options = {}, mainRepository, templator) {
    super(options);
    this.mainRepository = mainRepository;
    this.templator = templator;
  }

  getTemplate$(templatName) {
    return this.mainRepository.findByName$(slugify(templatName))
      .flatMap(templateDoc => this.checkIfEntityExistsOrFail$(templateDoc, `No template found with name ${templatName}`))
  }

  create$(tplData) {

    let data = Object.assign(tplData, {
      type: 'email',
      name: null,
      engine: 'mustache',
      text: null,
      html: null,
      params: [],
    }).map(data => Object.assign(data, { name: slugify(data.name) }))

    return this.mainRepository.store$(data)
      .flatMap(templateDoc => this.emitEvent$('template.created', templateDoc))
  }

  update$(templatName, tplData) {
    return this.getTemplate$(templatName)
      .flatMap(templateDoc => {
        templateDoc = Object.assign(templateDoc, tplData);
        return Observable.defer(() => templateDoc.save()).map(updateStatus => templateDoc);
      })
      .flatMap(templateDoc => this.emitEvent$('template.updated', templateDoc))
  }

  delete$(templatName) {
    return this.getTemplate$(templatName)
      .flatMap(templateDoc => Observable.create(obs => { templateDoc.remove(); obs.onNext(templateDoc); obs.onCompleted(); }))
      .flatMap(templateDoc => this.emitEvent$('template.deleted', templateDoc))
  }

  render$(templatName, data) {
    return this.resolveTemplate$(templatName)
      //TODO
      .flatMap(templateDoc => this.templator.render$(templateDoc, data))
  }


}