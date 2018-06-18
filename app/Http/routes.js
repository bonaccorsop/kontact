'use strict';

const { env, agenda, clients, logger } = require('../dependencies.js');
const { faith } = require('../facades');
const express = require('express');
const app = express();


const cors = require('cors')
app.use(cors());



const bodyParser = require('body-parser');
app.use(bodyParser.json());

if (env.get('HTTP_DEBUGMODE', false)) {
  logger.info('MorganBody Debug enabled');

  const morgan = require('morgan');
  app.use(morgan(':date[iso] :req[x-user] :method :url :status - :response-time ms'));

  const morganBody = require('morgan-body');
  morganBody(app);
}


if (env.get('HTTP_AGENDASH_ENABLED', false)) {
  const Agendash = require('agendash');
  app.use('/agenda', new Agendash(agenda));
}


// Base routes
app.get('/', (req, resp) => resp.send(`<h3>Ok, It\'s working! :)</h3>`));
app.get('/healthcheck', (req, resp) => { resp.status(204).send() });
app.get('/status/400', (req, resp) => { resp.status(400).send({ status: 'client error', code: 400 }) });
app.get('/status/500', (req, resp) => { resp.status(400).send({ status: 'server error', code: 500 }) });

// Controllers
const services = require('../services.js');

// Login Controller
const LoginController = require('./Controllers/LoginController');
app.use('/signin', (new LoginController()).getRouter());

// User Controller
const UserController = require('./Controllers/UserController');
app.use('/users', (new UserController(services.user)).getRouter());

const ContactController = require('./Controllers/ContactController');
app.use('/contacts', (new ContactController(services.message)).getRouter());

const MessageController = require('./Controllers/MessageController');
app.use('/messages', (new MessageController(services.message)).getRouter());


// Error handlers

const { Error } = require('mongoose');
const ServiceError = require('../Errors/ServiceError');
const EntityNotFoundError = require('../Errors/EntityNotFoundError');
const InputDataError = require('../Errors/InputDataError');
const ForbiddenResourceError = require('../Errors/ForbiddenResourceError');
const GenericUserError = require('../Errors/GenericUserError');

const AuthenticationError = require('./Auth/Errors/AuthenticationError');
const AuthorizationError = require('./Auth/Errors/AuthorizationError');
const InvalidUsernameError = require('./Auth/Errors/InvalidUsernameError');
const InvalidResetTokenError = require('./Auth/Errors/InvalidResetTokenError');

app.use((err, req, resp, next) => {
  let payload = {};

  if (err instanceof GenericUserError) {
    payload = { code: 400, msg: err.message };
  } else if (err instanceof AuthenticationError) {
    payload = { code: 401, msg: "Invalid username or password" };
  } else if (err instanceof AuthorizationError) {
    payload = { code: 401, msg: "Invalid token" };
  } else if (err instanceof InvalidUsernameError) {
    payload = { code: 401, msg: "No email user match" };
  } else if (err instanceof InvalidResetTokenError) {
    payload = { code: 401, msg: "Invalid reset token" };
  } else if (err instanceof ForbiddenResourceError) {
    payload = { code: 403, msg: err.message };
  } else if (err instanceof EntityNotFoundError) {
    payload = { code: 404, msg: err.message ? err.message : "Entity not found" };
  } else if (err instanceof InputDataError) {
    payload = { code: 400, msg: "Missing fields: " + err.message };
  } else if (err instanceof Error.ValidationError) {
    payload = { code: 400, msg: err.message };
  }

  else if (err instanceof ServiceError && err.code) {
    payload = { code: err.code, msg: err.message };
  } else {
    next(err);
    return;
  }
  resp.status(payload.code).send(payload);
});

const http = require('http');
module.exports = {
  listen: (port) => new Promise((resolve, reject) => {
    http.createServer(app).listen(port, err => {
      err ? reject(err) : resolve(app);
    });
  })
}