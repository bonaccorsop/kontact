'use strict';

const MongoRepository = require('./MongoRepository');

module.exports = class ScheduleRepository extends MongoRepository {

    constructor(schemas) {
        super(schemas);
        this.modelName = 'Schedule';
        this.slugKey = '';
        this.nameKey = '';
        this.populate = '';
    }

}


