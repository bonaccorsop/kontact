'use strict';

const { Observable } = require('rx');
const commandLineArgs = require('command-line-args')

const CWD = './app';
const deps = require(CWD + '/dependencies.js');
const { auth } = require(CWD + '/Http/Auth/auth');


const options = commandLineArgs([
  { name: 'email', alias: 'u', type: String },
  { name: 'password', alias: 'p', type: String },
  { name: 'firstname', alias: 'f', type: String },
  { name: 'lastname', alias: 'l', type: String },
  { name: 'role', alias: 'r', type: String },
])


Observable.of(1)

  //start mongo
  .concatMap(() => Observable.fromPromise(deps.mongoose.connect(deps.env.get('MONGO_CONNECTION'))))
  .do(conn => console.info(`# Mongo connection entablished with ${conn.host} √`))

  //load schemas
  .concatMap(() => Observable.fromPromise(deps.schemas.setUp()))
  .do(console.info(`# Repository Schemas loaded √`))

  // Generate Token
  .concatMap(() => auth.signup$({
    email: options.email,
    password: options.password,
    firstname: options.firstname,
    lastname: options.lastname,
    role: options.role || 'user',
  }))

  .subscribe(
    (userDoc) => {
      deps.logger.info('Utente creato', userDoc.toObject());
      process.exit(0)
    },
    (error) => { console.error(error); process.exit(0) },
  );














