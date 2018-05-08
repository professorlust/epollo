var debug = require('debug')('epollo:server');
var {User, Story,
    getUsers, getStories,
    getUserByUsername, getStoryById,
    getStoryByTitle, onlyNotLogined,
    onlyLogined, comparePassword,
    createUser, getUserById,
    createStory, updateUserStories,
    getStoryByLink, addThreadToStory,
    handleError
  } = require('./../config/database');
var express = require('express');
var app = express();
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Log in authentication
passport.use(new LocalStrategy((username, password, done) => {
    getUserByUsername(username, (err, user) => {
      if(err) return handleError(err, res);
      if(!user) {
        return done(null, false, { message: 'Unknown User' });
      }
      comparePassword(password, user.password, (err, isMatch) => {
        if(err) return handleError(err, res);
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  getUserById(id, (err, user) => {
    done(err, user);
  });
});

router.get('/', (req, res, next) => {
  res.render('index', {title: 'Unleash your creativity', user: req.user});
});

router.get('/signin', onlyNotLogined, (req, res, next) => {
  res.render('signin', {title: 'Sign in'});
});

router.post('/signin',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
  }),
  (req, res, next) => {

});

router.get('/signup', onlyNotLogined, (req, res, next) => {
  res.render('signup', {title: 'Sign up'});
});

router.post('/signup', onlyNotLogined, (req, res, next) => {
  var username = req.body.username;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('firstname', 'Firstname is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty().isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if(errors) {
    res.render('signup', {
      title: 'Epollo',
      errors: errors
    });
  } else {
    // Check for existing user in database
    getUserByUsername(username, (err, isExist) => {
      if(err) return handleError(err, res);
      if(isExist) {
        res.render('signup', {
          title: 'Sign up',
          errors: [{ msg: 'This username is already taken' }]
        });
      } else {

        var newUser = new User({
          username: username,
          name: {
            first: firstname,
            last: lastname
          },
          permalink: username.replace(/\s/g, '').toLowerCase(),
          email: email,
          password: password,
          profilepic: 'https://api.adorable.io/avatar/250/' + username
        });
        createUser(newUser, (err, user) => {
          if(err) return handleError(err, res);
          console.log(user.username + ' registered.');
        });

        res.redirect('stories');
      }
    });
  }
});

router.get('/signout', onlyLogined, (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

router.get('/newstory', onlyLogined, (req, res, next) => {
  res.render('newstory', {title: 'Create a new story', user: req.user});
});

router.post('/newstory', onlyLogined, (req, res, next) => {
  var stitle = req.body.stitle;
  var text = req.body.text;
  var genres = req.body.genres;
  var color = req.body.color;

  req.checkBody('stitle', 'Title is required').notEmpty();
  req.checkBody('text', 'Story text is required').notEmpty();
  req.checkBody('genres', 'At least one genre is required').notEmpty();

  var errors = req.validationErrors();
  if(errors) {
    res.render('newstory', {
      title: 'Create a new Story',
      errors: errors
    });
  } else {
    var newStory = new Story({
      title: req.body.stitle,
      permalink: req.body.stitle.toLowerCase().replace(/\s/g, '-'),
      text: req.body.text,
      genre: req.body.genres.replace(/\s/g, '').toLowerCase().split(','),
      author: {
        username: req.user.username,
        name: {
          first: req.user.name.first,
          last: req.user.name.last
        },
        permalink: req.user.permalink
      },
      color: req.body.color
    });
    createStory(newStory, (err, isMatch) => {
      if(err) return handleError(err, res);
      if(isMatch) {
        res.render('newstory', {
          title: 'Create a new Story',
          errors: [{ msg: 'This story title is already taken' }]
        });
      } else {
        newStory.save((err) => {
          if(err) return handleError(err, res);
          updateUserStories(newStory, req.user.username, (err) => {
            if(err) return handleError(err, res);
            res.redirect('/stories/' + newStory.permalink);
          });
        });
      }
    });
  }
});

router.get('/info', (req, res, next) => {
  res.render('info', {title: 'Info', user: req.user});
});

module.exports = router;
