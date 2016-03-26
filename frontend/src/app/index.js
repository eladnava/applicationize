'use strict';

// Set up angular app
angular.module('frontend', ['ngAnimate', 'ngTouch', 'ngSanitize', 'ngRoute', 'ngMaterial'])
    .config(function($routeProvider, $locationProvider) {
        // Define routes and link them to templates and controllers
        $routeProvider
            // Home Page
            .when('/', {
                templateUrl: '/app/main/main.html',
                controller: 'MainCtrl'
            })
            // Fallback URL
            .otherwise({
                redirectTo: '/'
            });

        // Use HTML5 state navigation APIs
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

// Run angular app
angular.module('frontend').run();
