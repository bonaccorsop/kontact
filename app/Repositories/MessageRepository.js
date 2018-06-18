'use strict';

const MongoRepository = require('./MongoRepository');

module.exports = class ContactRepository extends MongoRepository {

    constructor(schemas) {
        super(schemas);
        this.modelName = 'Message';
        this.slugKey = '';
        this.nameKey = '';
        this.populate = '';
    }

}


