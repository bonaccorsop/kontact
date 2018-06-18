'use strict';

const { logger, env, eventEmitter } = require('./dependencies');
const repos = require('./repositories');

let serviceOptions = {
    appUrl: env.get('APP_URL'),
    logger,
}

// User Service
const UserService = require('./Services/UserService');
const user = new UserService(repos.authorizedUser);

// Contact Service
const ContactService = require('./Services/ContactService');
const contact = new ContactService(serviceOptions, repos.contacts);

// Message Service
const MessageService = require('./Services/MessageService');
const message = new MessageService(serviceOptions, repos.messages);


module.exports = { user, contact, message };
