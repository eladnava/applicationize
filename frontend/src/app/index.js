'use strict';

// ng-app config()
angular.module('frontend', ['ngAnimate', 'ngTouch', 'ngSanitize', 'ngRoute', 'ngMaterial'])
  .config(function ($routeProvider, $locationProvider ) {
    
    // Set up routes and link them to templates and controllers
    $routeProvider
      .when('/', {
        templateUrl: '/app/main/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
  });

// ng-app run()
angular.module('frontend').run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {}]);
