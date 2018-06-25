'use strict';

const { Observable } = require('rx');
const { logger, agenda, faith, eventEmitter } = require('./dependencies');


module.exports = {

  faith: {

    listen: (obj) => {

      return faith.listen((event) => {
        let callback = obj[event.eventName] ? obj[event.eventName] : null;
        logger.info('[Faith BUS] Event received "' + event.eventName + '" from ' + event.sender)

        let subscription = null;

        try {
          subscription = callback(event)
            .subscribe(
              na => { },
              err => {
                logger.error('[Faith BUS] Error on event ' + event.eventName, err);
              },
              () => {
                logger.info('[Faith BUS] Event processed "' + event.eventName + '" from ' + event.sender)
              }
            );
        } catch (error) {
          logger.error('[Faith BUS] Fatal Error on: ' + event.eventName, error);
          process.exit(0);
        }
      })
    },

  },


  appEvents: {

    listen: (events, callback) => {
      events = Array.isArray(events) ? events : [events];
      events.forEach(eventName => {
        eventEmitter.on(eventName, (eventData) => {
          logger.info('[App Event] Dispatched: ' + eventName);
          try {
            callback(eventData).subscribe(
              (na) => { },
              (err) => { logger.error('[App Event] Error on ' + eventName, err) },
              () => { logger.info('[App Event] Completed: ' + eventName) },
            )
          } catch (error) {
            logger.error('[App Event] FATAL ERRROR on ' + eventName, error)
          }
        })
      }
      );
    },



  },





  agenda: {


    define: function (jobName, callback) {
      agenda.define(jobName, (job, done) => {
        logger.info('[Scheduled Job] Executing: ' + jobName);
        try {
          callback(job)
            .subscribe(
              na => { },
              err => {
                logger.error('[Scheduled Job] Error on: ' + jobName, err);
                job.fail(err); job.save()
              },
              () => {
                logger.info('[Scheduled Job] Completed: ' + jobName);
                done();
              }
            );
        } catch (error) {
          logger.error('[Scheduled Job] FATAL ERROR on: ' + jobName, error);
          job.fail(err); job.save()
        }

      });
    },


    schedule$: function (when, jobName, data) {
      return Observable.create(obs$ => {
        agenda.schedule(when, jobName, data, (err, scheduledTask) => {
          if (err) {
            logger.error('[Scheduled Job] Error on scheduling: "' + jobName + '"', err);
            obs$.onError(err);
          } else {
            logger.info('[Scheduled Job] Scheduled: "' + jobName + '" at "' + when + '"');
            obs$.onNext(scheduledTask);
            obs$.onCompleted();
          }
        });
      });


    },




  }







}