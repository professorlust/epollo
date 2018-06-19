/**
 * @author Martin Kondor
 * Copyright (C) Martin Kondor 2018
 * @license GPL-3.0 see LICENSE for details.
 */

'use strict';
declare let __dirname: any;
declare let process: any;
declare let require: any;

let express = require("express");
let session = require("express-session");
let conMongo = require("connect-mongo");
let path = require("path");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let debugConsole = require("debug");
let logger = require("morgan");
let flash = require("connect-flash");
let createError = require("http-errors");
let expressValidator = require("express-validator");

import { dbKeys } from './config/database';

let passport = require("passport");
let passportLocal = require("passport-local");

const app = express();
const connectMongo = conMongo(session);
const debug = debugConsole('epollo:server');
let LocalStrategy = passportLocal.Strategy;


// Setting routes

import * as indexRouter from './routes/index';
import * as usersRouter from './routes/users';
import * as storiesRouter from './routes/stories';

const PORT: number = process.env.PORT || 8080;
const env: string = process.env.NODE_ENV || 'development';
if(env ===  'development') {
  app.use(session({
    secret: dbKeys.sessionSecret,
    saveUninitialized: true,
    resave: true
  }));
} else {
  app.use(session({
    secret: dbKeys.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: new connectMongo({
      url: dbKeys.dbUrl,
      stringify: true
    })
  }));
}

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static('public'));
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'epollo')));


// Passport init

app.use(passport.initialize());
app.use(passport.session());


// Express validator

app.use(expressValidator({
  errorformatter: (param, msg, value) => {
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', indexRouter.router);
app.use('/users', usersRouter.router);
app.use('/stories', storiesRouter.router);

app.use((req, res, next) => {
  next(createError(404));
});
app.use((err: any, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', {title: '404', user: req.user});
});

app.listen(PORT, () => {
  debug(`running on port: ${PORT}`);
});
