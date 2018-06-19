'use strict';
let gsControllers = angular.module('epollo.getting-started.controllers', []);

gsControllers.controller('Main', function($scope, $rootScope) {

  $rootScope.capitalize = function(name) {
    if(name) {
      return name[0].toUpperCase() + name.slice(1, name.length);
    }
  }

  $rootScope.userData = {
    username: '',
    name: {
      first: '',
      last: ''
    },
    email: ''
  };
});

gsControllers.controller('Form', function($scope, $rootScope) {
  let namebody = document.getElementById('first');
  namebody.scrollIntoView();

  $scope.isFirstnameValid = function() {
    $scope.firstname = $rootScope.capitalize($scope.firstname);
    return $scope.firstname ? true : false;
  }

  $scope.isLastnameValid = function() {
    $scope.lastname = $rootScope.capitalize($scope.lastname);
    return $scope.lastname ? true : false;
  }

  $scope.isEmailValid = function() {
    return $scope.email ? true : false;
  }

  $scope.acceptedAggreement = function() {
    if($scope.isFirstnameValid() && $scope.isLastnameValid && $scope.isEmailValid) {
      return true;
    }
  }
});

