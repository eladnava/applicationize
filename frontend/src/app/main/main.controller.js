'use strict';

angular.module('frontend')
  .controller('MainCtrl', function ($scope, $location, $routeParams, $timeout, $mdToast, API)
    {
        // Not loading by default
        $scope.loading = false;
        
        // Return path to /generate API route
        $scope.getGenerateAPIEndpoint = function()
        {
            return API.getAPIEndpoint() + '/generate';
        }
    });
