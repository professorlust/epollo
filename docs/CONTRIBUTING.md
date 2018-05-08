# Contributing

We love contributions from everyone.

## For beginners

### To run this app/website and for contribution, you will need NPM, and NODEJS on your computer

### Steps to follow:
1. Fork this repository & clone your forked one
2. Go to the main folder and install npm packages with the command: ```npm install```
3. Create a new folder, named ```'epollodev'``` NEXT to epollo and NOT in epollo folder
4. Create a new file in that folder with the name of ```keys.json```
5. To this file write your database url (named 'dbUrl') what can be a mLab account url or your local database,
also write in a 'sessionSecret', 'cookieKey' and a 'secret' what are just random strings. See the example below the list.

If it is done, save it, now the app can run with the command: ```DEBUG=epollo:* npm start```, and if you typed in this command the site will run on the url: ```localhost:8080```.

The whole ```'keys.json'``` should look like this:
```
{
   "dbUrl": "<YOURDATABASEURL>",
   "sessionSecret": "<RANDOMSTRING>",
   "secret": "<RANDOMSTRING>",
   "cookieKey": "<RANDOMSTRING>"
}
```

6. After that, you can start changing anything on your own computer and upload it to your own repository
7. If you think you made a great change just go ahead in the Epollo repository and make a new pull request<
8. Done!

## Contributing Code

Fork the repo.

Make sure the tests pass.

Make your change, with new passing tests.

Mention how your changes affect the project to other developers and users in the
`NEWS.md` file.

Push to your fork. Write a commit. Submit a pull request.

Others will give constructive feedback.
This is a time for discussion and improvements,
and making the necessary changes will be required before we can
merge the contribution.
