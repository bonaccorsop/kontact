'use strict';

const MongoRepository = require('./MongoRepository');

module.exports = class AuthorizedUserRepository extends MongoRepository {

    constructor(schemas) {
        super(schemas);
        this.modelName = 'AuthorizedUser';
        this.slugKey = 'email';
        this.nameKey = '';
        this.populate = '';
    }

    // menuRef -> ObjectId, ObjectId.toString(), code
    resolve$(userRef) {
        if (typeof userRef === 'string' && !this.isObjectIdString(userRef)) {
            return this.getByUsername$(userRef);
        } else {
            return this.first$(userRef)
        }
    }

    findByCredentials$(username, encriptedPassword) {
        console.log(username, encriptedPassword);
        return this.first$({ email: username, password: encriptedPassword })
    }

    getByUsername$(username) {
        return this.first$({ email: username });
    }

}
