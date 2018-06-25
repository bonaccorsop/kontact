'use strict';

const { Observable } = require('rx');
const { logger, env, clients } = require('./dependencies');
const { faith, agenda } = require('./facades');
const services = require('./services');


let resolveAgencyAndUser$ = (faithEvent) => {

  return services.agency.firstOrCreateByChannelName$(faithEvent.sender)
    .flatMap(agencyDoc => Observable.if(
      () => faithEvent.data.user.email,
      Observable.of(agencyDoc),
      Observable.throw('Nessun utente specificato'),
    ))



    .flatMap(agencyDoc => services.user.updateOrCreateUser$(faithEvent.data.user.email, agencyDoc.channelName, {
      user: faithEvent.data.user,
      agency: agencyDoc.toObject(),
    }), (agencyDoc, userDoc) => ({ agency: agencyDoc.toObject(), user: userDoc.toObject() }));
}

let transformForJambon$ = ({ agency, user, order }) => {
  return Observable.of(Object.assign(order, { user: Object.assign(user, { agency }) }))
    .flatMap(order => {
      return Observable.fromArray(order.products)
        .flatMap(
          orderProd => services.product.find$(orderProd._product),
          (orderProd, productDoc) => Object.assign(orderProd, { product: productDoc })
        )
        .toArray()
        .map(orderProducts => Object.assign(order, { products: orderProducts }))
    })
}



module.exports = {

  listen: () => {

    return faith.listen({

    // il menù viene ricevuto dall'azienda e comunicato qui tramite questo evento
    'menu.ack': (faithEvent) => {
      //return agenda.schedule$('now', 'faith.menu.ack', faithEvent);
      return Observable.of(1);
    },

    // L'ordine viene mandato in create o update per l'utente dell'agency
    'order.push': (faithEvent) => {

      return resolveAgencyAndUser$(faithEvent)

        .do(({ agency, user }) => logger.debug('ORDER PUSH', {
          agency: agency.name,
          user: `${user.firstname} ${user.lastname}`,
          products: faithEvent.data.products.map(prod => ({ name: prod.name, qta: prod.qta, price: prod.price })),
          menu: faithEvent.data.menu.code
        }))

        .flatMap(
          ({ agency, user }) => services.order.createOrUpdateOrder$(user.email, faithEvent.data.menu.code, faithEvent.data.products),
          ({ agency, user }, orderDoc) => ({ agency, user, order: orderDoc.toObject() })
        )

        .do(({ agency, user, order }) => logger.debug('ORDER PUSH SYNCED', {
          agency: agency.name,
          user: `${user.firstname} ${user.lastname}`,
          products: order.products.map(prod => ({ name: prod.name, qta: prod.qta, price: prod.price })),
          menu: order.menu.code
        }))

        //sincronizza con jambon
        .flatMap(pack => Observable.if(
          () => env.get('JAMBONOLD_SYNC', true),
          Observable.of(pack)
            .flatMap(pack => transformForJambon$(pack))
            .flatMap(orderPack => Observable.fromPromise(clients.jambon.pushOrder(orderPack)))
            .do(jambonResp => { logger.debug('JAMBON SYNCED', jambonResp) }),
          Observable.of(pack)
        ))

        // reinvia recap se l'orario attuale supera il send time del menù
        // .flatMap(na => services.menu.getMenuByCode$(faithEvent.data.menu.code).map(menuDoc => menuDoc.toObject()))
        // .flatMap(menu => {
        //   logger.debug(menu.code, moment().isAfter(moment(menu.times.send)), menu.times.send);
        //   if (moment().isAfter(Date.parse(menu.times.send))) {
        //     return Observable.fromPromise(clients.jambon.sendRecap(menu.code, 'update'));
        //   } else {
        //     return Observable.of(menu);
        //   }
        // })
    },

    // L'ordine viene rimosso per l'utente dell'agency
    'order.remove': (faithEvent) => {
      return agenda.schedule$('now', 'faith.order.remove', faithEvent);
    },

  })
}

}







