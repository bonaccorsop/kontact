'use strict';

const MongoRepository = require('./MongoRepository');

module.exports = class ContactRepository extends MongoRepository {

  constructor(schemas) {
    super(schemas);
    this.modelName = 'Contact';
    this.slugKey = '';
    this.nameKey = '';
    this.populate = '';
  }

  findByEmail$(email) {
    return this.first$({ email });
  }

}


