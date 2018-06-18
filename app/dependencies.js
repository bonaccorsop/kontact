'use strict';

const env = require('./envparser');
const EventEmitter = require('events');
require('moment/locale/it');


const winston = require('winston');
const moment = require('moment');
const winstonConfig = winston.config;
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function () { return moment().add(2, 'hours').format('DD/MM/YYYY HH:mm:ss') },
      formatter: function (options) {
        // - Return string will be passed to logger.
        // - Optionally, use options.colorize(options.level, <string>) to
        //   colorize output based on the log level.
        return options.timestamp() + ' ' +
          winstonConfig.colorize(options.level, options.level.toUpperCase()) + ' ' +
          (options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
      }
    })
  ]
});
logger.level = 'debug';


const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const SchemaLoader = require('./SchemaLoader');
const schemas = new SchemaLoader(mongoose);

const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: env.get('MONGO_CONNECTION'), collection: 'scheduler' } });
agenda.on('ready', () => {
  logger.info('# Scheduler started √');
  agenda.start();
});


const Faith = require('./Modules/Faith');
const faith = new Faith({
  connection: env.get('FAITH_CONNECTION'),
  queue: env.get('FAITH_QUEUELISTEN')
});


const eventEmitter = new EventEmitter;

const EmailClient = require('./Modules/EmailClient');
const emailClient = new EmailClient({
  pretend: env.get('EMAIL_SMTPPRETEND', false),
  host: env.get('EMAIL_SMTPHOST'),
  port: env.get('EMAIL_SMTPPORT'),
  secure: env.get('EMAIL_SMTPSECURE'),
  defaultSender: env.get('EMAIL_DEFAULTSENDER'),
  auth: {
    user: env.get('EMAIL_SMTPUSER'),
    pass: env.get('EMAIL_SMTPPASS')
  }
})

const TelegramClient = require('./Clients/TelegramClient');
const telegram = new TelegramClient({
  token: env.get('TELEGRAM_TOKEN'),
  chatId: env.get('TELEGRAM_CHATID')
});

module.exports = {
  env,
  mongoose,
  schemas,
  agenda,
  faith,
  eventEmitter,
  logger,
  clients: {
    email: emailClient,
    telegram,
  }
};
