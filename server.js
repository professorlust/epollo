var express = require('express');
var app = express();
var session = require('express-session');
var connectMongo = require('connect-mongo')(session);
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var {dbKeys} = require('./config/database');
var debug = require('debug')('epollo:server');
var logger = require('morgan');
var expressValidator = require('express-validator');
var flash = require('connect-flash');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Setting routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var storiesRouter = require('./routes/stories');

var PORT = process.env.PORT || 8080;
var env = process.env.NODE_ENV || 'development';
if(env ===  'development') {

  app.use(logger('dev'));
  app.use(session({
    secret: dbKeys.sessionSecret,
    saveUninitialized: true,
    resave: true
  }));

  app.listen(PORT, () => {
    debug(`running on port: ${PORT}`);
  });
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

  app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
  });
}

app.use(cookieParser());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'epollo')));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expressValidator({
  errorformatter: (param, msg, value) => {
    var namespace = params.split('.')
    , root = namespace.shift()
    , formParam = root;

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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter);
