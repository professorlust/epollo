'use strict';
declare let require: any;

let express = require('express');
let app = express();
let router = express.Router();

import {User, Story,
    getUsers, getStories,
    getUserByUsername, getStoryById,
    getStoryByTitle, getStoryByLink,
    getUserByLink
  } from './../config/database';

import { onlyLogined, onlyNotLogined,
         handleError } from './../config/utils';

router.get('/', (req, res, next) => {
  getUsers((err: Error, result) => {
    if(err || result == null) {
      return handleError(err, res);
    } else {


      // Cut off the too long story/thread titles for book design

      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].stories.length; j++) {
          if(result[i].stories[j].title.length > 14) {
            result[i].stories[j].title = result[i].stories[j].title.slice(0, 11) + '...';
          }
        }

        for (let j = 0; j < result[i].threads.length; j++) {
          if(result[i].threads[j].title.length > 14) {
            result[i].threads[j].title = result[i].threads[j].title.slice(0, 11) + '...';
          }
        }
      }

      res.render('users', {
        title: 'Users/Authors',
        user: req.user,
        users: result
      });
    }
  });
});

router.get('/:permalink', (req, res, next) => {
  getUserByLink(req.params.permalink, (err: Error, result) => {
   if(err || result == null) {
     return handleError(err, res);
   } else {
     res.render('profile', {
       title: result.username,
       user: req.user,
       u: result
     });
   }
 });
});

router.get('/:username/settings', onlyLogined, (req, res, next) => {
  getUserByUsername(req.params.username, (err, result) => {
    if(err || result == null || result.username != req.user.username) {
      return handleError(err, res);
    } else {
      res.render('settings', {
        title: 'Settings',
        user: req.user
      });
    }
  });
});

router.post('/:username/settings/update', onlyLogined, (req, res, next) => {


  // TODO: Update settings

  return handleError(new Error('Not yet'), res);
});

export { router };
