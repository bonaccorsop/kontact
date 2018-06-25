'use strict';

const { Observable } = require('rx');

const EntityNotFoundError = require('../Errors/EntityNotFoundError');

module.exports = class BaseService
{
  constructor(options) {
    this.options = options;
    this.logger = options.logger || console;
    this.scheduler = options.scheduler;
  }

  checkIfEntityExistsOrFail$(entity, message = 'Entity not found') {
    return Observable.if(
      () => entity,
      Observable.of(entity),
      Observable.throw(new EntityNotFoundError(message)),
    )
  }

  /**
     * @param int pagelen
     * @param int page
     * @return Observable<Array>
     */
  getList$(pagelen, page = 1, filterExp = {}) {
    return this.mainRepository.getAll$(pagelen, page, filterExp);
  }

  /**
   * @param Object filterExp
   * @return Observable<Number>
   */
  getCount$(filterExp = {}) {
    return this.mainRepository.getCount$(filterExp);
  }

  /**
   * @param String ref
   * @return Observable<Object>
   */
  find$(ref) {
    return this.mainRepository.findBySlugOrId$(ref)
      //Check if exists
      .flatMap((item) => item ? this.Rx.Observable.of(item) : this.Rx.Observable.throw(new EntityNotFoundError));
  }


  emitEvent(eventName, data) {
    if(this.options.eventEmitter) {
      this.options.eventEmitter.emit(eventName, data);
    }
    return true;
  }

  emitEvent$(eventName, data) {

    this.logger.debug(eventName);

    return Observable.of(this.emitEvent(eventName, data))
      .map(status => data)
  }

  schedule$(when, jobName, data) {
    return this.scheduler.schedule$(when, jobName, data)
      .map(status => data)
  }


}