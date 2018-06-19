import * as express from 'express';
import * as mongoose from 'mongoose';

export let Model = mongoose.model;


/**
*@summary Send error state to server
*/

export let handleError = (err: Error, res: express.Response) => {
  res.status(404).send('Error');
}


/**
*@summary For exclude logined users from pages like signin/signup
*/

export let onlyNotLogined = (req: express.Request, res: express.Response, next: () => void) => {
    if(!req.user) {
      next();
    }
}


/**
*@summary Prevent not users from upload etc.
*/

export let onlyLogined = (req: express.Request, res: express.Response, next: () => void) => {
  if(req.user) {
    next();
  } else {
    res.redirect('/signin');
  }
}
