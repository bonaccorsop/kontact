'use strict';

const { logger, env } = require('./dependencies');
const { agenda } = require('./facades');
const repos = require('./repositories');

let serviceOptions = {
    appUrl: env.get('APP_URL'),
    scheduler: agenda,
    logger,
}

// User Service
const UserService = require('./Services/UserService');
const user = new UserService(repos.authorizedUser);

// Template Service
const TemplateService = require('./Services/TemplateService');
const template = new TemplateService(serviceOptions, repos.template);

// Contact Service
const ContactService = require('./Services/ContactService');
const contact = new ContactService(serviceOptions, repos.contacts);

// Message Service
const MessageService = require('./Services/MessageService');
const message = new MessageService(serviceOptions, repos.messages);


module.exports = { user, template, contact, message };
