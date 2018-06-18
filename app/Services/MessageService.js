'use strict';

const slugify = require('slugify');
const { Observable } = require('rx');

const BaseService = require('./BaseService');

module.exports = class MessageService extends BaseService
{
  constructor(options = {}, mainRepository) {
    super(options);
    this.mainRepository = mainRepository;
  }

}