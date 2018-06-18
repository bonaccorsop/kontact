'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = Schema({

  createdAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },

  type: { type: String, required: true, enum: ['email', 'sms', 'push'] },
  name: { type: String, required: true, unique: true },

  engine: { type: String, enum: ['mustache'], default: 'mustache' },

  // used just for all message types
  text: { type: String, required: true },

  // used just for emails
  html: { type: String, default: null },

  // used just for emails
  params: [{
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['Boolean', 'String', 'Object', 'Array', 'Date'] },
    description: { type: String, default: null }
  }],

}, {
  collection: 'templates',
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