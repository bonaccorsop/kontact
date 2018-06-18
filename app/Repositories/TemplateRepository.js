'use strict';

const MongoRepository = require('./MongoRepository');

module.exports = class TemplateRepository extends MongoRepository {

    constructor(schemas) {
      super(schemas);
      this.modelName = 'Template';
      this.slugKey = '';
      this.nameKey = '';
      this.populate = '';
    }

    findByName$(name) {
      return this.first$({ name });
    }

}


