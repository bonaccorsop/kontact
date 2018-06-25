'use strict';

const Joi = require('joi');
const slugify = require('slugify');
const { Observable } = require('rx');

const BaseService = require('./BaseService');

module.exports = class UserService extends BaseService
{
  constructor(options = {}, authorizedUserRepository) {
    super(options);
    this.authorizedUserRepository = authorizedUserRepository;
  }


}