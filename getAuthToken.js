'use strict';

const { Observable } = require('rx');
const commandLineArgs = require('command-line-args')

const CWD = './app';
const deps = require(CWD + '/dependencies.js');
const { auth } = require(CWD + '/Http/Auth/auth');


const options = commandLineArgs([
  { name: 'email', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String }
])

deps.logger.debug('Options:', options);

Observable.of(1)

  //start mongo
  .concatMap(() => Observable.fromPromise(deps.mongoose.connect(deps.env.get('MONGO_CONNECTION'))))
  .do(conn => console.info(`# Mongo connection entablished with ${conn.host} √`))

  //load schemas
  .concatMap(() => Observable.fromPromise(deps.schemas.setUp()))
  .do(console.info(`# Repository Schemas loaded √`))

  // Generate Token
  .concatMap(() => auth.authentication$(options.email, options.password))

  .subscribe(
    (token) => { deps.logger.info('Token:', token); process.exit(0) },
    (error) => { deps.logger.error('Credenziali invalide'); process.exit(0) }
  );














