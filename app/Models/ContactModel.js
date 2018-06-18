'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = Schema({

  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, default: null },

  username: { type: String, default: null, required: true },

  contacts: {
    email: { type: String, default: null },
    telephone: { type: String, default: null },
    pushToken: { type: String, default: null },
  },

  meta: {
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
  }


}, {
  collection: 'contacts',
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