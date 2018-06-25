'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = Schema({

  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  email: {
    type: String,
    required: false,
    unique: false,
    validate: {
      validator: str => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(str),
      message: '{VALUE} is not a valid email'
    },
  },

  password: { type: String, required: true },
  firstname: { type: String, required: false, default: null },
  lastname: { type: String, required: false, default: null },


  //_industry : {type: Schema.Types.ObjectId, ref: 'Industry'},
}, {
    collection: 'autorizedUsers',
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.resetToken;
        delete ret.authType;
        ret.id = doc._id;
        ret.createdAt = doc._id.getTimestamp();
      }
    }
  });