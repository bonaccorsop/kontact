'use strict';

const { Observable } = require('rx');
const { appEvents, agenda, faith } = require('./facades')
const services = require('./services');
const { logger, clients } = require('./dependencies');

const { capitalizeWords } = require('./Utils/String');


appEvents.listen(['menu.created', 'menu.updated'], menuDoc => {
  return agenda.schedule$('in 2 seconds', 'menu.publish', menuDoc);
});

appEvents.listen(['menu.created'], menuDoc => {
  return agenda.schedule$(menuDoc.times.send, 'menu.sendRecap', menuDoc.code);
});

appEvents.listen(['order.created', 'order.updated'], orderDoc => {
  return Observable.of(1);
    //.flatMap(orderDoc => clients.telegram.sendMessage('Ordine Creato'))
});

appEvents.listen(['order.deleted'], orderDoc => {
  return Observable.of(1);
});

appEvents.listen(['orderProduct.done'], ({ order, changedProduct }) => {

  const labelPayload = {
    user: changedProduct.label,
    product: changedProduct.name,
    agency: capitalizeWords(order.toObject().user.agency),
  }

  return Observable.range(0, changedProduct.qta)
    .do(na => logger.info('Printing Label', labelPayload))
    .flatMap(na => faith.send$(['printer'], 'label.print', labelPayload))

});





