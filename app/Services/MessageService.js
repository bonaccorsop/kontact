'use strict';

const slugify = require('slugify');
const { Observable } = require('rx');
const { Types } = require('mongoose');

const BaseService = require('./BaseService');

module.exports = class MessageService extends BaseService
{
  constructor(options = {}, mainRepository) {
    super(options);
    this.mainRepository = mainRepository;
  }

  create$(messageData) {
    return this.mainRepository.store$(Object.assign(messageData, { type: 'email', trackingCode: Types.ObjectId().str }))
      .flatMap(messageDoc => this.emitEvent$('message.created', messageDoc))
  }

  scheduleMessage$(messageData, when = 'now') {
    return this.create$(messageData)
      .flatMap(messageDoc => this.schedule$(when, 'message.deliver', messageDoc))
      .flatMap(messageDoc => this.emitEvent$('message.scheduled', messageDoc))
  }

  deliverMessage$(messageId) {
    return this.mainRepository.find$(messageId)

      // TODO
      .flatMap(messageDoc => this.messageSender.send$(messageDoc.toObject()).map(deliveryStatus => ({ deliveryStatus, messageDoc })))

      .flatMap(({ deliveryStatus, messageDoc }) => {
        messageDoc.sentAt = Date.now();
        return Observable.defer(() => messageDoc.save())
          .flatMap(messageDoc => this.emitEvent$('message.sent', messageDoc))
          .map(na => deliveryStatus);
      })
  }

  setAsRead$(messageId) {
    return this.mainRepository.find$(messageId)
      .flatMap(messageDoc => {
        messageDoc.readAt = Date.now();
        return Observable.defer(() => messageDoc.save()).map(updateStatus => messageDoc);
      })
      .flatMap(messageDoc => this.emitEvent$('message.read', messageDoc))
  }

}