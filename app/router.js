'use strict';

const deps = require('./dependencies');
const Agendash = require('agendash');
const auth = require('http-auth');

module.exports = {
  getRouter: (express, services) => {

    const authMiddleware = (req, res, next) => {
      services.auth.authorization$(req.headers.authorization)
        .subscribe(userData => { req.user = userData; next() }, err => { next(err); });
    };


    express.get('/v1/login', (req, res, next) => {
      services.auth.authentication$(req.body.username, req.body.password)
        .subscribe( token => { res.send({ token }) }, err => { next(err); });
    });

    express.get('/v1/users/me', authMiddleware, (req, res, next) => {
      res.send(req.user);
    });

    express.get('/v1/menu/me', authMiddleware, (req, res, next) => {
      res.send(req.user);
    });

    // agendash routes
    express.use('/dash', auth.connect(auth.basic({ realm: "Dash" }, (username, password, callback) => {
      callback(username === "user" && password === "password");
    })), new Agendash(deps.agenda));

  }
};

