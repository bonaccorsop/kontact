'use strict';

const { Observable } = require('rx');
const { appEvents, agenda, faith } = require('./facades')
const services = require('./services');
const { logger, clients } = require('./dependencies');

const { capitalizeWords } = require('./Utils/String');


appEvents.listen(['contact.created'], contactDoc => {
  return Observable.of(1)
    .do(na => logger.debug('contact created', contactDoc))
});

appEvents.listen(['contact.updated'], contactDoc => {
  return Observable.of(1)
    .do(na => logger.debug('contact updated', contactDoc))
});

appEvents.listen(['template.created'], templateDoc => {
  return Observable.of(1)
    .do(na => logger.debug('template created', templateDoc))
});

appEvents.listen(['template.updated'], templateDoc => {
  return Observable.of(1)
    .do(na => logger.debug('template updated', templateDoc))
});







