'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schema = Schema({

  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, default: null },

  scheduledAt: { type: Date, required: true },
  action: { type: String, required: true },
  entityId: { type: String, required: false, default: null },
  params: { type: Object, required: false, default: {} },

  output: {
    status: { type: String, required: false, default: 'scheduled', enum: ['scheduled', 'canceled', 'success', 'fail'] },
    executedAt: { type: Date, required: false, default: null },
    result: { type: Object, required: false, default: {} },
  },

}, {
  collection: 'schedules',
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

module.exports = schema;