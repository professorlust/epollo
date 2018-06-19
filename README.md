 <p align="center"><img src="https://github.com/MartinKondor/epollo/blob/master/public/images/logo/title.png"></p>

# epollo [![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Take%20a%20look%20at%20this%20repository%20https://github.com/MartinKondor/epollo/)
[![Project Status](https://img.shields.io/badge/status-active-brightgreen.svg?style=flat-square)](https://epollo.herokuapp.com/)
[![version](https://img.shields.io/badge/version-v1.2.0-blue.svg?style=flat-square)](https://github.com/MartinKondor/epollo/releases/tag/1.2.0)

[Available](https://bit.ly/2jumCc2)

Epollo is a website made for improving creativity by allowing anyone to participate in any written fiction/ non-fiction story by continuing it.

## About Epollo

Epollo is a free to use story sharing website where users can participate in any writen an uploaded stories by writing new storylines.
A story can be anything in any genre like non-fiction or fictions.
Stories with their storylines work like a tree, every story and thread can be threadable.

## Getting Started

This is the public repository for Epollo, where issues can be tracked and development is executed.


Take a look at the ```CONTRIBUTING.md``` before starting to work.

### Prerequisites

You will need [NodeJS](https://nodejs.org/en/) framework, and a [Mongo](https://www.typescriptlang.org/) database, for working on the website.

### Steps

Set up your npm.
```
npm i
```

Create a folder ```pids``` and place your database url to a file called ```keys.json``` like this:
```
{
	"dbUrl": <URL TO DATABASE>,
	"sessionSecret": <A RANDOM STRING>,
	"secret": <A RANDOM STRING>,
	"cookieKey": <A RANDOM STRING>
}
```

After work, compile TypeScript files:
```
gulp build
```

Running the website on your computer:
```
DEBUG=epollo:* npm start
```
or
```
npm start
```
or
```
nodemon epollo
```

## Built With

* [Gulp](https://gulpjs.com/) - Task runner
* [TypeScript](https://www.typescriptlang.org/) - JavaScript compiler
* [MongoDB](https://www.mongodb.com/) - NoSQL database
* [Express](https://expressjs.com/) - NodeJS web application framework
* [AngularJS](https://angular.io/) - JavaScript Front-end framework
* [NodeJS](https://nodejs.org/en/) - JavaScript runtime framework
* [NPM](https://www.npmjs.com/) - Software system

## Contributing

Please read the ```.md``` files for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE.md](https://github.com/MartinKondor/epollo/blob/master/LICENSE.md) file for details
