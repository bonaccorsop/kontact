'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = Schema({

  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },

  email: {
    type: String, required: true, unique: false,
    validate: {
      validator: str => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(str),
      message: '{VALUE} is not a valid email'
    },
  },

  group: { type: String, default: 'Default' },

  firstname: { type: String, default: null },
  lastname: { type: String, default: null },


  telephone: { type: String, default: null },
  pushToken: { type: String, default: null },

  meta: {

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