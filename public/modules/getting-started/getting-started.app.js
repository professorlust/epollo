'use strict';

let gsApp = angular.module('epollo.getting-started', [
  'ui.router',
  'epollo.getting-started.controllers'
]);

gsApp.config(function($stateProvider, $locationProvider) {

  $locationProvider.hashPrefix('');

  $stateProvider
  .state('form', {
    url: '/form',
    controller: 'Form',
    templateUrl: '/modules/getting-started/states/first.html'
  })
  .state('password', {
    parent: 'form',
    url: '/password',
    controller: 'Password',
    templateUrl: '/modules/getting-started/states/password.html'
  });
});

gsApp.run(function($state) {
  $state.go('form');
});
