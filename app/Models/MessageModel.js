'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = Schema({

  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },

  type: { type: String, required: true, enum: ['email', 'sms', 'push'] },
  template: { type: String, required: false, default: null },

  // required just for email
  from: { type: String, required: true },

  _contact: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
  to: { type: String, required: true },

  sentAt: { type: Date, default: null },
  readAt: { type: Date, default: null },

  // used for emails
  subject: { type: String, default: null },

  // used for all types of message
  text: { type: String, default: null },

  // used just for emails
  html: { type: String, default: null },

  // used just for emails
  trackingCode: { type: String, default: null },
}, {
  collection: 'messages',
  strict: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      ret.id = doc._id;
    }
  }
});