var mongoose = require('mongoose');
var dbKeys = require('./../dev/keys');
mongoose.connect(dbKeys.dbUrl);
var database =  mongoose.connection;
var Schema =  mongoose.Schema;
var bcrypt = require('bcrypt');

var debug = require('debug')('epollo');
database.on('error', () => {
  debug('Make sure the url in "dev/keys.json" to the database is right');
  console.error('Database connection error');
});

var userSchema = new Schema({
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
var storySchema = new Schema({
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
var User = mongoose.model('users',  userSchema);
var Story = mongoose.model('stories',  storySchema);

var handleError = (err, res) => {
  res.status(404).send('Error');
}

module.exports = {
  handleError: handleError,
  dbKeys:  dbKeys,
  mongoose:  mongoose,
  database:  database,
  Schema:  Schema,
  User:  User,
  Story:  Story,
  getUsers: (callback) => {
    User.find({}, callback);
  },
  getUserById: (id, callback) => {
    User.findById(id, callback);
  },
  getUserByUsername: (usr, callback) => {
    User.findOne({username: usr}, callback);
  },
  getUserByLink: (link, callback) => {
    User.findOne({permalink: link}, callback);
  },
  getStories: (callback) => {
    Story.find({}).sort([['date', -1]]).exec(callback);
  },
  getStoryById: (strId, callback) => {
    Story.findOne({permalink: strId}, callback);
  },
  getStoryByTitle: (strTitle, callback) => {
    Story.findOne({title: strTitle}, callback);
  },
  getStoryByLink: (strLink, callback) => {
    Story.findOne({permalink: strLink}, callback);
  },
  createStory: (newStory, callback) => {
    Story.findOne({permalink: newStory.permalink}, callback);
  },
  updateUserStories: (newStory, user, callback) => {
    User.findOne({username: user}, (err, newUser) => {
      if(err) handleError(err);
      if(newUser) {
        if(newUser.genres.length < 4) {
          var newGenres = newUser.genres.concat(newStory.genre);
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
  },
  createUser: (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        newUser.password = hash;
        newUser.save(callback);
      });
    });
  },
  comparePassword: (typedPassword, hash, callback) => {
    bcrypt.compare(typedPassword, hash, (err, isMach) => {
      if(err) console.log(err);
      callback(null, isMach);
    });
  },
  onlyNotLogined: (req, res, next) => {
    if(!req.user) {
      next();
    }
  },
  onlyLogined: (req, res, next) => {
    if(req.user) {
      next();
    } else {
      res.redirect('/signin');
    }
  }
}
