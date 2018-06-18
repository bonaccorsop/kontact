'use strict';

const schemas = require('./dependencies').schemas;

const AuthorizedUserRepository = require('./Repositories/AuthorizedUserRepository');
const Contact = require('./Repositories/ContactRepository');
const Message = require('./Repositories/MessageRepository');


module.exports = {
    authorizedUser: new AuthorizedUserRepository(schemas),
    contacts: new Contact(schemas),
    message: new Message(schemas),
};

