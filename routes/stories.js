var debug = require('debug')('epollo:server');
var {User, Story,
    getUsers, getStories,
    getUserByUsername, getStoryById,
    getStoryByTitle, getStoryByLink,
    onlyLogined, getUserByLink,
    handleError
  } = require('./../config/database');
var express = require('express');
var app = express();
var router = express.Router();

router.get('/', (req, res, next) => {
  getStories((err, result) => {
    if(err) return res.status(404).send();
    if(!result) {
      return res.status(404).send();
    } else {
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
    if(err) return handleError(err, res);
    if(!result) {
      return res.status(404).send();
    } else {
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
    if(err) return handleError(err, res);
    if(!result) {
      return res.status(404).send();
    } else {
      res.render('newthread', {
        title:'Continue ' + req.params.story,
        user: req.user,
        story: result
      });
    }
  });
});

/**
* This function is saves the new thread its parent stories 'nextThreads' array
* also in the users 'threads' and saves newThread as a story
*/
router.post('/:story/newthread', onlyLogined, (req, res, next) => {
  var stitle = req.body.stitle;
  var text = req.body.text;
  var genres = req.body.genres;
  var color = req.body.color;

  req.checkBody('stitle', 'Title is required').notEmpty();
  req.checkBody('text', 'Text is required').notEmpty();
  req.checkBody('genres', 'At least one genre is required').notEmpty();

  var errors = req.validationErrors();
  if(errors) {
    res.render('newstory', {
      title: 'Create a new Story',
      errors: errors
    });
  } else {
    getStoryByLink(req.params.story, (err, original) => {
      if(err) return handleError(err, res);
      if(original) {
        var newThread = new Story({
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
          parent: {
            title: original.title,
            permalink: original.permalink
          },
          // If the parent doesn't have original then it is
          original:
            original.original ?
              original.original :
              {
                title: original.title,
                permalink: original.permalink
              }
        });
        // Lets see if a story with this name already exist or not
        getStoryByLink(newThread.permalink, (err, isExist) => {
          if(err) return handleError(err, res);
          if(!isExist) {
            // Save it to it's parent
            original.nextThreads.push({
              title: newThread.title,
              permalink: newThread.permalink,
              color: newThread.color
            });
            // Save original
            original.save((err) => {
              if(err) return handleError(err, res);
              // If it is done save it to the user
              getUserByLink(req.user.permalink, (err, creator) => {
                if(err) return handleError(err, res);
                if(creator) {
                  if(creator.genres.length < 4) {
                    var newGenres = creator.genres.concat(newThread.genre);
                    creator.genres = newGenres;
                  }
                  creator.threads.push({
                    title: newThread.title,
                    permalink: newThread.permalink,
                    color: newThread.color
                  });
                  creator.save((err) => {
                    if(err) return handleError(err, res);
                    // Finaly save the thread as a story
                    newThread.save((err) => {
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
  var s = new RegExp(req.body.s);
  getStoryByLink({ $regex: s, $options: 'gi' }, (err, result) => {
    if(err) return handleError(err, res);
    if(result) {
      res.redirect('/stories/' + result.permalink);
    } else {
      res.redirect('/stories');
    }
  });
});

module.exports = router;
