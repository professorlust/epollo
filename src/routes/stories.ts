'use strict';
declare let require: any;

let express = require('express');
let app = express();
let router = express.Router();

import {
    Story,
    User,
    getStories,
    getStoryByLink,
    getUserByLink,
  } from './../config/database';

import {
    onlyLogined,
    handleError
  } from './../config/utils';

router.get('/', (req, res, next) => {
  getStories((err: Error, result) => {
    if(err || result == null) {
      return handleError(err, res);
    } else {


      // Filter out threads from listing them on the stories page
      // If it has a parent story, it is a thread

      let storiesArr = [];
      for (let i = 0; i < result.length; i++) {
        if(result[i].parent.title == null) {
          storiesArr.push(result[i]);
        }
      }

      res.render('stories', {
        title: 'Browse',
        user: req.user,
        stories: storiesArr
      });
    }
  });
});

router.get('/:story', (req, res, next) => {
  getStoryByLink(req.params.story, (err, result) => {
    if(err || result == null) {
      return handleError(err, res);
    } else {
      if (!result.previous) result.previous = null;
      res.render('story', {
        title: result.title,
        user: req.user,
        story: result
      });
    }
  });
});

router.get('/:story/newthread', onlyLogined, (req, res, next) => {
  getStoryByLink(req.params.story, (err, result) => {
    if(err || result == null) {
      return handleError(err, res);
    } else {
      res.render('newthread', {
        title:'Continue ' + result.title,
        user: req.user,
        story: result
      });
    }
  });
});


/**
*@summary This function is saves the new thread its parent story's 'nextThreads' array
* also in the user's 'threads' and saves newThread as a story
*/

router.post('/:story/newthread', onlyLogined, (req, res, next) => {


  // Validate thread, as a story

  let stitle: string = req.body.stitle;
  let text: string = req.body.text;
  let genres: string = req.body.genres;
  let color: string = req.body.color;

  req.checkBody('stitle', 'Title is required').notEmpty();
  req.checkBody('text', 'Text is required').notEmpty();
  req.checkBody('genres', 'At least one genre is required').notEmpty();

  let errors: Array<Error> = req.validationErrors();
  if(errors) {
    res.render('newstory', {
      title: 'Create a new Story',
      errors: errors
    });
  } else {


    // 1. Save as a story, with a parent story

    getStoryByLink(req.params.story, (err, original) => {
      if(err) return handleError(err, res);
      if(original) {


        let newThread = new Story({
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
          color: req.body.color,


          // Keep in an array all the previous stories for listing them on the story page

          previous:
            original.previous ?
              original.previous.concat([{
                title: original.title,
                permalink: original.permalink
              }]) :
              [{
                title: original.title,
                permalink: original.permalink
              }],


          // Original is the parent story

          parent: {
            title: original.title,
            permalink: original.permalink
          },


          // If the original (parent) doesn't have parent then
          // the story what we save now is the parent.

          original:
            original.original ?
              original.original :
              {
                title: original.title,
                permalink: original.permalink
              }
        });


        // If a story with this name already exist or not

        getStoryByLink(newThread.permalink, (err: Error, isExist: boolean) => {
          if(err) return handleError(err, res);
          if(!isExist) {


            // 2. Save story to it's parent

            original.nextThreads.push({
              title: newThread.title,
              permalink: newThread.permalink,
              color: newThread.color
            });


            // 3. Update parent stories array

            original.save((err: Error) => {
              if(err) return handleError(err, res);


              // 4. Save story to uploader's data
              // Into the threads array

              getUserByLink(req.user.permalink, (err: Error, creator) => {
                if(err) return handleError(err, res);
                if(creator) {
                  if(creator.genres.length < 4) {
                    let newGenres = creator.genres.concat(newThread.genre);
                    creator.genres = newGenres;
                  }
                  creator.threads.push({
                    title: newThread.title,
                    permalink: newThread.permalink,
                    color: newThread.color
                  });
                  creator.save((err: Error) => {
                    if(err) return handleError(err, res);


                    // 5. Finaly save the thread as a story

                    newThread.save((err: Error) => {
                      if(err) return handleError(err, res);
                      res.redirect('/stories/' + newThread.parent.permalink);
                    });
                  });
                }
              });
            });
          }
        });
      } else {
        res.render('newstory', {
          title: 'Create a new Story',
          errors: [{ msg: 'The story doesn\'t exist' }]
        });
      }
    });
  }
});

router.post('/search', (req, res, next) => {
  let serarchRegex: RegExp = new RegExp(req.body.s);
  getStoryByLink({ $regex: serarchRegex, $options: 'gi' }, (err: Error, result) => {
    if (err || result == null) {
      res.redirect('/stories');
    } else {
      res.redirect('/stories/' + result.permalink);
    }
  });
});

export { router };
