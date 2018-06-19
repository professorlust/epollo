'use strict';
declare let require;

import * as mongoose from 'mongoose';
let dbKeys = require('./../../pids/keys');
mongoose.connect(dbKeys.dbUrl);
let database: any =  mongoose.connection;
let Schema: any =  mongoose.Schema;
import * as bcrypt from 'bcrypt';

database.on('error', () => {
  console.error('Make sure the url in "pids/keys.json" to the database is right');
});

let userSchema: mongoose.SchemaDefinition = new Schema({
  username: String,
  name: {
    first: String,
    last: String
  },
  permalink: String,
  email: String,
  password: String,
  stories: [{
    title: String,
    permalink: String,
    color: String,
    genre: [String]
  }],
  threads: [{
    title: String,
    permalink: String,
    color: String
  }],
  bio: String,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  genres: [String]
});


// The title id is for the get requiests its simply just the
// title in lowercase and without spaces.

let storySchema: mongoose.SchemaDefinition = new Schema({
  title: String,
  permalink: String,
  text: String,
  genre: [String],
  author: {
    username: String,
    name: {
      first: String,
      last: String
    },
    permalink: String
  },
  color: String,
  previous: [{
    title: String,
    permalink: String
  }],
  nextThreads: [{
    title: String,
    permalink: String,
    color: String
  }],
  parent: {
    title: String,
    permalink: String
  },
  original: {
    title: String,
    permalink: String
  },
  date: {
    type: String,
    default: new Date().toISOString().substring(0, 10)
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
});
export let User = mongoose.model('users',  userSchema);
export let Story = mongoose.model('stories',  storySchema);

export { dbKeys, mongoose, database, Schema };


/**
*@summary Lists all user
*/

interface callbackInterface {
  (err: Error, result): void
};

export let getUsers = (callback: callbackInterface) => {
  User.find({}, callback);
}

export let getUserById = (id, callback: callbackInterface) => {
  User.findById(id, callback);
}

export let getUserByUsername = (usr: string, callback: callbackInterface) => {
  User.findOne({username: usr}, callback);
}

export let getUserByLink = (link: string, callback: callbackInterface) => {
  User.findOne({permalink: link}, callback);
}


/**
*@summary Lists all story
*/

export let getStories = (callback: callbackInterface) => {
  Story.find({}).sort([['date', -1]]).exec(callback);
}

export let getStoryById = (strId: string, callback: callbackInterface) => {
  Story.findOne({permalink: strId}, callback);
}

export let getStoryByTitle = (strTitle: string, callback: callbackInterface) => {
  Story.findOne({title: strTitle}, callback);
}

export let getStoryByLink = (strLink: any, callback: callbackInterface) => {
  Story.findOne({permalink: strLink}, callback);
}


/**
*@summary Save story to database
*/

export let createStory = (newStory, callback: callbackInterface) => {
  Story.findOne({permalink: newStory.permalink}, callback);
}


/**
*@summary Adding a new story to the user's sotries array
*/

export let updateUserStories = (newStory, user: string, callback: (err: Error) => void) => {
  User.findOne({username: user}, (err: Error, newUser) => {
    if(err)
      throw err;
    if(newUser) {
      if(newUser.genres.length < 4) {
        let newGenres = newUser.genres.concat(newStory.genre);
        newUser.genres = newGenres;
      }
      newUser.stories.push({
        title: newStory.title,
        permalink: newStory.permalink,
        color: newStory.color,
        genre: newStory.genre
      });
      newUser.save(callback);
    }
  });
}


/**
*@summary Save a new user to database
*/

export let createUser = (newUser, callback: (err: Error) => void) => {
  bcrypt.genSalt(10, (err: Error, salt: any) => {
    bcrypt.hash(newUser.password, salt, (err: Error, hash: any) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

export let comparePassword = (typedPassword: any, hash: any, callback: (err: Error, isMatch: boolean) => void) => {
  bcrypt.compare(typedPassword, hash, (err: Error, isMach: boolean) => {
    if(err) throw err;
    callback(null, isMach);
  });
}
