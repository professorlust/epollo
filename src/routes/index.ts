'use strict';
declare let require: any;

let express = require('express');
let app = express();
let router = express.Router();

import {
  User,
  Story,
  getUserByUsername,
  comparePassword,
  createUser,
  getUserById,
  createStory,
  updateUserStories
} from './../config/database';

import {
  onlyLogined,
  onlyNotLogined,
  handleError
} from './../config/utils';


// Log in authentication
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
let LocalStrategy = passportLocal.Strategy;

passport.use(new LocalStrategy((username, password, done) => {
    getUserByUsername(username, (err, user) => {
      if(err) throw err;
      if(!user) {
        return done(null, false, { message: 'Unknown User' });
      }
      comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      });
    });
  }
));
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});
passport.deserializeUser((id: any, done: any) => {
  getUserById(id, (err, user) => {
    done(err, user);
  });
});

router.get('/', (req, res, next) => {
  res.render('index', {title: 'Epollo - Unleash your creativity', user: req.user});
});

router.get('/signin', onlyNotLogined, (req, res, next) => {
  res.render('signin', {title: 'Sign In'});
});

router.post('/signin',
  passport.authenticate('local', {
    successRedirect: '/stories',
    failureRedirect: '/signin',
    failureFlash: true
  }),
  (req, res, next) => {

});

router.get('/signup', onlyNotLogined, (req, res, next) => {
  res.render('signup', {title: 'Sign Up for Free'});
});


/**
*@summary Validate signup user data,
* if validation is successfull, save user to db.
*/

router.post('/signup', onlyNotLogined, (req, res, next) => {


  // From signup.pug
  let username: string = req.body.username;
  let firstname: string = req.body.firstname;
  let lastname: string = req.body.lastname;
  let email: string = req.body.email;
  let password: string = req.body.password;
  let password2: string = req.body.password2;

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('firstname', 'Firstname is required').notEmpty();
  req.checkBody('lastname', 'Lastname is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty().isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors: Array<Error> = req.validationErrors();

  if(errors) {
    res.render('signup', {
      title: 'Epollo',
      errors: errors
    });
  } else {


    // Check for existing user in database
    getUserByUsername(username, (err: Error, isExist: boolean) => {
      if(err) return handleError(err, res);
      if(isExist) {
        res.render('signup', {
          title: 'Sign up',
          errors: [{ msg: 'This username is already taken' }]
        });
      } else {

        let newUser = new User({
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


        // Save user
        createUser(newUser, (err: Error) => {
          if(err) return handleError(err, res);
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


/**
*@summary Validate story data,
* if validation is successfull, save story.
*/

router.post('/newstory', onlyLogined, (req, res, next) => {


  // Validating
  let stitle: string = req.body.stitle;
  let text: string = req.body.text;
  let genres: string = req.body.genres;
  let color: string = req.body.color;

  req.checkBody('stitle', 'Title is required').notEmpty();
  req.checkBody('text', 'Story text is required').notEmpty();
  req.checkBody('genres', 'At least one genre is required').notEmpty();

  let errors: any = req.validationErrors();

  if(errors) {
    res.render('newstory', {
      title: 'Create a new Story',
      errors: errors
    });
  } else {
    let newStory = new Story({
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


    /**
    *@summary Save the story as it is, and after that,
    * save it to the uploader user's stories array.
    */

    createStory(newStory, (err: Error, isMatch: boolean) => {
      if(err) return handleError(err, res);
      if(isMatch) {
        res.render('newstory', {
          title: 'Create a new Story',
          errors: [{ msg: 'This story title is already taken' }]
        });
      } else {

        // Saving story
        newStory.save((err: Error) => {
          if(err) return handleError(err, res);


          // Saving story to users profile
          // and rediret to stories
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

router.get('/getting-started', onlyNotLogined, (req, res, next) => {
  res.render('getting-started', {title: 'Getting Started'});
});

export { router };
