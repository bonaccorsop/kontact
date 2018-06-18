'use strict';

const { Observable } = require('rx');
const moment = require('moment');
const { agenda, faith } = require('./facades');
const services = require('./services');
const { clients, logger, env } = require('./dependencies');



agenda.define('test', (job) => {
  let data = job.attrs.data || {};

  logger.info('TEST JOB', data);

  return Observable.of(1);
});


// ###################
// ## Menu Schedules
// ###################

agenda.define('menu.publish', (job) => {
  let menuDoc = job.attrs.data;
  return services.agency.getChannels$()
    .flatMap(channels => faith.send$(channels, 'menu.publish', menuDoc))
});

agenda.define('menu.sendRecap', (job) => {
  let code = job.attrs.data;
  return Observable.fromPromise(clients.jambon.sendRecap(code));
});

agenda.define('faith.menu.ack', (job) => {
  let faithEvent = job.attrs.data;
  return services.menu.setReceivedBy$(faithEvent.data.code, faithEvent.sender);
});



// ###################
// ## Order Schedules
// ###################

// let resolveAgencyAndUser$ = (faithEvent) => {
//   return services.agency.firstOrCreateByChannelName$(faithEvent.sender)
//     .flatMap(agencyDoc => services.user.updateOrCreateUser$(faithEvent.data.user.email, agencyDoc.channelName, {
//       user: faithEvent.data.user,
//       agency: agencyDoc.toObject(),
//     }), (agencyDoc, userDoc) => ({ agency: agencyDoc.toObject(), user: userDoc.toObject() }));
// }


// let transformForJambon$ = ({ agency, user, order }) => {
//   return Observable.of(Object.assign(order, { user: Object.assign(user, { agency }) }))
//     .flatMap(order => {
//       return Observable.fromArray(order.products)
//         .flatMap(
//           orderProd => services.product.find$(orderProd._product),
//           (orderProd, productDoc) => Object.assign(orderProd, { product: productDoc })
//         )
//         .toArray()
//         .map(orderProducts => Object.assign(order, { products: orderProducts }))
//     })
// }

// agenda.define('faith.order.push', (job) => {
//   let faithEvent = job.attrs.data;
//   return resolveAgencyAndUser$(faithEvent)
//     .flatMap(
//       ({ agency, user }) => services.order.createOrUpdateOrder$(user.email, faithEvent.data.menu.code, faithEvent.data.products),
//       ({ agency, user }, orderDoc) => ({ agency, user, order: orderDoc.toObject() })
//     )

//     //sincronizza con jambon
//     .flatMap(pack => Observable.if(
//       () => env.get('JAMBONOLD_SYNC', true),
//       Observable.of(pack)
//         .flatMap(pack => transformForJambon$(pack))
//         .flatMap(orderPack => Observable.fromPromise(clients.jambon.pushOrder(orderPack))),
//       Observable.of(pack)
//     ))

//     // reinvia recap se l'orario attuale supera il send time del menù
//     .flatMap(na => services.menu.getMenuByCode$(faithEvent.data.menu.code).map(menuDoc => menuDoc.toObject()))
//     .flatMap(menu => {
//       logger.debug(menu.code, moment().isAfter(moment(menu.times.send)), menu.times.send );
//       if (moment().isAfter(Date.parse(menu.times.send))) {
//         return Observable.fromPromise(clients.jambon.sendRecap(menu.code, 'update'));
//       } else {
//         return Observable.of(menu);
//       }
//     })

// });














