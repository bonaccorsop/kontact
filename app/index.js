'use strict';

const CWD = '.';

const moment = require('moment');
const { Observable } = require('rx');

const deps = require(CWD + '/dependencies.js');

const { listen } = require(CWD + '/faith-listeners.js');

const port = deps.env.get('HTTP_PORT');

Observable.of(1)

  //start mongo
  .flatMap(() => Observable.fromPromise(deps.mongoose.connect(deps.env.get('MONGO_CONNECTION'))))
  .do(conn => deps.logger.info(`# Mongo connection entablished with ${conn.host} √`))


  //load schemas
  .flatMap(() => Observable.fromPromise(deps.schemas.setUp()))
  .do(deps.logger.info(`# Repository Schemas loaded √`))

  // boostrap operations
  .flatMap(() => {
    return Observable.of(1);
  })
  .do(deps.logger.info(`# Bootstrap operations done √`))

  // load faith
  .concatMap(() => {

    listen();
    require(CWD + '/app-events.js');
    require(CWD + '/scheduledjobs.js');

    return Observable.of(1);
  })
  .do(deps.logger.info(`# Faith loaded √`))

  // start web server if port is specfied
  .flatMap(() => Observable.if(
    () => port,
    Observable.fromPromise(require(CWD + '/Http/routes.js').listen(port))
      .do(deps.logger.info(`# App HTTPService is running on port: ${port}, you can curl it! √`))
  ))

  .subscribe(
    (x) => { },
    (error) => deps.logger.error(error),
    () => { deps.logger.info('## Application up and ready √'); }
  );

function gracefulStop() {
  deps.logger.info('exit..');
  deps.agenda.stop(() => { process.exit(0) });
}

process.on('SIGTERM', gracefulStop);
process.on('SIGINT', gracefulStop);







